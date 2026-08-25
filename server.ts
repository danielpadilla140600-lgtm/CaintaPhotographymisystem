import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcryptjs";

import nodemailer from "nodemailer";

import os from "os";
import fs from "fs/promises";
import crypto from "crypto";

// Load environment variables
dotenv.config();

import { db } from "./src/db/database.ts";
import { UserRole, Booking, Payment, PrintOrder, AuditLog, Notification, Review, Studio, StudioService, StudioPackage, ChatbotFAQ, PhotoProofingGallery, MediaFile } from "./src/db/types.ts";

const app = express();
const PORT = 3000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const authSessions = new Map<string, { userId: string; expiresAt: number }>();
const passwordResetTokens = new Map<string, { userId: string; email: string; expiresAt: number }>();
const emailVerificationTokens = new Map<string, { userId: string; email: string; expiresAt: number }>();
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MEDIA_ROOT = path.join(process.cwd(), "protected-media");

function checkLoginRateLimit(key: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (attempt && attempt.lockedUntil > now) {
    const waitMinutes = Math.ceil((attempt.lockedUntil - now) / 60000);
    return { allowed: false, waitMinutes };
  }
  return { allowed: true };
}

function recordLoginFailure(key: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  attempt.count += 1;
  if (attempt.count >= 5) {
    attempt.lockedUntil = now + 15 * 60 * 1000; // 15 min lockout
    attempt.count = 0;
  }
  loginAttempts.set(key, attempt);
}

function clearLoginAttempts(key: string) {
  loginAttempts.delete(key);
}

// Do not serve requests against the pre-hydration in-memory database.
app.use(async (_req, _res, next) => {
  await db.waitUntilReady();
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store");
  }
  next();
});

// Restrict browser access to configured frontend origins and add baseline API headers.
app.use((req, res, next) => {
  const configuredOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:3000")
    .split(",").map(origin => origin.trim()).filter(Boolean);
  const requestOrigin = req.header("Origin");
  if (requestOrigin && configuredOrigins.includes(requestOrigin)) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Vary", "Origin");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("Referrer-Policy", "same-origin");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Enable JSON parser with high limit for base64 photo uploads
app.use(express.json({ limit: "20mb" }));

// Public reads are intentionally narrow. Every other API request must authenticate.
app.use((req, res, next) => {
  if (!req.path.startsWith("/api/")) return next();
  const publicApi = [
    /^\/api\/auth\/(login|register|forgot-password|reset-password|verify-email)$/,
    /^\/api\/studios\/?$/,
    /^\/api\/studios\/[^/]+$/,
    /^\/api\/reviews\/?$/,
    /^\/api\/categories\/?$/,
    /^\/api\/cms\/?$/,
    /^\/api\/custom-pages\/?$/,
    /^\/api\/media\/[^/]+$/,
    /^\/api\/services\/?$/,
    /^\/api\/packages\/?$/,
    /^\/api\/addons\/?$/,
    /^\/api\/print-products\/?$/
    ,/^\/api\/system\/audio\/?$/
  ];
  const isPublicRead = req.method === "GET" && publicApi.some(pattern => pattern.test(req.path));
  if (isPublicRead || publicApi.some(pattern => pattern.test(req.path) && req.path.startsWith("/api/auth/"))) {
    return next();
  }
  if (!getAuthenticatedUser(req)) {
    return res.status(401).json({ success: false, message: "Authentication is required." });
  }
  next();
});

// ----------------------------------------------------
// SMTP EMAIL NOTIFICATION TRANSPORTER SETUP
// ----------------------------------------------------
const smtpEmail = process.env.SMTP_EMAIL ? process.env.SMTP_EMAIL.trim() : "";
const smtpPassword = process.env.SMTP_APP_PASSWORD ? process.env.SMTP_APP_PASSWORD.trim().replace(/\s+/g, "") : "";

let mailTransporter: nodemailer.Transporter | null = null;

if (smtpEmail && smtpPassword) {
  mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpEmail,
      pass: smtpPassword
    }
  });

  mailTransporter.verify((error) => {
    if (error) {
      console.warn("[SMTP] Email transport verification failed:", error.message);
    } else {
      console.log(`[SMTP] Email notifications active via: ${smtpEmail}`);
    }
  });
} else {
  console.log("[SMTP] Notice: SMTP credentials not fully configured in .env");
}

// Rich HTML Email Dispatcher (High-End Luxury Studio Design)
async function sendEmailNotification(
  toEmail: string, 
  title: string, 
  message: string, 
  type: "info" | "success" | "warning" | "error" = "info",
  actionUrl?: string,
  actionLabel?: string
) {
  if (!mailTransporter || !smtpEmail) {
    console.log(`[SMTP Simulated] Email to ${toEmail}: [${title}] ${message}`);
    return;
  }

  const typeConfig: Record<string, { badge: string; badgeBg: string; badgeColor: string; accentGrad: string; icon: string }> = {
    success: {
      badge: "VERIFIED UPDATE",
      badgeBg: "#ecfdf5",
      badgeColor: "#059669",
      accentGrad: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      icon: "✓"
    },
    warning: {
      badge: "ACTION REQUIRED",
      badgeBg: "#fffbeb",
      badgeColor: "#d97706",
      accentGrad: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      icon: "⚡"
    },
    error: {
      badge: "ATTENTION",
      badgeBg: "#fef2f2",
      badgeColor: "#dc2626",
      accentGrad: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
      icon: "!"
    },
    info: {
      badge: "STUDIO NOTIFICATION",
      badgeBg: "#f5f3ef",
      badgeColor: "#78716c",
      accentGrad: "linear-gradient(135deg, #1c1917 0%, #292524 100%)",
      icon: "✦"
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const currentYear = new Date().getFullYear();
  const dateFormatted = new Date().toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f5f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1c1917;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f5f1; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e7e5e0;">
          
          <!-- Header Banner (Luxury Dark Obsidian & Gold Accent) -->
          <tr>
            <td style="background: #181615; padding: 36px 32px 30px; text-align: center; border-bottom: 2px solid #d97706;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <!-- Logo / Badge Emblem -->
                    <div style="display: inline-block; background: #262322; border: 1px solid #3e3a37; border-radius: 16px; padding: 10px 18px; margin-bottom: 16px;">
                      <span style="color: #f59e0b; font-size: 16px; margin-right: 6px;">📷</span>
                      <span style="color: #faf9f6; font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Cainta Photography MIS</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0; color: #a8a29e; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">
                      Centralized Photography Studio Network &bull; Rizal
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <!-- Type Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 18px;">
                <tr>
                  <td style="background-color: ${config.badgeBg}; border: 1px solid ${config.badgeColor}22; border-radius: 30px; padding: 5px 14px;">
                    <span style="color: ${config.badgeColor}; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                      ${config.icon} ${config.badge}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Main Title -->
              <h1 style="margin: 0 0 16px 0; color: #1c1917; font-size: 20px; font-weight: 800; line-height: 1.35; letter-spacing: -0.3px;">
                ${title}
              </h1>

              <!-- Message Callout Card -->
              <div style="background-color: #faf9f6; border: 1px solid #e7e5e0; border-left: 4px solid #d97706; border-radius: 14px; padding: 20px 22px; margin-bottom: 24px;">
                <p style="margin: 0; color: #44403c; font-size: 14px; line-height: 1.65;">
                  ${message}
                </p>
              </div>

              <!-- Metadata Summary Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fdfdfc; border: 1px solid #f0ede6; border-radius: 14px; padding: 14px 18px; margin-bottom: 28px;">
                <tr>
                  <td style="font-size: 11px; color: #78716c; padding: 4px 0;">
                    <strong style="color: #1c1917;">Timestamp:</strong> ${dateFormatted}
                  </td>
                  <td align="right" style="font-size: 11px; color: #78716c; padding: 4px 0;">
                    <strong style="color: #1c1917;">Status:</strong> <span style="color: #059669; font-weight: 700;">Verified System Transaction</span>
                  </td>
                </tr>
              </table>

              <!-- Optional CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${actionUrl || 'http://localhost:3000'}" style="display: inline-block; background-color: #1c1917; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.12);">
                      ${actionLabel || 'Access Studio MIS Portal →'}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="border-top: 1px solid #f0ede6;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px; text-align: center; background-color: #faf9f6;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #78716c; font-weight: 600;">
                Cainta Photography Studio Management Information System
              </p>
              <p style="margin: 0 0 12px 0; font-size: 10px; color: #a8a29e; line-height: 1.5;">
                Town Center &bull; Felix Avenue &bull; Valley Golf &bull; Imelda Avenue &bull; Cainta, Rizal<br/>
                This is an automated notification. Please do not reply directly to this email.
              </p>
              <p style="margin: 0; font-size: 10px; color: #d6d3d1;">
                &copy; ${currentYear} Cainta Photography Studio MIS. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await mailTransporter.sendMail({
      from: `"Cainta Photography Studio MIS" <${smtpEmail}>`,
      to: toEmail,
      subject: `[Cainta Photography] ${title}`,
      text: `${title}\n\n${message}\n\nTimestamp: ${dateFormatted}\n\n-- Cainta Photography Studio MIS`,
      html: htmlContent
    });
    console.log(`[SMTP] Successfully delivered email notification to ${toEmail} for: "${title}"`);
  } catch (err: any) {
    console.error(`[SMTP] Failed to send email to ${toEmail}:`, err?.message || err);
  }
}

// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

function createAuthToken(userId: string): string {
  const token = `${generateId("SESSION")}-${Math.random().toString(36).slice(2)}`;
  authSessions.set(token, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function getAuthenticatedUser(req: express.Request) {
  const header = req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const session = token ? authSessions.get(token) : undefined;
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    authSessions.delete(token);
    return null;
  }
  const userId = session.userId;
  const user = db.users.find(item => item.id === userId) || db.customers.find(customer => customer.id === userId) || null;
  if (user && getStudioAccountStatus(user) !== null && getStudioAccountStatus(user) !== "approved") {
    authSessions.delete(token);
    return null;
  }
  return user;
}

function requireAuthenticatedUser(req: express.Request, res: express.Response) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ success: false, message: "Authentication is required." });
    return null;
  }
  return user;
}

function requireRole(req: express.Request, res: express.Response, ...roles: UserRole[]) {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return null;
  if (!roles.includes(user.role as UserRole)) {
    res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
    return null;
  }
  return user;
}

function getStudioAccountStatus(user: any): "approved" | "pending" | "rejected" | "suspended" | null {
  if (user.role !== UserRole.STUDIO_ADMIN) return null;
  const studio = db.studios.find(item => item.id === user.studioId || item.ownerId === user.id);
  if (!studio) return "pending";
  if (studio.status === "suspended") return "suspended";
  if (studio.status === "rejected") return "rejected";
  return studio.isApproved || studio.status === "approved" ? "approved" : "pending";
}

function requireStudioAccess(req: express.Request, res: express.Response, studioId: string) {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return null;
  if (user.role === UserRole.SUPER_ADMIN) return user;
  const studioUser = "studioId" in user ? user : null;
  if (!studioUser || ![UserRole.STUDIO_ADMIN, UserRole.STUDIO_STAFF].includes(user.role as UserRole) || studioUser.studioId !== studioId) {
    res.status(403).json({ success: false, message: "You do not have access to this studio." });
    return null;
  }
  return user;
}

function requireBookingAccess(req: express.Request, res: express.Response, booking: Booking, allowStudio = true) {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return null;
  const ownsBooking = user.role === UserRole.CUSTOMER && booking.customerId === user.id;
  const studioUser = "studioId" in user ? user : null;
  const managesStudio = allowStudio && [UserRole.SUPER_ADMIN, UserRole.STUDIO_ADMIN, UserRole.STUDIO_STAFF].includes(user.role as UserRole) &&
    (user.role === UserRole.SUPER_ADMIN || studioUser?.studioId === booking.studioId);
  if (!ownsBooking && !managesStudio) {
    res.status(403).json({ success: false, message: "You do not have access to this booking." });
    return null;
  }
  return user;
}

function canManageStudioPayment(user: any, studioId: string): boolean {
  const studio = db.studios.find(item => item.id === studioId);
  return user.role === UserRole.STUDIO_ADMIN &&
    user.studioId === studioId &&
    studio?.ownerId === user.id;
}

function publicUser(user: any, authToken: string) {
  const { passwordHash, ...safeUser } = user;
  return { ...safeUser, authToken };
}

function expireUnpaidBooking(booking: Booking): boolean {
  if (!booking.paymentDueAt || !["Pending", "Awaiting Payment"].includes(booking.status)) return false;
  if (booking.amountPaid >= booking.downPaymentAmount || new Date(booking.paymentDueAt) > new Date()) return false;
  booking.status = "Expired";
  db.save();
  notifyUser(booking.customerId, "Booking Payment Hold Expired", `Booking ${booking.id} expired because the downpayment was not received before the payment deadline.`, "error", booking.studioId);
  return true;
}

// Logger helper
function logAction(userId: string, email: string, action: string, entityType: string, entityId: string) {
  const log: AuditLog = {
    id: generateId("LOG"),
    userId,
    userEmail: email,
    action,
    entityType,
    entityId,
    timestamp: new Date().toISOString()
  };
  db.addAuditLog(log);
}

// System-wide Notifications helper (Creates in-app notification + Sends SMTP email)
function notifyUser(userId: string, title: string, message: string, type: "info" | "success" | "warning" | "error" = "info", studioId?: string) {
  const notif: Notification = {
    id: generateId("NOTIF"),
    userId,
    studioId,
    title,
    message,
    isRead: false,
    type,
    createdAt: new Date().toISOString()
  };
  db.addNotification(notif);

  // Automatically lookup user / customer email and trigger real-time SMTP dispatch
  const recipient = db.users.find(u => u.id === userId) || db.customers.find(c => c.id === userId);
  if (recipient && recipient.email) {
    sendEmailNotification(recipient.email, title, message, type).catch(err => {
      console.warn("[SMTP] Notification email dispatch warning:", err);
    });
  }
}

function parseMediaData(value: unknown): { mimeType: string; bytes: Buffer } | null {
  if (typeof value !== "string") return null;
  const match = value.match(/^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > 8 * 1024 * 1024) return null;
  return { mimeType: match[1], bytes };
}

async function saveProtectedMedia(ownerId: string, entityType: string, entityId: string, purpose: string, value: unknown, originalName?: string) {
  const parsed = parseMediaData(value);
  if (!parsed) return null;
  await fs.mkdir(MEDIA_ROOT, { recursive: true });
  const mediaId = generateId("MEDIA");
  const extension = parsed.mimeType === "application/pdf" ? "pdf" : parsed.mimeType.split("/")[1];
  const storageKey = `${mediaId}.${extension}`;
  await fs.writeFile(path.join(MEDIA_ROOT, storageKey), parsed.bytes, { flag: "wx" });
  const media: MediaFile = {
    id: mediaId,
    ownerId,
    entityType,
    entityId,
    purpose,
    originalName,
    mimeType: parsed.mimeType,
    sizeBytes: parsed.bytes.length,
    checksum: crypto.createHash("sha256").update(parsed.bytes).digest("hex"),
    storageKey,
    accessStatus: "active",
    createdAt: new Date().toISOString()
  };
  db.addMediaFile(media);
  return { mediaId, mimeType: media.mimeType, size: media.sizeBytes };
}

function canAccessMedia(user: any, media: { ownerId: string; entityType: string; entityId: string }) {
  if (user.role === UserRole.SUPER_ADMIN || user.id === media.ownerId) return true;
  if (media.entityType === "payment") {
    const payment = db.payments.find(item => item.id === media.entityId);
    const booking = payment ? db.bookings.find(item => item.id === payment.bookingId) : undefined;
    return !!payment && !!booking && ((user.role === UserRole.CUSTOMER && payment.customerId === user.id) ||
      ([UserRole.STUDIO_ADMIN, UserRole.STUDIO_STAFF].includes(user.role) && user.studioId === payment.studioId));
  }
  if (media.entityType === "studio") {
    const studio = db.studios.find(item => item.id === media.entityId);
    return !!studio && (user.studioId === studio.id || user.id === studio.ownerId);
  }
  if (media.entityType === "print-order") {
    const order = db.printOrders.find(item => item.id === media.entityId);
    return !!order && ((user.role === UserRole.CUSTOMER && order.customerId === user.id) ||
      ([UserRole.STUDIO_ADMIN, UserRole.STUDIO_STAFF].includes(user.role) && user.studioId === order.studioId));
  }
  if (media.entityType === "service") {
    const service = db.services.find(item => item.id === media.entityId);
    return !!service && ([UserRole.STUDIO_ADMIN, UserRole.STUDIO_STAFF].includes(user.role) && user.studioId === service.studioId);
  }
  if (media.entityType === "package") {
    const pkg = db.packages.find(item => item.id === media.entityId);
    return !!pkg && ([UserRole.STUDIO_ADMIN, UserRole.STUDIO_STAFF].includes(user.role) && user.studioId === pkg.studioId);
  }
  return false;
}

app.post("/api/media", async (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { entityType, entityId, purpose, fileData, originalName } = req.body;
  if (!entityType || !entityId || !purpose || !fileData) {
    return res.status(400).json({ success: false, message: "entityType, entityId, purpose, and fileData are required." });
  }
  const media = await saveProtectedMedia(user.id, String(entityType), String(entityId), String(purpose), fileData, originalName);
  if (!media) return res.status(400).json({ success: false, message: "The file type or size is not supported." });
  res.json({ success: true, media, url: `/api/media/${media.mediaId}` });
});

// Lazy init of Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Auth Endpoints
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  const rateLimitKey = `${req.ip || "local"}:${String(email).toLowerCase()}`;
  const rateLimit = checkLoginRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return res.status(429).json({ 
      success: false, 
      message: `Too many failed login attempts. Account temporarily locked. Please try again in ${rateLimit.waitMinutes} minute(s).` 
    });
  }

  // Check across users (admins & studio admins) and customers table
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) ||
               db.customers.find(c => c.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    recordLoginFailure(rateLimitKey);
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  // Pure bcrypt password validation
  let isPasswordValid = false;
  try {
    if (user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$")) {
      isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    }
  } catch {
    isPasswordValid = false;
  }

  if (!isPasswordValid) {
    recordLoginFailure(rateLimitKey);
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const studioAccountStatus = getStudioAccountStatus(user);
  if (studioAccountStatus && studioAccountStatus !== "approved") {
    const messages = {
      pending: "Your studio registration is awaiting Super Admin approval. You cannot access the Studio Portal yet.",
      rejected: "Your studio registration was rejected. Please contact the Super Admin for more information.",
      suspended: "Your studio account is suspended. Please contact the Super Admin."
    };
    return res.status(403).json({ success: false, message: messages[studioAccountStatus] });
  }

  clearLoginAttempts(rateLimitKey);
  const authToken = createAuthToken(user.id);
  res.json({ success: true, user: publicUser(user, authToken) });
});

app.get("/api/auth/session", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const token = req.header("Authorization")?.slice(7).trim() || "";
  res.json({ success: true, user: publicUser(user, token) });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ success: false, message: "A valid email address is required." });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) ||
               db.customers.find(c => c.email.toLowerCase() === email.trim().toLowerCase());

  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour validity
    passwordResetTokens.set(resetToken, { userId: user.id, email: user.email, expiresAt });

    const resetLink = `http://localhost:3000/?action=reset-password&token=${resetToken}`;
    await sendEmailNotification(
      user.email,
      "Password Reset Request",
      `We received a request to reset the password for your Cainta Photography Studio MIS account. Use the link below to set a new password. If you did not make this request, you can safely ignore this email.`,
      "warning",
      resetLink,
      "Reset Password"
    );
    notifyUser(user.id, "Password Reset Link Dispatched", "A secure password reset link has been dispatched to your email address.", "info");
    logAction(user.id, user.email, "Requested password reset", "USER", user.id);
  }

  // Always return success to prevent email enumeration
  res.json({ 
    success: true, 
    message: "If an account matches that email address, a password reset link has been sent." 
  });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "A valid token and a password with at least 6 characters are required." });
  }

  const resetRecord = passwordResetTokens.get(token);
  if (!resetRecord || resetRecord.expiresAt <= Date.now()) {
    passwordResetTokens.delete(token);
    return res.status(400).json({ success: false, message: "Password reset link is invalid or has expired." });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  let updated = false;

  const uIndex = db.users.findIndex(u => u.id === resetRecord.userId);
  if (uIndex !== -1) {
    db.users[uIndex].passwordHash = hashedPassword;
    updated = true;
  } else {
    const cIndex = db.customers.findIndex(c => c.id === resetRecord.userId);
    if (cIndex !== -1) {
      db.customers[cIndex].passwordHash = hashedPassword;
      updated = true;
    }
  }

  if (!updated) {
    return res.status(404).json({ success: false, message: "User account not found." });
  }

  passwordResetTokens.delete(token);
  db.save();

  // Invalidate any active sessions for security
  for (const [sToken, session] of authSessions.entries()) {
    if (session.userId === resetRecord.userId) {
      authSessions.delete(sToken);
    }
  }

  logAction(resetRecord.userId, resetRecord.email, "Reset account password", "USER", resetRecord.userId);
  notifyUser(resetRecord.userId, "Password Reset Successful", "Your password has been changed successfully. You can now log in with your new credentials.", "success");

  res.json({ success: true, message: "Password has been successfully reset. Please log in with your new password." });
});

app.post("/api/auth/verify-email", (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: "Verification token is required." });
  }

  const record = emailVerificationTokens.get(token);
  if (!record || record.expiresAt <= Date.now()) {
    emailVerificationTokens.delete(token);
    return res.status(400).json({ success: false, message: "Email verification link is invalid or has expired." });
  }

  emailVerificationTokens.delete(token);
  res.json({ success: true, message: "Email verified successfully." });
});

app.post("/api/auth/logout", (req, res) => {
  const header = req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (token) authSessions.delete(token);
  res.json({ success: true });
});

app.put("/api/auth/account", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { fullName, email, contactNumber, address, currentPassword, newPassword } = req.body;
  if (!String(fullName || "").trim() || !String(email || "").trim()) {
    return res.status(400).json({ success: false, message: "Full name and email are required." });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const duplicate = [...db.users, ...db.customers].find(item => item.id !== user.id && item.email.toLowerCase() === normalizedEmail);
  if (duplicate) return res.status(400).json({ success: false, message: "Email is already registered." });

  const changingPassword = Boolean(newPassword);
  if (changingPassword) {
    if (typeof newPassword !== "string" || newPassword.length < 6 || !currentPassword) {
      return res.status(400).json({ success: false, message: "Current password and a new password of at least 6 characters are required." });
    }
    if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }
  }

  const updates: any = { fullName: String(fullName).trim(), email: String(email).trim(), contactNumber: contactNumber || "", address: address || "" };
  if (changingPassword) updates.passwordHash = bcrypt.hashSync(newPassword, 10);
  const target = user.role === UserRole.CUSTOMER ? db.customers.find(item => item.id === user.id) : db.users.find(item => item.id === user.id);
  if (!target) return res.status(404).json({ success: false, message: "Account not found." });
  Object.assign(target, updates);

  let authToken = req.header("Authorization")?.slice(7).trim() || "";
  if (changingPassword) {
    for (const [token, session] of authSessions.entries()) {
      if (session.userId === user.id) authSessions.delete(token);
    }
    authToken = createAuthToken(user.id);
  }
  db.save();
  logAction(user.id, target.email, "Updated account credentials", "USER", user.id);
  res.json({ success: true, user: publicUser(target, authToken) });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, fullName, contactNumber, address, role, studioName, businessPermit, validId, otherDocs } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ success: false, message: "Required fields are missing." });
  }

  // Check both users and customers tables to prevent duplicate email registration
  const existingInUsers = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  const existingInCustomers = db.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (existingInUsers || existingInCustomers) {
    return res.status(400).json({ success: false, message: "Email is already registered." });
  }

  const targetRole = role === UserRole.STUDIO_ADMIN ? UserRole.STUDIO_ADMIN : UserRole.CUSTOMER;
  const userId = generateId(targetRole === "CUSTOMER" ? "CUST" : "U");
  let studioId: string | undefined;

  // Securely hash user password with bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  // If registering as a Customer -> Insert into separate dedicated customers table
  if (targetRole === "CUSTOMER") {
    const newCustomer = {
      id: userId,
      email,
      passwordHash: hashedPassword,
      fullName,
      role: "CUSTOMER" as const,
      contactNumber,
      address,
      createdAt: new Date().toISOString()
    };

    db.addCustomer(newCustomer);
    logAction(userId, email, `Registered customer account in customers table`, "CUSTOMER", userId);

    const authToken = createAuthToken(newCustomer.id);
    return res.json({ success: true, user: publicUser(newCustomer, authToken) });
  }

  // If registering as a Studio Admin, we create their pending studio and save to users table
  if (targetRole === UserRole.STUDIO_ADMIN) {
    studioId = generateId("ST");
    const newStudio: Studio = {
      id: studioId,
      name: studioName || `${fullName}'s Photography Studio`,
      ownerId: userId,
      logo: "",
      coverImage: "",
      location: "Cainta, Rizal",
      rating: 5.0,
      reviewCount: 0,
      startingPrice: 1000,
      categories: ["Portrait Photography"],
      description: "Welcome to our newly registered photography studio! Complete our profile setup to list services, customizable packages, and receive instant bookings.",
      address: address || "Cainta, Rizal",
      contactInfo: contactNumber || "+63 900 000 0000",
      email: email,
      businessHours: "09:00 AM - 06:00 PM",
      isApproved: false,
      status: "pending",
      printingAvailable: true,
      businessPermit: undefined,
      validId: undefined,
      otherDocs: undefined,
      createdAt: new Date().toISOString()
    };
    const documentMedia: Array<{ purpose: string; value: string; name: string }> = [
      { purpose: "BUSINESS_PERMIT", value: businessPermit, name: "business-permit" },
      { purpose: "OWNER_VALID_ID", value: validId, name: "owner-valid-id" },
      { purpose: "SUPPORTING_DOCUMENT", value: otherDocs, name: "supporting-document" }
    ];
    db.addStudio(newStudio);
    for (const document of documentMedia) {
      if (document.value) {
        const media = await saveProtectedMedia(userId, "studio", studioId, document.purpose, document.value, document.name);
        if (media) (newStudio as any)[document.purpose === "BUSINESS_PERMIT" ? "businessPermit" : document.purpose === "OWNER_VALID_ID" ? "validId" : "otherDocs"] = `/api/media/${media.mediaId}`;
      }
    }
    await db.save();
    logAction(userId, email, `Registered new photography studio: ${newStudio.name}`, "STUDIO", studioId);
    
    // Notify super admin
    db.users.filter(u => u.role === UserRole.SUPER_ADMIN).forEach(admin => {
      notifyUser(admin.id, "New Studio Registration", `Studio '${newStudio.name}' has registered and is pending verification.`, "warning");
    });
  }

  const newUser = {
    id: userId,
    email,
    passwordHash: hashedPassword,
    fullName,
    role: targetRole as UserRole,
    studioId,
    contactNumber,
    address,
    createdAt: new Date().toISOString()
  };

  db.addUser(newUser);
  logAction(userId, email, `Registered user account as ${targetRole}`, "USER", userId);

  res.json({
    success: true,
    message: "Registration submitted successfully. Please wait for Super Admin approval before signing in to the Studio Portal."
  });
});

// CMS Content Management Endpoints
app.get("/api/cms", (req, res) => {
  const cmsMap: { [key: string]: string } = {};
  db.cmsSettings.forEach(s => {
    cmsMap[s.key] = s.value;
  });
  res.json({ success: true, cms: cmsMap });
});

app.post("/api/cms", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const updates = req.body;
  if (!updates || typeof updates !== "object") {
    return res.status(400).json({ success: false, message: "Invalid payload." });
  }

  for (const [key, value] of Object.entries(updates)) {
    const stringVal = String(value);
    const index = db.cmsSettings.findIndex(s => s.key === key);
    if (index !== -1) {
      db.cmsSettings[index].value = stringVal;
    } else {
      db.cmsSettings.push({
        id: key,
        key: key,
        value: stringVal
      });
    }
  }

  db.save();
  logAction("system", "system@cainta-mis.com", "Updated system content settings (CMS)", "SYSTEM", "CMS");
  res.json({ success: true, message: "CMS settings updated successfully.", cms: db.cmsSettings });
});

// System Settings (Theme, colors, feature toggles, nav visibility)
app.get("/api/admin/settings", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  res.json({ success: true, settings: db.systemSettings });
});

app.post("/api/admin/settings", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const updates = req.body;
  if (!updates) {
    return res.status(400).json({ success: false, message: "Invalid payload." });
  }
  db.updateSystemSettings(updates);
  logAction("system", "system@cainta-mis.com", "Updated system settings & UI config", "SYSTEM", "SETTINGS");
  res.json({ success: true, settings: db.systemSettings });
});

// The approved audio is public read-only configuration. Only the endpoint above can change it.
app.get("/api/system/audio", (_req, res) => {
  res.json({
    success: true,
    audioUrl: db.systemSettings.customAudioUrl || "",
    isEnabled: db.systemSettings.isSoundEnabled && db.systemSettings.customAudioEnabled !== false
  });
});

// SMTP Status & Test Email Dispatch Endpoint
app.get("/api/admin/smtp-status", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  res.json({
    success: true,
    isConfigured: !!(smtpEmail && smtpPassword),
    senderEmail: smtpEmail || "Not configured",
    service: "Gmail SMTP"
  });
});

app.post("/api/admin/send-test-email", async (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const { toEmail } = req.body;
  const targetEmail = toEmail || smtpEmail;

  if (!targetEmail) {
    return res.status(400).json({ success: false, message: "No recipient email address specified." });
  }

  if (!mailTransporter || !smtpEmail) {
    return res.status(500).json({
      success: false,
      message: "SMTP is not active. Please check SMTP_EMAIL and SMTP_APP_PASSWORD in .env."
    });
  }

  try {
    await sendEmailNotification(
      targetEmail,
      "Test Notification from Cainta Photography MIS",
      "Congratulations! Your Gmail SMTP configuration is fully operational. Real-time booking confirmations, payment approvals, studio applications, and client proofing notifications will now be delivered to your inbox automatically.",
      "success"
    );
    res.json({
      success: true,
      message: `Test email notification successfully sent to ${targetEmail} via Gmail SMTP!`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: `SMTP error: ${err?.message || "Failed to dispatch email"}` });
  }
});

// Custom Pages Builder Endpoints
app.get("/api/custom-pages", (req, res) => {
  if (req.method !== "GET" && !requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  res.json({ success: true, pages: db.customPages });
});

app.post("/api/custom-pages", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const { title, slug, isPublished, showInNavbar, blocks } = req.body;
  if (!title || !slug) {
    return res.status(400).json({ success: false, message: "Title and slug are required." });
  }
  const newPage = {
    id: generateId("PAGE"),
    title,
    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    isPublished: isPublished !== undefined ? isPublished : true,
    showInNavbar: showInNavbar !== undefined ? showInNavbar : true,
    blocks: blocks || [],
    createdAt: new Date().toISOString()
  };
  db.customPages.push(newPage);
  db.save();
  logAction("system", "system@cainta-mis.com", `Created custom page: ${title}`, "PAGE", newPage.id);
  res.json({ success: true, page: newPage });
});

app.put("/api/custom-pages/:id", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const index = db.customPages.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Custom page not found." });
  }
  const updated = {
    ...db.customPages[index],
    ...req.body
  };
  db.customPages[index] = updated;
  db.save();
  logAction("system", "system@cainta-mis.com", `Updated custom page: ${updated.title}`, "PAGE", updated.id);
  res.json({ success: true, page: updated });
});

app.delete("/api/custom-pages/:id", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const index = db.customPages.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Custom page not found." });
  }
  const removed = db.customPages.splice(index, 1)[0];
  db.save();
  logAction("system", "system@cainta-mis.com", `Deleted custom page: ${removed.title}`, "PAGE", removed.id);
  res.json({ success: true, message: "Custom page deleted successfully." });
});

// Admin-Only Direct Studio Owner Registration
app.post("/api/admin/register-studio", async (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const { 
    email, password, fullName, contactNumber, userAddress,
    studioName, description, categories, startingPrice, businessHours,
    address, location, latitude, longitude, businessPermit, validId, otherDocs
  } = req.body;

  if (!email || !password || !fullName || !studioName) {
    return res.status(400).json({ success: false, message: "Required fields are missing." });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) ||
                   db.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: "Email is already registered." });
  }

  const userId = generateId("U");
  const studioId = generateId("ST");
  const hashedPassword = bcrypt.hashSync(password, 10);

  // 1. Create registered studio
  const newStudio: Studio = {
    id: studioId,
    name: studioName,
    ownerId: userId,
    logo: "",
    coverImage: "",
    location: location || "Cainta, Rizal",
    rating: 5.0,
    reviewCount: 0,
    startingPrice: Number(startingPrice) || 1000,
    categories: Array.isArray(categories) ? categories : ["Portrait Photography"],
    description: description || "Centralized photography studio.",
    address: address || userAddress || "Cainta, Rizal",
    contactInfo: contactNumber || "+63 900 000 0000",
    email: email,
    businessHours: businessHours || "09:00 AM - 06:00 PM",
    isApproved: true,
    status: "approved",
    printingAvailable: true,
    latitude: latitude !== undefined ? Number(latitude) : undefined,
    longitude: longitude !== undefined ? Number(longitude) : undefined,
    businessPermit: undefined,
    validId: undefined,
    otherDocs: undefined,
    registeredByAdmin: true,
    createdAt: new Date().toISOString()
  };

  const documentMedia: Array<{ purpose: string; value: string; name: string }> = [
    { purpose: "BUSINESS_PERMIT", value: businessPermit, name: "business-permit" },
    { purpose: "OWNER_VALID_ID", value: validId, name: "owner-valid-id" },
    { purpose: "SUPPORTING_DOCUMENT", value: otherDocs, name: "supporting-document" }
  ];

  // 2. Create registered user
  const newUser = {
    id: userId,
    email,
    passwordHash: hashedPassword,
    fullName,
    role: UserRole.STUDIO_ADMIN,
    studioId,
    contactNumber,
    address: userAddress,
    createdAt: new Date().toISOString()
  };

  db.addStudio(newStudio);
  db.addUser(newUser);
  for (const document of documentMedia) {
    if (document.value) {
      const media = await saveProtectedMedia(userId, "studio", studioId, document.purpose, document.value, document.name);
      if (media) (newStudio as any)[document.purpose === "BUSINESS_PERMIT" ? "businessPermit" : document.purpose === "OWNER_VALID_ID" ? "validId" : "otherDocs"] = `/api/media/${media.mediaId}`;
    }
  }
  await db.save();
  
  logAction("system", "system@cainta-mis.com", `Directly registered and verified studio owner account: ${email} for studio ${studioName}`, "STUDIO", studioId);
  notifyUser(userId, "Welcome to Cainta Studio Network", `Your studio '${studioName}' has been directly registered and approved by the Super Admin.`, "success", studioId);

  res.json({ success: true, message: "Studio and owner registered successfully by admin.", user: newUser, studio: newStudio });
});

// Admin-Only Direct Generic User Creation (Customer, Studio Staff, Super Admin)
app.post("/api/admin/create-user", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const { email, password, fullName, contactNumber, address, role, studioId } = req.body;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ success: false, message: "Email, password, name, and role are required." });
  }

  const existingInUsers = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  const existingInCustomers = db.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (existingInUsers || existingInCustomers) {
    return res.status(400).json({ success: false, message: "Email is already registered." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  if (role === "CUSTOMER") {
    const userId = generateId("CUST");
    const newCustomer = {
      id: userId,
      email,
      passwordHash: hashedPassword,
      fullName,
      role: "CUSTOMER" as const,
      contactNumber,
      address,
      createdAt: new Date().toISOString()
    };
    db.addCustomer(newCustomer);
    logAction("system", "system@cainta-mis.com", `Admin created customer user account: ${email}`, "CUSTOMER", userId);
    return res.json({ success: true, message: "Customer account created successfully.", user: newCustomer });
  } else {
    const userId = generateId("U");
    const newUser = {
      id: userId,
      email,
      passwordHash: hashedPassword,
      fullName,
      role: role as UserRole,
      studioId: studioId || undefined,
      contactNumber,
      address,
      createdAt: new Date().toISOString()
    };
    db.addUser(newUser);
    logAction("system", "system@cainta-mis.com", `Admin created user account (${role}): ${email}`, "USER", userId);
    return res.json({ success: true, message: `User account (${role}) created successfully.`, user: newUser });
  }
});

// Studio Endpoints
app.get("/api/studios", (req, res) => {
  // Only approved studios appear publicly, unless a super-admin wants all, or we supply query param
  const { includePending } = req.query;
  if (includePending === "true") {
    if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
    return res.json({ success: true, studios: db.studios });
  }
  const approved = db.studios.filter(s => s.status === "approved" || s.isApproved);
  res.json({ success: true, studios: approved });
});

app.get("/api/studios/:id", (req, res) => {
  const studio = db.studios.find(s => s.id === req.params.id);
  if (!studio) {
    return res.status(404).json({ success: false, message: "Studio not found" });
  }
  if (!studio.isApproved && studio.status !== "approved") {
    const user = requireRole(req, res, UserRole.SUPER_ADMIN, UserRole.STUDIO_ADMIN);
    if (!user || (user.role === UserRole.STUDIO_ADMIN && user.studioId !== studio.id)) return;
  }
  // Load related information
  const services = db.services.filter(s => s.studioId === studio.id && s.isActive);
  const packages = db.packages.filter(p => p.studioId === studio.id && p.isActive);
  const addons = db.addons.filter(a => a.studioId === studio.id);
  const reviews = db.reviews.filter(r => r.studioId === studio.id);
  const printProducts = db.printProducts.filter(p => p.studioId === studio.id && p.isActive);

  res.json({
    success: true,
    studio,
    services,
    packages,
    addons,
    reviews,
    printProducts
  });
});

app.post("/api/studios", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const studioId = generateId("ST");
  const newStudio: Studio = {
    id: studioId,
    ...req.body,
    rating: 5.0,
    reviewCount: 0,
    isApproved: false,
    status: "pending",
    createdAt: new Date().toISOString()
  };
  db.addStudio(newStudio);
  res.json({ success: true, studio: newStudio });
});

app.put("/api/studios/:id", async (req, res) => {
  const index = db.studios.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Studio not found." });
  }
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const isOwnerOrAdmin = user.role === UserRole.SUPER_ADMIN || 
                         (user.role === UserRole.STUDIO_ADMIN && (user.studioId === req.params.id || db.studios[index].ownerId === user.id));
  if (!isOwnerOrAdmin) {
    return res.status(403).json({ success: false, message: "You cannot update this studio." });
  }
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const ownerFields = [
    "name", "logo", "coverImage", "location", "categories", "description", "address",
    "contactInfo", "email", "businessHours", "printingAvailable", "latitude", "longitude"
  ];
  const adminFields = [...ownerFields, "ownerId", "isApproved", "status", "businessPermit", "validId", "otherDocs", "registeredByAdmin"];
  const allowedFields = isSuperAdmin ? adminFields : ownerFields;
  const unknownFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
  if (unknownFields.length > 0) {
    return res.status(400).json({ success: false, message: `Unknown or protected studio fields: ${unknownFields.join(", ")}.` });
  }
  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (field in req.body) updates[field] = req.body[field];
  }
  if (updates.latitude !== undefined && (typeof updates.latitude !== "number" || updates.latitude < -90 || updates.latitude > 90)) {
    return res.status(400).json({ success: false, message: "Latitude must be a number between -90 and 90." });
  }
  if (updates.longitude !== undefined && (typeof updates.longitude !== "number" || updates.longitude < -180 || updates.longitude > 180)) {
    return res.status(400).json({ success: false, message: "Longitude must be a number between -180 and 180." });
  }
  const uploadFields: Array<{ field: "logo" | "coverImage" | "businessPermit" | "validId" | "otherDocs"; purpose: string }> = [
    { field: "logo", purpose: "STUDIO_LOGO" },
    { field: "coverImage", purpose: "STUDIO_COVER" },
    { field: "businessPermit", purpose: "BUSINESS_PERMIT" },
    { field: "validId", purpose: "OWNER_VALID_ID" },
    { field: "otherDocs", purpose: "SUPPORTING_DOCUMENT" }
  ];
  for (const upload of uploadFields) {
    const value = updates[upload.field];
    if (typeof value === "string" && value.startsWith("data:")) {
      const media = await saveProtectedMedia(user.id, "studio", req.params.id, upload.purpose, value, upload.field);
      if (!media) return res.status(400).json({ success: false, message: `${upload.field} is not a supported file.` });
      updates[upload.field] = `/api/media/${media.mediaId}`;
    }
  }
  db.studios[index] = { ...db.studios[index], ...updates };
  db.save();
  logAction(user.id, user.email, "Updated studio profile", "STUDIO", req.params.id);
  res.json({ success: true, studio: db.studios[index] });
});

app.put("/api/studios/:id/approve", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const index = db.studios.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Studio not found." });
  }
  db.studios[index].isApproved = true;
  db.studios[index].status = "approved";
  db.save();

  const studio = db.studios[index];
  logAction("system", "system@cainta-mis.com", `Approved studio registration: ${studio.name}`, "STUDIO", studio.id);
  notifyUser(studio.ownerId, "Studio Approved", `Your studio '${studio.name}' has been verified and approved by the Super Admin! You can now start receiving client bookings.`, "success", studio.id);

  res.json({ success: true, studio });
});

app.put("/api/studios/:id/reject", (req, res) => {
  const admin = requireRole(req, res, UserRole.SUPER_ADMIN);
  if (!admin) return;
  const index = db.studios.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: "Studio not found." });

  const studio = db.studios[index];
  studio.isApproved = false;
  studio.status = "rejected";
  db.save();
  for (const [token, session] of authSessions.entries()) {
    if (session.userId === studio.ownerId) authSessions.delete(token);
  }
  logAction(admin.id, admin.email, `Rejected studio registration: ${studio.name}`, "STUDIO", studio.id);
  notifyUser(studio.ownerId, "Studio Registration Rejected", `Your studio '${studio.name}' was rejected by the Super Admin.`, "error", studio.id);
  res.json({ success: true, studio });
});

app.put("/api/admin/users/:id/status", (req, res) => {
  const admin = requireRole(req, res, UserRole.SUPER_ADMIN);
  if (!admin) return;
  const { status } = req.body;
  if (!["approved", "rejected", "suspended"].includes(status)) {
    return res.status(400).json({ success: false, message: "Status must be approved, rejected, or suspended." });
  }
  const user = db.users.find(item => item.id === req.params.id);
  if (!user || user.role !== UserRole.STUDIO_ADMIN) {
    return res.status(400).json({ success: false, message: "Only studio-owner accounts can be moderated here." });
  }
  const studio = db.studios.find(item => item.ownerId === user.id || item.id === user.studioId);
  if (!studio) return res.status(404).json({ success: false, message: "Owner studio not found." });

  studio.status = status;
  studio.isApproved = status === "approved";
  db.save();
  if (status !== "approved") {
    for (const [token, session] of authSessions.entries()) {
      if (session.userId === user.id) authSessions.delete(token);
    }
  }
  logAction(admin.id, admin.email, `${status[0].toUpperCase()}${status.slice(1)} studio owner account`, "USER", user.id);
  notifyUser(user.id, `Studio Account ${status[0].toUpperCase()}${status.slice(1)}`, `Your studio account has been ${status} by the Super Admin.`, status === "approved" ? "success" : "error", studio.id);
  res.json({ success: true, user, studio });
});

app.delete("/api/studios/:id", (req, res) => {
  const admin = requireRole(req, res, UserRole.SUPER_ADMIN);
  if (!admin) return;
  const index = db.studios.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Studio not found." });
  }
  const studio = db.studios[index];
  const hasActiveBookings = db.bookings.some(booking => booking.studioId === studio.id && !["Completed", "Cancelled", "Rejected", "Expired", "No Show"].includes(booking.status));
  if (hasActiveBookings) {
    return res.status(409).json({ success: false, message: "This studio has active bookings and cannot be archived yet." });
  }
  studio.status = "suspended";
  studio.isApproved = false;
  db.save();
  logAction(admin.id, admin.email, `Archived studio: ${studio.name}`, "STUDIO", studio.id);
  res.json({ success: true, message: "Studio archived successfully.", studio });
});

// Studio Staff Management Endpoints
app.get("/api/studios/:id/staff", (req, res) => {
  const user = requireStudioAccess(req, res, req.params.id);
  if (!user) return;
  const staff = db.users
    .filter(u => u.studioId === req.params.id && [UserRole.STUDIO_ADMIN, UserRole.STUDIO_STAFF].includes(u.role))
    .map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
  res.json({ success: true, staff });
});

app.post("/api/studios/:id/staff/invite", (req, res) => {
  const user = requireStudioAccess(req, res, req.params.id);
  if (!user) return;
  if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.STUDIO_ADMIN) {
    return res.status(403).json({ success: false, message: "Only studio administrators can invite staff." });
  }

  const { email, fullName, password, contactNumber } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ success: false, message: "Staff email and full name are required." });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) ||
                   db.customers.find(c => c.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: "An account with this email already exists." });
  }

  const staffId = generateId("STAFF");
  const defaultPassword = password || "Staff123!";
  const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

  const newStaff = {
    id: staffId,
    email: email.trim(),
    passwordHash: hashedPassword,
    fullName: fullName.trim(),
    role: UserRole.STUDIO_STAFF,
    studioId: req.params.id,
    contactNumber: contactNumber || undefined,
    createdAt: new Date().toISOString()
  };

  db.addUser(newStaff);
  logAction(user.id, user.email, `Invited new studio staff: ${fullName}`, "USER", staffId);
  sendEmailNotification(
    email.trim(),
    "Studio Staff Invitation",
    `You have been invited to join the studio management team on Cainta Photography Studio MIS. Your temporary login password is: ${defaultPassword}`,
    "info"
  );

  const { passwordHash: _, ...safeStaff } = newStaff;
  res.json({ success: true, staff: safeStaff });
});

app.delete("/api/studios/:id/staff/:staffId", (req, res) => {
  const user = requireStudioAccess(req, res, req.params.id);
  if (!user) return;
  if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.STUDIO_ADMIN) {
    return res.status(403).json({ success: false, message: "Only studio administrators can remove staff." });
  }

  const index = db.users.findIndex(u => u.id === req.params.staffId && u.studioId === req.params.id && u.role === UserRole.STUDIO_STAFF);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Staff member not found or is not removable." });
  }

  const removed = db.users.splice(index, 1)[0];
  db.save();
  logAction(user.id, user.email, `Removed staff member: ${removed.fullName}`, "USER", removed.id);
  res.json({ success: true, message: "Staff member removed successfully." });
});

// Users & Customers Endpoints
app.get("/api/users", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  // Combines admin/studio users and customers for comprehensive system overview
  const allAccounts = [
    ...db.users,
    ...db.customers.map(c => ({ ...c, role: "CUSTOMER" as const }))
  ];
  res.json({ success: true, users: allAccounts });
});

// Dedicated Customers Table Endpoint
app.get("/api/customers", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  res.json({ success: true, customers: db.customers });
});

// Global Services
app.get("/api/services", (req, res) => {
  res.json({ success: true, services: db.services });
});

// Global Packages
app.get("/api/packages", (req, res) => {
  res.json({ success: true, packages: db.packages });
});

// Global Addons
app.get("/api/addons", (req, res) => {
  res.json({ success: true, addons: db.addons });
});

// Global Reviews - PUBLIC: only approved reviews visible
app.get("/api/reviews", (req, res) => {
  const approvedReviews = db.reviews.filter(r => r.status === "approved");
  res.json({ success: true, reviews: approvedReviews });
});

// Categories
app.get("/api/categories", (req, res) => {
  res.json({ success: true, categories: db.categories });
});

app.post("/api/categories", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const { name, description } = req.body;
  const newCat = {
    id: generateId("CAT"),
    name,
    description,
    createdAt: new Date().toISOString()
  };
  db.addCategory(newCat);
  res.json({ success: true, category: newCat });
});

app.delete("/api/categories/:id", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const index = db.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Category not found." });
  }
  db.categories.splice(index, 1);
  db.save();
  res.json({ success: true, message: "Category removed successfully." });
});

// Service management
app.get("/api/studios/:studioId/services", (req, res) => {
  const services = db.services.filter(s => s.studioId === req.params.studioId);
  res.json({ success: true, services });
});

app.post("/api/studios/:studioId/services", async (req, res) => {
  const user = requireStudioAccess(req, res, req.params.studioId);
  if (!user) return;
  const newService: StudioService = {
    id: generateId("SRV"),
    studioId: req.params.studioId,
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    basePrice: Number(req.body.basePrice),
    durationMinutes: Number(req.body.durationMinutes),
    image: "",
    isActive: true,
    availableDays: req.body.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    availableSlots: req.body.availableSlots || ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"],
    requirements: req.body.requirements || ["Arrive 10 minutes early"],
    createdAt: new Date().toISOString()
  };
  if (req.body.image) {
    const media = await saveProtectedMedia(user.id, "service", newService.id, "SERVICE_IMAGE", req.body.image, "service-image");
    if (!media) return res.status(400).json({ success: false, message: "Service image must be a supported image smaller than 8 MB." });
    newService.image = `/api/media/${media.mediaId}`;
  }
  db.addService(newService);
  res.json({ success: true, service: newService });
});

app.put("/api/services/:id", (req, res) => {
  const index = db.services.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Service not found." });
  }
  if (!requireStudioAccess(req, res, db.services[index].studioId)) return;
  db.services[index] = { ...db.services[index], ...req.body };
  db.save();
  res.json({ success: true, service: db.services[index] });
});

app.delete("/api/services/:id", (req, res) => {
  const index = db.services.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Service not found." });
  }
  if (!requireStudioAccess(req, res, db.services[index].studioId)) return;
  db.services.splice(index, 1);
  db.save();
  res.json({ success: true, message: "Service deleted." });
});

// Packages
app.get("/api/studios/:studioId/packages", (req, res) => {
  const packages = db.packages.filter(p => p.studioId === req.params.studioId);
  res.json({ success: true, packages });
});

app.post("/api/studios/:studioId/packages", async (req, res) => {
  const user = requireStudioAccess(req, res, req.params.studioId);
  if (!user) return;
  const newPkg: StudioPackage = {
    id: generateId("PKG"),
    studioId: req.params.studioId,
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price),
    durationMinutes: Number(req.body.durationMinutes),
    editedPhotosCount: Number(req.body.editedPhotosCount),
    includedPrints: req.body.includedPrints || "None",
    photographerCount: Number(req.body.photographerCount),
    includedServices: req.body.includedServices || [],
    termsAndConditions: req.body.termsAndConditions || "No terms specified.",
    image: "",
    isActive: true,
    createdAt: new Date().toISOString()
  };
  if (req.body.image) {
    const media = await saveProtectedMedia(user.id, "package", newPkg.id, "PACKAGE_IMAGE", req.body.image, "package-image");
    if (!media) return res.status(400).json({ success: false, message: "Package image must be a supported image smaller than 8 MB." });
    newPkg.image = `/api/media/${media.mediaId}`;
  }
  db.addPackage(newPkg);
  res.json({ success: true, package: newPkg });
});

app.put("/api/packages/:id", (req, res) => {
  const index = db.packages.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Package not found." });
  }
  if (!requireStudioAccess(req, res, db.packages[index].studioId)) return;
  db.packages[index] = { ...db.packages[index], ...req.body };
  db.save();
  res.json({ success: true, package: db.packages[index] });
});

app.delete("/api/packages/:id", (req, res) => {
  const index = db.packages.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Package not found." });
  }
  if (!requireStudioAccess(req, res, db.packages[index].studioId)) return;
  db.packages.splice(index, 1);
  db.save();
  res.json({ success: true, message: "Package deleted." });
});

// Addons
app.get("/api/studios/:studioId/addons", (req, res) => {
  const addons = db.addons.filter(a => a.studioId === req.params.studioId);
  res.json({ success: true, addons });
});

app.post("/api/studios/:studioId/addons", (req, res) => {
  if (!requireStudioAccess(req, res, req.params.studioId)) return;
  const newAddon = {
    id: generateId("ADD"),
    studioId: req.params.studioId,
    name: req.body.name,
    price: Number(req.body.price),
    description: req.body.description || "",
    createdAt: new Date().toISOString()
  };
  db.addAddon(newAddon);
  res.json({ success: true, addon: newAddon });
});

app.delete("/api/addons/:id", (req, res) => {
  const index = db.addons.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Addon not found." });
  }
  if (!requireStudioAccess(req, res, db.addons[index].studioId)) return;
  db.addons.splice(index, 1);
  db.save();
  res.json({ success: true, message: "Addon removed." });
});

// Helper to parse time slot string (e.g., "09:00 AM", "01:30 PM", "14:00") into minutes from midnight
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 540; // Default 9:00 AM
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes("PM");
  const isAM = clean.includes("AM");
  const numbers = clean.replace(/[^0-9:]/g, "");
  const parts = numbers.split(":");
  let hours = parseInt(parts[0], 10) || 9;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Bookings
app.get("/api/bookings", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  db.bookings.forEach(expireUnpaidBooking);
  const { customerId, studioId } = req.query;
  let filtered = db.bookings.map(booking => ({
    ...booking,
    pendingPaymentAmount: db.payments
      .filter(payment => payment.bookingId === booking.id && payment.paymentStatus === "Pending Verification")
      .reduce((sum, payment) => sum + Number(payment.amount), 0)
  }));
  if (user.role === UserRole.CUSTOMER) filtered = filtered.filter(b => b.customerId === user.id);
  else if (user.role === UserRole.STUDIO_ADMIN || user.role === UserRole.STUDIO_STAFF) filtered = filtered.filter(b => b.studioId === user.studioId);
  if (customerId && user.role === UserRole.SUPER_ADMIN) filtered = filtered.filter(b => b.customerId === customerId);
  if (studioId && user.role === UserRole.SUPER_ADMIN) filtered = filtered.filter(b => b.studioId === studioId);
  res.json({ success: true, bookings: filtered });
});

app.get("/api/bookings/:id", (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }
  if (!requireBookingAccess(req, res, booking)) return;
  res.json({ success: true, booking });
});

app.post("/api/bookings", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { studioId, customerId, serviceId, packageId, bookingDate, timeSlot, addons, customerDetails, totalAmount } = req.body;

  if (user.role !== UserRole.CUSTOMER || customerId !== user.id) {
    return res.status(403).json({ success: false, message: "Only the authenticated customer can create this booking." });
  }

  const studio = db.studios.find(item => item.id === studioId && (item.status === "approved" || item.isApproved));
  if (!studio) {
    return res.status(400).json({ success: false, message: "Bookings are available only for approved studios." });
  }
  const selectedPackage = db.packages.find(item => item.id === packageId && item.studioId === studioId);
  if (!selectedPackage) {
    return res.status(400).json({ success: false, message: "The selected package is not valid for this studio." });
  }
  const selectedService = serviceId ? db.services.find(item => item.id === serviceId && item.studioId === studioId && item.isActive) : undefined;
  if (serviceId && !selectedService) {
    return res.status(400).json({ success: false, message: "The selected service is not valid for this studio." });
  }
  const requestedDate = new Date(`${bookingDate}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(bookingDate)) || Number.isNaN(requestedDate.getTime()) || requestedDate < new Date(new Date().toDateString())) {
    return res.status(400).json({ success: false, message: "Booking date must be today or a future date." });
  }
  if (selectedService) {
    const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" });
    if (!selectedService.availableDays.includes(dayName) || !selectedService.availableSlots.includes(timeSlot)) {
      return res.status(400).json({ success: false, message: "The selected date or time is not available for this service." });
    }
  }
  const selectedAddons = Array.isArray(addons) ? addons : [];
  const calculatedTotal = Number(selectedPackage.price) + selectedAddons.reduce((sum: number, addon: any) => {
    const catalogAddon = db.addons.find(item => item.id === addon.addonId && item.studioId === studioId);
    return sum + (catalogAddon ? Number(catalogAddon.price) * Math.max(1, Number(addon.quantity) || 1) : 0);
  }, 0);

  // Determine duration of shoot in minutes
  let shootDuration = 60; // Default 1 hour
  if (packageId) {
    const pkg = db.packages.find(p => p.id === packageId);
    if (pkg?.durationMinutes) shootDuration = pkg.durationMinutes;
  } else if (serviceId) {
    const srv = db.services.find(s => s.id === serviceId);
    if (srv?.durationMinutes) shootDuration = srv.durationMinutes;
  }

  const newStartMinutes = parseTimeToMinutes(timeSlot);
  const newEndMinutes = newStartMinutes + shootDuration;

  // Advanced Time-Range Overlap Conflict Check:
  // (StartA < EndB) AND (EndA > StartB)
  const overlappingBooking = db.bookings.find(b => {
    if (b.studioId !== studioId || b.bookingDate !== bookingDate) return false;
    if (["Cancelled", "Rejected", "Expired"].includes(b.status)) return false;

    // Find duration of existing booking
    let existingDuration = 60;
    if (b.packageId) {
      const p = db.packages.find(pkg => pkg.id === b.packageId);
      if (p?.durationMinutes) existingDuration = p.durationMinutes;
    } else if (b.serviceId) {
      const s = db.services.find(srv => srv.id === b.serviceId);
      if (s?.durationMinutes) existingDuration = s.durationMinutes;
    }

    const existingStart = parseTimeToMinutes(b.timeSlot);
    const existingEnd = existingStart + existingDuration;

    // Interval collision condition
    return newStartMinutes < existingEnd && newEndMinutes > existingStart;
  });

  if (overlappingBooking) {
    return res.status(400).json({ 
      success: false, 
      message: `Time slot conflict! Studio already has booking #${overlappingBooking.id} scheduled at ${overlappingBooking.timeSlot} on ${bookingDate}. Please choose another time.` 
    });
  }

  const bookingId = generateId("BK-2026");
  const newBooking: Booking = {
    id: bookingId,
    studioId,
    customerId,
    serviceId,
    packageId,
    bookingDate,
    timeSlot,
    addons: addons || [],
    customerDetails,
    status: "Pending",
    totalAmount: calculatedTotal,
    amountPaid: 0,
    downPaymentAmount: Math.round(calculatedTotal * 0.3 * 100) / 100,
    remainingBalance: calculatedTotal,
    paymentStatus: "Unpaid",
    finalPaymentStatus: "Pending",
    paymentDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };

  db.addBooking(newBooking);

  // Notifications
  notifyUser(customerId, "Booking Created", `Your booking at ${db.studios.find(s=>s.id===studioId)?.name} is successfully created. Complete payment to secure your slot!`, "info");
  
  // Find studio admin to notify
  const studioAdmin = db.users.find(u => u.studioId === studioId && u.role === UserRole.STUDIO_ADMIN);
  if (studioAdmin) {
    notifyUser(studioAdmin.id, "New Booking Received", `A new booking (${bookingId}) has been made for ${bookingDate} at ${timeSlot}.`, "warning", studioId);
  }

  res.json({ success: true, booking: newBooking });
});

app.put("/api/bookings/:id/assign-staff", (req, res) => {
  const index = db.bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }

  const booking = db.bookings[index];
  const user = requireStudioAccess(req, res, booking.studioId);
  if (!user) return;

  const { staffId, staffName } = req.body;
  if (!staffId || !staffName) {
    return res.status(400).json({ success: false, message: "Staff ID and staff name are required." });
  }

  (db.bookings[index] as any).assignedStaffId = staffId;
  (db.bookings[index] as any).assignedStaffName = staffName;
  db.save();

  logAction(user.id, user.email, `Assigned staff ${staffName} to booking ${booking.id}`, "BOOKING", booking.id);
  notifyUser(staffId, "Booking Assigned", `You have been assigned to shoot booking ${booking.id} on ${booking.bookingDate} at ${booking.timeSlot}.`, "info", booking.studioId);

  res.json({ success: true, booking: db.bookings[index] });
});

app.put("/api/bookings/:id/checklist", (req, res) => {
  const index = db.bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }

  const booking = db.bookings[index];
  const user = requireStudioAccess(req, res, booking.studioId);
  if (!user) return;

  const { checklist } = req.body;
  if (!Array.isArray(checklist)) {
    return res.status(400).json({ success: false, message: "Checklist must be an array." });
  }

  (db.bookings[index] as any).preShootChecklist = checklist;
  db.save();

  res.json({ success: true, booking: db.bookings[index] });
});

app.put("/api/bookings/:id/status", (req, res) => {
  const { status, amountPaid, paymentStatus } = req.body;
  const index = db.bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }

  const original = db.bookings[index];
  const user = requireBookingAccess(req, res, original);
  if (!user || user.role === UserRole.CUSTOMER) {
    if (user?.role === UserRole.CUSTOMER) res.status(403).json({ success: false, message: "Customers cannot change booking status." });
    return;
  }
  const allowedTransitions: Record<string, string[]> = {
    Pending: ["Awaiting Payment", "Cancelled", "Expired"],
    "Awaiting Payment": ["Pending", "Confirmed", "Cancelled", "Expired"],
    Confirmed: ["Ongoing", "Rescheduled", "Cancelled"],
    Rescheduled: ["Confirmed", "Cancelled"],
    Ongoing: ["Completed", "No Show"],
    Completed: []
  };
  if (status && status !== original.status && !allowedTransitions[original.status]?.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid booking status transition from ${original.status} to ${status}.` });
  }
  db.bookings[index] = {
    ...original,
    status: status || original.status,
    amountPaid: amountPaid !== undefined ? Number(amountPaid) : original.amountPaid,
    paymentStatus: paymentStatus || original.paymentStatus
  };
  db.save();

  // Notify customer
  notifyUser(original.customerId, `Booking Status Updated`, `Your booking ${original.id} status is now: ${status || original.status}`, "success");

  res.json({ success: true, booking: db.bookings[index] });
});

app.put("/api/bookings/:id/requirements", async (req, res) => {
  const { fileName, fileData } = req.body;
  const index = db.bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }
  const user = requireBookingAccess(req, res, db.bookings[index], false);
  if (!user) return;
  if (user.role !== UserRole.CUSTOMER) {
    return res.status(403).json({ success: false, message: "Only the booking customer can submit requirements." });
  }
  if (!fileData || typeof fileData !== "string") {
    return res.status(400).json({ success: false, message: "A requirement file is required." });
  }
  const media = await saveProtectedMedia(user.id, "booking", req.params.id, "BOOKING_REQUIREMENT", fileData, fileName || "booking-requirement");
  if (!media) {
    return res.status(400).json({ success: false, message: "Requirement must be a supported image or PDF smaller than 8 MB." });
  }
  db.bookings[index].requirementsDoc = `/api/media/${media.mediaId}`;
  db.save();
  res.json({ success: true, booking: db.bookings[index] });
});

// Payments
function syncBookingPaymentTotals(booking: Booking) {
  const bookingPayments = db.payments.filter(payment => payment.bookingId === booking.id);
  const verifiedPayments = bookingPayments.filter(payment => payment.paymentStatus === "Paid");
  const paidAmount = Math.min(booking.totalAmount, verifiedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0));
  const hasPendingPayment = bookingPayments.some(payment => payment.paymentStatus === "Pending Verification");

  booking.amountPaid = paidAmount;
  booking.remainingBalance = Math.max(0, booking.totalAmount - paidAmount);
  booking.finalPaymentStatus = booking.remainingBalance === 0 ? "Paid" : "Pending";
  booking.paymentStatus = hasPendingPayment
    ? "Pending Verification"
    : booking.finalPaymentStatus === "Paid"
      ? "Paid"
      : paidAmount > 0
        ? "Partially Paid"
        : "Unpaid";

  if (booking.finalPaymentStatus === "Paid" || paidAmount >= booking.downPaymentAmount) {
    booking.status = "Confirmed";
  }
}

app.get("/api/payments", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { studioId, customerId } = req.query;
  let filtered = db.payments.map(p => ({
    ...p,
    status: (p as any).status || p.paymentStatus
  }));
  if (user.role === UserRole.CUSTOMER) {
    filtered = filtered.filter(p => p.customerId === user.id);
  } else if (user.role === UserRole.STUDIO_ADMIN || user.role === UserRole.STUDIO_STAFF) {
    filtered = filtered.filter(p => p.studioId === user.studioId);
  }
  if (studioId && user.role === UserRole.SUPER_ADMIN) filtered = filtered.filter(p => p.studioId === studioId);
  if (customerId && user.role === UserRole.SUPER_ADMIN) filtered = filtered.filter(p => p.customerId === customerId);
  res.json({ success: true, payments: filtered });
});

app.post("/api/payments", async (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { bookingId, amount, paymentMethod, referenceNumber, proofOfPayment } = req.body;
  const booking = db.bookings.find(item => item.id === bookingId);
  const paymentAmount = Number(amount);

  if (!booking || user.role !== UserRole.CUSTOMER || booking.customerId !== user.id) {
    return res.status(400).json({ success: false, message: "The payment does not match a valid booking." });
  }
  if (["Cancelled", "Rejected", "Expired"].includes(booking.status)) {
    return res.status(400).json({ success: false, message: "This booking cannot accept a downpayment." });
  }
  if (!Number.isFinite(paymentAmount) || Math.abs(paymentAmount - booking.downPaymentAmount) > 0.01) {
    return res.status(400).json({ success: false, message: `The downpayment must be exactly ₱${booking.downPaymentAmount.toLocaleString()}.` });
  }
  if (!["Cash", "GCash", "Bank Transfer", "Online Payment"].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: "Choose a valid payment method." });
  }
  if (paymentMethod !== "Cash" && (!referenceNumber?.trim() || !proofOfPayment)) {
    return res.status(400).json({ success: false, message: "Reference number and proof of payment are required for this payment method." });
  }
  if (proofOfPayment && !parseMediaData(proofOfPayment)) {
    return res.status(400).json({ success: false, message: "Proof of payment must be a JPEG, PNG, WebP, or PDF file smaller than 8 MB." });
  }
  if (db.payments.some(payment => payment.bookingId === bookingId && payment.paymentType === "Downpayment" && ["Pending Verification", "Paid"].includes(payment.paymentStatus))) {
    return res.status(400).json({ success: false, message: "A down payment has already been submitted for this booking." });
  }

  // Security Check: Duplicate Reference Number Validation
  if (referenceNumber && referenceNumber.trim()) {
    const cleanRef = referenceNumber.trim();
    const duplicatePayment = db.payments.find(p => p.referenceNumber && p.referenceNumber.trim().toUpperCase() === cleanRef.toUpperCase());
    if (duplicatePayment) {
      return res.status(400).json({ 
        success: false, 
        message: `Security Alert: Reference number '${cleanRef}' has already been submitted for Payment ${duplicatePayment.id}. Duplicate receipts are strictly rejected.` 
      });
    }
  }
  
  const paymentId = generateId("PAY");
  const paymentMedia = proofOfPayment ? await saveProtectedMedia(user.id, "payment", paymentId, "PAYMENT_PROOF", proofOfPayment, "payment-proof") : null;
  const newPayment: Payment = {
    id: paymentId,
    bookingId,
    studioId: booking.studioId,
    customerId: booking.customerId,
    amount: paymentAmount,
    paymentType: "Downpayment",
    paymentMethod,
    paymentStatus: "Pending Verification",
    referenceNumber,
    proofOfPayment: paymentMedia ? `/api/media/${paymentMedia.mediaId}` : undefined,
    paymentDate: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  (newPayment as any).status = "Pending Verification";

  db.addPayment(newPayment);
  logAction(user.id, user.email, "Submitted downpayment", "PAYMENT", paymentId);

  syncBookingPaymentTotals(booking);
  booking.status = "Awaiting Payment";
  db.save();

  // Notify studio admin & dispatch simulated SMS acknowledgment
  const studioAdmin = db.users.find(u => u.studioId === booking.studioId && u.role === UserRole.STUDIO_ADMIN);
  if (studioAdmin) {
    notifyUser(
      studioAdmin.id, 
      "New Payment Submitted", 
      `Payment proof submitted for Booking ${bookingId} (Ref #${referenceNumber || "N/A"}). Please verify.`, 
      "warning", 
      booking.studioId
    );
  }

  res.json({ success: true, payment: newPayment });
});

app.get("/api/media/:id", async (req, res) => {
  const media = db.mediaFiles.find(item => item.id === req.params.id && item.accessStatus === "active");
  if (!media) {
    return res.status(404).json({ success: false, message: "Media file not found." });
  }
  const publicPurposes = ["STUDIO_LOGO", "STUDIO_COVER", "SERVICE_IMAGE", "PACKAGE_IMAGE"];
  const relatedStudioId = media.entityType === "studio"
    ? media.entityId
    : media.entityType === "service"
      ? db.services.find(item => item.id === media.entityId)?.studioId
      : media.entityType === "package"
        ? db.packages.find(item => item.id === media.entityId)?.studioId
        : undefined;
  const relatedStudio = relatedStudioId ? db.studios.find(item => item.id === relatedStudioId) : undefined;
  const isPublicMedia = publicPurposes.includes(media.purpose) && !!relatedStudio && (relatedStudio.isApproved || relatedStudio.status === "approved");
  const user = isPublicMedia ? getAuthenticatedUser(req) : requireAuthenticatedUser(req, res);
  if (!isPublicMedia && (!user || !canAccessMedia(user, media))) {
    return res.status(404).json({ success: false, message: "Media file not found." });
  }
  try {
    res.type(media.mimeType);
    res.setHeader("Cache-Control", "private, no-store");
    res.send(await fs.readFile(path.join(MEDIA_ROOT, media.storageKey)));
  } catch {
    res.status(404).json({ success: false, message: "Media file is unavailable." });
  }
});

app.put("/api/payments/:id/verify", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { approved, reason } = req.body;
  const index = db.payments.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Payment not found." });
  }

  const payment = db.payments[index];
  if (!canManageStudioPayment(user, payment.studioId)) {
    return res.status(403).json({ success: false, message: "You are not allowed to review this payment." });
  }
  if (payment.paymentStatus !== "Pending Verification") {
    return res.status(400).json({ success: false, message: "Only pending payments can be verified." });
  }
  const paymentBooking = db.bookings.find(item => item.id === payment.bookingId);
  if (!paymentBooking || ["Cancelled", "Expired"].includes(paymentBooking.status)) {
    return res.status(400).json({ success: false, message: "Payments cannot be verified for cancelled or expired bookings." });
  }
  if (typeof approved !== "boolean") {
    return res.status(400).json({ success: false, message: "An explicit approval decision is required." });
  }
  if (!approved && !String(reason || "").trim()) {
    return res.status(400).json({ success: false, message: "A rejection reason is required." });
  }
  db.payments[index].paymentStatus = approved ? "Paid" : "Failed";
  (db.payments[index] as any).status = approved ? "Verified" : "Rejected";
  (db.payments[index] as any).reviewedBy = user.id;
  (db.payments[index] as any).reviewedAt = new Date().toISOString();
  (db.payments[index] as any).rejectionReason = approved ? undefined : String(reason).trim();
  db.save();

  // Also update booking status
  const bIndex = db.bookings.findIndex(b => b.id === payment.bookingId);
  if (bIndex !== -1) {
    syncBookingPaymentTotals(db.bookings[bIndex]);
    if (!approved) db.bookings[bIndex].status = "Pending";
    db.save();
    
    // Notify customer
    notifyUser(
      db.bookings[bIndex].customerId,
      approved ? "Payment Verified & Slot Confirmed" : "Downpayment Rejected",
      approved
        ? `Your downpayment of ₱${payment.amount} has been verified for booking ${payment.bookingId}. Remaining balance: ₱${db.bookings[bIndex].remainingBalance}.`
        : `Your downpayment for booking ${payment.bookingId} was rejected. Reason: ${String(reason).trim()}`,
      approved ? "success" : "error",
      payment.studioId
    );
  }

  logAction(user.id, user.email, approved ? "Approved downpayment" : "Rejected downpayment", "PAYMENT", payment.id);

  res.json({ success: true, payment: db.payments[index] });
});

app.post("/api/bookings/:id/balance-payment", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const booking = db.bookings.find(item => item.id === req.params.id);
  const amount = Number(req.body.amount);
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
  if (!canManageStudioPayment(user, booking.studioId)) {
    return res.status(403).json({ success: false, message: "You are not allowed to record this payment." });
  }
  syncBookingPaymentTotals(booking);
  if (booking.amountPaid < booking.downPaymentAmount) {
    return res.status(400).json({ success: false, message: "Verify the down payment before recording the remaining balance." });
  }
  if (!Number.isFinite(amount) || amount <= 0 || Math.abs(amount - booking.remainingBalance) > 0.01) {
    return res.status(400).json({ success: false, message: `Balance payment must be exactly ₱${booking.remainingBalance.toLocaleString()}.` });
  }

  const payment: Payment = {
    id: generateId("PAY"), bookingId: booking.id, studioId: booking.studioId, customerId: booking.customerId,
    amount, paymentType: "Balance", paymentMethod: req.body.paymentMethod || "Cash", paymentStatus: "Paid",
    referenceNumber: req.body.referenceNumber, paymentDate: new Date().toISOString(), createdAt: new Date().toISOString()
  };
  db.addPayment(payment);
  syncBookingPaymentTotals(booking);
  db.save();
  notifyUser(booking.customerId, "Final Payment Recorded", `Your final payment of ₱${amount} has been recorded at the studio. Your booking is fully paid.`, "success", booking.studioId);
  res.json({ success: true, payment, booking });
});

// Photo Proofing Endpoints
app.get("/api/photo-proofing/booking/:bookingId", (req, res) => {
  const booking = db.bookings.find(item => item.id === req.params.bookingId);
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
  if (!requireBookingAccess(req, res, booking)) return;
  const gallery = db.photoProofings.find(p => p.bookingId === req.params.bookingId);
  res.json({ success: true, gallery: gallery || null });
});

app.post("/api/photo-proofing", (req, res) => {
  const { bookingId, studioId, customerId, photos, watermarkText, watermarkPosition, watermarkOpacity } = req.body;
  const booking = db.bookings.find(item => item.id === bookingId);
  if (!booking || booking.studioId !== studioId || booking.customerId !== customerId) {
    return res.status(400).json({ success: false, message: "Gallery details do not match a valid booking." });
  }
  const user = requireStudioAccess(req, res, studioId);
  if (!user) return;
  
  const proofingId = generateId("PRF");
  const newGallery: PhotoProofingGallery = {
    id: proofingId,
    bookingId,
    studioId,
    customerId,
    photos: photos || [],
    watermarkText: watermarkText || "PROOF - CAINTA STUDIO",
    watermarkPosition: watermarkPosition || "repeat_diagonal",
    watermarkOpacity: watermarkOpacity !== undefined ? watermarkOpacity : 0.35,
    status: "sent_to_client",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addPhotoProofing(newGallery);

  // Notify customer that photo proofing is ready
  notifyUser(
    customerId,
    "Photo Proofing Gallery Ready",
    `Your watermarked photo proofs for Booking #${bookingId} are now ready for review! Star your favorites for editing.`,
    "success",
    studioId
  );

  res.json({ success: true, gallery: newGallery });
});

app.put("/api/photo-proofing/:id/photos", (req, res) => {
  const { photos, status, watermarkText, watermarkOpacity, watermarkPosition } = req.body;
  const index = db.photoProofings.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Photo proofing gallery not found." });
  }

  const existing = db.photoProofings[index];
  const booking = db.bookings.find(item => item.id === existing.bookingId);
  if (!booking || !requireBookingAccess(req, res, booking)) return;
  const user = getAuthenticatedUser(req);
  const studioOperator = user && user.role !== UserRole.CUSTOMER;
  if (studioOperator && user?.role !== UserRole.SUPER_ADMIN && user?.studioId !== existing.studioId) {
    return res.status(403).json({ success: false, message: "You do not have access to this gallery." });
  }
  if (user?.role === UserRole.CUSTOMER && status && status !== "client_reviewed") {
    return res.status(403).json({ success: false, message: "Customers can only submit gallery selections." });
  }
  db.photoProofings[index] = {
    ...existing,
    photos: photos || existing.photos,
    status: status || existing.status,
    watermarkText: watermarkText || existing.watermarkText,
    watermarkOpacity: watermarkOpacity !== undefined ? watermarkOpacity : existing.watermarkOpacity,
    watermarkPosition: watermarkPosition || existing.watermarkPosition,
    updatedAt: new Date().toISOString()
  };
  db.save();

  // Notify studio admin if customer reviewed
  if (status === "client_reviewed") {
    const studioAdmin = db.users.find(u => u.studioId === existing.studioId && u.role === UserRole.STUDIO_ADMIN);
    if (studioAdmin) {
      notifyUser(
        studioAdmin.id,
        "Photo Proofing Selections Submitted",
        `Customer reviewed photo proofs for Booking #${existing.bookingId} and submitted retouch notes.`,
        "info",
        existing.studioId
      );
    }
  }

  res.json({ success: true, gallery: db.photoProofings[index] });
});

app.put("/api/photo-proofing/:id/deliver", (req, res) => {
  const { finalDriveLink, status } = req.body;
  const index = db.photoProofings.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Photo proofing gallery not found." });
  }

  const existing = db.photoProofings[index];
  if (!requireStudioAccess(req, res, existing.studioId)) return;
  db.photoProofings[index] = {
    ...existing,
    finalDriveLink: finalDriveLink || existing.finalDriveLink,
    status: status || "completed",
    updatedAt: new Date().toISOString()
  };
  db.save();

  // Notify customer
  notifyUser(
    existing.customerId,
    "Final High-Res Photos Delivered!",
    `Your high-resolution edited photoshoot files are ready for download! Access them via your Customer Dashboard portal.`,
    "success",
    existing.studioId
  );

  res.json({ success: true, gallery: db.photoProofings[index] });
});

// Notifications API
app.put("/api/notifications/:id/read", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const index = db.notifications.findIndex(n => n.id === req.params.id);
  if (index !== -1 && db.notifications[index].userId !== user.id) {
    return res.status(403).json({ success: false, message: "You cannot update another user's notification." });
  }
  if (index !== -1) {
    db.notifications[index].isRead = true;
    db.save();
  }
  res.json({ success: true });
});

app.post("/api/notifications/dispatch", (req, res) => {
  const actor = requireRole(req, res, UserRole.SUPER_ADMIN, UserRole.STUDIO_ADMIN);
  if (!actor) return;
  const { userId, studioId, channel, recipientContact, title, message, type } = req.body;
  const targetUser = db.users.find(u => u.id === userId) || db.customers.find(c => c.id === userId);

  if (!targetUser) {
    return res.status(404).json({ success: false, message: "Notification recipient not found." });
  }

  const targetStudioId = "studioId" in targetUser ? targetUser.studioId : undefined;
  if (studioId && targetUser.role !== UserRole.SUPER_ADMIN && targetStudioId !== studioId) {
    return res.status(403).json({ success: false, message: "Notification target is outside the user's studio." });
  }

  const notif: Notification = {
    id: generateId("DISPATCH"),
    userId,
    studioId,
    title: title || `${channel || "App"} Notification`,
    message,
    isRead: false,
    type: type || "info",
    channel: channel || "SMS",
    recipientContact: recipientContact || "+63 900 000 0000",
    createdAt: new Date().toISOString()
  };

  db.addNotification(notif);
  res.json({ success: true, notification: notif });
});

// Printing Products
app.get("/api/print-products", (req, res) => {
  const { studioId } = req.query;
  const filtered = studioId ? db.printProducts.filter(p => p.studioId === studioId) : db.printProducts;
  res.json({ success: true, products: filtered, printProducts: filtered });
});

app.post("/api/print-products", (req, res) => {
  const { studioId, name, description, size, price, image, estimatedHours } = req.body;
  if (!requireStudioAccess(req, res, studioId)) return;
  const newProd: any = {
    id: generateId("PRD"),
    studioId,
    name,
    description,
    size,
    price: Number(price),
    image: image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&fit=crop",
    inStock: true,
    estimatedHours: Number(estimatedHours) || 24,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  db.addPrintProduct(newProd);
  res.json({ success: true, product: newProd });
});

app.delete("/api/print-products/:id", (req, res) => {
  const index = db.printProducts.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }
  if (!requireStudioAccess(req, res, db.printProducts[index].studioId)) return;
  db.printProducts.splice(index, 1);
  db.save();
  res.json({ success: true, message: "Print product removed." });
});

// Print orders
app.get("/api/print-orders", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { customerId, studioId } = req.query;
  let filtered = db.printOrders;
  if (user.role === UserRole.CUSTOMER) filtered = filtered.filter(o => o.customerId === user.id);
  else if (user.role === UserRole.STUDIO_ADMIN || user.role === UserRole.STUDIO_STAFF) filtered = filtered.filter(o => o.studioId === user.studioId);
  if (customerId && user.role === UserRole.SUPER_ADMIN) filtered = filtered.filter(o => o.customerId === customerId);
  if (studioId && user.role === UserRole.SUPER_ADMIN) filtered = filtered.filter(o => o.studioId === studioId);
  res.json({ success: true, printOrders: filtered });
});

app.post("/api/print-orders", async (req, res) => {
  const { studioId, customerId, productId, quantity, uploadedPhoto, totalAmount, paymentMethod, referenceNumber, proofOfPayment, shippingAddress } = req.body;
  const user = requireRole(req, res, UserRole.CUSTOMER);
  if (!user) return;
  if (customerId !== user.id) return res.status(403).json({ success: false, message: "Customer identity is derived from the authenticated session." });
  const product = db.printProducts.find(item => item.id === productId && item.studioId === studioId && item.isActive && item.inStock);
  const orderQuantity = Number(quantity);
  if (!product || !Number.isInteger(orderQuantity) || orderQuantity < 1 || orderQuantity > 100) {
    return res.status(400).json({ success: false, message: "The selected print product or quantity is invalid." });
  }
  const calculatedTotal = Number(product.price) * orderQuantity;
  if (!Number.isFinite(calculatedTotal) || Math.abs(calculatedTotal - Number(totalAmount)) > 0.01) {
    return res.status(400).json({ success: false, message: "The order total does not match the selected product and quantity." });
  }
  if (!["Cash", "GCash", "Bank Transfer", "Online Payment"].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: "Choose a valid payment method." });
  }
  if (shippingAddress !== undefined && !String(shippingAddress).trim()) {
    return res.status(400).json({ success: false, message: "A shipping address is required for delivery orders." });
  }
  if (paymentMethod !== "Cash" && (!String(referenceNumber || "").trim() || !proofOfPayment)) {
    return res.status(400).json({ success: false, message: "Reference number and payment proof are required for non-cash payments." });
  }
  if (proofOfPayment && !parseMediaData(proofOfPayment)) {
    return res.status(400).json({ success: false, message: "Payment proof must be a supported image smaller than 8 MB." });
  }
  
  const orderId = generateId("PR-2026");
  const photoMedia = await saveProtectedMedia(user.id, "print-order", orderId, "PRINT_UPLOAD", uploadedPhoto, "print-photo");
  if (!photoMedia) {
    return res.status(400).json({ success: false, message: "The print photo must be a JPEG, PNG, or WebP image smaller than 8 MB." });
  }
  const paymentMedia = proofOfPayment
    ? await saveProtectedMedia(user.id, "print-order", orderId, "PAYMENT_PROOF", proofOfPayment, "print-payment-proof")
    : null;
  const newOrder: PrintOrder = {
    id: orderId,
    studioId,
    customerId,
    productId,
    quantity: orderQuantity,
    uploadedPhoto: `/api/media/${photoMedia.mediaId}`,
    status: "Pending",
    totalAmount: calculatedTotal,
    paymentMethod,
    paymentStatus: paymentMethod === "Cash" ? "Unpaid" : "Pending Verification",
    proofOfPayment: paymentMedia ? `/api/media/${paymentMedia.mediaId}` : undefined,
    referenceNumber: String(referenceNumber || "").trim() || undefined,
    shippingAddress: String(shippingAddress || "").trim() || undefined,
    createdAt: new Date().toISOString()
  };

  db.addPrintOrder(newOrder);

  // Notify studio admin
  const studioAdmin = db.users.find(u => u.studioId === studioId && u.role === UserRole.STUDIO_ADMIN);
  if (studioAdmin) {
    notifyUser(studioAdmin.id, "New Print Order", `A new print order (${orderId}) has been received.`, "warning", studioId);
  }

  res.json({ success: true, printOrder: newOrder });
});

app.put("/api/print-orders/:id/status", (req, res) => {
  const { status } = req.body;
  const index = db.printOrders.findIndex(o => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Print order not found." });
  }

  const original = db.printOrders[index];
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const canManage = user.role === UserRole.SUPER_ADMIN ||
    ((user.role === UserRole.STUDIO_ADMIN || user.role === UserRole.STUDIO_STAFF) && user.studioId === original.studioId);
  if (!canManage) return res.status(403).json({ success: false, message: "You cannot update this print order." });
  const allowedTransitions: Record<string, string[]> = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Processing", "Cancelled"],
    Processing: ["Quality Check", "Ready for Pickup", "Out for Delivery", "Cancelled"],
    "Quality Check": ["Ready for Pickup", "Processing"],
    "Ready for Pickup": ["Completed"],
    "Out for Delivery": ["Completed"],
    Completed: [],
    Cancelled: []
  };
  if (status && status !== original.status && !allowedTransitions[original.status]?.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid print order transition from ${original.status} to ${status}.` });
  }
  if (status === "Completed" && original.paymentStatus !== "Paid") {
    return res.status(400).json({ success: false, message: "A print order must be paid before completion." });
  }
  db.printOrders[index] = {
    ...original,
    status: status || original.status
  };
  db.save();

  notifyUser(original.customerId, "Print Order Update", `Your print order ${original.id} status is now: ${status || original.status}`, "info");

  res.json({ success: true, printOrder: db.printOrders[index] });
});

app.post("/api/print-orders/:id/payment", async (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const index = db.printOrders.findIndex(order => order.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: "Print order not found." });
  const order = db.printOrders[index];
  const amount = Number(req.body.amount);
  if (user.role !== UserRole.CUSTOMER || order.customerId !== user.id) {
    return res.status(403).json({ success: false, message: "Only the order customer can submit payment." });
  }
  if (!Number.isFinite(amount) || Math.abs(amount - order.totalAmount) > 0.01) {
    return res.status(400).json({ success: false, message: "Payment amount must match the print order total." });
  }
  if (!["Cash", "GCash", "Bank Transfer", "Online Payment"].includes(req.body.paymentMethod)) {
    return res.status(400).json({ success: false, message: "Choose a valid payment method." });
  }
  if (req.body.paymentMethod !== "Cash" && (!String(req.body.referenceNumber || "").trim() || !req.body.proofOfPayment)) {
    return res.status(400).json({ success: false, message: "Reference number and proof are required for non-cash print payments." });
  }
  if (req.body.proofOfPayment && !parseMediaData(req.body.proofOfPayment)) {
    return res.status(400).json({ success: false, message: "Payment proof must be a supported image smaller than 8 MB." });
  }
  const media = req.body.proofOfPayment ? await saveProtectedMedia(user.id, "print-order", order.id, "PAYMENT_PROOF", req.body.proofOfPayment, "print-payment-proof") : null;
  db.printOrders[index] = {
    ...order,
    paymentStatus: req.body.paymentMethod === "Cash" ? "Unpaid" : "Pending Verification",
    proofOfPayment: media ? `/api/media/${media.mediaId}` : undefined,
    referenceNumber: String(req.body.referenceNumber || "").trim() || undefined
  };
  db.save();
  res.json({ success: true, printOrder: db.printOrders[index] });
});

app.put("/api/print-orders/:id/payment/verify", (req, res) => {
  const user = requireStudioAccess(req, res, db.printOrders.find(order => order.id === req.params.id)?.studioId || "");
  if (!user) return;
  const index = db.printOrders.findIndex(order => order.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: "Print order not found." });
  const { approved, reason } = req.body;
  if (typeof approved !== "boolean") return res.status(400).json({ success: false, message: "An explicit approval decision is required." });
  if (!approved && !String(reason || "").trim()) return res.status(400).json({ success: false, message: "A rejection reason is required." });
  if (db.printOrders[index].paymentStatus !== "Pending Verification") return res.status(400).json({ success: false, message: "Only pending print payments can be verified." });
  db.printOrders[index].paymentStatus = approved ? "Paid" : "Unpaid";
  db.save();
  res.json({ success: true, printOrder: db.printOrders[index] });
});

// Reviews
app.post("/api/reviews", (req, res) => {
  const { studioId, customerId, customerName, bookingId, rating, comment } = req.body;
  const user = requireRole(req, res, UserRole.CUSTOMER);
  if (!user) return;
  if (customerId !== user.id) return res.status(403).json({ success: false, message: "Customer identity is derived from the authenticated session." });
  
  // Verify completed booking exists and hasn't been reviewed yet
  const completedBooking = db.bookings.find(b => b.id === bookingId && b.customerId === customerId && b.status === "Completed");
  if (!completedBooking) {
    return res.status(400).json({ success: false, message: "You can only review completed bookings." });
  }

  const alreadyReviewed = db.reviews.some(r => r.bookingId === bookingId);
  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: "You have already reviewed this booking." });
  }
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || !String(comment || "").trim()) {
    return res.status(400).json({ success: false, message: "A rating from 1 to 5 and a comment are required." });
  }

  const reviewId = generateId("REV");
  const newReview: Review = {
    id: reviewId,
    studioId,
    customerId,
    customerName,
    bookingId,
    rating: Number(rating),
    comment,
    status: "pending", // Requires admin approval before going public
    createdAt: new Date().toISOString()
  };

  db.addReview(newReview);

  logAction(customerId, customerName, `Submitted review REV-${reviewId} for studio ${studioId}`, "REVIEW", reviewId);

  res.json({ success: true, review: newReview, message: "Your review has been submitted and is pending admin approval." });
});

// ====================================================================
// ADMIN REVIEW MANAGEMENT ENDPOINTS (SUPER_ADMIN only)
// ====================================================================

// GET all reviews (admin sees ALL statuses: pending, approved, rejected)
app.get("/api/admin/reviews", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const allReviews = [...db.reviews].sort((a, b) => {
    // pending first, then approved, rejected last
    const order = { pending: 0, approved: 1, rejected: 2 };
    return (order[a.status] ?? 1) - (order[b.status] ?? 1);
  });
  res.json({ success: true, reviews: allReviews });
});

// Approve a review
app.put("/api/admin/reviews/:id/approve", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const { id } = req.params;
  const idx = db.reviews.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Review not found." });

  db.reviews[idx].status = "approved";
  db.save();

  // Recalculate Studio Rating based on approved reviews only
  const studioId = db.reviews[idx].studioId;
  const studioIdx = db.studios.findIndex(s => s.id === studioId);
  if (studioIdx !== -1) {
    const approvedReviews = db.reviews.filter(r => r.studioId === studioId && r.status === "approved");
    const avgRating = approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;
    db.studios[studioIdx].rating = parseFloat(avgRating.toFixed(1));
    db.studios[studioIdx].reviewCount = approvedReviews.length;
    db.save();
  }

  logAction("SYSTEM", "system@admin", `Approved review ${id}`, "REVIEW", id);
  res.json({ success: true, review: db.reviews[idx] });
});

// Reject a review
app.put("/api/admin/reviews/:id/reject", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const { id } = req.params;
  const idx = db.reviews.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Review not found." });

  db.reviews[idx].status = "rejected";
  db.save();

  // Recalculate Studio Rating based on approved reviews only
  const studioId = db.reviews[idx].studioId;
  const studioIdx = db.studios.findIndex(s => s.id === studioId);
  if (studioIdx !== -1) {
    const approvedReviews = db.reviews.filter(r => r.studioId === studioId && r.status === "approved");
    const avgRating = approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;
    db.studios[studioIdx].rating = parseFloat(avgRating.toFixed(1));
    db.studios[studioIdx].reviewCount = approvedReviews.length;
    db.save();
  }

  logAction("SYSTEM", "system@admin", `Rejected review ${id}`, "REVIEW", id);
  res.json({ success: true, review: db.reviews[idx] });
});

// Hard delete a review (admin only)
app.delete("/api/admin/reviews/:id", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const { id } = req.params;
  const idx = db.reviews.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Review not found." });

  const studioId = db.reviews[idx].studioId;
  db.reviews.splice(idx, 1);
  db.save();

  // Recalculate Studio Rating after deletion
  const studioIdx = db.studios.findIndex(s => s.id === studioId);
  if (studioIdx !== -1) {
    const approvedReviews = db.reviews.filter(r => r.studioId === studioId && r.status === "approved");
    const avgRating = approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;
    db.studios[studioIdx].rating = parseFloat(avgRating.toFixed(1));
    db.studios[studioIdx].reviewCount = approvedReviews.length;
    db.save();
  }

  logAction("SYSTEM", "system@admin", `Deleted review ${id}`, "REVIEW", id);
  res.json({ success: true, message: "Review deleted successfully." });
});

// ====================================================================
// STUDIO OWNER REVIEW ENDPOINTS (STUDIO_ADMIN only)
// ====================================================================

// GET reviews for a specific studio (studio owner sees pending + approved, not rejected)
app.get("/api/studio/reviews", (req, res) => {
  const { studioId } = req.query;
  if (!studioId) return res.status(400).json({ success: false, message: "studioId is required." });
  if (!requireStudioAccess(req, res, String(studioId))) return;
  const studioReviews = db.reviews
    .filter(r => r.studioId === studioId && r.status !== "rejected")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, reviews: studioReviews });
});

// Studio owner replies to a review
app.put("/api/studio/reviews/:id/reply", (req, res) => {
  const { id } = req.params;
  const { reply, studioId } = req.body;
  if (!reply || !studioId) return res.status(400).json({ success: false, message: "reply and studioId are required." });
  if (!requireStudioAccess(req, res, studioId)) return;

  const idx = db.reviews.findIndex(r => r.id === id && r.studioId === studioId);
  if (idx === -1) return res.status(404).json({ success: false, message: "Review not found or not yours." });

  db.reviews[idx].reply = reply;
  db.reviews[idx].replyAt = new Date().toISOString();
  db.save();

  logAction(studioId, studioId, `Studio replied to review ${id}`, "REVIEW", id);
  res.json({ success: true, review: db.reviews[idx] });
});

// Favorites
app.get("/api/favorites", (req, res) => {
  const { customerId } = req.query;
  const user = requireRole(req, res, UserRole.CUSTOMER);
  if (!user) return;
  if (customerId !== user.id) return res.status(403).json({ success: false, message: "Favorite access is limited to the authenticated customer." });
  const filtered = db.favorites.filter(f => f.customerId === customerId);
  res.json({ success: true, favorites: filtered });
});

app.post("/api/favorites", (req, res) => {
  const { customerId, studioId } = req.body;
  const user = requireRole(req, res, UserRole.CUSTOMER);
  if (!user) return;
  if (customerId !== user.id) return res.status(403).json({ success: false, message: "Customer identity is derived from the authenticated session." });
  const exists = db.favorites.find(f => f.customerId === customerId && f.studioId === studioId);
  if (exists) {
    return res.json({ success: true, message: "Already favorited" });
  }
  const newFav = {
    id: generateId("FAV"),
    customerId,
    studioId,
    createdAt: new Date().toISOString()
  };
  db.addFavorite(newFav);
  res.json({ success: true, favorite: newFav });
});

app.delete("/api/favorites", (req, res) => {
  const { customerId, studioId } = req.body;
  const user = requireRole(req, res, UserRole.CUSTOMER);
  if (!user) return;
  if (customerId !== user.id) return res.status(403).json({ success: false, message: "Customer identity is derived from the authenticated session." });
  const index = db.favorites.findIndex(f => f.customerId === customerId && f.studioId === studioId);
  if (index !== -1) {
    db.favorites.splice(index, 1);
    db.save();
  }
  res.json({ success: true, message: "Favorite removed." });
});

// Knowledge Base / FAQ FAQs
app.get("/api/chatbot/faqs", (req, res) => {
  const { studioId } = req.query;
  const filtered = studioId ? db.faqs.filter(f => f.studioId === studioId || f.studioId === "GLOBAL") : db.faqs;
  res.json({ success: true, faqs: filtered });
});

app.post("/api/chatbot/faqs", (req, res) => {
  const { studioId, question, answer, category } = req.body;
  if (!requireStudioAccess(req, res, studioId)) return;
  const newFAQ: ChatbotFAQ = {
    id: generateId("FAQ"),
    studioId,
    question,
    answer,
    category: category || "FAQ",
    createdAt: new Date().toISOString()
  };
  db.addFAQ(newFAQ);
  res.json({ success: true, faq: newFAQ });
});

app.delete("/api/chatbot/faqs/:id", (req, res) => {
  const index = db.faqs.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "FAQ not found." });
  }
  if (!requireStudioAccess(req, res, db.faqs[index].studioId)) return;
  db.faqs.splice(index, 1);
  db.save();
  res.json({ success: true, message: "FAQ removed." });
});

// Notifications Endpoints
app.get("/api/notifications", (req, res) => {
  const { userId } = req.query;
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  if (userId !== user.id) return res.status(403).json({ success: false, message: "Notification access is limited to the authenticated user." });
  const filtered = db.notifications.filter(n => n.userId === userId);
  res.json({ success: true, notifications: filtered });
});

app.put("/api/notifications/mark-read", (req, res) => {
  const { userId, notifId } = req.body;
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  if (userId && userId !== user.id) return res.status(403).json({ success: false, message: "Notification access is limited to the authenticated user." });
  if (notifId) {
    const notif = db.notifications.find(n => n.id === notifId);
    if (notif) {
      notif.isRead = true;
      db.save();
    }
  } else if (userId) {
    db.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    db.save();
  }
  res.json({ success: true });
});

// Audit Logs
app.get("/api/audit-logs", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  res.json({ success: true, logs: db.auditLogs, auditLogs: db.auditLogs });
});

// ----------------------------------------------------
// ANALYTICS & SALES REPORTING
// ----------------------------------------------------
app.get("/api/reports/sales", (req, res) => {
  const user = requireRole(req, res, UserRole.SUPER_ADMIN, UserRole.STUDIO_ADMIN, UserRole.STUDIO_STAFF);
  if (!user) return;
  const { studioId, startDate, endDate } = req.query;
  const scopedStudioId = user.role === UserRole.SUPER_ADMIN ? studioId as string | undefined : ("studioId" in user ? user.studioId : undefined);
  let targetBookings = db.bookings.filter(b => !["Cancelled", "Expired", "Rejected"].includes(b.status));
  let targetPrints = db.printOrders.filter(p => !["Cancelled"].includes(p.status));

  if (scopedStudioId) {
    targetBookings = targetBookings.filter(b => b.studioId === scopedStudioId);
    targetPrints = targetPrints.filter(p => p.studioId === scopedStudioId);
  }

  // Filter by date range if provided
  if (startDate) {
    targetBookings = targetBookings.filter(b => b.bookingDate >= (startDate as string));
    targetPrints = targetPrints.filter(p => p.createdAt >= (startDate as string));
  }
  if (endDate) {
    targetBookings = targetBookings.filter(b => b.bookingDate <= (endDate as string));
    targetPrints = targetPrints.filter(p => p.createdAt <= (endDate as string));
  }

  const bookingSales = targetBookings.reduce((sum, b) => sum + db.payments
    .filter(p => p.bookingId === b.id && p.paymentStatus === "Paid")
    .reduce((paymentSum, p) => paymentSum + Number(p.amount), 0), 0);
  const printingSales = targetPrints.reduce((sum, p) => sum + (p.paymentStatus === "Paid" ? p.totalAmount : 0), 0);
  const totalSales = bookingSales + printingSales;

  res.json({
    success: true,
    summary: {
      bookingSales,
      printingSales,
      totalSales,
        outstandingBalances: targetBookings.reduce((sum, b) => sum + Math.max(0, b.remainingBalance), 0),
      bookingCount: targetBookings.length,
      printOrderCount: targetPrints.length
    }
  });
});

app.get("/api/reports/bookings", (req, res) => {
  const user = requireRole(req, res, UserRole.SUPER_ADMIN, UserRole.STUDIO_ADMIN, UserRole.STUDIO_STAFF);
  if (!user) return;
  const { studioId } = req.query;
  let targetBookings = db.bookings;
  const scopedStudioId = user.role === UserRole.SUPER_ADMIN ? studioId as string | undefined : ("studioId" in user ? user.studioId : undefined);
  if (scopedStudioId) {
    targetBookings = targetBookings.filter(b => b.studioId === scopedStudioId);
  }

  // Aggregate by status
  const statusCounts = targetBookings.reduce((acc: any, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const months = Array.from({ length: 12 }, (_, index) => new Date(new Date().getFullYear(), index, 1)
    .toLocaleDateString("en-US", { month: "short" }));
  const trend = months.map(m => {
    const val = db.bookings.filter(b => {
      if (scopedStudioId && b.studioId !== scopedStudioId) return false;
      const bMonth = new Date(b.createdAt).getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[bMonth].substring(0, 3) === m && db.payments.some(p => p.bookingId === b.id && p.paymentStatus === "Paid");
    });

    const printVal = db.printOrders.filter(p => {
      if (scopedStudioId && p.studioId !== scopedStudioId) return false;
      const pMonth = new Date(p.createdAt).getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[pMonth].substring(0, 3) === m && p.paymentStatus === "Paid";
    });

    return {
      name: m,
      bookings: val.length,
      revenue: val.reduce((sum, b) => sum + db.payments.filter(p => p.bookingId === b.id && p.paymentStatus === "Paid").reduce((paid, p) => paid + Number(p.amount), 0), 0) + printVal.reduce((sum, p) => sum + p.totalAmount, 0),
      printing: printVal.reduce((sum, p) => sum + p.totalAmount, 0)
    };
  });

  res.json({
    success: true,
    statusCounts,
    trend
  });
});

app.get("/api/reports/daily-closing", (req, res) => {
  const user = requireRole(req, res, UserRole.SUPER_ADMIN, UserRole.STUDIO_ADMIN);
  if (!user) return;

  const { studioId, date } = req.query;
  const targetStudioId = user.role === UserRole.SUPER_ADMIN ? studioId as string | undefined : ("studioId" in user ? user.studioId : undefined);
  const targetDate = (date as string) || new Date().toISOString().split("T")[0];

  const verifiedPayments = db.payments.filter(p => {
    if (targetStudioId && p.studioId !== targetStudioId) return false;
    if (p.paymentStatus !== "Paid") return false;
    const paymentDay = (p.paymentDate || p.createdAt || "").split("T")[0];
    return paymentDay === targetDate;
  });

  const verifiedPrints = db.printOrders.filter(pr => {
    if (targetStudioId && pr.studioId !== targetStudioId) return false;
    if (pr.paymentStatus !== "Paid") return false;
    const printDay = (pr.createdAt || "").split("T")[0];
    return printDay === targetDate;
  });

  const totalDownpayments = verifiedPayments.filter(p => p.paymentType === "Downpayment").reduce((sum, p) => sum + Number(p.amount), 0);
  const totalBalanceCollections = verifiedPayments.filter(p => p.paymentType === "Balance").reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPrintRevenue = verifiedPrints.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const grossCollections = totalDownpayments + totalBalanceCollections + totalPrintRevenue;

  const byMethod = {
    cash: verifiedPayments.filter(p => p.paymentMethod === "Cash").reduce((s, p) => s + Number(p.amount), 0) +
          verifiedPrints.filter(p => p.paymentMethod === "Cash").reduce((s, p) => s + Number(p.totalAmount), 0),
    gcash: verifiedPayments.filter(p => p.paymentMethod === "GCash").reduce((s, p) => s + Number(p.amount), 0) +
           verifiedPrints.filter(p => p.paymentMethod === "GCash").reduce((s, p) => s + Number(p.totalAmount), 0),
    bankTransfer: verifiedPayments.filter(p => p.paymentMethod === "Bank Transfer").reduce((s, p) => s + Number(p.amount), 0) +
                  verifiedPrints.filter(p => p.paymentMethod === "Bank Transfer").reduce((s, p) => s + Number(p.totalAmount), 0),
    online: verifiedPayments.filter(p => p.paymentMethod === "Online Payment").reduce((s, p) => s + Number(p.amount), 0) +
            verifiedPrints.filter(p => p.paymentMethod === "Online Payment").reduce((s, p) => s + Number(p.totalAmount), 0)
  };

  res.json({
    success: true,
    closingReport: {
      date: targetDate,
      studioId: targetStudioId || "ALL_STUDIOS",
      grossCollections,
      totalDownpayments,
      totalBalanceCollections,
      totalPrintRevenue,
      paymentCount: verifiedPayments.length + verifiedPrints.length,
      breakdownByMethod: byMethod,
      transactions: verifiedPayments.map(p => ({
        id: p.id,
        bookingId: p.bookingId,
        type: p.paymentType,
        method: p.paymentMethod,
        amount: p.amount,
        referenceNumber: p.referenceNumber || "N/A",
        timestamp: p.paymentDate || p.createdAt
      }))
    }
  });
});

app.get("/api/audit-events", (req, res) => {
  const user = requireRole(req, res, UserRole.SUPER_ADMIN, UserRole.STUDIO_ADMIN);
  if (!user) return;

  const { entityType, entityId, limit } = req.query;
  let events = [...db.auditLogs];

  if (entityType) {
    events = events.filter(e => e.entityType.toLowerCase() === String(entityType).toLowerCase());
  }
  if (entityId) {
    events = events.filter(e => e.entityId === String(entityId));
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const maxLimit = Number(limit) || 100;

  res.json({ success: true, auditEvents: events.slice(0, maxLimit) });
});

// Automatic Background Job: Check and expire unpaid booking holds every 60 seconds
setInterval(() => {
  const now = new Date();
  let updated = false;
  for (const b of db.bookings) {
    if (["Pending", "Awaiting Payment"].includes(b.status) && b.paymentDueAt && new Date(b.paymentDueAt) <= now && b.amountPaid < b.downPaymentAmount) {
      // Only expire if no pending verification payment exists
      const hasPendingProof = db.payments.some(p => p.bookingId === b.id && p.paymentStatus === "Pending Verification");
      if (!hasPendingProof) {
        b.status = "Expired";
        b.paymentStatus = "Failed";
        updated = true;
        notifyUser(b.customerId, "Booking Payment Hold Expired", `Booking ${b.id} expired because the downpayment was not received before the deadline. The time slot has been released.`, "error", b.studioId);
        logAction("SYSTEM", "system@caintaphotography.com", "Auto-expired unpaid booking hold", "BOOKING", b.id);
      }
    }
  }
  if (updated) db.save();
}, 60 * 1000);

// ----------------------------------------------------
// AI CHATBOT (GEMINI PROXY)
// ----------------------------------------------------
app.post("/api/chatbot/message", async (req, res) => {
  const { message, studioId, history } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Query message is required." });
  }

  try {
    const client = getGeminiClient();

    // 1. Retrieve knowledge context from database
    let studioContext = "";
    let faqsContext = "";
    
    // Global and Studio specific FAQs
    const relevantFAQs = db.faqs.filter(f => f.studioId === "GLOBAL" || (studioId && f.studioId === studioId));
    faqsContext = relevantFAQs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

    if (studioId) {
      const studio = db.studios.find(s => s.id === studioId);
      if (studio) {
        const services = db.services.filter(s => s.studioId === studioId && s.isActive);
        const packages = db.packages.filter(p => p.studioId === studioId && p.isActive);
        studioContext = `
STUDIO PROFILE DETAILS:
Name: ${studio.name}
Description: ${studio.description}
Address: ${studio.address}
Location: ${studio.location}
Contact: ${studio.contactInfo}
Email: ${studio.email}
Business Hours: ${studio.businessHours}
Rating: ${studio.rating} (${studio.reviewCount} reviews)
Starting Price: ${studio.startingPrice} PHP
Printing Available: ${studio.printingAvailable ? "Yes" : "No"}

AVAILABLE SERVICES:
${services.map(s => `- ${s.name} (Base Price: ${s.basePrice} PHP, Duration: ${s.durationMinutes} mins) - Description: ${s.description}`).join("\n")}

AVAILABLE CUSTOMIZABLE PACKAGES:
${packages.map(p => `- ${p.name} (Price: ${p.price} PHP, Duration: ${p.durationMinutes} mins, Edited Photos: ${p.editedPhotosCount}, Prints: ${p.includedPrints}) - Description: ${p.description}`).join("\n")}
`;
      }
    } else {
      // General platform discovery context
      studioContext = `
ALL REGISTERED PHOTOGRAPHY STUDIOS IN CAINTA, RIZAL:
${db.studios.map(s => `- ${s.name} (Location: ${s.location}, Rating: ${s.rating}, Starting Price: ${s.startingPrice} PHP). Focus categories: ${s.categories.join(", ")}. ID: ${s.id}`).join("\n")}
`;
    }

    const systemInstruction = `
You are the official AI-assisted chatbot support for the Cainta Photography Studio MIS platform.
Your job is to answer customer questions accurately and guide them towards booking the perfect photography session or print order.

CRITICAL SECURITY AND SAFETY CONSTRAINTS:
1. You must NOT invent or make up prices, available schedules, booking confirmations, payment confirmations, or studio policies.
2. If the user asks a question whose specific answer cannot be found in the database/FAQ/studio context below, you MUST respond exactly with:
"I don't have enough information to answer that accurately. Please contact the studio or use the booking page."
Do NOT invent details to "fill the gap" or sound helpful. This is an absolute security boundary!
3. Prioritize the provided database context over any generic AI training.
4. When guiding the user to book or explore, you can provide special action triggers enclosed in brackets, which the frontend will render as beautiful action buttons. Use:
- [view_services:${studioId || "GLOBAL"}] to view available services
- [view_packages:${studioId || "GLOBAL"}] to see custom packages
- [book_now:${studioId || "GLOBAL"}] to trigger the booking wizard

CURRENT DATABASE/STUDIO CONTEXT:
${studioContext}

FAQs & KNOWLEDGE BASE:
${faqsContext}
`;

    // Initialize chat session
    const chat = client.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction,
        temperature: 0.3, // Low temperature for high precision and compliance
      }
    });

    // Send history first if any to maintain conversation state
    if (history && history.length > 0) {
      // The @google/genai SDK chats have internal history management.
      // We can fast-forward or pass previous contexts. To keep it simple, we construct a unified prompt or use Gemini chat history.
      // Since we reconstruct the chat session per request in Express, we can pass past messages as context:
    }

    const response = await chat.sendMessage({ message });
    res.json({ success: true, text: response.text });

  } catch (error: any) {
    console.error("Gemini Chatbot API error:", error);
    res.json({
      success: true,
      text: "I'm having trouble connecting to my AI brain right now. However, you can browse all services, customizable packages, and make real-time bookings directly using the booking pages!"
    });
  }
});

// Helper to retrieve local LAN IP address
function getLocalNetworkIp(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal && !net.address.startsWith("169.254")) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}

// LAN Network Information endpoint
app.get("/api/system/network-info", (req, res) => {
  if (!requireRole(req, res, UserRole.SUPER_ADMIN)) return;
  const lanIp = getLocalNetworkIp();
  res.json({
    success: true,
    port: PORT,
    localUrl: `http://localhost:${PORT}`,
    networkUrl: `http://${lanIp}:${PORT}`,
    ipAddress: lanIp
  });
});

// ----------------------------------------------------
// VITE MIDDLEWARE SETUP & STATIC RUN
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const lanIp = getLocalNetworkIp();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`📸 CAINTA PHOTOGRAPHY STUDIO MIS (LAN Access Ready)`);
    console.log(`➜ Local:   http://localhost:${PORT}`);
    console.log(`➜ Network: http://${lanIp}:${PORT}`);
    console.log(`  (Connect any smartphone, tablet, or PC on your Wi-Fi)`);
    console.log(`======================================================\n`);
  });
}

startServer();

