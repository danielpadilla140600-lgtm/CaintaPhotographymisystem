import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

import { 
  User, Customer, Studio, StudioCategory, StudioService, StudioPackage, 
  PackageAddon, Booking, Payment, PrintProduct, PrintOrder, 
  Review, ChatbotFAQ, AuditLog, Notification, FavoriteStudio, PhotoProofingGallery, UserRole, CMSSetting,
  CustomPage, SystemSettings, MediaFile
} from "./types.ts";

const DB_FILE = path.join(process.cwd(), "db.json");

export interface DatabaseSchema {
  users: User[];
  customers: Customer[];  // Separate table for customer accounts
  studios: Studio[];
  categories: StudioCategory[];
  services: StudioService[];
  packages: StudioPackage[];
  addons: PackageAddon[];
  bookings: Booking[];
  payments: Payment[];
  printProducts: PrintProduct[];
  printOrders: PrintOrder[];
  reviews: Review[];
  faqs: ChatbotFAQ[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  favorites: FavoriteStudio[];
  photoProofings: PhotoProofingGallery[];
  cmsSettings: CMSSetting[];
  customPages: CustomPage[];
  systemSettings: SystemSettings;
  mediaFiles: MediaFile[];
}

const defaultSchema: DatabaseSchema = {
  users: [],
  customers: [],  // Customers registered through the app go here
  studios: [],
  categories: [],
  services: [],
  packages: [],
  addons: [],
  bookings: [],
  payments: [],
  printProducts: [],
  printOrders: [],
  reviews: [],
  faqs: [],
  auditLogs: [],
  notifications: [],
  favorites: [],
  photoProofings: [],
  cmsSettings: [],
  customPages: [],
  systemSettings: {
    primaryColor: "#2c2a29",
    accentColor: "#d97706",
    backgroundColor: "#faf9f6",
    fontFamily: "sans",
    headerStyle: "standard",
    isChatbotEnabled: true,
    isPrintStoreEnabled: true,
    isBookingEnabled: true,
    isMapEnabled: true,
    isSoundEnabled: true,
    customAudioUrl: "",
    customAudioEnabled: true,
    hiddenNavItems: []
  },
  mediaFiles: []
};

// ====================================================================
// MAPPING UTILITIES (MYSQL ROWS <-> TYPESCRIPT INTERFACES)
// ====================================================================

function toDbUser(u: User): any {
  return {
    id: u.id,
    email: u.email,
    password_hash: u.passwordHash,
    full_name: u.fullName,
    role: u.role,
    studio_id: u.studioId || null,
    contact_number: u.contactNumber || null,
    address: u.address || null,
    created_at: u.createdAt ? new Date(u.createdAt) : new Date()
  };
}

function fromDbUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    role: row.role as UserRole,
    studioId: row.studio_id || undefined,
    contactNumber: row.contact_number || undefined,
    address: row.address || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

// Customer mapper functions (separate customers table)
function toDbCustomer(c: Customer): any {
  return {
    id: c.id,
    email: c.email,
    password_hash: c.passwordHash,
    full_name: c.fullName,
    contact_number: c.contactNumber || null,
    address: c.address || null,
    created_at: c.createdAt ? new Date(c.createdAt) : new Date()
  };
}

function fromDbCustomer(row: any): Customer {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    role: "CUSTOMER" as const,
    contactNumber: row.contact_number || undefined,
    address: row.address || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbStudio(s: Studio): any {
  return {
    id: s.id,
    name: s.name,
    owner_id: s.ownerId,
    logo: s.logo,
    cover_image: s.coverImage,
    location: s.location,
    rating: Number(s.rating) || 0,
    review_count: Number(s.reviewCount) || 0,
    starting_price: Number(s.startingPrice) || 0,
    categories: Array.isArray(s.categories) ? s.categories.join(",") : (s.categories || ""),
    description: s.description || "",
    address: s.address || "",
    contact_info: s.contactInfo || "",
    email: s.email || "",
    business_hours: s.businessHours || "09:00 AM - 06:00 PM",
    is_approved: s.isApproved ? 1 : 0,
    status: s.status || "pending",
    printing_available: s.printingAvailable ? 1 : 0,
    latitude: s.latitude !== undefined && s.latitude !== null ? Number(s.latitude) : null,
    longitude: s.longitude !== undefined && s.longitude !== null ? Number(s.longitude) : null,
    business_permit: s.businessPermit || null,
    valid_id: s.validId || null,
    other_docs: s.otherDocs || null,
    registered_by_admin: s.registeredByAdmin ? 1 : 0,
    created_at: s.createdAt ? new Date(s.createdAt) : new Date()
  };
}

function fromDbStudio(row: any): Studio {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    logo: row.logo,
    coverImage: row.cover_image,
    location: row.location,
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    startingPrice: Number(row.starting_price) || 0,
    categories: row.categories ? (typeof row.categories === "string" ? row.categories.split(",") : row.categories) : [],
    description: row.description || "",
    address: row.address || "",
    contactInfo: row.contact_info || "",
    email: row.email || "",
    businessHours: row.business_hours || "09:00 AM - 06:00 PM",
    isApproved: !!row.is_approved,
    status: row.status || "pending",
    printingAvailable: !!row.printing_available,
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : undefined,
    longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : undefined,
    businessPermit: row.business_permit || undefined,
    validId: row.valid_id || undefined,
    otherDocs: row.other_docs || undefined,
    registeredByAdmin: !!row.registered_by_admin,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbCategory(c: StudioCategory): any {
  return {
    id: c.id,
    name: c.name,
    description: c.description || "",
    created_at: c.createdAt ? new Date(c.createdAt) : new Date()
  };
}

function fromDbCategory(row: any): StudioCategory {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbService(s: StudioService): any {
  return {
    id: s.id,
    studio_id: s.studioId,
    name: s.name,
    description: s.description || "",
    category: s.category || "General",
    base_price: Number(s.basePrice) || 0,
    duration_minutes: Number(s.durationMinutes) || 0,
    image: s.image || null,
    is_active: s.isActive ? 1 : 0,
    available_days: Array.isArray(s.availableDays) ? s.availableDays.join(",") : (s.availableDays || ""),
    available_slots: Array.isArray(s.availableSlots) ? s.availableSlots.join(",") : (s.availableSlots || ""),
    requirements: Array.isArray(s.requirements) ? s.requirements.join(",") : (s.requirements || ""),
    created_at: s.createdAt ? new Date(s.createdAt) : new Date()
  };
}

function fromDbService(row: any): StudioService {
  return {
    id: row.id,
    studioId: row.studio_id,
    name: row.name,
    description: row.description || "",
    category: row.category || "General",
    basePrice: Number(row.base_price) || 0,
    durationMinutes: Number(row.duration_minutes) || 0,
    image: row.image || undefined,
    isActive: !!row.is_active,
    availableDays: row.available_days ? (typeof row.available_days === "string" ? row.available_days.split(",") : row.available_days) : [],
    availableSlots: row.available_slots ? (typeof row.available_slots === "string" ? row.available_slots.split(",") : row.available_slots) : [],
    requirements: row.requirements ? (typeof row.requirements === "string" ? row.requirements.split(",") : row.requirements) : [],
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbPackage(p: StudioPackage): any {
  return {
    id: p.id,
    studio_id: p.studioId,
    name: p.name,
    description: p.description || "",
    price: Number(p.price) || 0,
    duration_minutes: Number(p.durationMinutes) || 0,
    edited_photos_count: Number(p.editedPhotosCount) || 0,
    included_prints: p.includedPrints || "",
    photographer_count: Number(p.photographerCount) || 1,
    included_services: Array.isArray(p.includedServices) ? p.includedServices.join(",") : (p.includedServices || null),
    terms_and_conditions: p.termsAndConditions || "",
    image: p.image || null,
    is_active: p.isActive ? 1 : 0,
    created_at: p.createdAt ? new Date(p.createdAt) : new Date()
  };
}

function fromDbPackage(row: any): StudioPackage {
  return {
    id: row.id,
    studioId: row.studio_id,
    name: row.name,
    description: row.description || "",
    price: Number(row.price) || 0,
    durationMinutes: Number(row.duration_minutes) || 0,
    editedPhotosCount: Number(row.edited_photos_count) || 0,
    includedPrints: row.included_prints || "",
    photographerCount: Number(row.photographer_count) || 1,
    includedServices: row.included_services ? (typeof row.included_services === "string" ? row.included_services.split(",") : row.included_services) : [],
    termsAndConditions: row.terms_and_conditions || "",
    image: row.image || undefined,
    isActive: !!row.is_active,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbAddon(a: PackageAddon): any {
  return {
    id: a.id,
    studio_id: a.studioId,
    name: a.name,
    price: Number(a.price) || 0,
    description: a.description || "",
    created_at: a.createdAt ? new Date(a.createdAt) : new Date()
  };
}

function fromDbAddon(row: any): PackageAddon {
  return {
    id: row.id,
    studioId: row.studio_id,
    name: row.name,
    price: Number(row.price) || 0,
    description: row.description || "",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbBooking(b: Booking): any {
  return {
    id: b.id,
    studio_id: b.studioId,
    customer_id: b.customerId,
    service_id: b.serviceId || null,
    package_id: b.packageId || null,
    booking_date: b.bookingDate,
    time_slot: b.timeSlot,
    addons: Array.isArray(b.addons) ? JSON.stringify(b.addons) : (b.addons || "[]"),
    customer_name: b.customerDetails?.fullName || "",
    customer_email: b.customerDetails?.email || "",
    customer_phone: b.customerDetails?.phone || "",
    customer_notes: b.customerDetails?.notes || null,
    requirements_doc: b.requirementsDoc || null,
    status: b.status,
    total_amount: Number(b.totalAmount) || 0,
    amount_paid: Number(b.amountPaid) || 0,
    down_payment_amount: Number(b.downPaymentAmount) || 0,
    remaining_balance: Number(b.remainingBalance) || Math.max(0, Number(b.totalAmount) - Number(b.amountPaid)),
    payment_status: b.paymentStatus || "Unpaid",
    final_payment_status: b.finalPaymentStatus || (Number(b.amountPaid) >= Number(b.totalAmount) ? "Paid" : "Pending"),
    payment_due_at: b.paymentDueAt ? new Date(b.paymentDueAt) : null,
    created_at: b.createdAt ? new Date(b.createdAt) : new Date()
  };
}

function fromDbBooking(row: any): Booking {
  let parsedAddons = [];
  try {
    parsedAddons = row.addons ? (typeof row.addons === "string" ? JSON.parse(row.addons) : row.addons) : [];
  } catch (e) {
    parsedAddons = [];
  }
  return {
    id: row.id,
    studioId: row.studio_id,
    customerId: row.customer_id,
    serviceId: row.service_id,
    packageId: row.package_id,
    bookingDate: row.booking_date instanceof Date ? row.booking_date.toISOString().split("T")[0] : String(row.booking_date),
    timeSlot: row.time_slot,
    addons: parsedAddons,
    customerDetails: {
      fullName: row.customer_name || "",
      email: row.customer_email || "",
      phone: row.customer_phone || "",
      notes: row.customer_notes || ""
    },
    requirementsDoc: row.requirements_doc || undefined,
    status: row.status,
    totalAmount: Number(row.total_amount) || 0,
    amountPaid: Number(row.amount_paid) || 0,
    downPaymentAmount: Number(row.down_payment_amount) || Math.round(Number(row.total_amount) * 0.3 * 100) / 100,
    remainingBalance: Number(row.remaining_balance) || Math.max(0, Number(row.total_amount) - Number(row.amount_paid)),
    paymentStatus: row.payment_status || "Unpaid",
    finalPaymentStatus: row.final_payment_status || (Number(row.amount_paid) >= Number(row.total_amount) ? "Paid" : "Pending"),
    paymentDueAt: row.payment_due_at instanceof Date ? row.payment_due_at.toISOString() : (row.payment_due_at || undefined),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbPayment(p: Payment): any {
  return {
    id: p.id,
    booking_id: p.bookingId,
    studio_id: p.studioId,
    customer_id: p.customerId,
    amount: Number(p.amount) || 0,
    payment_type: p.paymentType || "Downpayment",
    payment_method: p.paymentMethod,
    payment_status: p.paymentStatus,
    proof_of_payment: p.proofOfPayment || null,
    reference_number: p.referenceNumber || null,
    payment_date: p.paymentDate ? new Date(p.paymentDate) : new Date(),
    reviewed_by: p.reviewedBy || null,
    reviewed_at: p.reviewedAt ? new Date(p.reviewedAt) : null,
    rejection_reason: p.rejectionReason || null,
    created_at: p.createdAt ? new Date(p.createdAt) : new Date()
  };
}

function fromDbPayment(row: any): Payment {
  return {
    id: row.id,
    bookingId: row.booking_id,
    studioId: row.studio_id,
    customerId: row.customer_id,
    amount: Number(row.amount) || 0,
    paymentType: row.payment_type || "Downpayment",
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    proofOfPayment: row.proof_of_payment || undefined,
    referenceNumber: row.reference_number || undefined,
    paymentDate: row.payment_date instanceof Date ? row.payment_date.toISOString() : (row.payment_date || new Date().toISOString()),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString()),
    reviewedBy: row.reviewed_by || undefined,
    reviewedAt: row.reviewed_at instanceof Date ? row.reviewed_at.toISOString() : (row.reviewed_at || undefined),
    rejectionReason: row.rejection_reason || undefined
  };
}

function toDbPrintProduct(p: PrintProduct): any {
  return {
    id: p.id,
    studio_id: p.studioId,
    name: p.name,
    description: p.description || "",
    size: p.size,
    price: Number(p.price) || 0,
    image: p.image,
    in_stock: p.inStock ? 1 : 0,
    estimated_hours: Number(p.estimatedHours) || 24,
    is_active: p.isActive ? 1 : 0,
    created_at: p.createdAt ? new Date(p.createdAt) : new Date()
  };
}

function fromDbPrintProduct(row: any): PrintProduct {
  return {
    id: row.id,
    studioId: row.studio_id,
    name: row.name,
    description: row.description || "",
    size: row.size,
    price: Number(row.price) || 0,
    image: row.image,
    inStock: !!row.in_stock,
    estimatedHours: Number(row.estimated_hours) || 24,
    isActive: !!row.is_active,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbPrintOrder(o: PrintOrder): any {
  return {
    id: o.id,
    studio_id: o.studioId,
    customer_id: o.customerId,
    product_id: o.productId || null,
    quantity: Number(o.quantity) || 1,
    uploaded_photo: o.uploadedPhoto,
    status: o.status,
    total_amount: Number(o.totalAmount) || 0,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    proof_of_payment: o.proofOfPayment || null,
    reference_number: o.referenceNumber || null,
    shipping_address: o.shippingAddress || null,
    created_at: o.createdAt ? new Date(o.createdAt) : new Date()
  };
}

function fromDbPrintOrder(row: any): PrintOrder {
  return {
    id: row.id,
    studioId: row.studio_id,
    customerId: row.customer_id,
    productId: row.product_id,
    quantity: Number(row.quantity) || 1,
    uploadedPhoto: row.uploaded_photo,
    status: row.status,
    totalAmount: Number(row.total_amount) || 0,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    proofOfPayment: row.proof_of_payment || undefined,
    referenceNumber: row.reference_number || undefined,
    shippingAddress: row.shipping_address || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbReview(r: Review): any {
  return {
    id: r.id,
    studio_id: r.studioId,
    customer_id: r.customerId,
    customer_name: r.customerName,
    booking_id: r.bookingId,
    rating: Number(r.rating) || 5,
    comment: r.comment || "",
    status: r.status || "pending",
    reply: r.reply || null,
    reply_at: r.replyAt ? new Date(r.replyAt) : null,
    created_at: r.createdAt ? new Date(r.createdAt) : new Date()
  };
}

function fromDbReview(row: any): Review {
  return {
    id: row.id,
    studioId: row.studio_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    bookingId: row.booking_id,
    rating: Number(row.rating) || 5,
    comment: row.comment || "",
    status: (row.status as "pending" | "approved" | "rejected") || "pending",
    reply: row.reply || undefined,
    replyAt: row.reply_at instanceof Date ? row.reply_at.toISOString() : (row.reply_at || undefined),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbFAQ(f: ChatbotFAQ): any {
  return {
    id: f.id,
    studio_id: f.studioId,
    question: f.question,
    answer: f.answer,
    category: f.category,
    created_at: f.createdAt ? new Date(f.createdAt) : new Date()
  };
}

function fromDbFAQ(row: any): ChatbotFAQ {
  return {
    id: row.id,
    studioId: row.studio_id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbAuditLog(l: AuditLog): any {
  return {
    id: l.id,
    user_id: l.userId,
    user_email: l.userEmail,
    action: l.action,
    entity_type: l.entityType,
    entity_id: l.entityId,
    timestamp: l.timestamp ? new Date(l.timestamp) : new Date()
  };
}

function fromDbAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : (row.timestamp || new Date().toISOString())
  };
}

function toDbNotification(n: Notification): any {
  return {
    id: n.id,
    user_id: n.userId,
    studio_id: n.studioId || null,
    title: n.title,
    message: n.message,
    is_read: n.isRead ? 1 : 0,
    type: n.type,
    created_at: n.createdAt ? new Date(n.createdAt) : new Date()
  };
}

function fromDbNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    studioId: row.studio_id || undefined,
    title: row.title,
    message: row.message,
    isRead: !!row.is_read,
    type: row.type as any,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbFavorite(f: FavoriteStudio): any {
  return {
    id: f.id,
    customer_id: f.customerId,
    studio_id: f.studioId,
    created_at: f.createdAt ? new Date(f.createdAt) : new Date()
  };
}

function fromDbFavorite(row: any): FavoriteStudio {
  return {
    id: row.id,
    customerId: row.customer_id,
    studioId: row.studio_id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

function toDbPhotoProofing(p: PhotoProofingGallery): any {
  return {
    id: p.id,
    booking_id: p.bookingId,
    studio_id: p.studioId,
    customer_id: p.customerId,
    photos: Array.isArray(p.photos) ? JSON.stringify(p.photos) : (p.photos || "[]"),
    watermark_text: p.watermarkText,
    watermark_position: p.watermarkPosition || "center",
    watermark_opacity: p.watermarkOpacity !== undefined ? Number(p.watermarkOpacity) : 0.40,
    final_drive_link: p.finalDriveLink || null,
    status: p.status || "draft",
    created_at: p.createdAt ? new Date(p.createdAt) : new Date(),
    updated_at: p.updatedAt ? new Date(p.updatedAt) : new Date()
  };
}

function fromDbPhotoProofing(row: any): PhotoProofingGallery {
  let parsedPhotos = [];
  try {
    parsedPhotos = row.photos ? (typeof row.photos === "string" ? JSON.parse(row.photos) : row.photos) : [];
  } catch (e) {
    parsedPhotos = [];
  }
  return {
    id: row.id,
    bookingId: row.booking_id,
    studioId: row.studio_id,
    customerId: row.customer_id,
    photos: parsedPhotos,
    watermarkText: row.watermark_text,
    watermarkPosition: row.watermark_position || "center",
    watermarkOpacity: row.watermark_opacity !== null ? Number(row.watermark_opacity) : 0.40,
    finalDriveLink: row.final_drive_link || undefined,
    status: row.status || "draft",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString()),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at || new Date().toISOString())
  };
}

function toDbCMS(c: CMSSetting): any {
  return {
    id: c.id || c.key,
    key: c.key,
    value: c.value
  };
}

function fromDbCMS(row: any): CMSSetting {
  return {
    id: row.id || row.key,
    key: row.key,
    value: row.value
  };
}

function toDbMediaFile(media: MediaFile): any {
  return {
    id: media.id,
    owner_id: media.ownerId,
    entity_type: media.entityType,
    entity_id: media.entityId,
    purpose: media.purpose,
    original_name: media.originalName || null,
    mime_type: media.mimeType,
    size_bytes: media.sizeBytes,
    checksum: media.checksum,
    storage_key: media.storageKey,
    access_status: media.accessStatus,
    created_at: media.createdAt ? new Date(media.createdAt) : new Date()
  };
}

function fromDbMediaFile(row: any): MediaFile {
  return {
    id: row.id,
    ownerId: row.owner_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    purpose: row.purpose,
    originalName: row.original_name || undefined,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes) || 0,
    checksum: row.checksum,
    storageKey: row.storage_key,
    accessStatus: row.access_status || "quarantined",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString())
  };
}

// ====================================================================
// MAIN RELATIONAL MYSQL DATABASE CONTROLLER
// ====================================================================

class RelationalDatabase {
  private pool: mysql.Pool | null = null;
  private data: DatabaseSchema = { ...defaultSchema };
  private isMySqlActive = false;
  private readonly ready: Promise<void>;
  private saveQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.ready = this.initialize();
  }

  public waitUntilReady() {
    return this.ready;
  }

  private async initialize() {
    const host = process.env.DB_HOST || "127.0.0.1";
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER || "root";
    const password = process.env.DB_PASSWORD || "";
    const database = process.env.DB_NAME || "cainta_photography_mis";

    console.log(`[Database] Connecting to MySQL server at ${host}:${port}/${database}...`);
    try {
      this.pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Verify database connection
      await this.pool.query("SELECT 1");
      this.isMySqlActive = true;
      console.log(`[Database] Connected successfully to MySQL server '${database}'!`);

      // Ensure all schemas and tables exist
      await this.bootstrapDatabaseSchema();

      // Load all data directly from live MySQL tables into memory
      await this.loadFromMySql();
    } catch (err) {
      console.error("[Database] MySQL connection failed. Operating in local db.json mode:", err);
      this.isMySqlActive = false;
      this.loadLocalBackup();
    }
    this.initializeCMSDefaults();
  }

  private initializeCMSDefaults() {
    if (!this.data.cmsSettings || this.data.cmsSettings.length === 0) {
      const defaults: CMSSetting[] = [
        { id: "heroTitle", key: "heroTitle", value: "Frame Your Story. <br /> Book Cainta Studios." },
        { id: "heroSubtitle", key: "heroSubtitle", value: "Discover accredited photography studios in Cainta, Rizal. Compare live calendar availability, customize grad & creative packages, inspect RAW vs retouched portfolios, and order gallery-grade physical wall prints." },
        { id: "heroBackground", key: "heroBackground", value: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1800&fit=crop" },
        { id: "aboutTitle", key: "aboutTitle", value: "Pristine Studio Lighting & Retouching" },
        { id: "aboutDescription", key: "aboutDescription", value: "Experience the difference of calibrated Profoto strobes, true-to-life skin tones, and meticulous post-processing by Cainta's leading photographers." },
        { id: "featuresTitle", key: "featuresTitle", value: "Specialized Categories" },
        { id: "featuresSubtitle", key: "featuresSubtitle", value: "Explore photography styles and packages suited to your milestones." }
      ];
      this.data.cmsSettings = defaults;
      this.save();
    }
  }

  private loadLocalBackup() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
        for (const key of Object.keys(defaultSchema)) {
          if (!this.data[key as keyof DatabaseSchema]) {
            (this.data as any)[key] = [];
          }
        }
      } else {
        this.data = { ...defaultSchema };
        this.save();
      }
    } catch (error) {
      console.error("[Database] Local load failed", error);
    }
  }

  // Get collections
  get users() { return this.data.users; }
  get customers() { return this.data.customers || []; }  // Separate customers table
  get studios() { return this.data.studios; }
  get categories() { return this.data.categories; }
  get services() { return this.data.services; }
  get packages() { return this.data.packages; }
  get addons() { return this.data.addons; }
  get bookings() { return this.data.bookings; }
  get payments() { return this.data.payments; }
  get printProducts() { return this.data.printProducts; }
  get printOrders() { return this.data.printOrders; }
  get reviews() { return this.data.reviews; }
  get faqs() { return this.data.faqs; }
  get auditLogs() { return this.data.auditLogs; }
  get notifications() { return this.data.notifications; }
  get favorites() { return this.data.favorites; }
  get photoProofings() { return this.data.photoProofings || []; }
  get cmsSettings() { return this.data.cmsSettings || []; }
  get customPages() { return this.data.customPages || []; }
  get systemSettings() { return this.data.systemSettings || defaultSchema.systemSettings; }
  get mediaFiles() { return this.data.mediaFiles || []; }

  public updateSystemSettings(settings: SystemSettings) {
    this.data.systemSettings = { ...this.data.systemSettings, ...settings };
    this.save();
  }

  // Ensure relational data integrity (e.g. all studio ownerIds have corresponding user records)
  private ensureIntegrity() {
    // Keep data empty unless user-generated records are explicitly created.
    for (const studio of this.data.studios) {
      if (!this.data.users.some(u => u.id === studio.ownerId)) {
        const ownerUser: User = {
          id: studio.ownerId,
          email: studio.email || `${studio.ownerId}@caintastudios.com`,
          passwordHash: "$2b$10$KWzQUkhlejbbjajhZZSS3ONo1.Onq8MCGV6FDtQ1vWrH9TsHW7D6G",
          fullName: `${studio.name} Admin`,
          role: studio.ownerId === "u-superadmin" ? UserRole.SUPER_ADMIN : UserRole.STUDIO_ADMIN,
          studioId: studio.id,
          contactNumber: studio.contactInfo,
          address: studio.address,
          createdAt: studio.createdAt || new Date().toISOString()
        };
        this.data.users.push(ownerUser);
      }
    }
  }

  // Generic write helpers (Saves to memory buffers instantly, then persists to MySQL & local file)
  public addUser(user: User) { this.users.push(user); this.save(); }
  public addCustomer(customer: Customer) { 
    if (!this.data.customers) this.data.customers = [];
    this.data.customers.push(customer); 
    this.save(); 
  }
  public addCMSSetting(setting: CMSSetting) { this.cmsSettings.push(setting); this.save(); }
  public addStudio(studio: Studio) { 
    this.studios.push(studio); 
    this.ensureIntegrity();
    this.save(); 
  }
  public addCategory(category: StudioCategory) { this.categories.push(category); this.save(); }
  public addService(service: StudioService) { this.services.push(service); this.save(); }
  public addPackage(pkg: StudioPackage) { this.packages.push(pkg); this.save(); }
  public addAddon(addon: PackageAddon) { this.addons.push(addon); this.save(); }
  public addBooking(booking: Booking) { this.bookings.push(booking); this.save(); }
  public addPayment(payment: Payment) { this.payments.push(payment); this.save(); }
  public addPrintProduct(product: PrintProduct) { this.printProducts.push(product); this.save(); }
  public addPrintOrder(order: PrintOrder) { this.printOrders.push(order); this.save(); }
  public addReview(review: Review) { this.reviews.push(review); this.save(); }
  public addFAQ(faq: ChatbotFAQ) { this.faqs.push(faq); this.save(); }
  public addAuditLog(log: AuditLog) { this.auditLogs.unshift(log); this.save(); }
  public addNotification(notification: Notification) { this.notifications.unshift(notification); this.save(); }
  public addFavorite(fav: FavoriteStudio) { this.favorites.push(fav); this.save(); }
  public addPhotoProofing(proofing: PhotoProofingGallery) { this.photoProofings.push(proofing); this.save(); }
  public addMediaFile(media: MediaFile) {
    if (!this.data.mediaFiles) this.data.mediaFiles = [];
    this.data.mediaFiles.push(media);
    this.save();
  }

  // Generic parameterized MySQL Insert / Upsert
  private async mysqlInsert(table: string, dbRow: any) {
    if (!this.isMySqlActive || !this.pool) return;
    try {
      // If inserting a studio, ensure its owner exists in users first to avoid FK error
      if (table === "studios" && dbRow.owner_id) {
        const [existingUser]: any = await this.pool.query("SELECT id FROM users WHERE id = ?", [dbRow.owner_id]);
        if (!existingUser || existingUser.length === 0) {
          const ownerUser = this.users.find(u => u.id === dbRow.owner_id) || {
            id: dbRow.owner_id,
            email: dbRow.email || `${dbRow.owner_id}@caintastudios.com`,
            passwordHash: "$2b$10$KWzQUkhlejbbjajhZZSS3ONo1.Onq8MCGV6FDtQ1vWrH9TsHW7D6G",
            fullName: `${dbRow.name || "Studio"} Admin`,
            role: dbRow.owner_id === "u-superadmin" ? UserRole.SUPER_ADMIN : UserRole.STUDIO_ADMIN,
            studioId: dbRow.id,
            contactNumber: dbRow.contact_info,
            address: dbRow.address,
            createdAt: dbRow.created_at ? new Date(dbRow.created_at).toISOString() : new Date().toISOString()
          };
          await this.mysqlInsert("users", toDbUser(ownerUser));
        }
      }

      const keys = Object.keys(dbRow);
      const values = Object.values(dbRow);
      const placeholders = keys.map(() => "?").join(", ");
      const columns = keys.map(k => `\`${k}\``).join(", ");
      const updateClauses = keys.filter(k => k !== "id").map(k => `\`${k}\` = VALUES(\`${k}\`)`).join(", ");

      const query = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClauses}`;
      await this.pool.query(query, values);
    } catch (err) {
      console.error(`[Database] MySQL insert failed on table '${table}':`, err);
    }
  }

  // Synchronizes changes made in memory to MySQL and local file storage
  public save() {
    this.saveQueue = this.saveQueue.then(() => this.persist()).catch(err => {
      console.error("[Database] Queued save failed:", err);
    });
    return this.saveQueue;
  }

  private async persist() {
    this.ensureIntegrity();

    // 1. Write clean local storage backup
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      console.error("[Database] Local file backup sync failed", error);
    }

    // 2. Map & Upsert all items to MySQL in strict foreign-key order
    if (!this.isMySqlActive || !this.pool) return;
    try {
      await this.syncTable("users", this.users.map(toDbUser));
      await this.syncTable("customers", this.customers.map(toDbCustomer));
      await this.syncTable("studios", this.studios.map(toDbStudio));
      await this.syncTable("categories", this.categories.map(toDbCategory));
      await this.syncTable("services", this.services.map(toDbService));
      await this.syncTable("packages", this.packages.map(toDbPackage));
      await this.syncTable("addons", this.addons.map(toDbAddon));
      await this.syncTable("bookings", this.bookings.map(toDbBooking));
      await this.syncTable("payments", this.payments.map(toDbPayment));
      await this.syncTable("print_products", this.printProducts.map(toDbPrintProduct));
      await this.syncTable("print_orders", this.printOrders.map(toDbPrintOrder));
      await this.syncTable("reviews", this.reviews.map(toDbReview));
      await this.syncTable("faqs", this.faqs.map(toDbFAQ));
      await this.syncTable("audit_logs", this.auditLogs.map(toDbAuditLog));
      await this.syncTable("notifications", this.notifications.map(toDbNotification));
      await this.syncTable("favorites", this.favorites.map(toDbFavorite));
      await this.syncTable("photo_proofings", this.photoProofings.map(toDbPhotoProofing));
      await this.syncTable("cms_settings", this.cmsSettings.map(toDbCMS));
      await this.syncTable("media_files", this.mediaFiles.map(toDbMediaFile));
    } catch (err) {
      console.error("[Database] Synchronize MySQL update failed:", err);
    }
  }

  // Synchronizes a full table to MySQL
  private async syncTable(table: string, dbRows: any[]) {
    if (!this.pool) return;
    try {
      // Deletion: Remove rows no longer present in memory
      const activeIds = dbRows.map(r => r.id);
      if (activeIds.length > 0) {
        const idPlaceholders = activeIds.map(() => "?").join(",");
        await this.pool.query(`DELETE FROM \`${table}\` WHERE id NOT IN (${idPlaceholders})`, activeIds);
      } else {
        await this.pool.query(`DELETE FROM \`${table}\``);
      }

      // Upsert: Insert or update all rows
      for (const row of dbRows) {
        const keys = Object.keys(row);
        const values = Object.values(row);
        const columns = keys.map(k => `\`${k}\``).join(", ");
        const placeholders = keys.map(() => "?").join(", ");
        const updateClauses = keys.filter(k => k !== "id").map(k => `\`${k}\` = VALUES(\`${k}\`)`).join(", ");

        const query = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClauses}`;
        await this.pool.query(query, values);
      }
    } catch (tableErr) {
      console.error(`[Database] syncTable failed for '${table}':`, tableErr);
    }
  }

  // Reads all tables from MySQL to populate the memory state
  private async loadFromMySql() {
    if (!this.pool) return;
    console.log("[Database] Hydrating memory from MySQL tables...");
    try {
      const [usersRes]: any = await this.pool.query("SELECT * FROM users");
      const [customersRes]: any = await this.pool.query("SELECT * FROM customers");
      const [studiosRes]: any = await this.pool.query("SELECT * FROM studios");
      const [categoriesRes]: any = await this.pool.query("SELECT * FROM categories");
      const [servicesRes]: any = await this.pool.query("SELECT * FROM services");
      const [packagesRes]: any = await this.pool.query("SELECT * FROM packages");
      const [addonsRes]: any = await this.pool.query("SELECT * FROM addons");
      const [bookingsRes]: any = await this.pool.query("SELECT * FROM bookings");
      const [paymentsRes]: any = await this.pool.query("SELECT * FROM payments");
      const [printsRes]: any = await this.pool.query("SELECT * FROM print_products");
      const [printOrdersRes]: any = await this.pool.query("SELECT * FROM print_orders");
      const [reviewsRes]: any = await this.pool.query("SELECT * FROM reviews");
      const [faqsRes]: any = await this.pool.query("SELECT * FROM faqs");
      const [logsRes]: any = await this.pool.query("SELECT * FROM audit_logs ORDER BY timestamp DESC");
      const [notificationsRes]: any = await this.pool.query("SELECT * FROM notifications ORDER BY created_at DESC");
      const [favoritesRes]: any = await this.pool.query("SELECT * FROM favorites");
      const [proofingsRes]: any = await this.pool.query("SELECT * FROM photo_proofings");
      let mediaFilesRes: any[] = [];
      try {
        const [media]: any = await this.pool.query("SELECT * FROM media_files");
        mediaFilesRes = media;
      } catch (e) {}

      let cmsRes: any[] = [];
      try {
        const [cms]: any = await this.pool.query("SELECT * FROM cms_settings");
        cmsRes = cms;
      } catch (e) {}

      this.data.users = usersRes.map(fromDbUser);
      this.data.customers = customersRes.map(fromDbCustomer);
      this.data.studios = studiosRes.map(fromDbStudio);
      this.data.categories = categoriesRes.map(fromDbCategory);
      this.data.services = servicesRes.map(fromDbService);
      this.data.packages = packagesRes.map(fromDbPackage);
      this.data.addons = addonsRes.map(fromDbAddon);
      this.data.bookings = bookingsRes.map(fromDbBooking);
      this.data.payments = paymentsRes.map(fromDbPayment);
      this.data.printProducts = printsRes.map(fromDbPrintProduct);
      this.data.printOrders = printOrdersRes.map(fromDbPrintOrder);
      this.data.reviews = reviewsRes.map(fromDbReview);
      this.data.faqs = faqsRes.map(fromDbFAQ);
      this.data.auditLogs = logsRes.map(fromDbAuditLog);
      this.data.notifications = notificationsRes.map(fromDbNotification);
      this.data.favorites = favoritesRes.map(fromDbFavorite);
      this.data.photoProofings = proofingsRes.map(fromDbPhotoProofing);
      this.data.cmsSettings = cmsRes.map(fromDbCMS);
      this.data.mediaFiles = mediaFilesRes.map(fromDbMediaFile);

      this.ensureIntegrity();

      console.log(`[Database] Hydration complete! Loaded users: ${this.data.users.length}, customers: ${this.data.customers.length}, studios: ${this.data.studios.length}, bookings: ${this.data.bookings.length}`);    } catch (err) {
      console.error("[Database] Hydration from MySQL failed:", err);
      this.loadLocalBackup();
    }
  }

  // Schema bootstrapper to ensure tables and auxiliary columns exist
  private async bootstrapDatabaseSchema() {
    if (!this.pool) return;
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          role VARCHAR(50) NOT NULL,
          studio_id VARCHAR(50) NULL,
          contact_number VARCHAR(50) NULL,
          address TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Dedicated customers table (separate from users/admin/studio_owner)
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id VARCHAR(50) PRIMARY KEY,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          contact_number VARCHAR(50) NULL,
          address TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS cms_settings (
          id VARCHAR(100) PRIMARY KEY,
          \`key\` VARCHAR(100) NOT NULL,
          \`value\` TEXT NOT NULL
        );
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS media_files (
          id VARCHAR(50) PRIMARY KEY,
          owner_id VARCHAR(50) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          entity_id VARCHAR(50) NOT NULL,
          purpose VARCHAR(50) NOT NULL,
          original_name VARCHAR(255) NULL,
          mime_type VARCHAR(100) NOT NULL,
          size_bytes BIGINT NOT NULL,
          checksum VARCHAR(128) NOT NULL,
          storage_key VARCHAR(255) NOT NULL UNIQUE,
          access_status VARCHAR(30) NOT NULL DEFAULT 'quarantined',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX media_files_entity_idx (entity_type, entity_id),
          INDEX media_files_owner_idx (owner_id),
          INDEX media_files_purpose_idx (purpose)
        );
      `);
      try {
        await this.pool.query(`ALTER TABLE media_files ADD COLUMN purpose VARCHAR(50) NOT NULL DEFAULT 'LEGACY';`);
      } catch (e) {}

      // Add missing columns if needed
      try {
        await this.pool.query(`ALTER TABLE studios ADD COLUMN business_permit TEXT NULL;`);
      } catch (e) {}
      try {
        await this.pool.query(`ALTER TABLE studios ADD COLUMN valid_id LONGTEXT NULL;`);
      } catch (e) {}
      try {
        await this.pool.query(`ALTER TABLE studios ADD COLUMN other_docs TEXT NULL;`);
      } catch (e) {}
      try {
        await this.pool.query(`ALTER TABLE studios ADD COLUMN registered_by_admin BOOLEAN DEFAULT FALSE;`);
      } catch (e) {}
      // Reviews moderation & reply columns
      try {
        await this.pool.query(`ALTER TABLE reviews ADD COLUMN status VARCHAR(50) DEFAULT 'approved';`);
      } catch (e) {}
      try {
        await this.pool.query(`ALTER TABLE reviews ADD COLUMN reply TEXT NULL;`);
      } catch (e) {}
      try {
        await this.pool.query(`ALTER TABLE reviews ADD COLUMN reply_at TIMESTAMP NULL;`);
      } catch (e) {}
    } catch (err) {
      console.error("[Database] MySQL schema verification notice:", err);
    }
  }
}

export const db = new RelationalDatabase();
