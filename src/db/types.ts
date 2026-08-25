export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  STUDIO_ADMIN = "STUDIO_ADMIN",
  STUDIO_STAFF = "STUDIO_STAFF",
  CUSTOMER = "CUSTOMER"
}

// User interface — Admin and Studio Owner accounts only (stored in `users` table)
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;  // SUPER_ADMIN | STUDIO_ADMIN | STUDIO_STAFF
  studioId?: string; // Only for STUDIO_ADMIN / STUDIO_STAFF
  contactNumber?: string;
  address?: string;
  authToken?: string;
  createdAt: string;
}

export type MediaAccessStatus = "quarantined" | "active" | "rejected" | "deleted";

export interface MediaFile {
  id: string;
  ownerId: string;
  entityType: string;
  entityId: string;
  purpose: string;
  originalName?: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  storageKey: string;
  accessStatus: MediaAccessStatus;
  createdAt: string;
}

// Customer interface — Dedicated customer accounts (stored in `customers` table)
export interface Customer {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: "CUSTOMER"; // Always CUSTOMER
  contactNumber?: string;
  address?: string;
  authToken?: string;
  createdAt: string;
}

export interface Studio {
  id: string;
  name: string;
  ownerId: string;
  logo: string;
  coverImage: string;
  location: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  categories: string[]; // e.g. ["Portrait", "Wedding"]
  description: string;
  address: string;
  contactInfo: string;
  email: string;
  businessHours: string; // e.g. "9:00 AM - 6:00 PM"
  isApproved: boolean; // Verification status
  status: "pending" | "under_review" | "approved" | "rejected" | "suspended";
  printingAvailable: boolean;
  latitude?: number;
  longitude?: number;
  businessPermit?: string;
  validId?: string;
  otherDocs?: string;
  registeredByAdmin?: boolean;
  createdAt: string;
}

export interface StudioCategory {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface StudioService {
  id: string;
  studioId: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  durationMinutes: number;
  image: string;
  isActive: boolean;
  availableDays: string[]; // e.g. ["Monday", "Tuesday"]
  availableSlots: string[]; // e.g. ["09:00 AM", "10:30 AM"]
  requirements: string[]; // e.g. ["Downpayment", "Dress code"]
  createdAt: string;
}

export interface StudioPackage {
  id: string;
  studioId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  editedPhotosCount: number;
  includedPrints: string;
  photographerCount: number;
  includedServices: string[];
  termsAndConditions: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

export interface PackageAddon {
  id: string;
  studioId: string;
  name: string;
  price: number;
  description: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  studioId: string;
  customerId: string;
  serviceId: string;
  packageId: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 AM"
  addons: { addonId: string; quantity: number; price: number }[];
  customerDetails: {
    fullName: string;
    email: string;
    phone: string;
    notes: string;
  };
  requirementsDoc?: string; // File name or base64 of upload
  status: "Pending" | "Awaiting Payment" | "Confirmed" | "Rescheduled" | "Ongoing" | "Completed" | "Cancelled" | "Rejected" | "Expired" | "No Show";
  totalAmount: number;
  amountPaid: number;
  downPaymentAmount: number;
  remainingBalance: number;
  paymentStatus: "Unpaid" | "Pending Verification" | "Partially Paid" | "Paid" | "Refunded" | "Failed";
  finalPaymentStatus: "Pending" | "Paid";
  paymentDueAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  studioId: string;
  customerId: string;
  amount: number;
  paymentType: "Downpayment" | "Balance";
  paymentMethod: "Cash" | "GCash" | "Bank Transfer" | "Online Payment";
  paymentStatus: "Unpaid" | "Pending Verification" | "Partially Paid" | "Paid" | "Refunded" | "Failed";
  proofOfPayment?: string; // base64 or file path
  referenceNumber?: string;
  paymentDate: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface PrintProduct {
  id: string;
  studioId: string;
  name: string;
  description: string;
  size: string;
  price: number;
  image: string;
  inStock: boolean;
  estimatedHours: number;
  isActive: boolean;
  createdAt: string;
}

export interface PrintOrder {
  id: string;
  studioId: string;
  customerId: string;
  productId: string;
  quantity: number;
  uploadedPhoto: string; // base64
  status: "Pending" | "Confirmed" | "Processing" | "Quality Check" | "Ready for Pickup" | "Out for Delivery" | "Completed" | "Cancelled";
  totalAmount: number;
  paymentMethod: "Cash" | "GCash" | "Bank Transfer" | "Online Payment";
  paymentStatus: "Unpaid" | "Pending Verification" | "Paid";
  proofOfPayment?: string;
  referenceNumber?: string;
  shippingAddress?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  studioId: string;
  customerId: string;
  customerName: string;
  bookingId: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  reply?: string;       // Studio owner's response text
  replyAt?: string;     // ISO timestamp when reply was posted
  createdAt: string;
}

export interface ChatbotFAQ {
  id: string;
  studioId: string; // can be "GLOBAL" or a specific studio ID
  question: string;
  answer: string;
  category: string; // "FAQ" | "Studio Info" | "Services" | "Booking" | "Policies"
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  userId: string; // Target user
  studioId?: string; // If studio notification
  title: string;
  message: string;
  isRead: boolean;
  type: "info" | "success" | "warning" | "error";
  channel?: "App" | "SMS" | "Email";
  recipientContact?: string; // Phone or Email address
  createdAt: string;
}

export interface FavoriteStudio {
  id: string;
  customerId: string;
  studioId: string;
  createdAt: string;
}

export interface ProofPhoto {
  id: string;
  url: string;
  caption?: string;
  watermarkText?: string;
  isSelectedForPrint: boolean;
  isStarred: boolean;
  feedbackNote?: string;
  status: "raw" | "selected" | "editing" | "final_approved";
}

export interface PhotoProofingGallery {
  id: string;
  bookingId: string;
  studioId: string;
  customerId: string;
  photos: ProofPhoto[];
  watermarkText: string;
  watermarkPosition: "center" | "bottom_right" | "repeat_diagonal";
  watermarkOpacity: number;
  finalDriveLink?: string;
  status: "draft" | "sent_to_client" | "client_reviewed" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface CMSSetting {
  id: string;
  key: string;
  value: string;
}

export interface PageBlock {
  id: string;
  type: "hero" | "text" | "gallery" | "faq" | "cta" | "pricing";
  title?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: { title: string; description: string; price?: string; image?: string }[];
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  showInNavbar: boolean;
  blocks: PageBlock[];
  createdAt: string;
}

export interface SystemSettings {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  headerStyle: string;
  isChatbotEnabled: boolean;
  isPrintStoreEnabled: boolean;
  isBookingEnabled: boolean;
  isMapEnabled: boolean;
  isSoundEnabled: boolean;
  customAudioUrl: string;
  customAudioEnabled: boolean;
  hiddenNavItems: string[];
}
