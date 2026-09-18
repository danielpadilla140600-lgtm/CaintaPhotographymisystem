var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  api: () => api
});
module.exports = __toCommonJS(index_exports);
var import_https = require("firebase-functions/v2/https");
var import_express2 = __toESM(require("express"));

// ../server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_dotenv2 = __toESM(require("dotenv"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_os2 = __toESM(require("os"), 1);
var import_promises = __toESM(require("fs/promises"), 1);
var import_crypto = __toESM(require("crypto"), 1);

// ../src/db/database.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_os = __toESM(require("os"), 1);
var import_promise = __toESM(require("mysql2/promise"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var isServerless = !!(process.env.VERCEL || process.env.FUNCTION_TARGET || process.env.K_SERVICE || process.env.FIREBASE_CONFIG);
var DB_FILE = isServerless ? import_path.default.join(import_os.default.tmpdir(), "db.json") : import_path.default.join(process.cwd(), "db.json");
var defaultSchema = {
  users: [],
  customers: [],
  // Customers registered through the app go here
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
    demoVideoUrl: "",
    hiddenNavItems: []
  },
  mediaFiles: [],
  availabilities: [],
  blackouts: []
};
function toDbAvailability(a) {
  return {
    id: a.id,
    studio_id: a.studioId,
    day_of_week: Number(a.dayOfWeek),
    opening_time: a.openingTime,
    closing_time: a.closingTime,
    is_available: a.isAvailable ? 1 : 0,
    slot_duration_minutes: Number(a.slotDurationMinutes) || 60,
    created_at: a.createdAt ? new Date(a.createdAt) : /* @__PURE__ */ new Date(),
    updated_at: a.updatedAt ? new Date(a.updatedAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbAvailability(row) {
  return {
    id: row.id,
    studioId: row.studio_id,
    dayOfWeek: Number(row.day_of_week),
    openingTime: row.opening_time,
    closingTime: row.closing_time,
    isAvailable: !!row.is_available,
    slotDurationMinutes: Number(row.slot_duration_minutes) || 60,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbBlackout(b) {
  return {
    id: b.id,
    studio_id: b.studioId,
    blackout_date: b.blackoutDate,
    start_time: b.startTime,
    end_time: b.endTime,
    reason: b.reason || "Studio closure",
    is_recurring: b.isRecurring ? 1 : 0,
    recurrence_rule: b.recurrenceRule || null,
    created_at: b.createdAt ? new Date(b.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbBlackout(row) {
  return {
    id: row.id,
    studioId: row.studio_id,
    blackoutDate: row.blackout_date,
    startTime: row.start_time,
    endTime: row.end_time,
    reason: row.reason || "Studio closure",
    isRecurring: !!row.is_recurring,
    recurrenceRule: row.recurrence_rule || void 0,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbUser(u) {
  return {
    id: u.id,
    email: u.email,
    password_hash: u.passwordHash,
    full_name: u.fullName,
    role: u.role,
    studio_id: u.studioId || null,
    contact_number: u.contactNumber || null,
    address: u.address || null,
    created_at: u.createdAt ? new Date(u.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbUser(row) {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    role: row.role,
    studioId: row.studio_id || void 0,
    contactNumber: row.contact_number || void 0,
    address: row.address || void 0,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbCustomer(c) {
  return {
    id: c.id,
    email: c.email,
    password_hash: c.passwordHash,
    full_name: c.fullName,
    contact_number: c.contactNumber || null,
    address: c.address || null,
    created_at: c.createdAt ? new Date(c.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbCustomer(row) {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    role: "CUSTOMER",
    contactNumber: row.contact_number || void 0,
    address: row.address || void 0,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbStudio(s) {
  const blockedDates = Array.isArray(s.blockedDates) ? s.blockedDates.filter(Boolean) : [];
  const categories = Array.isArray(s.categories) ? s.categories.filter(Boolean) : [];
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
    blocked_dates: blockedDates.join(","),
    categories: categories.join(","),
    description: s.description || "",
    address: s.address || "",
    contact_info: s.contactInfo || "",
    email: s.email || "",
    business_hours: s.businessHours || "09:00 AM - 06:00 PM",
    is_approved: s.isApproved ? 1 : 0,
    status: s.status || "pending",
    printing_available: s.printingAvailable ? 1 : 0,
    latitude: s.latitude !== void 0 && s.latitude !== null ? Number(s.latitude) : null,
    longitude: s.longitude !== void 0 && s.longitude !== null ? Number(s.longitude) : null,
    business_permit: s.businessPermit || null,
    valid_id: s.validId || null,
    other_docs: s.otherDocs || null,
    registered_by_admin: s.registeredByAdmin ? 1 : 0,
    created_at: s.createdAt ? new Date(s.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbStudio(row) {
  const blockedDates = row.blocked_dates ? typeof row.blocked_dates === "string" ? row.blocked_dates.split(",").map((v) => v.trim()).filter(Boolean) : row.blocked_dates : [];
  const categories = row.categories ? typeof row.categories === "string" ? row.categories.split(",").map((v) => v.trim()).filter(Boolean) : row.categories : [];
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
    blockedDates,
    categories,
    description: row.description || "",
    address: row.address || "",
    contactInfo: row.contact_info || "",
    email: row.email || "",
    businessHours: row.business_hours || "09:00 AM - 06:00 PM",
    isApproved: !!row.is_approved,
    status: row.status || "pending",
    printingAvailable: !!row.printing_available,
    latitude: row.latitude !== null && row.latitude !== void 0 ? Number(row.latitude) : void 0,
    longitude: row.longitude !== null && row.longitude !== void 0 ? Number(row.longitude) : void 0,
    businessPermit: row.business_permit || void 0,
    validId: row.valid_id || void 0,
    otherDocs: row.other_docs || void 0,
    registeredByAdmin: !!row.registered_by_admin,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbCategory(c) {
  return {
    id: c.id,
    name: c.name,
    description: c.description || "",
    created_at: c.createdAt ? new Date(c.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbCategory(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbService(s) {
  const serviceImages = Array.isArray(s.images) && s.images.length > 0 ? s.images : s.image ? [s.image] : [];
  return {
    id: s.id,
    studio_id: s.studioId,
    name: s.name,
    description: s.description || "",
    category: s.category || "General",
    base_price: Number(s.basePrice) || 0,
    duration_minutes: Number(s.durationMinutes) || 0,
    image: serviceImages.length > 0 ? JSON.stringify(serviceImages) : null,
    is_active: s.isActive ? 1 : 0,
    available_days: Array.isArray(s.availableDays) ? s.availableDays.join(",") : s.availableDays || "",
    available_slots: Array.isArray(s.availableSlots) ? s.availableSlots.join(",") : s.availableSlots || "",
    requirements: Array.isArray(s.requirements) ? s.requirements.join(",") : s.requirements || "",
    created_at: s.createdAt ? new Date(s.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbService(row) {
  let serviceImages = [];
  if (typeof row.image === "string" && row.image.startsWith("[")) {
    try {
      const parsedImages = JSON.parse(row.image);
      if (Array.isArray(parsedImages)) serviceImages = parsedImages.filter((image) => typeof image === "string");
    } catch {
      serviceImages = [];
    }
  }
  if (serviceImages.length === 0 && row.image) serviceImages = [row.image];
  return {
    id: row.id,
    studioId: row.studio_id,
    name: row.name,
    description: row.description || "",
    category: row.category || "General",
    basePrice: Number(row.base_price) || 0,
    durationMinutes: Number(row.duration_minutes) || 0,
    image: serviceImages[0] || void 0,
    images: serviceImages,
    isActive: !!row.is_active,
    availableDays: row.available_days ? typeof row.available_days === "string" ? row.available_days.split(",") : row.available_days : [],
    availableSlots: row.available_slots ? typeof row.available_slots === "string" ? row.available_slots.split(",") : row.available_slots : [],
    requirements: row.requirements ? typeof row.requirements === "string" ? row.requirements.split(",") : row.requirements : [],
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbPackage(p) {
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
    included_services: Array.isArray(p.includedServices) ? p.includedServices.join(",") : p.includedServices || null,
    terms_and_conditions: p.termsAndConditions || "",
    image: p.image || null,
    is_active: p.isActive ? 1 : 0,
    created_at: p.createdAt ? new Date(p.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbPackage(row) {
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
    includedServices: row.included_services ? typeof row.included_services === "string" ? row.included_services.split(",") : row.included_services : [],
    termsAndConditions: row.terms_and_conditions || "",
    image: row.image || void 0,
    isActive: !!row.is_active,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbAddon(a) {
  return {
    id: a.id,
    studio_id: a.studioId,
    name: a.name,
    price: Number(a.price) || 0,
    description: a.description || "",
    image: a.image || null,
    created_at: a.createdAt ? new Date(a.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbAddon(row) {
  return {
    id: row.id,
    studioId: row.studio_id,
    name: row.name,
    price: Number(row.price) || 0,
    description: row.description || "",
    image: row.image || void 0,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbBooking(b) {
  return {
    id: b.id,
    studio_id: b.studioId,
    customer_id: b.customerId,
    service_id: b.serviceId || null,
    package_id: b.packageId || null,
    booking_date: b.bookingDate,
    time_slot: b.timeSlot,
    addons: Array.isArray(b.addons) ? JSON.stringify(b.addons) : b.addons || "[]",
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
    payment_option: b.paymentOption || "Downpayment",
    payment_due_at: b.paymentDueAt ? new Date(b.paymentDueAt) : null,
    cancellation_reason: b.cancellationReason || null,
    cancelled_by: b.cancelledBy || null,
    cancelled_at: b.cancelledAt ? new Date(b.cancelledAt) : null,
    created_at: b.createdAt ? new Date(b.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbBooking(row) {
  let parsedAddons = [];
  try {
    parsedAddons = row.addons ? typeof row.addons === "string" ? JSON.parse(row.addons) : row.addons : [];
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
    requirementsDoc: row.requirements_doc || void 0,
    status: row.status,
    totalAmount: Number(row.total_amount) || 0,
    amountPaid: Number(row.amount_paid) || 0,
    downPaymentAmount: Number(row.down_payment_amount) || Math.round(Number(row.total_amount) * 0.3 * 100) / 100,
    remainingBalance: Number(row.remaining_balance) || Math.max(0, Number(row.total_amount) - Number(row.amount_paid)),
    paymentStatus: row.payment_status || "Unpaid",
    finalPaymentStatus: row.final_payment_status || (Number(row.amount_paid) >= Number(row.total_amount) ? "Paid" : "Pending"),
    paymentOption: row.payment_option === "Full Payment" || Number(row.down_payment_amount) >= Number(row.total_amount) && Number(row.total_amount) > 0 ? "Full Payment" : "Downpayment",
    paymentDueAt: row.payment_due_at instanceof Date ? row.payment_due_at.toISOString() : row.payment_due_at || void 0,
    cancellationReason: row.cancellation_reason || void 0,
    cancelledBy: row.cancelled_by || void 0,
    cancelledAt: row.cancelled_at instanceof Date ? row.cancelled_at.toISOString() : row.cancelled_at || void 0,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbPayment(p) {
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
    payment_date: p.paymentDate ? new Date(p.paymentDate) : /* @__PURE__ */ new Date(),
    reviewed_by: p.reviewedBy || null,
    reviewed_at: p.reviewedAt ? new Date(p.reviewedAt) : null,
    rejection_reason: p.rejectionReason || null,
    created_at: p.createdAt ? new Date(p.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbPayment(row) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    studioId: row.studio_id,
    customerId: row.customer_id,
    amount: Number(row.amount) || 0,
    paymentType: row.payment_type || "Downpayment",
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    proofOfPayment: row.proof_of_payment || void 0,
    referenceNumber: row.reference_number || void 0,
    paymentDate: row.payment_date instanceof Date ? row.payment_date.toISOString() : row.payment_date || (/* @__PURE__ */ new Date()).toISOString(),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    reviewedBy: row.reviewed_by || void 0,
    reviewedAt: row.reviewed_at instanceof Date ? row.reviewed_at.toISOString() : row.reviewed_at || void 0,
    rejectionReason: row.rejection_reason || void 0
  };
}
function toDbPrintProduct(p) {
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
    created_at: p.createdAt ? new Date(p.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbPrintProduct(row) {
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
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbPrintOrder(o) {
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
    created_at: o.createdAt ? new Date(o.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbPrintOrder(row) {
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
    proofOfPayment: row.proof_of_payment || void 0,
    referenceNumber: row.reference_number || void 0,
    shippingAddress: row.shipping_address || void 0,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbReview(r) {
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
    created_at: r.createdAt ? new Date(r.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbReview(row) {
  return {
    id: row.id,
    studioId: row.studio_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    bookingId: row.booking_id,
    rating: Number(row.rating) || 5,
    comment: row.comment || "",
    status: row.status || "pending",
    reply: row.reply || void 0,
    replyAt: row.reply_at instanceof Date ? row.reply_at.toISOString() : row.reply_at || void 0,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbFAQ(f) {
  return {
    id: f.id,
    studio_id: f.studioId,
    question: f.question,
    answer: f.answer,
    category: f.category,
    created_at: f.createdAt ? new Date(f.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbFAQ(row) {
  return {
    id: row.id,
    studioId: row.studio_id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    frequency: row.frequency,
    isSuggestion: !!row.is_suggestion,
    source: row.source || "manual"
  };
}
function toDbAuditLog(l) {
  return {
    id: l.id,
    user_id: l.userId,
    user_email: l.userEmail,
    action: l.action,
    entity_type: l.entityType,
    entity_id: l.entityId,
    timestamp: l.timestamp ? new Date(l.timestamp) : /* @__PURE__ */ new Date()
  };
}
function fromDbAuditLog(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbNotification(n) {
  return {
    id: n.id,
    user_id: n.userId,
    studio_id: n.studioId || null,
    title: n.title,
    message: n.message,
    is_read: n.isRead ? 1 : 0,
    type: n.type,
    created_at: n.createdAt ? new Date(n.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbNotification(row) {
  return {
    id: row.id,
    userId: row.user_id,
    studioId: row.studio_id || void 0,
    title: row.title,
    message: row.message,
    isRead: !!row.is_read,
    type: row.type,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbFavorite(f) {
  return {
    id: f.id,
    customer_id: f.customerId,
    studio_id: f.studioId,
    created_at: f.createdAt ? new Date(f.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbFavorite(row) {
  return {
    id: row.id,
    customerId: row.customer_id,
    studioId: row.studio_id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbPhotoProofing(p) {
  return {
    id: p.id,
    booking_id: p.bookingId,
    studio_id: p.studioId,
    customer_id: p.customerId,
    photos: Array.isArray(p.photos) ? JSON.stringify(p.photos) : p.photos || "[]",
    watermark_text: p.watermarkText,
    watermark_position: p.watermarkPosition || "center",
    watermark_opacity: p.watermarkOpacity !== void 0 ? Number(p.watermarkOpacity) : 0.4,
    final_drive_link: p.finalDriveLink || null,
    status: p.status || "draft",
    created_at: p.createdAt ? new Date(p.createdAt) : /* @__PURE__ */ new Date(),
    updated_at: p.updatedAt ? new Date(p.updatedAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbPhotoProofing(row) {
  let parsedPhotos = [];
  try {
    parsedPhotos = row.photos ? typeof row.photos === "string" ? JSON.parse(row.photos) : row.photos : [];
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
    watermarkOpacity: row.watermark_opacity !== null ? Number(row.watermark_opacity) : 0.4,
    finalDriveLink: row.final_drive_link || void 0,
    status: row.status || "draft",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function toDbCMS(c) {
  return {
    id: c.id || c.key,
    key: c.key,
    value: c.value
  };
}
function fromDbCMS(row) {
  return {
    id: row.id || row.key,
    key: row.key,
    value: row.value
  };
}
function toDbMediaFile(media) {
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
    created_at: media.createdAt ? new Date(media.createdAt) : /* @__PURE__ */ new Date()
  };
}
function fromDbMediaFile(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    purpose: row.purpose,
    originalName: row.original_name || void 0,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes) || 0,
    checksum: row.checksum,
    storageKey: row.storage_key,
    accessStatus: row.access_status || "quarantined",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
var RelationalDatabase = class {
  constructor() {
    this.pool = null;
    this.data = { ...defaultSchema };
    this.isMySqlActive = false;
    this.saveQueue = Promise.resolve();
    this.ready = this.initialize();
  }
  get allowLocalBackup() {
    return process.env.ALLOW_LOCAL_BACKUP === "true";
  }
  waitUntilReady() {
    return this.ready;
  }
  async initialize() {
    const host = process.env.DB_HOST || "127.0.0.1";
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER || "root";
    const password = process.env.DB_PASSWORD || "";
    const database = process.env.DB_NAME || "cainta_photography_mis";
    const isServerless3 = !!(process.env.VERCEL || process.env.FUNCTION_TARGET || process.env.K_SERVICE || process.env.FIREBASE_CONFIG);
    const defaultLimit = isServerless3 ? 3 : 10;
    const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT) || defaultLimit;
    const connectTimeout = Number(process.env.DB_CONNECT_TIMEOUT) || (isServerless3 ? 1e4 : 5e3);
    const ssl = process.env.DB_SSL === "true" || process.env.DB_SSL === "1" ? { rejectUnauthorized: false } : void 0;
    console.log(`[Database] Connecting to MySQL server at ${host}:${port}/${database} (Serverless: ${isServerless3}, Pool limit: ${connectionLimit})...`);
    try {
      this.pool = import_promise.default.createPool({
        host,
        port,
        user,
        password,
        database,
        connectTimeout,
        waitForConnections: true,
        connectionLimit,
        queueLimit: 0,
        ssl
      });
      await this.pool.query("SELECT 1");
      this.isMySqlActive = true;
      console.log(`[Database] Connected successfully to MySQL server '${database}'!`);
      await this.bootstrapDatabaseSchema();
      await this.loadFromMySql();
    } catch (err) {
      this.isMySqlActive = false;
      if (this.allowLocalBackup) {
        console.warn("[Database] MySQL connection failed. Falling back to local db.json mode because ALLOW_LOCAL_BACKUP=true.", err);
        this.loadLocalBackup();
      } else {
        console.error("[Database] MySQL connection failed and local fallback is disabled. Starting with an empty in-memory database.", err);
        this.data = { ...defaultSchema };
      }
    }
    this.initializeCMSDefaults();
  }
  initializeCMSDefaults() {
    if (!this.data.cmsSettings || this.data.cmsSettings.length === 0) {
      const defaults = [
        { id: "heroTitle", key: "heroTitle", value: "Frame Your Story. <br /> Book Cainta Studios." },
        { id: "heroSubtitle", key: "heroSubtitle", value: "Discover accredited photography studios in Cainta, Rizal. Compare live calendar availability, customize grad & creative packages, inspect RAW vs retouched portfolios, and order gallery-grade physical wall prints." },
        { id: "heroBackground", key: "heroBackground", value: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1800&fit=crop" },
        { id: "aboutTitle", key: "aboutTitle", value: "Pristine Studio Lighting & Retouching" },
        { id: "aboutDescription", key: "aboutDescription", value: "Experience the difference of calibrated Profoto strobes, true-to-life skin tones, and meticulous post-processing by Cainta's leading photographers." },
        { id: "featuresTitle", key: "featuresTitle", value: "Spotlight Studios in Cainta, Rizal" },
        { id: "featuresSubtitle", key: "featuresSubtitle", value: "Explore photography styles and packages suited to your milestones." }
      ];
      this.data.cmsSettings = defaults;
      this.save();
    }
  }
  loadLocalBackup() {
    if (!this.allowLocalBackup) {
      this.data = { ...defaultSchema };
      return;
    }
    try {
      if (import_fs.default.existsSync(DB_FILE)) {
        const fileContent = import_fs.default.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
        for (const key of Object.keys(defaultSchema)) {
          if (!this.data[key]) {
            this.data[key] = [];
          }
        }
      } else {
        this.data = { ...defaultSchema };
        this.save();
      }
    } catch (error) {
      console.error("[Database] Local load failed", error);
    }
    this.reconcileStudioBrandingMedia();
  }
  reconcileStudioBrandingMedia() {
    for (const studio of this.data.studios) {
      const latestByPurpose = /* @__PURE__ */ new Map();
      for (const media of this.data.mediaFiles || []) {
        if (media.entityType !== "studio" || media.entityId !== studio.id || media.accessStatus !== "active") continue;
        if (media.purpose === "STUDIO_LOGO" || media.purpose === "STUDIO_COVER") {
          if (!latestByPurpose.has(media.purpose)) {
            latestByPurpose.set(media.purpose, `/api/media/${media.id}`);
          }
        }
      }
      if (latestByPurpose.has("STUDIO_LOGO")) {
        studio.logo = latestByPurpose.get("STUDIO_LOGO") || studio.logo;
      }
      if (latestByPurpose.has("STUDIO_COVER")) {
        studio.coverImage = latestByPurpose.get("STUDIO_COVER") || studio.coverImage;
      }
    }
  }
  // Get collections
  get users() {
    return this.data.users;
  }
  get customers() {
    return this.data.customers || [];
  }
  // Separate customers table
  get studios() {
    return this.data.studios;
  }
  get categories() {
    return this.data.categories;
  }
  get services() {
    return this.data.services;
  }
  get packages() {
    return this.data.packages;
  }
  get addons() {
    return this.data.addons;
  }
  get bookings() {
    return this.data.bookings;
  }
  get payments() {
    return this.data.payments;
  }
  get printProducts() {
    return this.data.printProducts;
  }
  get printOrders() {
    return this.data.printOrders;
  }
  get reviews() {
    return this.data.reviews;
  }
  get faqs() {
    return this.data.faqs;
  }
  get auditLogs() {
    return this.data.auditLogs;
  }
  get notifications() {
    return this.data.notifications;
  }
  get favorites() {
    return this.data.favorites;
  }
  get photoProofings() {
    return this.data.photoProofings || [];
  }
  get cmsSettings() {
    return this.data.cmsSettings || [];
  }
  get customPages() {
    return this.data.customPages || [];
  }
  get systemSettings() {
    return this.data.systemSettings || defaultSchema.systemSettings;
  }
  get mediaFiles() {
    return this.data.mediaFiles || [];
  }
  get availabilities() {
    return this.data.availabilities || [];
  }
  get blackouts() {
    return this.data.blackouts || [];
  }
  updateSystemSettings(settings) {
    this.data.systemSettings = { ...this.data.systemSettings, ...settings };
    this.save();
  }
  // Ensure relational data integrity (e.g. all studio ownerIds have corresponding user records)
  ensureIntegrity() {
    for (const studio of this.data.studios) {
      if (!this.data.users.some((u) => u.id === studio.ownerId)) {
        const ownerUser = {
          id: studio.ownerId,
          email: studio.email || `${studio.ownerId}@caintastudios.com`,
          passwordHash: "$2b$10$KWzQUkhlejbbjajhZZSS3ONo1.Onq8MCGV6FDtQ1vWrH9TsHW7D6G",
          fullName: `${studio.name} Admin`,
          role: studio.ownerId === "u-superadmin" ? "SUPER_ADMIN" /* SUPER_ADMIN */ : "STUDIO_ADMIN" /* STUDIO_ADMIN */,
          studioId: studio.id,
          contactNumber: studio.contactInfo,
          address: studio.address,
          createdAt: studio.createdAt || (/* @__PURE__ */ new Date()).toISOString()
        };
        this.data.users.push(ownerUser);
      }
    }
  }
  // Generic write helpers (Saves to memory buffers instantly, then persists to MySQL & local file)
  addUser(user) {
    this.users.push(user);
    this.save();
  }
  addCustomer(customer) {
    if (!this.data.customers) this.data.customers = [];
    this.data.customers.push(customer);
    this.save();
  }
  addCMSSetting(setting) {
    this.cmsSettings.push(setting);
    this.save();
  }
  addStudio(studio) {
    this.studios.push(studio);
    this.ensureIntegrity();
    this.save();
  }
  addCategory(category) {
    this.categories.push(category);
    this.save();
  }
  addService(service) {
    this.services.push(service);
    this.save();
  }
  addPackage(pkg) {
    this.packages.push(pkg);
    this.save();
  }
  addAddon(addon) {
    this.addons.push(addon);
    this.save();
  }
  addBooking(booking) {
    this.bookings.push(booking);
    this.save();
  }
  addPayment(payment) {
    this.payments.push(payment);
    this.save();
  }
  addPrintProduct(product) {
    this.printProducts.push(product);
    this.save();
  }
  addPrintOrder(order) {
    this.printOrders.push(order);
    this.save();
  }
  addReview(review) {
    this.reviews.push(review);
    this.save();
  }
  addFAQ(faq) {
    this.faqs.push(faq);
    this.save();
  }
  addAuditLog(log) {
    this.auditLogs.unshift(log);
    this.save();
  }
  addNotification(notification) {
    this.notifications.unshift(notification);
    this.save();
  }
  addFavorite(fav) {
    this.favorites.push(fav);
    this.save();
  }
  addPhotoProofing(proofing) {
    this.photoProofings.push(proofing);
    this.save();
  }
  addMediaFile(media) {
    if (!this.data.mediaFiles) this.data.mediaFiles = [];
    this.data.mediaFiles.push(media);
    this.save();
  }
  // Generic parameterized MySQL Insert / Upsert
  async mysqlInsert(table, dbRow) {
    if (!this.isMySqlActive || !this.pool) return;
    try {
      if (table === "studios" && dbRow.owner_id) {
        const [existingUser] = await this.pool.query("SELECT id FROM users WHERE id = ?", [dbRow.owner_id]);
        if (!existingUser || existingUser.length === 0) {
          const ownerUser = this.users.find((u) => u.id === dbRow.owner_id) || {
            id: dbRow.owner_id,
            email: dbRow.email || `${dbRow.owner_id}@caintastudios.com`,
            passwordHash: "$2b$10$KWzQUkhlejbbjajhZZSS3ONo1.Onq8MCGV6FDtQ1vWrH9TsHW7D6G",
            fullName: `${dbRow.name || "Studio"} Admin`,
            role: dbRow.owner_id === "u-superadmin" ? "SUPER_ADMIN" /* SUPER_ADMIN */ : "STUDIO_ADMIN" /* STUDIO_ADMIN */,
            studioId: dbRow.id,
            contactNumber: dbRow.contact_info,
            address: dbRow.address,
            createdAt: dbRow.created_at ? new Date(dbRow.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
          };
          await this.mysqlInsert("users", toDbUser(ownerUser));
        }
      }
      const keys = Object.keys(dbRow);
      const values = Object.values(dbRow);
      const placeholders = keys.map(() => "?").join(", ");
      const columns = keys.map((k) => `\`${k}\``).join(", ");
      const updateClauses = keys.filter((k) => k !== "id").map((k) => `\`${k}\` = VALUES(\`${k}\`)`).join(", ");
      const query = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClauses}`;
      await this.pool.query(query, values);
    } catch (err) {
      console.error(`[Database] MySQL insert failed on table '${table}':`, err);
    }
  }
  // Synchronizes changes made in memory to MySQL and local file storage
  save() {
    this.saveQueue = this.saveQueue.then(() => this.persist()).catch((err) => {
      console.error("[Database] Queued save failed:", err);
    });
    return this.saveQueue;
  }
  async persist() {
    this.ensureIntegrity();
    try {
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      console.error("[Database] Local file backup sync failed", error);
    }
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
      await this.syncTable("studio_availability", this.availabilities.map(toDbAvailability));
      await this.syncTable("availability_blackouts", this.blackouts.map(toDbBlackout));
    } catch (err) {
      console.error("[Database] Synchronize MySQL update failed:", err);
    }
  }
  // Synchronizes a full table to MySQL
  async syncTable(table, dbRows) {
    if (!this.pool) return;
    try {
      const tableCheck = await this.pool.query(`SHOW TABLES LIKE ?`, [table]);
      if (!Array.isArray(tableCheck[0]) || tableCheck[0].length === 0) {
        return;
      }
      const activeIds = dbRows.map((r) => r.id);
      if (activeIds.length > 0) {
        const idPlaceholders = activeIds.map(() => "?").join(",");
        await this.pool.query(`DELETE FROM \`${table}\` WHERE id NOT IN (${idPlaceholders})`, activeIds);
      } else {
        await this.pool.query(`DELETE FROM \`${table}\``);
      }
      for (const row of dbRows) {
        const keys = Object.keys(row);
        const values = Object.values(row);
        const columns = keys.map((k) => `\`${k}\``).join(", ");
        const placeholders = keys.map(() => "?").join(", ");
        const updateClauses = keys.filter((k) => k !== "id").map((k) => `\`${k}\` = VALUES(\`${k}\`)`).join(", ");
        const query = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClauses}`;
        await this.pool.query(query, values);
      }
    } catch (tableErr) {
      console.error(`[Database] syncTable failed for '${table}':`, tableErr);
    }
  }
  // Reads all tables from MySQL to populate the memory state
  async loadFromMySql() {
    if (!this.pool) return;
    console.log("[Database] Hydrating memory from MySQL tables...");
    try {
      const [usersRes] = await this.pool.query("SELECT * FROM users");
      const [customersRes] = await this.pool.query("SELECT * FROM customers");
      const [studiosRes] = await this.pool.query("SELECT * FROM studios");
      const [categoriesRes] = await this.pool.query("SELECT * FROM categories");
      const [servicesRes] = await this.pool.query("SELECT * FROM services");
      const [packagesRes] = await this.pool.query("SELECT * FROM packages");
      const [addonsRes] = await this.pool.query("SELECT * FROM addons");
      const [bookingsRes] = await this.pool.query("SELECT * FROM bookings");
      const [paymentsRes] = await this.pool.query("SELECT * FROM payments");
      const [printsRes] = await this.pool.query("SELECT * FROM print_products");
      const [printOrdersRes] = await this.pool.query("SELECT * FROM print_orders");
      const [reviewsRes] = await this.pool.query("SELECT * FROM reviews");
      const [faqsRes] = await this.pool.query("SELECT * FROM faqs");
      const [logsRes] = await this.pool.query("SELECT * FROM audit_logs ORDER BY timestamp DESC");
      const [notificationsRes] = await this.pool.query("SELECT * FROM notifications ORDER BY created_at DESC");
      const [favoritesRes] = await this.pool.query("SELECT * FROM favorites");
      const [proofingsRes] = await this.pool.query("SELECT * FROM photo_proofings");
      let availabilityRes = [];
      try {
        const [availability] = await this.pool.query("SELECT * FROM studio_availability");
        availabilityRes = availability;
      } catch (e) {
      }
      let blackoutRes = [];
      try {
        const [blackouts] = await this.pool.query("SELECT * FROM availability_blackouts");
        blackoutRes = blackouts;
      } catch (e) {
      }
      let mediaFilesRes = [];
      try {
        const [media] = await this.pool.query("SELECT * FROM media_files");
        mediaFilesRes = media;
      } catch (e) {
      }
      let cmsRes = [];
      try {
        const [cms] = await this.pool.query("SELECT * FROM cms_settings");
        cmsRes = cms;
      } catch (e) {
      }
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
      this.data.availabilities = availabilityRes.map(fromDbAvailability);
      this.data.blackouts = blackoutRes.map(fromDbBlackout);
      this.data.cmsSettings = cmsRes.map(fromDbCMS);
      this.data.mediaFiles = mediaFilesRes.map(fromDbMediaFile);
      this.reconcileStudioBrandingMedia();
      this.ensureIntegrity();
      console.log(`[Database] Hydration complete! Loaded users: ${this.data.users.length}, customers: ${this.data.customers.length}, studios: ${this.data.studios.length}, bookings: ${this.data.bookings.length}`);
    } catch (err) {
      console.error("[Database] Hydration from MySQL failed:", err);
      this.loadLocalBackup();
    }
  }
  // Schema bootstrapper to ensure tables and auxiliary columns exist
  async bootstrapDatabaseSchema() {
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
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS photo_proofings (
          id VARCHAR(50) PRIMARY KEY,
          booking_id VARCHAR(50) NOT NULL,
          studio_id VARCHAR(50) NOT NULL,
          customer_id VARCHAR(50) NOT NULL,
          photos JSON NULL,
          watermark_text VARCHAR(255) NOT NULL DEFAULT 'PROOF - CAINTA STUDIO',
          watermark_position VARCHAR(50) NOT NULL DEFAULT 'repeat_diagonal',
          watermark_opacity DECIMAL(4,2) NOT NULL DEFAULT 0.35,
          final_drive_link TEXT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX photo_proofings_booking_idx (booking_id),
          INDEX photo_proofings_customer_idx (customer_id),
          INDEX photo_proofings_studio_idx (studio_id)
        );
      `);
      try {
        await this.pool.query(`ALTER TABLE media_files ADD COLUMN purpose VARCHAR(50) NOT NULL DEFAULT 'LEGACY';`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE studios ADD COLUMN blocked_dates TEXT NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE studios ADD COLUMN business_permit TEXT NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE studios ADD COLUMN valid_id LONGTEXT NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE studios ADD COLUMN other_docs TEXT NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE studios ADD COLUMN registered_by_admin BOOLEAN DEFAULT FALSE;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE addons ADD COLUMN image VARCHAR(255) NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE reviews ADD COLUMN status VARCHAR(50) DEFAULT 'approved';`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE reviews ADD COLUMN reply TEXT NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE reviews ADD COLUMN reply_at TIMESTAMP NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE bookings ADD COLUMN payment_option VARCHAR(50) DEFAULT 'Downpayment';`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE bookings MODIFY COLUMN package_id VARCHAR(50) NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS gcash_qr_sessions (
            id VARCHAR(50) PRIMARY KEY,
            payment_id VARCHAR(50) NULL,
            booking_id VARCHAR(50) NULL,
            print_order_id VARCHAR(50) NULL,
            studio_id VARCHAR(50) NOT NULL,
            customer_id VARCHAR(50) NOT NULL,
            gateway VARCHAR(20) NOT NULL DEFAULT 'paymongo',
            gateway_payment_intent_id VARCHAR(255) NULL,
            gateway_source_id VARCHAR(255) NULL,
            gateway_checkout_url TEXT NULL,
            qr_code_data LONGTEXT NULL,
            amount DECIMAL(10,2) NOT NULL,
            payment_type VARCHAR(30) NOT NULL DEFAULT 'Downpayment',
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            expires_at TIMESTAMP NOT NULL,
            webhook_event_id VARCHAR(255) NULL,
            paid_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_gqr_booking (booking_id),
            INDEX idx_gqr_customer (customer_id),
            INDEX idx_gqr_intent (gateway_payment_intent_id),
            INDEX idx_gqr_status (status)
          );
        `);
      } catch (e) {
      }
      try {
        await this.pool.query(`
          ALTER TABLE gcash_qr_sessions
          MODIFY COLUMN expires_at TIMESTAMP NOT NULL
        `);
      } catch (e) {
      }
      try {
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS webhook_events (
            event_id VARCHAR(255) PRIMARY KEY,
            gateway VARCHAR(20) NOT NULL,
            event_type VARCHAR(100) NOT NULL,
            payment_id VARCHAR(50) NULL,
            session_id VARCHAR(50) NULL,
            raw_payload MEDIUMTEXT NULL,
            processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_whe_payment (payment_id),
            INDEX idx_whe_processed (processed_at)
          );
        `);
      } catch (e) {
      }
      try {
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS studio_payment_credentials (
            id VARCHAR(50) PRIMARY KEY,
            studio_id VARCHAR(50) NOT NULL,
            gateway VARCHAR(20) NOT NULL DEFAULT 'paymongo',
            gateway_sub_account_id VARCHAR(255) NULL,
            public_key_encrypted TEXT NULL,
            secret_key_encrypted TEXT NULL,
            webhook_secret_encrypted TEXT NULL,
            gcash_merchant_name VARCHAR(100) NULL,
            gcash_number VARCHAR(20) NULL,
            is_live_mode TINYINT(1) NOT NULL DEFAULT 0,
            is_enabled TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_studio_gateway (studio_id, gateway)
          );
        `);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE payments ADD COLUMN gcash_session_id VARCHAR(50) NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE payments ADD COLUMN gateway_transaction_id VARCHAR(255) NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE payments ADD COLUMN fraud_score INT NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE payments ADD COLUMN payment_channel VARCHAR(50) NOT NULL DEFAULT 'manual_upload';`);
      } catch (e) {
      }
      try {
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS studio_availability (
            id VARCHAR(50) PRIMARY KEY,
            studio_id VARCHAR(50) NOT NULL,
            day_of_week INT NOT NULL,
            opening_time VARCHAR(20) NOT NULL,
            closing_time VARCHAR(20) NOT NULL,
            is_available TINYINT(1) NOT NULL DEFAULT 1,
            slot_duration_minutes INT NOT NULL DEFAULT 60,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_studio_availability_studio (studio_id)
          );
        `);
      } catch (e) {
      }
      try {
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS availability_blackouts (
            id VARCHAR(50) PRIMARY KEY,
            studio_id VARCHAR(50) NOT NULL,
            blackout_date DATE NOT NULL,
            start_time VARCHAR(20) NULL,
            end_time VARCHAR(20) NULL,
            reason VARCHAR(255) NOT NULL DEFAULT 'Studio closure',
            is_recurring TINYINT(1) NOT NULL DEFAULT 0,
            recurrence_rule VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_availability_blackouts_studio (studio_id)
          );
        `);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE print_orders ADD COLUMN gcash_session_id VARCHAR(50) NULL;`);
      } catch (e) {
      }
      try {
        await this.pool.query(`ALTER TABLE print_orders ADD COLUMN gateway_transaction_id VARCHAR(255) NULL;`);
      } catch (e) {
      }
    } catch (err) {
      console.error("[Database] MySQL schema verification notice:", err);
    }
  }
};
var db = new RelationalDatabase();

// ../src/utils/pdfGenerator.ts
var import_jspdf = require("jspdf");
function buildBookingReceiptPDF(booking, studio, payment) {
  const doc = new import_jspdf.jsPDF({
    unit: "mm",
    format: "a4"
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(studio?.name || "CAINTA PHOTOGRAPHY STUDIO", 14, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Official Booking Confirmation & Acknowledgement Receipt", 14, 18);
  doc.text("Cainta Studio Management Information System (MIS)", 14, 23);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth - 55, 8, 42, 12, 2, 2, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`STATUS: ${booking.status.toUpperCase()}`, pageWidth - 52, 15);
  let y = 38;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("BOOKING DETAILS", 14, y);
  doc.text("CUSTOMER DETAILS", 110, y);
  y += 5;
  doc.setLineWidth(0.3);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.text(`Booking Reference:`, 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(booking.id, 50, y);
  doc.setFont("helvetica", "bold");
  doc.text(`Customer Name:`, 110, y);
  doc.setFont("helvetica", "normal");
  doc.text(booking.customerDetails.fullName, 145, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`Shoot Date:`, 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(booking.bookingDate, 50, y);
  doc.setFont("helvetica", "bold");
  doc.text(`Email Address:`, 110, y);
  doc.setFont("helvetica", "normal");
  doc.text(booking.customerDetails.email, 145, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`Time Slot:`, 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(booking.timeSlot, 50, y);
  doc.setFont("helvetica", "bold");
  doc.text(`Contact Number:`, 110, y);
  doc.setFont("helvetica", "normal");
  doc.text(booking.customerDetails.phone || "N/A", 145, y);
  y += 6;
  const leftAddressWidth = 42;
  const rightStatusWidth = 25;
  doc.setFont("helvetica", "bold");
  doc.text(`Studio Location:`, 14, y);
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(studio?.address || "Cainta, Rizal", leftAddressWidth);
  doc.text(addressLines, 50, y);
  doc.setFont("helvetica", "bold");
  doc.text(`Payment Status:`, 105, y);
  doc.setFont("helvetica", "normal");
  const paymentStatusLines = doc.splitTextToSize(booking.paymentStatus, rightStatusWidth);
  doc.text(paymentStatusLines, 128, y, { maxWidth: rightStatusWidth });
  const rightColumnOffset = Math.max(addressLines.length, paymentStatusLines.length) * 4.2;
  y += Math.max(6, rightColumnOffset + 2);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, pageWidth - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text("Description / Package Item", 18, y + 5.5);
  doc.text("Qty", 130, y + 5.5);
  doc.text("Amount (PHP)", pageWidth - 45, y + 5.5);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text("Photography Shoot Package", 18, y);
  doc.text("1", 132, y);
  doc.text(`PHP ${(booking.totalAmount - (booking.addons?.reduce((acc, a) => acc + a.price * a.quantity, 0) || 0)).toLocaleString()}`, pageWidth - 45, y);
  y += 7;
  if (booking.addons && booking.addons.length > 0) {
    booking.addons.forEach((addon, i) => {
      doc.text(`Addon Service #${i + 1}`, 18, y);
      doc.text(String(addon.quantity), 132, y);
      doc.text(`PHP ${(addon.price * addon.quantity).toLocaleString()}`, pageWidth - 45, y);
      y += 7;
    });
  }
  doc.setLineWidth(0.3);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;
  const rightXLabel = 118;
  const rightXVal = pageWidth - 14;
  doc.setFont("helvetica", "bold");
  doc.text("Total Package Price:", rightXLabel, y);
  doc.text(`PHP ${booking.totalAmount.toLocaleString()}`, rightXVal, y, { align: "right" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text("Amount Paid / Downpayment:", rightXLabel, y);
  doc.text(`PHP ${(booking.amountPaid || 0).toLocaleString()}`, rightXVal, y, { align: "right" });
  y += 6;
  const remainingBalance = Math.max(0, booking.totalAmount - (booking.amountPaid || 0));
  doc.setFont("helvetica", "bold");
  doc.setTextColor(remainingBalance > 0 ? 180 : 22, remainingBalance > 0 ? 83 : 101, remainingBalance > 0 ? 9 : 52);
  doc.text("Remaining Balance:", rightXLabel, y);
  doc.text(`PHP ${remainingBalance.toLocaleString()}`, rightXVal, y, { align: "right" });
  y += 12;
  if (payment?.referenceNumber) {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, "F");
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT VERIFICATION RECORD", 18, y + 5);
    doc.setFont("helvetica", "normal");
    doc.text(`Method: ${payment.paymentMethod} | Reference No: ${payment.referenceNumber} | Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 18, y + 10);
    y += 20;
  }
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Terms & Conditions:", 14, y);
  y += 4;
  doc.text("1. Please arrive at least 10 minutes prior to your scheduled time slot.", 14, y);
  y += 4;
  doc.text("2. Rescheduling is permitted at least 48 hours prior to the photoshoot date.", 14, y);
  y += 4;
  doc.text("3. Remaining balance shall be settled on the day of the photoshoot at the studio counter.", 14, y);
  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("CAINTA PHOTOGRAPHY STUDIO MIS - OFFICIAL DIGITAL RECEIPT", pageWidth / 2, y, { align: "center" });
  return doc;
}
function buildPrintOrderReceiptPDF(order, studio, product) {
  const doc = new import_jspdf.jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CUSTOM PRINT ORDER RECEIPT", 14, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(studio?.name || "Cainta Photography Studio", 14, 23);
  doc.text(`Order ID: ${order.id}`, pageWidth - 46, 23, { align: "right" });
  let y = 40;
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text("ORDER INFORMATION", 14, y);
  y += 6;
  doc.setLineWidth(0.3);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Studio:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(studio?.name || "N/A", 48, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Product:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(product?.name || "Custom Print", 48, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Size:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(product?.size || "N/A", 48, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Quantity:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(order.quantity), 48, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Order Status:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(order.status, 48, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Payment Status:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(order.paymentStatus, 48, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Payment Method:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(order.paymentMethod, 48, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Reference No:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(order.referenceNumber || "N/A", 48, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Order Date:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(order.createdAt).toLocaleString(), 48, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Shipping / Pickup:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(order.shippingAddress || "Studio pickup", 48, y);
  y += 16;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, pageWidth - 28, 24, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL AMOUNT", 18, y + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(`PHP ${order.totalAmount.toLocaleString()}`, pageWidth - 18, y + 8, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Paid via ${order.paymentMethod} \u2022 ${order.paymentStatus}`, 18, y + 18);
  y += 36;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text("Thank you for ordering with Cainta Photography Studio. Your artwork will be processed and updated in the order tracker.", 14, y, { maxWidth: pageWidth - 28 });
  return doc;
}

// ../server.ts
import_dotenv2.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
var SESSION_TTL_MS = 8 * 60 * 60 * 1e3;
var authSessions = /* @__PURE__ */ new Map();
var passwordResetTokens = /* @__PURE__ */ new Map();
var passwordResetOtps = /* @__PURE__ */ new Map();
var emailVerificationTokens = /* @__PURE__ */ new Map();
var loginAttempts = /* @__PURE__ */ new Map();
var isServerless2 = !!(process.env.VERCEL || process.env.FUNCTION_TARGET || process.env.K_SERVICE || process.env.FIREBASE_CONFIG);
var MEDIA_ROOT = isServerless2 ? import_path2.default.join(import_os2.default.tmpdir(), "protected-media") : import_path2.default.join(process.cwd(), "protected-media");
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : "";
async function verifyGoogleIdToken(credential) {
  if (!credential || !credential.includes(".")) {
    throw new Error("Invalid Google credential format.");
  }
  const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
  const response = await fetch(tokenInfoUrl);
  if (!response.ok) {
    throw new Error("Google identity token could not be verified.");
  }
  const payload = await response.json();
  if (!payload?.email || !payload?.sub || !payload?.name) {
    throw new Error("Google identity payload is incomplete.");
  }
  if (GOOGLE_CLIENT_ID && payload.aud && payload.aud !== GOOGLE_CLIENT_ID) {
    throw new Error("Google client configuration mismatch.");
  }
  if (!["accounts.google.com", "https://accounts.google.com"].includes(payload.iss || "")) {
    throw new Error("Google token issuer mismatch.");
  }
  return {
    email: String(payload.email).trim().toLowerCase(),
    fullName: String(payload.name || payload.email.split("@")[0]).trim(),
    googleId: String(payload.sub),
    picture: String(payload.picture || "")
  };
}
var faqSuggestionStore = /* @__PURE__ */ new Map();
function normalizeFaqQuestion(question) {
  return question.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}
function looksLikeQuestion(question) {
  const normalized = question.trim().toLowerCase();
  return normalized.includes("?") || /\b(what|where|when|why|how|who|can|could|is|are|do|does|which|will|should|booking|book|price|payment|cost|studio)\b/.test(normalized);
}
function rememberFaqSuggestion(question, answer, studioId) {
  if (!question || !answer) return;
  if (!looksLikeQuestion(question)) return;
  const normalized = normalizeFaqQuestion(question);
  if (!normalized) return;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = faqSuggestionStore.get(normalized);
  if (existing) {
    existing.answer = answer;
    existing.frequency += 1;
    existing.lastSeenAt = now;
    existing.studioId = existing.studioId || studioId || "GLOBAL";
    return;
  }
  if (faqSuggestionStore.size > 500) {
    const oldestKey = Array.from(faqSuggestionStore.keys()).sort((a, b) => {
      const aa = faqSuggestionStore.get(a);
      const bb = faqSuggestionStore.get(b);
      return new Date(aa.lastSeenAt).getTime() - new Date(bb.lastSeenAt).getTime();
    })[0];
    if (oldestKey) faqSuggestionStore.delete(oldestKey);
  }
  faqSuggestionStore.set(normalized, {
    id: generateId("SUG"),
    question: question.trim(),
    answer: answer.trim(),
    studioId: studioId || "GLOBAL",
    category: "Suggested",
    frequency: 1,
    createdAt: now,
    lastSeenAt: now,
    source: "chatbot"
  });
}
var sseClients = /* @__PURE__ */ new Map();
function broadcastSSE(userId, data) {
  const clients = sseClients.get(userId);
  if (!clients || clients.size === 0) return;
  const payload = `data: ${JSON.stringify(data)}

`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}
function checkLoginRateLimit(key) {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (attempt && attempt.lockedUntil > now) {
    const waitMinutes = Math.ceil((attempt.lockedUntil - now) / 6e4);
    return { allowed: false, waitMinutes };
  }
  return { allowed: true };
}
function recordLoginFailure(key) {
  const now = Date.now();
  const attempt = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  attempt.count += 1;
  const failureCount = attempt.count;
  if (attempt.count >= 5) {
    attempt.lockedUntil = now + 15 * 60 * 1e3;
    attempt.count = 0;
  }
  loginAttempts.set(key, attempt);
  return failureCount;
}
function clearLoginAttempts(key) {
  loginAttempts.delete(key);
}
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
app.use((req, res, next) => {
  const configuredOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:3000").split(",").map((origin) => origin.trim()).filter(Boolean);
  const requestOrigin = req.header("Origin");
  const isOriginAllowed = !requestOrigin || configuredOrigins.includes("*") || configuredOrigins.includes(requestOrigin) || configuredOrigins.some((pattern) => pattern.startsWith("*.") && requestOrigin.endsWith(pattern.slice(1))) || process.env.NODE_ENV !== "production" && requestOrigin.startsWith("http://localhost");
  if (requestOrigin && isOriginAllowed) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Vary", "Origin");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("Referrer-Policy", "same-origin");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.post("/api/webhooks/paymongo", import_express.default.raw({ type: "application/json" }), async (req, res) => {
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET || "";
  const signatureHeader = req.headers["paymongo-signature"] || "";
  if (!webhookSecret || !signatureHeader) {
    console.warn("[GCash Webhook] Rejected: missing signature or webhook secret not configured.");
    return res.status(400).json({ error: "Missing signature" });
  }
  const rawBody = req.body;
  const expectedSig = import_crypto.default.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  let sigValid = false;
  try {
    sigValid = import_crypto.default.timingSafeEqual(
      Buffer.from(expectedSig, "hex"),
      Buffer.from(signatureHeader.padEnd(expectedSig.length, "0"), "hex")
    );
  } catch {
    sigValid = false;
  }
  if (!sigValid) {
    console.warn("[GCash Webhook] REJECTED \u2014 invalid HMAC signature. Possible spoofed request.");
    return res.status(401).json({ error: "Invalid signature" });
  }
  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  const eventId = event?.data?.id || event?.id || "";
  if (!eventId) {
    console.warn("[GCash Webhook] Missing event ID \u2014 rejecting.");
    return res.status(400).json({ error: "Missing event ID" });
  }
  res.status(200).json({ received: true });
  setImmediate(async () => {
    try {
      const [existing] = await db.pool.execute(
        "SELECT event_id FROM webhook_events WHERE event_id = ?",
        [eventId]
      );
      if (existing.length > 0) {
        console.log(`[GCash Webhook] Skipped \u2014 event ${eventId} already processed.`);
        return;
      }
      const eventType = event?.data?.attributes?.type || event?.type || "unknown";
      const paymentIntentId = event?.data?.attributes?.data?.attributes?.payment_intent_id || event?.data?.attributes?.payment_intent_id || event?.data?.attributes?.data?.id || "";
      const gatewayAmount = event?.data?.attributes?.data?.attributes?.amount || event?.data?.attributes?.amount || 0;
      const gatewayAmountPHP = gatewayAmount / 100;
      console.log(`[GCash Webhook] Processing event: ${eventType} (${eventId}), intent: ${paymentIntentId}`);
      if (eventType === "payment.paid" || eventType === "source.chargeable") {
        const [sessions] = await db.pool.execute(
          "SELECT * FROM gcash_qr_sessions WHERE gateway_payment_intent_id = ? AND status = 'pending' LIMIT 1",
          [paymentIntentId]
        );
        const sessionRows = sessions;
        if (sessionRows.length === 0) {
          console.warn(`[GCash Webhook] No pending session found for intent: ${paymentIntentId}`);
          await db.pool.execute(
            "INSERT INTO webhook_events (event_id, gateway, event_type, raw_payload) VALUES (?, 'paymongo', ?, ?)",
            [eventId, eventType, JSON.stringify(event).substring(0, 65535)]
          );
          return;
        }
        const session = sessionRows[0];
        if (Math.abs(gatewayAmountPHP - Number(session.amount)) > 0.01) {
          console.error(
            `[GCash FRAUD ALERT] Amount mismatch! Gateway: \u20B1${gatewayAmountPHP}, Session: \u20B1${session.amount}, Session: ${session.id}`
          );
          await db.pool.execute(
            "UPDATE gcash_qr_sessions SET status = 'failed', webhook_event_id = ? WHERE id = ?",
            [eventId, session.id]
          );
          await db.pool.execute(
            "INSERT INTO webhook_events (event_id, gateway, event_type, session_id, raw_payload) VALUES (?, 'paymongo', 'FRAUD_AMOUNT_MISMATCH', ?, ?)",
            [eventId, session.id, JSON.stringify(event).substring(0, 65535)]
          );
          if (session.payment_id) {
            await db.pool.execute(
              "UPDATE payments SET fraud_score = -1 WHERE id = ?",
              [session.payment_id]
            );
          }
          return;
        }
        const paidAt = (/* @__PURE__ */ new Date()).toISOString();
        const gatewayTransactionId = event?.data?.attributes?.data?.id || event?.data?.attributes?.payment_intent_id || eventId;
        const fraudScore = event?.data?.attributes?.data?.attributes?.risk_score ?? null;
        await db.pool.execute(
          "UPDATE gcash_qr_sessions SET status = 'paid', paid_at = ?, webhook_event_id = ? WHERE id = ?",
          [paidAt, eventId, session.id]
        );
        let paymentId = session.payment_id;
        if (session.booking_id && !paymentId) {
          paymentId = `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          await db.pool.execute(
            `INSERT INTO payments
              (id, gcash_session_id, booking_id, studio_id, customer_id, amount, payment_type,
               payment_method, payment_status, reference_number, gateway_transaction_id,
               fraud_score, payment_channel, payment_date, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'GCash', 'Pending Verification', ?, ?, ?, 'gcash_qr', NOW(), NOW())`,
            [
              paymentId,
              session.id,
              session.booking_id,
              session.studio_id,
              session.customer_id,
              session.amount,
              session.payment_type,
              gatewayTransactionId,
              gatewayTransactionId,
              fraudScore
            ]
          );
          await db.pool.execute(
            "UPDATE gcash_qr_sessions SET payment_id = ? WHERE id = ?",
            [paymentId, session.id]
          );
        } else if (session.booking_id) {
          await db.pool.execute(
            `UPDATE payments SET payment_status = 'Pending Verification', gateway_transaction_id = ?,
              fraud_score = ?, payment_channel = 'gcash_qr' WHERE id = ?`,
            [gatewayTransactionId, fraudScore, paymentId]
          );
        } else if (session.print_order_id) {
          await db.pool.execute(
            `UPDATE print_orders SET payment_status = 'Pending Verification',
              reference_number = COALESCE(?, reference_number),
              gateway_transaction_id = ? WHERE id = ?`,
            [gatewayTransactionId, gatewayTransactionId, session.print_order_id]
          );
          const printOrderIndex = db.printOrders.findIndex((order) => order.id === session.print_order_id);
          if (printOrderIndex !== -1) {
            db.printOrders[printOrderIndex] = {
              ...db.printOrders[printOrderIndex],
              paymentStatus: "Pending Verification",
              referenceNumber: gatewayTransactionId
            };
          }
        }
        if (session.booking_id) {
          const bookingRow = db.bookings.find((b) => b.id === session.booking_id);
          if (bookingRow) {
            const [rows] = await db.pool.execute(
              "SELECT * FROM payments WHERE booking_id = ?",
              [session.booking_id]
            );
            const allPayments = rows;
            const verifiedTotal = allPayments.filter((p) => p.payment_status === "Paid").reduce((s, p) => s + Number(p.amount), 0);
            const newAmountPaid = Math.min(bookingRow.totalAmount, verifiedTotal);
            const newBalance = Math.max(0, bookingRow.totalAmount - newAmountPaid);
            const newPaymentStatus = newBalance === 0 ? "Paid" : newAmountPaid >= bookingRow.downPaymentAmount ? "Partially Paid" : "Unpaid";
            const newBookingStatus = newBalance === 0 || newAmountPaid >= bookingRow.downPaymentAmount ? "Confirmed" : bookingRow.status;
            await db.pool.execute(
              `UPDATE bookings SET amount_paid = ?, remaining_balance = ?, payment_status = ?,
                final_payment_status = ?, status = ? WHERE id = ?`,
              [
                newAmountPaid,
                newBalance,
                newPaymentStatus,
                newBalance === 0 ? "Paid" : "Pending",
                newBookingStatus,
                session.booking_id
              ]
            );
            const idx = db.bookings.findIndex((b) => b.id === session.booking_id);
            if (idx !== -1) {
              db.bookings[idx] = {
                ...db.bookings[idx],
                amountPaid: newAmountPaid,
                remainingBalance: newBalance,
                paymentStatus: newPaymentStatus,
                finalPaymentStatus: newBalance === 0 ? "Paid" : "Pending",
                status: newBookingStatus
              };
            }
            const booking = db.bookings.find((b) => b.id === session.booking_id);
            const studio = db.studios.find((s) => s.id === session.studio_id);
            const studioName = studio?.name || "Studio";
            const typeLabel = session.payment_type === "Downpayment" ? "Downpayment" : "Final Payment";
            notifyUser(
              session.customer_id,
              `GCash Payment Confirmed \u2014 ${typeLabel}`,
              `Your GCash payment of \u20B1${Number(session.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })} for ${studioName} has been confirmed instantly via QR Ph. Booking: ${session.booking_id}.`,
              "success",
              session.studio_id
            );
            notifyUser(
              db.users.find((u) => u.studioId === session.studio_id)?.id || "",
              `GCash Payment Received \u2014 ${typeLabel}`,
              `\u20B1${Number(session.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })} GCash QR payment received for Booking ${session.booking_id}. ${session.payment_type === "Downpayment" ? "Booking confirmed." : "Fully paid."}`,
              "success",
              session.studio_id
            );
            const customer = db.customers.find((c) => c.id === session.customer_id);
            if (customer?.email) {
              sendEmailNotification(
                customer.email,
                `GCash Payment Confirmed \u2014 ${typeLabel}`,
                `Your GCash QR payment of \u20B1${Number(session.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })} for your booking at ${studioName} has been confirmed automatically. No receipt upload needed!

Booking ID: ${session.booking_id}
Payment ID: ${paymentId}
Gateway Ref: ${gatewayTransactionId}`,
                "success"
              );
            }
          }
        }
        await db.pool.execute(
          "INSERT INTO webhook_events (event_id, gateway, event_type, payment_id, session_id, raw_payload) VALUES (?, 'paymongo', ?, ?, ?, ?)",
          [eventId, eventType, paymentId, session.id, JSON.stringify(event).substring(0, 65535)]
        );
        broadcastSSE(session.customer_id, {
          type: "GCASH_PAYMENT_CONFIRMED",
          sessionId: session.id,
          paymentId,
          bookingId: session.booking_id,
          amount: session.amount,
          paidAt
        });
        console.log(`[GCash Webhook] \u2705 Payment confirmed: ${paymentId} for session ${session.id}`);
      }
    } catch (err) {
      console.error("[GCash Webhook] Processing error:", err?.message || err);
    }
  });
});
app.use(import_express.default.json({ limit: "12mb" }));
app.use((err, _req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "The file is too large. Please select a file that is 8 MB or smaller." });
  }
  next(err);
});
app.use((req, res, next) => {
  if (!req.path.startsWith("/api/")) return next();
  const publicApi = [
    /^\/api\/auth\/(login|register|forgot-password|verify-reset-otp|reset-password|verify-email|google)$/,
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
    /^\/api\/print-products\/?$/,
    /^\/api\/system\/audio\/?$/,
    /^\/api\/system\/demo-video\/?$/,
    /^\/api\/chatbot\/faqs\/?$/,
    /^\/api\/chatbot\/message\/?$/,
    // GCash webhook is public (auth via HMAC signature, not session token)
    /^\/api\/webhooks\/paymongo$/
  ];
  const isPublicRead = req.method === "GET" && publicApi.some((pattern) => pattern.test(req.path));
  const isPublicChatbotMessage = req.method === "POST" && /^\/api\/chatbot\/message\/?$/.test(req.path);
  if (isPublicRead || publicApi.some((pattern) => pattern.test(req.path) && req.path.startsWith("/api/auth/")) || isPublicChatbotMessage) {
    return next();
  }
  if (!getAuthenticatedUser(req)) {
    return res.status(401).json({ success: false, message: "Authentication is required." });
  }
  next();
});
var smtpEmail = process.env.SMTP_EMAIL ? process.env.SMTP_EMAIL.trim() : "";
var smtpPassword = process.env.SMTP_APP_PASSWORD ? process.env.SMTP_APP_PASSWORD.trim().replace(/\s+/g, "") : "";
var mailTransporter = null;
if (smtpEmail && smtpPassword) {
  mailTransporter = import_nodemailer.default.createTransport({
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
async function sendEmailNotification(toEmail, title, message, type = "info", actionUrl, actionLabel, attachments) {
  if (!mailTransporter || !smtpEmail) {
    console.log(`[SMTP Simulated] Email to ${toEmail}: [${title}] ${message}`);
    return;
  }
  const typeConfig = {
    success: {
      badge: "VERIFIED UPDATE",
      badgeBg: "#ecfdf5",
      badgeColor: "#059669",
      accentGrad: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      icon: "\u2713"
    },
    warning: {
      badge: "ACTION REQUIRED",
      badgeBg: "#fffbeb",
      badgeColor: "#d97706",
      accentGrad: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      icon: "\u26A1"
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
      icon: "\u2726"
    }
  };
  const config = typeConfig[type] || typeConfig.info;
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const dateFormatted = (/* @__PURE__ */ new Date()).toLocaleDateString("en-PH", {
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
                      <span style="color: #f59e0b; font-size: 16px; margin-right: 6px;">\u{1F4F7}</span>
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
                    <a href="${actionUrl || "http://localhost:3000"}" style="display: inline-block; background-color: #1c1917; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.12);">
                      ${actionLabel || "Access Studio MIS Portal \u2192"}
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
      text: `${title}

${message}

Timestamp: ${dateFormatted}

-- Cainta Photography Studio MIS`,
      html: htmlContent,
      attachments: attachments?.map((item) => ({
        filename: item.filename,
        content: item.content,
        contentType: item.contentType || "application/octet-stream"
      }))
    });
    console.log(`[SMTP] Successfully delivered email notification to ${toEmail} for: "${title}"`);
  } catch (err) {
    console.error(`[SMTP] Failed to send email to ${toEmail}:`, err?.message || err);
  }
}
var generateId = (prefix) => `${prefix}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
function createAuthToken(userId) {
  const token = `${generateId("SESSION")}-${Math.random().toString(36).slice(2)}`;
  authSessions.set(token, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}
function getAuthenticatedUser(req) {
  const header = req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const session = token ? authSessions.get(token) : void 0;
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    authSessions.delete(token);
    return null;
  }
  const userId = session.userId;
  const user = db.users.find((item) => item.id === userId) || db.customers.find((customer) => customer.id === userId) || null;
  if (user && getStudioAccountStatus(user) !== null && getStudioAccountStatus(user) !== "approved") {
    authSessions.delete(token);
    return null;
  }
  return user;
}
function requireAuthenticatedUser(req, res) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ success: false, message: "Authentication is required." });
    return null;
  }
  return user;
}
function requireRole(req, res, ...roles) {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return null;
  if (!roles.includes(user.role)) {
    res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
    return null;
  }
  return user;
}
function getStudioAccountStatus(user) {
  if (user.role !== "STUDIO_ADMIN" /* STUDIO_ADMIN */) return null;
  const studio = db.studios.find((item) => item.id === user.studioId || item.ownerId === user.id);
  if (!studio) return "pending";
  if (studio.status === "suspended") return "suspended";
  if (studio.status === "rejected") return "rejected";
  return studio.isApproved || studio.status === "approved" ? "approved" : "pending";
}
function requireStudioAccess(req, res, studioId) {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return null;
  if (user.role === "SUPER_ADMIN" /* SUPER_ADMIN */) return user;
  const studioUser = "studioId" in user ? user : null;
  if (!studioUser || !["STUDIO_ADMIN" /* STUDIO_ADMIN */, "STUDIO_STAFF" /* STUDIO_STAFF */].includes(user.role) || studioUser.studioId !== studioId) {
    res.status(403).json({ success: false, message: "You do not have access to this studio." });
    return null;
  }
  return user;
}
function requireStudioOwner(req, res, studioId) {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return null;
  if (user.role !== "STUDIO_ADMIN" /* STUDIO_ADMIN */) {
    res.status(403).json({ success: false, message: "Only the studio owner can manage this studio's availability." });
    return null;
  }
  const studio = db.studios.find((item) => item.id === studioId);
  if (!studio || studio.ownerId !== user.id) {
    res.status(403).json({ success: false, message: "Only the studio owner can manage this studio's availability." });
    return null;
  }
  return user;
}
function requireBookingAccess(req, res, booking, allowStudio = true) {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return null;
  const ownsBooking = user.role === "CUSTOMER" /* CUSTOMER */ && booking.customerId === user.id;
  const studioUser = "studioId" in user ? user : null;
  const managesStudio = allowStudio && ["SUPER_ADMIN" /* SUPER_ADMIN */, "STUDIO_ADMIN" /* STUDIO_ADMIN */, "STUDIO_STAFF" /* STUDIO_STAFF */].includes(user.role) && (user.role === "SUPER_ADMIN" /* SUPER_ADMIN */ || studioUser?.studioId === booking.studioId);
  if (!ownsBooking && !managesStudio) {
    res.status(403).json({ success: false, message: "You do not have access to this booking." });
    return null;
  }
  return user;
}
function canManageStudioPayment(user, studioId) {
  const studio = db.studios.find((item) => item.id === studioId);
  return user.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */ && user.studioId === studioId && studio?.ownerId === user.id;
}
function publicUser(user, authToken) {
  const { passwordHash, ...safeUser } = user;
  return { ...safeUser, authToken };
}
function expireUnpaidBooking(booking) {
  if (!booking.paymentDueAt || !["Pending", "Awaiting Payment"].includes(booking.status)) return false;
  if (booking.amountPaid >= booking.downPaymentAmount || new Date(booking.paymentDueAt) > /* @__PURE__ */ new Date()) return false;
  booking.status = "Expired";
  db.save();
  notifyUser(booking.customerId, "Booking Payment Hold Expired", `Booking ${booking.id} expired because the downpayment was not received before the payment deadline.`, "error", booking.studioId);
  return true;
}
function logAction(userId, email, action, entityType, entityId) {
  const log = {
    id: generateId("LOG"),
    userId,
    userEmail: email,
    action,
    entityType,
    entityId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addAuditLog(log);
}
function notifyUser(userId, title, message, type = "info", studioId) {
  const notif = {
    id: generateId("NOTIF"),
    userId,
    studioId,
    title,
    message,
    isRead: false,
    type,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addNotification(notif);
  const recipient = db.users.find((u) => u.id === userId) || db.customers.find((c) => c.id === userId);
  if (recipient && recipient.email) {
    sendEmailNotification(recipient.email, title, message, type).catch((err) => {
      console.warn("[SMTP] Notification email dispatch warning:", err);
    });
  }
}
async function sendReceiptCopyEmail(customerEmail, title, message, fileName, pdfBuffer) {
  await sendEmailNotification(
    customerEmail,
    title,
    message,
    "success",
    void 0,
    void 0,
    [{ filename: fileName, content: pdfBuffer, contentType: "application/pdf" }]
  );
}
function parseMediaData(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^data:((?:image\/(?:jpeg|png|webp)|application\/pdf|video\/(?:mp4|webm|quicktime|x-matroska|x-msvideo)));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > 8 * 1024 * 1024) return null;
  if (mimeType.startsWith("video/")) {
    return { mimeType, bytes };
  }
  const hasSignature = mimeType === "image/jpeg" ? bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) : mimeType === "image/png" ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : mimeType === "image/webp" ? bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP" : bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  if (!hasSignature) return null;
  return { mimeType, bytes };
}
function reconcileStudioBrandingMedia(studioId) {
  const studioIndex = db.studios.findIndex((item) => item.id === studioId);
  if (studioIndex === -1) return;
  const media = db.mediaFiles.filter(
    (item) => item.entityType === "studio" && item.entityId === studioId && item.accessStatus === "active" && (item.purpose === "STUDIO_LOGO" || item.purpose === "STUDIO_COVER")
  );
  const latestByPurpose = /* @__PURE__ */ new Map();
  for (const item of media) {
    if (!latestByPurpose.has(item.purpose)) {
      latestByPurpose.set(item.purpose, `/api/media/${item.id}`);
    }
  }
  if (latestByPurpose.has("STUDIO_LOGO")) db.studios[studioIndex].logo = latestByPurpose.get("STUDIO_LOGO") || db.studios[studioIndex].logo;
  if (latestByPurpose.has("STUDIO_COVER")) db.studios[studioIndex].coverImage = latestByPurpose.get("STUDIO_COVER") || db.studios[studioIndex].coverImage;
}
async function saveProtectedMedia(ownerId, entityType, entityId, purpose, value, originalName) {
  const parsed = parseMediaData(value);
  if (!parsed) return null;
  await import_promises.default.mkdir(MEDIA_ROOT, { recursive: true });
  const mediaId = generateId("MEDIA");
  const extension = parsed.mimeType === "application/pdf" ? "pdf" : parsed.mimeType.split("/")[1];
  const storageKey = `${mediaId}.${extension}`;
  await import_promises.default.writeFile(import_path2.default.join(MEDIA_ROOT, storageKey), parsed.bytes, { flag: "wx" });
  const media = {
    id: mediaId,
    ownerId,
    entityType,
    entityId,
    purpose,
    originalName,
    mimeType: parsed.mimeType,
    sizeBytes: parsed.bytes.length,
    checksum: import_crypto.default.createHash("sha256").update(parsed.bytes).digest("hex"),
    storageKey,
    accessStatus: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addMediaFile(media);
  if (entityType === "studio") {
    reconcileStudioBrandingMedia(entityId);
    await db.save();
  }
  return { mediaId, mimeType: media.mimeType, size: media.sizeBytes };
}
function canAccessMedia(user, media) {
  if (user.role === "SUPER_ADMIN" /* SUPER_ADMIN */ || user.id === media.ownerId) return true;
  if (media.entityType === "payment") {
    const payment = db.payments.find((item) => item.id === media.entityId);
    const booking = payment ? db.bookings.find((item) => item.id === payment.bookingId) : void 0;
    return !!payment && !!booking && (user.role === "CUSTOMER" /* CUSTOMER */ && payment.customerId === user.id || ["STUDIO_ADMIN" /* STUDIO_ADMIN */, "STUDIO_STAFF" /* STUDIO_STAFF */].includes(user.role) && user.studioId === payment.studioId);
  }
  if (media.entityType === "studio") {
    const studio = db.studios.find((item) => item.id === media.entityId);
    return !!studio && (user.studioId === studio.id || user.id === studio.ownerId);
  }
  if (media.entityType === "print-order") {
    const order = db.printOrders.find((item) => item.id === media.entityId);
    return !!order && (user.role === "CUSTOMER" /* CUSTOMER */ && order.customerId === user.id || ["STUDIO_ADMIN" /* STUDIO_ADMIN */, "STUDIO_STAFF" /* STUDIO_STAFF */].includes(user.role) && user.studioId === order.studioId);
  }
  if (media.entityType === "photo-proofing") {
    const gallery = db.photoProofings.find((item) => item.id === media.entityId);
    return !!gallery && (user.role === "CUSTOMER" /* CUSTOMER */ && gallery.customerId === user.id || ["STUDIO_ADMIN" /* STUDIO_ADMIN */, "STUDIO_STAFF" /* STUDIO_STAFF */].includes(user.role) && user.studioId === gallery.studioId || user.role === "SUPER_ADMIN" /* SUPER_ADMIN */);
  }
  if (media.entityType === "service") {
    const service = db.services.find((item) => item.id === media.entityId);
    return !!service && (["STUDIO_ADMIN" /* STUDIO_ADMIN */, "STUDIO_STAFF" /* STUDIO_STAFF */].includes(user.role) && user.studioId === service.studioId);
  }
  if (media.entityType === "package") {
    const pkg = db.packages.find((item) => item.id === media.entityId);
    return !!pkg && (["STUDIO_ADMIN" /* STUDIO_ADMIN */, "STUDIO_STAFF" /* STUDIO_STAFF */].includes(user.role) && user.studioId === pkg.studioId);
  }
  if (media.entityType === "addon") {
    const addon = db.addons.find((item) => item.id === media.entityId);
    return !!addon && (["STUDIO_ADMIN" /* STUDIO_ADMIN */, "STUDIO_STAFF" /* STUDIO_STAFF */].includes(user.role) && user.studioId === addon.studioId);
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
  if ((String(purpose) === "HERO_BACKGROUND" || String(purpose) === "SYSTEM_DEMO_VIDEO") && (user.role !== "SUPER_ADMIN" /* SUPER_ADMIN */ || String(entityType) !== (String(purpose) === "HERO_BACKGROUND" ? "cms" : "system") || String(entityId) !== (String(purpose) === "HERO_BACKGROUND" ? "heroBackground" : "demo-video"))) {
    return res.status(403).json({ success: false, message: "Only a superadmin can upload this protected media." });
  }
  const media = await saveProtectedMedia(user.id, String(entityType), String(entityId), String(purpose), fileData, originalName);
  if (!media) return res.status(400).json({ success: false, message: "The file type or size is not supported." });
  const mediaUrl = `/api/media/${media.mediaId}`;
  if (String(purpose) === "HERO_BACKGROUND" && String(entityType) === "cms" && String(entityId) === "heroBackground") {
    const cmsIndex = db.cmsSettings.findIndex((setting) => setting.key === "heroBackground");
    if (cmsIndex >= 0) {
      db.cmsSettings[cmsIndex].value = mediaUrl;
    } else {
      db.cmsSettings.push({ id: "heroBackground", key: "heroBackground", value: mediaUrl });
    }
    await db.save();
  }
  res.json({ success: true, media, url: mediaUrl });
});
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
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || db.customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    recordLoginFailure(rateLimitKey);
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  let isPasswordValid = false;
  try {
    if (user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$")) {
      isPasswordValid = import_bcryptjs.default.compareSync(password, user.passwordHash);
    }
  } catch {
    isPasswordValid = false;
  }
  if (!isPasswordValid) {
    const failureCount = recordLoginFailure(rateLimitKey);
    if (failureCount === 3 || failureCount === 5) {
      notifyUser(
        user.id,
        "Multiple Failed Login Attempts",
        `We detected ${failureCount} unsuccessful login attempts for your account. If this was not you, change your password immediately and contact support.`,
        "error"
      );
    }
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
app.post("/api/auth/google", async (req, res) => {
  const credential = typeof req.body?.credential === "string" ? req.body.credential.trim() : "";
  if (!credential) {
    return res.status(400).json({ success: false, message: "Missing Google credential." });
  }
  try {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: "Google client ID is not configured on the server." });
    }
    const googleIdentity = await verifyGoogleIdToken(credential);
    const normalizedEmail = googleIdentity.email;
    const existingUser = db.users.find((u) => u.email.toLowerCase() === normalizedEmail) || db.customers.find((c) => c.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      existingUser.fullName = existingUser.fullName || googleIdentity.fullName;
      existingUser.email = normalizedEmail;
      existingUser.authProvider = "google";
      existingUser.googleId = googleIdentity.googleId;
      if (googleIdentity.picture) existingUser.picture = googleIdentity.picture;
      const authToken2 = createAuthToken(existingUser.id);
      db.save();
      return res.json({ success: true, user: publicUser(existingUser, authToken2) });
    }
    const customer = {
      id: generateId("CUST"),
      email: normalizedEmail,
      passwordHash: import_bcryptjs.default.hashSync(`${Date.now()}-${import_crypto.default.randomUUID()}-google-social`, 10),
      fullName: googleIdentity.fullName,
      role: "CUSTOMER" /* CUSTOMER */,
      contactNumber: "",
      address: "",
      authProvider: "google",
      googleId: googleIdentity.googleId,
      picture: googleIdentity.picture,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.addCustomer(customer);
    const authToken = createAuthToken(customer.id);
    return res.json({ success: true, user: publicUser(customer, authToken) });
  } catch (error) {
    console.error("[Google Login]", error?.message || error);
    return res.status(401).json({ success: false, message: "Google authentication failed." });
  }
});
app.get("/api/auth/session", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const token = req.header("Authorization")?.slice(7).trim() || "";
  res.json({ success: true, user: publicUser(user, token) });
});
app.post("/api/auth/forgot-password", async (req, res) => {
  const normalizedEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return res.status(400).json({ success: false, message: "A valid email address is required." });
  }
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail) || db.customers.find((c) => c.email.toLowerCase() === normalizedEmail);
  if (user) {
    const otp = String(import_crypto.default.randomInt(1e5, 1e6)).padStart(6, "0");
    const expiresAt = Date.now() + 10 * 60 * 1e3;
    passwordResetOtps.set(normalizedEmail, {
      userId: user.id,
      email: user.email,
      otpHash: import_crypto.default.createHash("sha256").update(otp).digest("hex"),
      expiresAt,
      attempts: 0
    });
    await sendEmailNotification(
      user.email,
      "Your Password Reset OTP",
      `We received a request to reset your Cainta Photography Studio MIS password. Your one-time verification code is <strong>${otp}</strong>. This code expires in 10 minutes. If you did not make this request, you can safely ignore this email.`,
      "warning"
    );
    notifyUser(user.id, "Password Reset OTP Dispatched", "A password reset verification code has been sent to your email address.", "info");
    logAction(user.id, user.email, "Requested password reset", "USER", user.id);
  }
  res.json({
    success: true,
    message: "If an account matches that email address, a password reset OTP has been sent."
  });
});
app.post("/api/auth/verify-reset-otp", (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: "A valid email address is required." });
  }
  if (!otp || otp.length < 6) {
    return res.status(400).json({ success: false, message: "A valid 6-digit OTP is required." });
  }
  const resetRecord = passwordResetOtps.get(email);
  if (!resetRecord || resetRecord.expiresAt <= Date.now()) {
    passwordResetOtps.delete(email);
    return res.status(400).json({ success: false, message: "The OTP is invalid or has expired. Request a new OTP." });
  }
  resetRecord.attempts += 1;
  if (resetRecord.attempts > 5) {
    passwordResetOtps.delete(email);
    return res.status(400).json({ success: false, message: "Too many OTP attempts. Please request a fresh OTP." });
  }
  const otpHash = import_crypto.default.createHash("sha256").update(otp).digest("hex");
  if (!import_crypto.default.timingSafeEqual(Buffer.from(otpHash), Buffer.from(resetRecord.otpHash))) {
    const attemptsLeft = 5 - resetRecord.attempts;
    if (attemptsLeft <= 0) {
      passwordResetOtps.delete(email);
      return res.status(400).json({ success: false, message: "Too many OTP attempts. Please request a fresh OTP." });
    }
    return res.status(400).json({ success: false, message: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.` });
  }
  const resetToken = import_crypto.default.randomBytes(32).toString("hex");
  passwordResetTokens.set(resetToken, {
    userId: resetRecord.userId,
    email: resetRecord.email,
    expiresAt: Date.now() + 15 * 60 * 1e3
  });
  passwordResetOtps.delete(email);
  res.json({ success: true, resetToken });
});
app.post("/api/auth/reset-password", (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || typeof token !== "string" || !token.trim()) {
    return res.status(400).json({ success: false, message: "A valid verification token is required." });
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "A password with at least 6 characters is required." });
  }
  const resetRecord = passwordResetTokens.get(token);
  if (!resetRecord || resetRecord.expiresAt <= Date.now()) {
    passwordResetTokens.delete(token);
    return res.status(400).json({ success: false, message: "Password reset link is invalid or has expired." });
  }
  const hashedPassword = import_bcryptjs.default.hashSync(newPassword, 10);
  let updated = false;
  const uIndex = db.users.findIndex((u) => u.id === resetRecord.userId);
  if (uIndex !== -1) {
    db.users[uIndex].passwordHash = hashedPassword;
    updated = true;
  } else {
    const cIndex = db.customers.findIndex((c) => c.id === resetRecord.userId);
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
  const duplicate = [...db.users, ...db.customers].find((item) => item.id !== user.id && item.email.toLowerCase() === normalizedEmail);
  if (duplicate) return res.status(400).json({ success: false, message: "Email is already registered." });
  const changingPassword = Boolean(newPassword);
  if (changingPassword) {
    if (typeof newPassword !== "string" || newPassword.length < 6 || !currentPassword) {
      return res.status(400).json({ success: false, message: "Current password and a new password of at least 6 characters are required." });
    }
    if (!import_bcryptjs.default.compareSync(currentPassword, user.passwordHash)) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }
  }
  const updates = { fullName: String(fullName).trim(), email: String(email).trim(), contactNumber: contactNumber || "", address: address || "" };
  if (changingPassword) updates.passwordHash = import_bcryptjs.default.hashSync(newPassword, 10);
  const target = user.role === "CUSTOMER" /* CUSTOMER */ ? db.customers.find((item) => item.id === user.id) : db.users.find((item) => item.id === user.id);
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
  const { email, password, fullName, contactNumber, address, role, studioName, studioAddress, latitude, longitude, businessPermit, validId, otherDocs } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ success: false, message: "Required fields are missing." });
  }
  const existingInUsers = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const existingInCustomers = db.customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (existingInUsers || existingInCustomers) {
    return res.status(400).json({ success: false, message: "Email is already registered." });
  }
  const targetRole = role === "STUDIO_ADMIN" /* STUDIO_ADMIN */ ? "STUDIO_ADMIN" /* STUDIO_ADMIN */ : "CUSTOMER" /* CUSTOMER */;
  const userId = generateId(targetRole === "CUSTOMER" ? "CUST" : "U");
  let studioId;
  const hashedPassword = import_bcryptjs.default.hashSync(password, 10);
  if (targetRole === "CUSTOMER") {
    const newCustomer = {
      id: userId,
      email,
      passwordHash: hashedPassword,
      fullName,
      role: "CUSTOMER",
      contactNumber,
      address,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.addCustomer(newCustomer);
    logAction(userId, email, `Registered customer account in customers table`, "CUSTOMER", userId);
    const authToken = createAuthToken(newCustomer.id);
    return res.json({ success: true, user: publicUser(newCustomer, authToken) });
  }
  if (targetRole === "STUDIO_ADMIN" /* STUDIO_ADMIN */) {
    studioId = generateId("ST");
    const newStudio = {
      id: studioId,
      name: studioName || `${fullName}'s Photography Studio`,
      ownerId: userId,
      logo: "",
      coverImage: "",
      location: studioAddress || "Cainta, Rizal",
      rating: 5,
      reviewCount: 0,
      startingPrice: 1e3,
      categories: ["Portrait Photography"],
      description: "Welcome to our newly registered photography studio! Complete our profile setup to list services, customizable packages, and receive instant bookings.",
      address: studioAddress || address || "Cainta, Rizal",
      contactInfo: contactNumber || "+63 900 000 0000",
      email,
      businessHours: "09:00 AM - 06:00 PM",
      isApproved: false,
      status: "pending",
      printingAvailable: true,
      latitude: Number.isFinite(Number(latitude)) ? Number(latitude) : void 0,
      longitude: Number.isFinite(Number(longitude)) ? Number(longitude) : void 0,
      businessPermit: void 0,
      validId: void 0,
      otherDocs: void 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const documentMedia = [
      { purpose: "BUSINESS_PERMIT", value: businessPermit, name: "business-permit" },
      { purpose: "OWNER_VALID_ID", value: validId, name: "owner-valid-id" },
      { purpose: "SUPPORTING_DOCUMENT", value: otherDocs, name: "supporting-document" }
    ];
    const newUser = {
      id: userId,
      email,
      passwordHash: hashedPassword,
      fullName,
      role: targetRole,
      studioId,
      contactNumber,
      address,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.addUser(newUser);
    db.addStudio(newStudio);
    for (const document of documentMedia) {
      if (document.value) {
        const media = await saveProtectedMedia(userId, "studio", studioId, document.purpose, document.value, document.name);
        if (media) newStudio[document.purpose === "BUSINESS_PERMIT" ? "businessPermit" : document.purpose === "OWNER_VALID_ID" ? "validId" : "otherDocs"] = `/api/media/${media.mediaId}`;
      }
    }
    await db.save();
    logAction(userId, email, `Registered new photography studio: ${newStudio.name}`, "STUDIO", studioId);
    db.users.filter((u) => u.role === "SUPER_ADMIN" /* SUPER_ADMIN */).forEach((admin) => {
      notifyUser(admin.id, "New Studio Registration", `Studio '${newStudio.name}' has registered and is pending verification.`, "warning");
    });
  }
  res.json({
    success: true,
    message: "Registration submitted successfully. Please wait for Super Admin approval before signing in to the Studio Portal."
  });
});
app.get("/api/cms", (req, res) => {
  const cmsMap = {};
  db.cmsSettings.forEach((s) => {
    cmsMap[s.key] = s.value;
  });
  res.json({ success: true, cms: cmsMap });
});
app.post("/api/cms", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const updates = req.body;
  if (!updates || typeof updates !== "object") {
    return res.status(400).json({ success: false, message: "Invalid payload." });
  }
  for (const [key, value] of Object.entries(updates)) {
    const stringVal = String(value);
    const index = db.cmsSettings.findIndex((s) => s.key === key);
    if (index !== -1) {
      db.cmsSettings[index].value = stringVal;
    } else {
      db.cmsSettings.push({
        id: key,
        key,
        value: stringVal
      });
    }
  }
  db.save();
  logAction("system", "system@cainta-mis.com", "Updated system content settings (CMS)", "SYSTEM", "CMS");
  res.json({ success: true, message: "CMS settings updated successfully.", cms: db.cmsSettings });
});
app.get("/api/admin/settings", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  res.json({ success: true, settings: db.systemSettings });
});
app.post("/api/admin/settings", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const updates = req.body;
  if (!updates) {
    return res.status(400).json({ success: false, message: "Invalid payload." });
  }
  db.updateSystemSettings(updates);
  logAction("system", "system@cainta-mis.com", "Updated system settings & UI config", "SYSTEM", "SETTINGS");
  res.json({ success: true, settings: db.systemSettings });
});
app.get("/api/system/audio", (_req, res) => {
  res.json({
    success: true,
    audioUrl: db.systemSettings.customAudioUrl || "",
    isEnabled: db.systemSettings.isSoundEnabled && db.systemSettings.customAudioEnabled !== false
  });
});
app.get("/api/system/demo-video", (_req, res) => {
  const demoVideo = db.mediaFiles.find(
    (item) => item.entityType === "system" && item.entityId === "demo-video" && item.purpose === "SYSTEM_DEMO_VIDEO" && item.accessStatus === "active"
  );
  res.json({
    success: true,
    demoVideoUrl: demoVideo ? `/api/media/${demoVideo.id}` : db.systemSettings.demoVideoUrl || ""
  });
});
app.get("/api/admin/smtp-status", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  res.json({
    success: true,
    isConfigured: !!(smtpEmail && smtpPassword),
    senderEmail: smtpEmail || "Not configured",
    service: "Gmail SMTP"
  });
});
app.post("/api/admin/send-test-email", async (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
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
  } catch (err) {
    res.status(500).json({ success: false, message: `SMTP error: ${err?.message || "Failed to dispatch email"}` });
  }
});
app.get("/api/custom-pages", (req, res) => {
  if (req.method !== "GET" && !requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  res.json({ success: true, pages: db.customPages });
});
app.post("/api/custom-pages", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const { title, slug, isPublished, showInNavbar, blocks } = req.body;
  if (!title || !slug) {
    return res.status(400).json({ success: false, message: "Title and slug are required." });
  }
  const newPage = {
    id: generateId("PAGE"),
    title,
    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    isPublished: isPublished !== void 0 ? isPublished : true,
    showInNavbar: showInNavbar !== void 0 ? showInNavbar : true,
    blocks: blocks || [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.customPages.push(newPage);
  db.save();
  logAction("system", "system@cainta-mis.com", `Created custom page: ${title}`, "PAGE", newPage.id);
  res.json({ success: true, page: newPage });
});
app.put("/api/custom-pages/:id", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const index = db.customPages.findIndex((p) => p.id === req.params.id);
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
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const index = db.customPages.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Custom page not found." });
  }
  const removed = db.customPages.splice(index, 1)[0];
  db.save();
  logAction("system", "system@cainta-mis.com", `Deleted custom page: ${removed.title}`, "PAGE", removed.id);
  res.json({ success: true, message: "Custom page deleted successfully." });
});
app.post("/api/admin/register-studio", async (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const {
    email,
    password,
    fullName,
    contactNumber,
    userAddress,
    studioName,
    description,
    categories,
    startingPrice,
    businessHours,
    address,
    location,
    latitude,
    longitude,
    businessPermit,
    validId,
    otherDocs
  } = req.body;
  if (!email || !password || !fullName || !studioName) {
    return res.status(400).json({ success: false, message: "Required fields are missing." });
  }
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || db.customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: "Email is already registered." });
  }
  const userId = generateId("U");
  const studioId = generateId("ST");
  const hashedPassword = import_bcryptjs.default.hashSync(password, 10);
  const newStudio = {
    id: studioId,
    name: studioName,
    ownerId: userId,
    logo: "",
    coverImage: "",
    location: location || "Cainta, Rizal",
    rating: 5,
    reviewCount: 0,
    startingPrice: Number(startingPrice) || 1e3,
    categories: Array.isArray(categories) ? categories : ["Portrait Photography"],
    description: description || "Centralized photography studio.",
    address: address || userAddress || "Cainta, Rizal",
    contactInfo: contactNumber || "+63 900 000 0000",
    email,
    businessHours: businessHours || "09:00 AM - 06:00 PM",
    isApproved: true,
    status: "approved",
    printingAvailable: true,
    latitude: latitude !== void 0 ? Number(latitude) : void 0,
    longitude: longitude !== void 0 ? Number(longitude) : void 0,
    businessPermit: void 0,
    validId: void 0,
    otherDocs: void 0,
    registeredByAdmin: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const documentMedia = [
    { purpose: "BUSINESS_PERMIT", value: businessPermit, name: "business-permit" },
    { purpose: "OWNER_VALID_ID", value: validId, name: "owner-valid-id" },
    { purpose: "SUPPORTING_DOCUMENT", value: otherDocs, name: "supporting-document" }
  ];
  const newUser = {
    id: userId,
    email,
    passwordHash: hashedPassword,
    fullName,
    role: "STUDIO_ADMIN" /* STUDIO_ADMIN */,
    studioId,
    contactNumber,
    address: userAddress,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addStudio(newStudio);
  db.addUser(newUser);
  for (const document of documentMedia) {
    if (document.value) {
      const media = await saveProtectedMedia(userId, "studio", studioId, document.purpose, document.value, document.name);
      if (media) newStudio[document.purpose === "BUSINESS_PERMIT" ? "businessPermit" : document.purpose === "OWNER_VALID_ID" ? "validId" : "otherDocs"] = `/api/media/${media.mediaId}`;
    }
  }
  await db.save();
  logAction("system", "system@cainta-mis.com", `Directly registered and verified studio owner account: ${email} for studio ${studioName}`, "STUDIO", studioId);
  notifyUser(userId, "Welcome to Cainta Studio Network", `Your studio '${studioName}' has been directly registered and approved by the Super Admin.`, "success", studioId);
  res.json({ success: true, message: "Studio and owner registered successfully by admin.", user: newUser, studio: newStudio });
});
app.post("/api/admin/create-user", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const { email, password, fullName, contactNumber, address, role, studioId } = req.body;
  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ success: false, message: "Email, password, name, and role are required." });
  }
  const existingInUsers = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const existingInCustomers = db.customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (existingInUsers || existingInCustomers) {
    return res.status(400).json({ success: false, message: "Email is already registered." });
  }
  const hashedPassword = import_bcryptjs.default.hashSync(password, 10);
  if (role === "CUSTOMER") {
    const userId = generateId("CUST");
    const newCustomer = {
      id: userId,
      email,
      passwordHash: hashedPassword,
      fullName,
      role: "CUSTOMER",
      contactNumber,
      address,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
      role,
      studioId: studioId || void 0,
      contactNumber,
      address,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.addUser(newUser);
    logAction("system", "system@cainta-mis.com", `Admin created user account (${role}): ${email}`, "USER", userId);
    return res.json({ success: true, message: `User account (${role}) created successfully.`, user: newUser });
  }
});
app.get("/api/studios", (req, res) => {
  const { includePending } = req.query;
  if (includePending === "true") {
    if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
    return res.json({ success: true, studios: db.studios });
  }
  const approved = db.studios.filter((s) => s.status === "approved" || s.isApproved);
  res.json({ success: true, studios: approved });
});
app.get("/api/studios/:id", (req, res) => {
  const studio = db.studios.find((s) => s.id === req.params.id);
  if (!studio) {
    return res.status(404).json({ success: false, message: "Studio not found" });
  }
  reconcileStudioBrandingMedia(studio.id);
  if (!studio.isApproved && studio.status !== "approved") {
    const user = requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */, "STUDIO_ADMIN" /* STUDIO_ADMIN */);
    if (!user || user.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */ && user.studioId !== studio.id) return;
  }
  const services = db.services.filter((s) => s.studioId === studio.id && s.isActive);
  const packages = db.packages.filter((p) => p.studioId === studio.id && p.isActive);
  const addons = db.addons.filter((a) => a.studioId === studio.id);
  const reviews = db.reviews.filter((r) => r.studioId === studio.id);
  const printProducts = db.printProducts.filter((p) => p.studioId === studio.id && p.isActive);
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
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const studioId = generateId("ST");
  const newStudio = {
    id: studioId,
    ...req.body,
    rating: 5,
    reviewCount: 0,
    isApproved: false,
    status: "pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addStudio(newStudio);
  res.json({ success: true, studio: newStudio });
});
app.put("/api/studios/:id", async (req, res) => {
  const index = db.studios.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Studio not found." });
  }
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const isOwnerOrAdmin = user.role === "SUPER_ADMIN" /* SUPER_ADMIN */ || user.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */ && (user.studioId === req.params.id || db.studios[index].ownerId === user.id);
  if (!isOwnerOrAdmin) {
    return res.status(403).json({ success: false, message: "You cannot update this studio." });
  }
  const isSuperAdmin = user.role === "SUPER_ADMIN" /* SUPER_ADMIN */;
  const ownerFields = [
    "name",
    "logo",
    "coverImage",
    "location",
    "categories",
    "description",
    "address",
    "contactInfo",
    "email",
    "businessHours",
    "printingAvailable",
    "latitude",
    "longitude",
    "startingPrice",
    "blockedDates"
  ];
  const adminFields = [...ownerFields, "ownerId", "isApproved", "status", "businessPermit", "validId", "otherDocs", "registeredByAdmin"];
  const allowedFields = isSuperAdmin ? adminFields : ownerFields;
  const unknownFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));
  if (unknownFields.length > 0) {
    return res.status(400).json({ success: false, message: `Unknown or protected studio fields: ${unknownFields.join(", ")}.` });
  }
  const updates = {};
  for (const field of allowedFields) {
    if (field in req.body) updates[field] = req.body[field];
  }
  if (updates.latitude !== void 0 && (typeof updates.latitude !== "number" || updates.latitude < -90 || updates.latitude > 90)) {
    return res.status(400).json({ success: false, message: "Latitude must be a number between -90 and 90." });
  }
  if (updates.longitude !== void 0 && (typeof updates.longitude !== "number" || updates.longitude < -180 || updates.longitude > 180)) {
    return res.status(400).json({ success: false, message: "Longitude must be a number between -180 and 180." });
  }
  const uploadFields = [
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
  reconcileStudioBrandingMedia(req.params.id);
  await db.save();
  logAction(user.id, user.email, "Updated studio profile", "STUDIO", req.params.id);
  res.json({ success: true, studio: db.studios[index] });
});
app.put("/api/studios/:id/approve", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const index = db.studios.findIndex((s) => s.id === req.params.id);
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
  const admin = requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */);
  if (!admin) return;
  const index = db.studios.findIndex((s) => s.id === req.params.id);
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
  const admin = requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */);
  if (!admin) return;
  const { status } = req.body;
  if (!["approved", "rejected", "suspended"].includes(status)) {
    return res.status(400).json({ success: false, message: "Status must be approved, rejected, or suspended." });
  }
  const user = db.users.find((item) => item.id === req.params.id);
  if (!user || user.role !== "STUDIO_ADMIN" /* STUDIO_ADMIN */) {
    return res.status(400).json({ success: false, message: "Only studio-owner accounts can be moderated here." });
  }
  const studio = db.studios.find(
    (item) => item.ownerId === user.id || item.id === user.studioId || item.email && user.email && item.email.toLowerCase() === user.email.toLowerCase()
  );
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
  const admin = requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */);
  if (!admin) return;
  const index = db.studios.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Studio not found." });
  }
  const studio = db.studios[index];
  const hasActiveBookings = db.bookings.some((booking) => booking.studioId === studio.id && !["Completed", "Cancelled", "Rejected", "Expired", "No Show"].includes(booking.status));
  if (hasActiveBookings) {
    return res.status(409).json({ success: false, message: "This studio has active bookings and cannot be archived yet." });
  }
  studio.status = "suspended";
  studio.isApproved = false;
  db.save();
  logAction(admin.id, admin.email, `Archived studio: ${studio.name}`, "STUDIO", studio.id);
  res.json({ success: true, message: "Studio archived successfully.", studio });
});
app.get("/api/studios/:id/staff", (req, res) => {
  const user = requireStudioAccess(req, res, req.params.id);
  if (!user) return;
  const staff = db.users.filter((u) => u.studioId === req.params.id && ["STUDIO_ADMIN" /* STUDIO_ADMIN */, "STUDIO_STAFF" /* STUDIO_STAFF */].includes(u.role)).map((u) => {
    const { passwordHash, ...safe } = u;
    return safe;
  });
  res.json({ success: true, staff });
});
app.post("/api/studios/:id/staff/invite", (req, res) => {
  const user = requireStudioAccess(req, res, req.params.id);
  if (!user) return;
  if (user.role !== "SUPER_ADMIN" /* SUPER_ADMIN */ && user.role !== "STUDIO_ADMIN" /* STUDIO_ADMIN */) {
    return res.status(403).json({ success: false, message: "Only studio administrators can invite staff." });
  }
  const { email, fullName, password, contactNumber } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ success: false, message: "Staff email and full name are required." });
  }
  const existing = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || db.customers.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: "An account with this email already exists." });
  }
  const staffId = generateId("STAFF");
  const defaultPassword = password || "Staff123!";
  const hashedPassword = import_bcryptjs.default.hashSync(defaultPassword, 10);
  const newStaff = {
    id: staffId,
    email: email.trim(),
    passwordHash: hashedPassword,
    fullName: fullName.trim(),
    role: "STUDIO_STAFF" /* STUDIO_STAFF */,
    studioId: req.params.id,
    contactNumber: contactNumber || void 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
  if (user.role !== "SUPER_ADMIN" /* SUPER_ADMIN */ && user.role !== "STUDIO_ADMIN" /* STUDIO_ADMIN */) {
    return res.status(403).json({ success: false, message: "Only studio administrators can remove staff." });
  }
  const index = db.users.findIndex((u) => u.id === req.params.staffId && u.studioId === req.params.id && u.role === "STUDIO_STAFF" /* STUDIO_STAFF */);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Staff member not found or is not removable." });
  }
  const removed = db.users.splice(index, 1)[0];
  db.save();
  logAction(user.id, user.email, `Removed staff member: ${removed.fullName}`, "USER", removed.id);
  res.json({ success: true, message: "Staff member removed successfully." });
});
app.get("/api/users", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const allAccounts = [
    ...db.users,
    ...db.customers.map((c) => ({ ...c, role: "CUSTOMER" }))
  ];
  res.json({ success: true, users: allAccounts });
});
app.delete("/api/users/:id", (req, res) => {
  const admin = requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */);
  if (!admin) return;
  const userId = req.params.id;
  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    const removed = db.users.splice(userIndex, 1)[0];
    for (const [token, session] of authSessions.entries()) {
      if (session.userId === removed.id) authSessions.delete(token);
    }
    db.save();
    logAction(admin.id, admin.email, `Deleted user account: ${removed.fullName || removed.email}`, "USER", removed.id);
    return res.json({ success: true, message: "User deleted successfully." });
  }
  const customerIndex = db.customers.findIndex((c) => c.id === userId);
  if (customerIndex !== -1) {
    const removed = db.customers.splice(customerIndex, 1)[0];
    for (const [token, session] of authSessions.entries()) {
      if (session.userId === removed.id) authSessions.delete(token);
    }
    db.save();
    logAction(admin.id, admin.email, `Deleted customer account: ${removed.fullName || removed.email}`, "USER", removed.id);
    return res.json({ success: true, message: "Customer deleted successfully." });
  }
  return res.status(404).json({ success: false, message: "User not found." });
});
app.get("/api/customers", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  res.json({ success: true, customers: db.customers });
});
app.get("/api/services", (req, res) => {
  res.json({ success: true, services: db.services });
});
app.get("/api/packages", (req, res) => {
  res.json({ success: true, packages: db.packages });
});
app.get("/api/addons", (req, res) => {
  res.json({ success: true, addons: db.addons });
});
app.get("/api/reviews", (req, res) => {
  const visibleReviews = db.reviews.filter((r) => r.status !== "rejected" && r.isVisible !== false);
  res.json({ success: true, reviews: visibleReviews });
});
app.get("/api/categories", (req, res) => {
  res.json({ success: true, categories: db.categories });
});
app.post("/api/categories", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  if (!name) {
    return res.status(400).json({ success: false, message: "Category name is required." });
  }
  if (db.categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
    return res.status(409).json({ success: false, message: "A category with this name already exists." });
  }
  const newCat = {
    id: generateId("CAT"),
    name,
    description,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addCategory(newCat);
  res.json({ success: true, category: newCat });
});
app.put("/api/categories/:id", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const category = db.categories.find((item) => item.id === req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found." });
  }
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  if (!name) {
    return res.status(400).json({ success: false, message: "Category name is required." });
  }
  if (db.categories.some((item) => item.id !== category.id && item.name.toLowerCase() === name.toLowerCase())) {
    return res.status(409).json({ success: false, message: "A category with this name already exists." });
  }
  category.name = name;
  category.description = description;
  db.save();
  res.json({ success: true, category });
});
app.delete("/api/categories/:id", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const index = db.categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Category not found." });
  }
  db.categories.splice(index, 1);
  db.save();
  res.json({ success: true, message: "Category removed successfully." });
});
app.get("/api/studios/:studioId/services", (req, res) => {
  const services = db.services.filter((s) => s.studioId === req.params.studioId);
  res.json({ success: true, services });
});
app.post("/api/studios/:studioId/services", async (req, res) => {
  const user = requireStudioAccess(req, res, req.params.studioId);
  if (!user) return;
  const newService = {
    id: generateId("SRV"),
    studioId: req.params.studioId,
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    basePrice: Number(req.body.basePrice),
    durationMinutes: Number(req.body.durationMinutes),
    image: "",
    images: [],
    isActive: true,
    availableDays: req.body.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    availableSlots: req.body.availableSlots || ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"],
    requirements: req.body.requirements || ["Arrive 10 minutes early"],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const submittedImages = Array.isArray(req.body.images) ? req.body.images : req.body.image ? [req.body.image] : [];
  for (const [index, submittedImage] of submittedImages.entries()) {
    if (typeof submittedImage === "string" && (/^https?:\/\//.test(submittedImage) || submittedImage.startsWith("/api/media/"))) {
      newService.images?.push(submittedImage);
      continue;
    }
    const media = await saveProtectedMedia(user.id, "service", newService.id, "SERVICE_IMAGE", submittedImage, `service-image-${index + 1}`);
    if (!media) return res.status(400).json({ success: false, message: "Service images must be supported images smaller than 8 MB." });
    newService.images?.push(`/api/media/${media.mediaId}`);
  }
  newService.image = newService.images?.[0] || "";
  db.addService(newService);
  res.json({ success: true, service: newService });
});
app.put("/api/services/:id", async (req, res) => {
  const index = db.services.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Service not found." });
  }
  const user = requireStudioAccess(req, res, db.services[index].studioId);
  if (!user) return;
  const service = db.services[index];
  const submittedImages = Array.isArray(req.body.images) ? req.body.images : req.body.image ? [req.body.image] : void 0;
  let protectedImages = service.images || (service.image ? [service.image] : []);
  if (submittedImages) {
    protectedImages = [];
    for (const [imageIndex, submittedImage] of submittedImages.entries()) {
      if (typeof submittedImage === "string" && submittedImage.startsWith("/api/media/")) {
        protectedImages.push(submittedImage);
        continue;
      }
      if (typeof submittedImage === "string" && /^https?:\/\//.test(submittedImage)) {
        protectedImages.push(submittedImage);
        continue;
      }
      const media = await saveProtectedMedia(user.id, "service", service.id, "SERVICE_IMAGE", submittedImage, `service-image-${imageIndex + 1}`);
      if (!media) return res.status(400).json({ success: false, message: "Service images must be supported images smaller than 8 MB." });
      protectedImages.push(`/api/media/${media.mediaId}`);
    }
  }
  db.services[index] = { ...service, ...req.body, images: protectedImages, image: protectedImages[0] || "" };
  db.save();
  res.json({ success: true, service: db.services[index] });
});
app.delete("/api/services/:id", (req, res) => {
  const index = db.services.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Service not found." });
  }
  if (!requireStudioAccess(req, res, db.services[index].studioId)) return;
  db.services.splice(index, 1);
  db.save();
  res.json({ success: true, message: "Service deleted." });
});
app.get("/api/studios/:studioId/packages", (req, res) => {
  const packages = db.packages.filter((p) => p.studioId === req.params.studioId);
  res.json({ success: true, packages });
});
app.post("/api/studios/:studioId/packages", async (req, res) => {
  const user = requireStudioAccess(req, res, req.params.studioId);
  if (!user) return;
  const newPkg = {
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
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (req.body.image) {
    const media = await saveProtectedMedia(user.id, "package", newPkg.id, "PACKAGE_IMAGE", req.body.image, "package-image");
    if (!media) return res.status(400).json({ success: false, message: "Package image must be a supported image smaller than 8 MB." });
    newPkg.image = `/api/media/${media.mediaId}`;
  }
  db.addPackage(newPkg);
  res.json({ success: true, package: newPkg });
});
app.put("/api/packages/:id", async (req, res) => {
  const index = db.packages.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Package not found." });
  }
  const user = requireStudioAccess(req, res, db.packages[index].studioId);
  if (!user) return;
  const pkg = db.packages[index];
  let image = pkg.image;
  if (req.body.image && req.body.image !== pkg.image) {
    const media = await saveProtectedMedia(user.id, "package", pkg.id, "PACKAGE_IMAGE", req.body.image, "package-image");
    if (!media) return res.status(400).json({ success: false, message: "Package image must be a supported image smaller than 8 MB." });
    image = `/api/media/${media.mediaId}`;
  }
  db.packages[index] = { ...pkg, ...req.body, image };
  db.save();
  res.json({ success: true, package: db.packages[index] });
});
app.delete("/api/packages/:id", (req, res) => {
  const index = db.packages.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Package not found." });
  }
  if (!requireStudioAccess(req, res, db.packages[index].studioId)) return;
  db.packages.splice(index, 1);
  db.save();
  res.json({ success: true, message: "Package deleted." });
});
app.get("/api/studios/:studioId/addons", (req, res) => {
  const addons = db.addons.filter((a) => a.studioId === req.params.studioId);
  res.json({ success: true, addons });
});
app.post("/api/studios/:studioId/addons", async (req, res) => {
  const user = requireStudioAccess(req, res, req.params.studioId);
  if (!user) return;
  const newAddon = {
    id: generateId("ADD"),
    studioId: req.params.studioId,
    name: req.body.name,
    price: Number(req.body.price),
    description: req.body.description || "",
    image: "",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (req.body.image) {
    const media = await saveProtectedMedia(user.id, "addon", newAddon.id, "ADDON_IMAGE", req.body.image, "addon-image");
    if (!media) return res.status(400).json({ success: false, message: "Add-on image must be a supported image smaller than 8 MB." });
    newAddon.image = `/api/media/${media.mediaId}`;
  }
  db.addAddon(newAddon);
  res.json({ success: true, addon: newAddon });
});
app.delete("/api/addons/:id", (req, res) => {
  const index = db.addons.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Addon not found." });
  }
  if (!requireStudioAccess(req, res, db.addons[index].studioId)) return;
  db.addons.splice(index, 1);
  db.save();
  res.json({ success: true, message: "Addon removed." });
});
function parseHHMM(value) {
  if (!value || typeof value !== "string") return 0;
  const [hourRaw, minuteRaw] = String(value).split(":");
  const hour = Number(hourRaw || 0);
  const minute = Number(minuteRaw || 0);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;
  return hour * 60 + minute;
}
app.get("/api/studios/:studioId/availability", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  if (user.role === "CUSTOMER" /* CUSTOMER */) {
    return res.status(403).json({ success: false, message: "Only studio staff can view this information." });
  }
  if (user.role === "STUDIO_STAFF" /* STUDIO_STAFF */ && user.studioId !== req.params.studioId) {
    return res.status(403).json({ success: false, message: "You do not have access to this studio." });
  }
  if (user.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */ && user.studioId !== req.params.studioId) {
    return res.status(403).json({ success: false, message: "You do not have access to this studio." });
  }
  const availability = db.availabilities.filter((a) => a.studioId === req.params.studioId);
  res.json({ success: true, availability });
});
app.post("/api/studios/:studioId/availability", (req, res) => {
  const user = requireStudioOwner(req, res, req.params.studioId);
  if (!user) return;
  const payload = req.body || {};
  const dayOfWeek = Number(payload.dayOfWeek);
  if (Number.isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return res.status(400).json({ success: false, message: "Please select a valid day of week." });
  }
  const openingTime = String(payload.openingTime || "09:00");
  const closingTime = String(payload.closingTime || "18:00");
  const start = parseHHMM(openingTime);
  const end = parseHHMM(closingTime);
  if (start >= end) {
    return res.status(400).json({ success: false, message: "Closing time must be after opening time." });
  }
  const existing = db.availabilities.find((a) => a.studioId === req.params.studioId && a.dayOfWeek === dayOfWeek);
  const item = existing || {
    id: generateId("AVL"),
    studioId: req.params.studioId,
    dayOfWeek,
    openingTime,
    closingTime,
    isAvailable: payload.isAvailable !== false,
    slotDurationMinutes: Number(payload.slotDurationMinutes) || 60,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (existing) {
    Object.assign(existing, {
      openingTime,
      closingTime,
      isAvailable: payload.isAvailable !== false,
      slotDurationMinutes: Number(payload.slotDurationMinutes) || 60,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } else {
    db.availabilities.push(item);
  }
  db.save();
  res.json({ success: true, availability: item });
});
app.put("/api/studios/:studioId/availability/:id", (req, res) => {
  const user = requireStudioOwner(req, res, req.params.studioId);
  if (!user) return;
  const index = db.availabilities.findIndex((a) => a.id === req.params.id && a.studioId === req.params.studioId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Availability not found." });
  }
  const payload = req.body || {};
  const openingTime = String(payload.openingTime || db.availabilities[index].openingTime);
  const closingTime = String(payload.closingTime || db.availabilities[index].closingTime);
  const start = parseHHMM(openingTime);
  const end = parseHHMM(closingTime);
  if (start >= end) {
    return res.status(400).json({ success: false, message: "Closing time must be after opening time." });
  }
  db.availabilities[index] = {
    ...db.availabilities[index],
    dayOfWeek: Number(payload.dayOfWeek ?? db.availabilities[index].dayOfWeek),
    openingTime,
    closingTime,
    isAvailable: payload.isAvailable !== false,
    slotDurationMinutes: Number(payload.slotDurationMinutes) || db.availabilities[index].slotDurationMinutes,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.save();
  res.json({ success: true, availability: db.availabilities[index] });
});
app.delete("/api/studios/:studioId/availability/:id", (req, res) => {
  const user = requireStudioOwner(req, res, req.params.studioId);
  if (!user) return;
  const index = db.availabilities.findIndex((a) => a.id === req.params.id && a.studioId === req.params.studioId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Availability not found." });
  }
  db.availabilities.splice(index, 1);
  db.save();
  res.json({ success: true, message: "Availability removed." });
});
app.get("/api/studios/:studioId/blackouts", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  if (user.role === "CUSTOMER" /* CUSTOMER */) {
    return res.status(403).json({ success: false, message: "Only studio staff can view this information." });
  }
  if (user.role === "STUDIO_STAFF" /* STUDIO_STAFF */ && user.studioId !== req.params.studioId) {
    return res.status(403).json({ success: false, message: "You do not have access to this studio." });
  }
  if (user.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */ && user.studioId !== req.params.studioId) {
    return res.status(403).json({ success: false, message: "You do not have access to this studio." });
  }
  const blackouts = db.blackouts.filter((b) => b.studioId === req.params.studioId);
  res.json({ success: true, blackouts });
});
app.post("/api/studios/:studioId/blackouts", (req, res) => {
  const user = requireStudioOwner(req, res, req.params.studioId);
  if (!user) return;
  const blackout = {
    id: generateId("BLK"),
    studioId: req.params.studioId,
    blackoutDate: String(req.body.blackoutDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)),
    startTime: String(req.body.startTime || "00:00"),
    endTime: String(req.body.endTime || "23:59"),
    reason: String(req.body.reason || "Studio closure"),
    isRecurring: Boolean(req.body.isRecurring),
    recurrenceRule: req.body.recurrenceRule || void 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.blackouts.push(blackout);
  db.save();
  res.json({ success: true, blackout });
});
app.delete("/api/studios/:studioId/blackouts/:id", (req, res) => {
  const user = requireStudioOwner(req, res, req.params.studioId);
  if (!user) return;
  const index = db.blackouts.findIndex((b) => b.id === req.params.id && b.studioId === req.params.studioId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Blackout not found." });
  }
  db.blackouts.splice(index, 1);
  db.save();
  res.json({ success: true, message: "Blackout removed." });
});
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 540;
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
app.get("/api/bookings", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  db.bookings.forEach(expireUnpaidBooking);
  const { customerId, studioId } = req.query;
  let filtered = db.bookings.map((booking) => ({
    ...booking,
    pendingPaymentAmount: db.payments.filter((payment) => payment.bookingId === booking.id && payment.paymentStatus === "Pending Verification").reduce((sum, payment) => sum + Number(payment.amount), 0)
  }));
  if (user.role === "CUSTOMER" /* CUSTOMER */) filtered = filtered.filter((b) => b.customerId === user.id);
  else if (user.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */ || user.role === "STUDIO_STAFF" /* STUDIO_STAFF */) filtered = filtered.filter((b) => b.studioId === user.studioId);
  if (customerId && user.role === "SUPER_ADMIN" /* SUPER_ADMIN */) filtered = filtered.filter((b) => b.customerId === customerId);
  if (studioId && user.role === "SUPER_ADMIN" /* SUPER_ADMIN */) filtered = filtered.filter((b) => b.studioId === studioId);
  res.json({ success: true, bookings: filtered });
});
app.get("/api/bookings/:id", (req, res) => {
  const booking = db.bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }
  if (!requireBookingAccess(req, res, booking)) return;
  res.json({ success: true, booking });
});
app.post("/api/bookings", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { studioId, customerId, serviceId, packageId, bookingDate, timeSlot, addons, customerDetails, totalAmount, paymentOption } = req.body;
  if (user.role !== "CUSTOMER" /* CUSTOMER */ || customerId !== user.id) {
    return res.status(403).json({ success: false, message: "Only the authenticated customer can create this booking." });
  }
  const studio = db.studios.find((item) => item.id === studioId && (item.status === "approved" || item.isApproved));
  if (!studio) {
    return res.status(400).json({ success: false, message: "Bookings are available only for approved studios." });
  }
  if (!serviceId) {
    return res.status(400).json({ success: false, message: "Please select a service before booking." });
  }
  const selectedPackage = packageId ? db.packages.find((item) => item.id === packageId && item.studioId === studioId) : void 0;
  if (packageId && !selectedPackage) {
    return res.status(400).json({ success: false, message: "The selected package is not valid for this studio." });
  }
  const selectedService = serviceId ? db.services.find((item) => item.id === serviceId && item.studioId === studioId && item.isActive) : void 0;
  if (serviceId && !selectedService) {
    return res.status(400).json({ success: false, message: "The selected service is not valid for this studio." });
  }
  const requestedDate = /* @__PURE__ */ new Date(`${bookingDate}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(bookingDate)) || Number.isNaN(requestedDate.getTime()) || requestedDate < new Date((/* @__PURE__ */ new Date()).toDateString())) {
    return res.status(400).json({ success: false, message: "Booking date must be today or a future date." });
  }
  const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" });
  const dayOfWeek = requestedDate.getDay();
  const studioAvailability = db.availabilities.find((a) => a.studioId === studioId && a.dayOfWeek === dayOfWeek);
  if (studioAvailability && !studioAvailability.isAvailable) {
    return res.status(400).json({ success: false, message: `The studio is closed on ${dayName}. Please choose another day.` });
  }
  if (studioAvailability) {
    const start = parseHHMM(studioAvailability.openingTime);
    const end = parseHHMM(studioAvailability.closingTime);
    const slotStart = parseTimeToMinutes(timeSlot);
    if (slotStart < start || slotStart >= end) {
      return res.status(400).json({ success: false, message: "The selected time is outside the studio owner's working hours." });
    }
  }
  const blackout = db.blackouts.find((b) => b.studioId === studioId && b.blackoutDate === bookingDate);
  if (blackout) {
    const blackStart = parseHHMM(blackout.startTime);
    const blackEnd = parseHHMM(blackout.endTime);
    const slotStart = parseTimeToMinutes(timeSlot);
    if (slotStart >= blackStart && slotStart < blackEnd) {
      return res.status(400).json({ success: false, message: `The studio is blocked on ${bookingDate} for: ${blackout.reason || "schedule closure"}.` });
    }
  }
  if (selectedService) {
    if (!selectedService.availableDays.includes(dayName) || !selectedService.availableSlots.includes(timeSlot)) {
      return res.status(400).json({ success: false, message: "The selected date or time is not available for this service." });
    }
  }
  const selectedAddons = (Array.isArray(addons) ? addons : []).reduce((validAddons, addon) => {
    const catalogAddon = db.addons.find((item) => item.id === addon.addonId && item.studioId === studioId);
    if (!catalogAddon) return validAddons;
    const quantity = Math.max(1, Number(addon.quantity) || 1);
    validAddons.push({ addonId: catalogAddon.id, quantity, price: Number(catalogAddon.price) });
    return validAddons;
  }, []);
  const calculatedTotal = (selectedPackage ? Number(selectedPackage.price) : Number(selectedService?.basePrice || 0)) + selectedAddons.reduce((sum, addon) => {
    return sum + addon.price * addon.quantity;
  }, 0);
  const normalizedPaymentOption = paymentOption === "Full Payment" ? "Full Payment" : "Downpayment";
  let shootDuration = 60;
  if (packageId) {
    const pkg = db.packages.find((p) => p.id === packageId);
    if (pkg?.durationMinutes) shootDuration = pkg.durationMinutes;
  } else if (serviceId) {
    const srv = db.services.find((s) => s.id === serviceId);
    if (srv?.durationMinutes) shootDuration = srv.durationMinutes;
  }
  const newStartMinutes = parseTimeToMinutes(timeSlot);
  const newEndMinutes = newStartMinutes + shootDuration;
  const overlappingBooking = db.bookings.find((b) => {
    if (b.studioId !== studioId || b.bookingDate !== bookingDate) return false;
    if (["Cancelled", "Rejected", "Expired"].includes(b.status)) return false;
    let existingDuration = 60;
    if (b.packageId) {
      const p = db.packages.find((pkg) => pkg.id === b.packageId);
      if (p?.durationMinutes) existingDuration = p.durationMinutes;
    } else if (b.serviceId) {
      const s = db.services.find((srv) => srv.id === b.serviceId);
      if (s?.durationMinutes) existingDuration = s.durationMinutes;
    }
    const existingStart = parseTimeToMinutes(b.timeSlot);
    const existingEnd = existingStart + existingDuration;
    return newStartMinutes < existingEnd && newEndMinutes > existingStart;
  });
  if (overlappingBooking) {
    return res.status(400).json({
      success: false,
      message: `Time slot conflict! Studio already has booking #${overlappingBooking.id} scheduled at ${overlappingBooking.timeSlot} on ${bookingDate}. Please choose another time.`
    });
  }
  const bookingId = generateId("BK-2026");
  const newBooking = {
    id: bookingId,
    studioId,
    customerId,
    serviceId,
    packageId,
    bookingDate,
    timeSlot,
    addons: selectedAddons,
    customerDetails,
    status: "Pending",
    totalAmount: calculatedTotal,
    amountPaid: 0,
    downPaymentAmount: normalizedPaymentOption === "Full Payment" ? calculatedTotal : Math.round(calculatedTotal * 0.3 * 100) / 100,
    remainingBalance: calculatedTotal,
    paymentStatus: "Unpaid",
    finalPaymentStatus: "Pending",
    paymentOption: normalizedPaymentOption,
    paymentDueAt: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addBooking(newBooking);
  notifyUser(customerId, "Booking Created", `Your booking at ${db.studios.find((s) => s.id === studioId)?.name} is successfully created. Complete payment to secure your slot!`, "info");
  const studioAdmin = db.users.find((u) => u.studioId === studioId && u.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */);
  if (studioAdmin) {
    notifyUser(studioAdmin.id, "New Booking Received", `A new booking (${bookingId}) has been made for ${bookingDate} at ${timeSlot}.`, "warning", studioId);
  }
  res.json({ success: true, booking: newBooking });
});
app.put("/api/bookings/:id/cancel", (req, res) => {
  const index = db.bookings.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }
  const booking = db.bookings[index];
  const user = requireBookingAccess(req, res, booking, false);
  if (!user) return;
  if (user.role !== "CUSTOMER" /* CUSTOMER */) {
    return res.status(403).json({ success: false, message: "Only the customer can cancel this booking." });
  }
  const cancellableStatuses = ["Pending", "Awaiting Payment", "Confirmed", "Rescheduled"];
  if (!cancellableStatuses.includes(booking.status)) {
    return res.status(400).json({ success: false, message: `Bookings in ${booking.status} status can no longer be cancelled.` });
  }
  const reason = String(req.body.reason || "Customer requested cancellation").trim();
  db.bookings[index] = {
    ...booking,
    status: "Cancelled",
    cancellationReason: reason || "Customer requested cancellation",
    cancelledBy: user.id,
    cancelledAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.save();
  const studio = db.studios.find((item) => item.id === booking.studioId);
  const studioOwner = studio ? db.users.find((item) => item.id === studio.ownerId) : void 0;
  const message = `Booking ${booking.id} for ${booking.bookingDate} at ${booking.timeSlot} was cancelled by the customer. Reason: ${reason || "Customer requested cancellation"}`;
  if (studioOwner) notifyUser(studioOwner.id, "Booking Cancelled by Customer", message, "warning", booking.studioId);
  notifyUser(user.id, "Booking Cancellation Confirmed", `Your booking ${booking.id} has been cancelled successfully.`, "success", booking.studioId);
  logAction(user.id, user.email, "Cancelled booking", "BOOKING", booking.id);
  res.json({ success: true, booking: db.bookings[index] });
});
app.put("/api/bookings/:id/assign-staff", (req, res) => {
  const index = db.bookings.findIndex((b) => b.id === req.params.id);
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
  db.bookings[index].assignedStaffId = staffId;
  db.bookings[index].assignedStaffName = staffName;
  db.save();
  logAction(user.id, user.email, `Assigned staff ${staffName} to booking ${booking.id}`, "BOOKING", booking.id);
  notifyUser(staffId, "Booking Assigned", `You have been assigned to shoot booking ${booking.id} on ${booking.bookingDate} at ${booking.timeSlot}.`, "info", booking.studioId);
  res.json({ success: true, booking: db.bookings[index] });
});
app.put("/api/bookings/:id/checklist", (req, res) => {
  const index = db.bookings.findIndex((b) => b.id === req.params.id);
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
  db.bookings[index].preShootChecklist = checklist;
  db.save();
  res.json({ success: true, booking: db.bookings[index] });
});
app.put("/api/bookings/:id/status", (req, res) => {
  const { status, amountPaid, paymentStatus } = req.body;
  const index = db.bookings.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }
  const original = db.bookings[index];
  const user = requireBookingAccess(req, res, original);
  if (!user || user.role === "CUSTOMER" /* CUSTOMER */) {
    if (user?.role === "CUSTOMER" /* CUSTOMER */) res.status(403).json({ success: false, message: "Customers cannot change booking status." });
    return;
  }
  const allowedTransitions = {
    Pending: ["Awaiting Payment", "Cancelled", "Expired"],
    "Awaiting Payment": ["Pending", "Confirmed", "Cancelled", "Expired"],
    Confirmed: ["Ongoing", "Completed", "Rescheduled", "Cancelled"],
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
    amountPaid: amountPaid !== void 0 ? Number(amountPaid) : original.amountPaid,
    paymentStatus: paymentStatus || original.paymentStatus
  };
  if ((status || original.status) === "Completed") {
    const existingProofing = db.photoProofings.find((p) => p.bookingId === original.id);
    if (!existingProofing) {
      const newGallery = {
        id: generateId("PRF"),
        bookingId: original.id,
        studioId: original.studioId,
        customerId: original.customerId,
        photos: [],
        watermarkText: `${db.studios.find((s) => s.id === original.studioId)?.name?.toUpperCase() || "CAINTA STUDIO"} - PROOF ONLY`,
        watermarkPosition: "repeat_diagonal",
        watermarkOpacity: 0.35,
        status: "sent_to_client",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.addPhotoProofing(newGallery);
      notifyUser(
        original.customerId,
        "Photo Proofing Gallery Ready",
        `Your photo proofing gallery for Booking #${original.id} is now ready for review.`,
        "success",
        original.studioId
      );
    }
  }
  db.save();
  notifyUser(original.customerId, `Booking Status Updated`, `Your booking ${original.id} status is now: ${status || original.status}`, "success");
  res.json({ success: true, booking: db.bookings[index] });
});
app.put("/api/bookings/:id/requirements", async (req, res) => {
  const { fileName, fileData } = req.body;
  const index = db.bookings.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }
  const user = requireBookingAccess(req, res, db.bookings[index], false);
  if (!user) return;
  if (user.role !== "CUSTOMER" /* CUSTOMER */) {
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
function syncBookingPaymentTotals(booking) {
  const bookingPayments = db.payments.filter((payment) => payment.bookingId === booking.id);
  const verifiedPayments = bookingPayments.filter((payment) => payment.paymentStatus === "Paid");
  const paidAmount = Math.min(booking.totalAmount, verifiedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0));
  const hasPendingPayment = bookingPayments.some((payment) => payment.paymentStatus === "Pending Verification");
  booking.amountPaid = paidAmount;
  booking.remainingBalance = Math.max(0, booking.totalAmount - paidAmount);
  booking.finalPaymentStatus = booking.remainingBalance === 0 ? "Paid" : "Pending";
  booking.paymentStatus = hasPendingPayment ? "Pending Verification" : booking.finalPaymentStatus === "Paid" ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Unpaid";
  if (booking.finalPaymentStatus === "Paid" || paidAmount >= booking.downPaymentAmount) {
    booking.status = "Confirmed";
  }
}
app.get("/api/payments", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { studioId, customerId } = req.query;
  let filtered = db.payments.map((p) => ({
    ...p,
    status: p.status || p.paymentStatus
  }));
  if (user.role === "CUSTOMER" /* CUSTOMER */) {
    filtered = filtered.filter((p) => p.customerId === user.id);
  } else if (user.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */ || user.role === "STUDIO_STAFF" /* STUDIO_STAFF */) {
    filtered = filtered.filter((p) => p.studioId === user.studioId);
  }
  if (studioId && user.role === "SUPER_ADMIN" /* SUPER_ADMIN */) filtered = filtered.filter((p) => p.studioId === studioId);
  if (customerId && user.role === "SUPER_ADMIN" /* SUPER_ADMIN */) filtered = filtered.filter((p) => p.customerId === customerId);
  res.json({ success: true, payments: filtered });
});
app.post("/api/payments", async (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { bookingId, amount, paymentMethod, referenceNumber, proofOfPayment, paymentType } = req.body;
  const booking = db.bookings.find((item) => item.id === bookingId);
  const paymentAmount = Number(amount);
  const requestedPaymentType = paymentType === "Full Payment" ? "Full Payment" : "Downpayment";
  if (!booking || user.role !== "CUSTOMER" /* CUSTOMER */ || booking.customerId !== user.id) {
    return res.status(400).json({ success: false, message: "The payment does not match a valid booking." });
  }
  if (["Cancelled", "Rejected", "Expired"].includes(booking.status)) {
    return res.status(400).json({ success: false, message: "This booking cannot accept a payment." });
  }
  const expectedAmount = requestedPaymentType === "Full Payment" ? booking.totalAmount : booking.downPaymentAmount;
  if (!Number.isFinite(paymentAmount) || Math.abs(paymentAmount - expectedAmount) > 0.01) {
    return res.status(400).json({ success: false, message: `The selected ${requestedPaymentType.toLowerCase()} must be exactly \u20B1${expectedAmount.toLocaleString()}.` });
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
  if (["Downpayment", "Full Payment"].includes(requestedPaymentType) && db.payments.some((payment) => payment.bookingId === bookingId && (payment.paymentType === requestedPaymentType || payment.paymentType === "Full Payment") && ["Pending Verification", "Paid"].includes(payment.paymentStatus))) {
    return res.status(400).json({ success: false, message: `A ${requestedPaymentType.toLowerCase()} has already been submitted for this booking.` });
  }
  if (referenceNumber && referenceNumber.trim()) {
    const cleanRef = referenceNumber.trim();
    const duplicatePayment = db.payments.find((p) => p.referenceNumber && p.referenceNumber.trim().toUpperCase() === cleanRef.toUpperCase());
    if (duplicatePayment) {
      return res.status(400).json({
        success: false,
        message: `Security Alert: Reference number '${cleanRef}' has already been submitted for Payment ${duplicatePayment.id}. Duplicate receipts are strictly rejected.`
      });
    }
  }
  const paymentId = generateId("PAY");
  const paymentMedia = proofOfPayment ? await saveProtectedMedia(user.id, "payment", paymentId, "PAYMENT_PROOF", proofOfPayment, "payment-proof") : null;
  const newPayment = {
    id: paymentId,
    bookingId,
    studioId: booking.studioId,
    customerId: booking.customerId,
    amount: paymentAmount,
    paymentType: requestedPaymentType,
    paymentMethod,
    paymentStatus: "Pending Verification",
    referenceNumber,
    proofOfPayment: paymentMedia ? `/api/media/${paymentMedia.mediaId}` : void 0,
    paymentDate: (/* @__PURE__ */ new Date()).toISOString(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    reviewedBy: void 0,
    reviewedAt: void 0
  };
  newPayment.status = "For Verification";
  db.addPayment(newPayment);
  logAction(user.id, user.email, `Submitted ${requestedPaymentType.toLowerCase()}`, "PAYMENT", paymentId);
  syncBookingPaymentTotals(booking);
  db.save();
  const studioAdmin = db.users.find((u) => u.studioId === booking.studioId && u.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */);
  if (studioAdmin) {
    notifyUser(
      studioAdmin.id,
      "Payment Submitted for Verification",
      `A ${paymentMethod} ${requestedPaymentType} for Booking ${bookingId} was submitted for studio verification. Your slot is not confirmed until the payment is verified.`,
      "info",
      booking.studioId
    );
  }
  notifyUser(
    booking.customerId,
    "Payment Submitted for Verification",
    `Your ${paymentMethod} ${requestedPaymentType} of \u20B1${paymentAmount.toLocaleString()} for Booking ${bookingId} is awaiting studio verification.`,
    "info",
    booking.studioId
  );
  res.json({ success: true, payment: newPayment });
});
app.get("/api/media/:id", async (req, res) => {
  const media = db.mediaFiles.find((item) => item.id === req.params.id && item.accessStatus === "active");
  if (!media) {
    return res.status(404).json({ success: false, message: "Media file not found." });
  }
  const publicPurposes = ["STUDIO_LOGO", "STUDIO_COVER", "SERVICE_IMAGE", "PACKAGE_IMAGE", "ADDON_IMAGE", "PRINT_PRODUCT_IMAGE", "SYSTEM_DEMO_VIDEO"];
  const relatedStudioId = media.entityType === "studio" ? media.entityId : media.entityType === "service" ? db.services.find((item) => item.id === media.entityId)?.studioId : media.entityType === "package" ? db.packages.find((item) => item.id === media.entityId)?.studioId : media.entityType === "print-product" ? db.printProducts.find((item) => item.id === media.entityId)?.studioId : media.entityType === "addon" ? db.addons.find((item) => item.id === media.entityId)?.studioId : void 0;
  const relatedStudio = relatedStudioId ? db.studios.find((item) => item.id === relatedStudioId) : void 0;
  const isPublicMedia = publicPurposes.includes(media.purpose) && !!relatedStudio && (relatedStudio.isApproved || relatedStudio.status === "approved") || media.purpose === "HERO_BACKGROUND" && media.entityType === "cms" && media.entityId === "heroBackground" || media.purpose === "SYSTEM_DEMO_VIDEO" && media.entityType === "system" && media.entityId === "demo-video";
  let user = null;
  if (isPublicMedia) {
    user = getAuthenticatedUser(req);
  } else {
    user = requireAuthenticatedUser(req, res);
    if (!user) return;
    if (!canAccessMedia(user, media)) {
      return res.status(404).json({ success: false, message: "Media file not found." });
    }
  }
  try {
    const fileBuffer = await import_promises.default.readFile(import_path2.default.join(MEDIA_ROOT, media.storageKey));
    res.type(media.mimeType);
    res.setHeader("Cache-Control", "private, no-store");
    return res.send(fileBuffer);
  } catch {
    return res.status(404).json({ success: false, message: "Media file is unavailable." });
  }
});
app.put("/api/payments/:id/verify", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { approved, reason } = req.body;
  const index = db.payments.findIndex((p) => p.id === req.params.id);
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
  const paymentBooking = db.bookings.find((item) => item.id === payment.bookingId);
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
  db.payments[index].status = approved ? "Verified" : "Rejected";
  db.payments[index].reviewedBy = user.id;
  db.payments[index].reviewedAt = (/* @__PURE__ */ new Date()).toISOString();
  db.payments[index].rejectionReason = approved ? void 0 : String(reason).trim();
  db.save();
  const bIndex = db.bookings.findIndex((b) => b.id === payment.bookingId);
  if (bIndex !== -1) {
    syncBookingPaymentTotals(db.bookings[bIndex]);
    if (!approved) db.bookings[bIndex].status = "Pending";
    db.save();
    const customer = db.customers.find((c) => c.id === db.bookings[bIndex].customerId) || db.users.find((u) => u.id === db.bookings[bIndex].customerId);
    if (approved && customer?.email) {
      const receiptDoc = buildBookingReceiptPDF(db.bookings[bIndex], db.studios.find((s) => s.id === payment.studioId), payment);
      const pdfBuffer = Buffer.from(receiptDoc.output("arraybuffer"));
      sendReceiptCopyEmail(
        customer.email,
        "Official Receipt Copy",
        `Your official receipt for Booking ${payment.bookingId} is attached here. Please keep this copy for your records.`,
        `Receipt_${payment.bookingId}_CaintaMIS.pdf`,
        pdfBuffer
      ).catch((err) => console.warn("[SMTP] Receipt copy email warning:", err));
    }
    notifyUser(
      db.bookings[bIndex].customerId,
      approved ? "Payment Verified & Slot Confirmed" : "Downpayment Rejected",
      approved ? `Your downpayment of \u20B1${payment.amount} has been verified for booking ${payment.bookingId}. Remaining balance: \u20B1${db.bookings[bIndex].remainingBalance}.` : `Your downpayment for booking ${payment.bookingId} was rejected. Reason: ${String(reason).trim()}`,
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
  const booking = db.bookings.find((item) => item.id === req.params.id);
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
    return res.status(400).json({ success: false, message: `Balance payment must be exactly \u20B1${booking.remainingBalance.toLocaleString()}.` });
  }
  const payment = {
    id: generateId("PAY"),
    bookingId: booking.id,
    studioId: booking.studioId,
    customerId: booking.customerId,
    amount,
    paymentType: "Balance",
    paymentMethod: req.body.paymentMethod || "Cash",
    paymentStatus: "Paid",
    referenceNumber: req.body.referenceNumber,
    paymentDate: (/* @__PURE__ */ new Date()).toISOString(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addPayment(payment);
  syncBookingPaymentTotals(booking);
  db.save();
  const customer = db.customers.find((c) => c.id === booking.customerId) || db.users.find((u) => u.id === booking.customerId);
  if (customer?.email) {
    const receiptDoc = buildBookingReceiptPDF(booking, db.studios.find((s) => s.id === booking.studioId), payment);
    const pdfBuffer = Buffer.from(receiptDoc.output("arraybuffer"));
    sendReceiptCopyEmail(
      customer.email,
      "Final Payment Receipt Copy",
      `Your final payment receipt for Booking ${booking.id} is attached here. Thank you for choosing Cainta Photography Studio.`,
      `Receipt_${booking.id}_CaintaMIS.pdf`,
      pdfBuffer
    ).catch((err) => console.warn("[SMTP] Final receipt copy email warning:", err));
  }
  notifyUser(booking.customerId, "Final Payment Recorded", `Your final payment of \u20B1${amount} has been recorded at the studio. Your booking is fully paid.`, "success", booking.studioId);
  res.json({ success: true, payment, booking });
});
app.get("/api/photo-proofing/booking/:bookingId", (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.bookingId);
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
  if (!requireBookingAccess(req, res, booking)) return;
  const gallery = db.photoProofings.find((p) => p.bookingId === req.params.bookingId);
  res.json({ success: true, gallery: gallery || null });
});
app.post("/api/photo-proofing", (req, res) => {
  const { bookingId, studioId, customerId, photos, watermarkText, watermarkPosition, watermarkOpacity } = req.body;
  const booking = db.bookings.find((item) => item.id === bookingId);
  if (!booking || booking.studioId !== studioId || booking.customerId !== customerId) {
    return res.status(400).json({ success: false, message: "Gallery details do not match a valid booking." });
  }
  const user = requireStudioAccess(req, res, studioId);
  if (!user) return;
  const proofingId = generateId("PRF");
  const newGallery = {
    id: proofingId,
    bookingId,
    studioId,
    customerId,
    photos: photos || [],
    watermarkText: watermarkText || "PROOF - CAINTA STUDIO",
    watermarkPosition: watermarkPosition || "repeat_diagonal",
    watermarkOpacity: watermarkOpacity !== void 0 ? watermarkOpacity : 0.35,
    status: "sent_to_client",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addPhotoProofing(newGallery);
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
  const index = db.photoProofings.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Photo proofing gallery not found." });
  }
  const existing = db.photoProofings[index];
  const booking = db.bookings.find((item) => item.id === existing.bookingId);
  if (!booking || !requireBookingAccess(req, res, booking)) return;
  const user = getAuthenticatedUser(req);
  const studioOperator = user && user.role !== "CUSTOMER" /* CUSTOMER */;
  if (studioOperator && user?.role !== "SUPER_ADMIN" /* SUPER_ADMIN */ && user?.studioId !== existing.studioId) {
    return res.status(403).json({ success: false, message: "You do not have access to this gallery." });
  }
  if (user?.role === "CUSTOMER" /* CUSTOMER */ && status && status !== "client_reviewed") {
    return res.status(403).json({ success: false, message: "Customers can only submit gallery selections." });
  }
  db.photoProofings[index] = {
    ...existing,
    photos: photos || existing.photos,
    status: status || existing.status,
    watermarkText: watermarkText || existing.watermarkText,
    watermarkOpacity: watermarkOpacity !== void 0 ? watermarkOpacity : existing.watermarkOpacity,
    watermarkPosition: watermarkPosition || existing.watermarkPosition,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.save();
  if (status === "client_reviewed") {
    const studioAdmin = db.users.find((u) => u.studioId === existing.studioId && u.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */);
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
  const index = db.photoProofings.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Photo proofing gallery not found." });
  }
  const existing = db.photoProofings[index];
  if (!requireStudioAccess(req, res, existing.studioId)) return;
  db.photoProofings[index] = {
    ...existing,
    finalDriveLink: finalDriveLink || existing.finalDriveLink,
    status: status || "completed",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.save();
  notifyUser(
    existing.customerId,
    "Final High-Res Photos Delivered!",
    `Your high-resolution edited photoshoot files are ready for download! Access them via your Customer Dashboard portal.`,
    "success",
    existing.studioId
  );
  res.json({ success: true, gallery: db.photoProofings[index] });
});
app.put("/api/notifications/:id/read", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const index = db.notifications.findIndex((n) => n.id === req.params.id);
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
  const actor = requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */, "STUDIO_ADMIN" /* STUDIO_ADMIN */);
  if (!actor) return;
  const { userId, studioId, channel, recipientContact, title, message, type } = req.body;
  const targetUser = db.users.find((u) => u.id === userId) || db.customers.find((c) => c.id === userId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "Notification recipient not found." });
  }
  const targetStudioId = "studioId" in targetUser ? targetUser.studioId : void 0;
  if (studioId && targetUser.role !== "SUPER_ADMIN" /* SUPER_ADMIN */ && targetStudioId !== studioId) {
    return res.status(403).json({ success: false, message: "Notification target is outside the user's studio." });
  }
  const notif = {
    id: generateId("DISPATCH"),
    userId,
    studioId,
    title: title || `${channel || "App"} Notification`,
    message,
    isRead: false,
    type: type || "info",
    channel: channel || "SMS",
    recipientContact: recipientContact || "+63 900 000 0000",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addNotification(notif);
  res.json({ success: true, notification: notif });
});
app.get("/api/print-products", (req, res) => {
  const { studioId } = req.query;
  const filtered = (studioId ? db.printProducts.filter((p) => p.studioId === studioId) : db.printProducts).filter((product) => product.isActive !== false).map((product) => {
    const images = db.mediaFiles.filter((media) => media.entityType === "print-product" && media.entityId === product.id && media.purpose === "PRINT_PRODUCT_IMAGE" && media.accessStatus === "active").map((media) => `/api/media/${media.id}`);
    return { ...product, images: images.length > 0 ? images : product.images?.length ? product.images : [product.image] };
  });
  res.json({ success: true, products: filtered, printProducts: filtered });
});
app.post("/api/print-products", async (req, res) => {
  const { studioId, name, description, size, price, image, images, estimatedHours } = req.body;
  const user = requireStudioAccess(req, res, studioId);
  if (!user) return;
  const submittedImages = Array.isArray(images) ? images.filter((value) => typeof value === "string" && value.length > 0) : [];
  const firstImage = submittedImages[0] || image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&fit=crop";
  const newProd = {
    id: generateId("PRD"),
    studioId,
    name,
    description,
    size,
    price: Number(price),
    image: firstImage,
    images: submittedImages,
    inStock: true,
    estimatedHours: Number(estimatedHours) || 24,
    isActive: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addPrintProduct(newProd);
  const savedImages = [];
  for (let index = 0; index < submittedImages.length; index += 1) {
    const media = await saveProtectedMedia(user.id, "print-product", newProd.id, "PRINT_PRODUCT_IMAGE", submittedImages[index], `print-product-${index + 1}`);
    if (!media) {
      return res.status(400).json({ success: false, message: "Each catalog image must be a JPEG, PNG, or WebP image smaller than 8 MB." });
    }
    savedImages.push(`/api/media/${media.mediaId}`);
  }
  if (savedImages.length > 0) {
    newProd.image = savedImages[0];
    newProd.images = savedImages;
    db.printProducts[db.printProducts.length - 1] = newProd;
    await db.save();
  }
  res.json({ success: true, product: newProd });
});
app.delete("/api/print-products/:id", async (req, res) => {
  const index = db.printProducts.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }
  if (!requireStudioAccess(req, res, db.printProducts[index].studioId)) return;
  db.printProducts[index].isActive = false;
  try {
    await db.save();
  } catch {
    return res.status(500).json({ success: false, message: "Product could not be removed from storage." });
  }
  res.json({ success: true, message: "Print product removed." });
});
app.put("/api/print-products/:id", async (req, res) => {
  const index = db.printProducts.findIndex((product2) => product2.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: "Product not found." });
  const product = db.printProducts[index];
  const user = requireStudioAccess(req, res, product.studioId);
  if (!user) return;
  const { name, description, size, price, images, estimatedHours } = req.body;
  if (!String(name || "").trim() || !String(size || "").trim() || !Number.isFinite(Number(price))) {
    return res.status(400).json({ success: false, message: "Name, size, and a valid price are required." });
  }
  const submittedImages = Array.isArray(images) ? images.filter((value) => typeof value === "string" && value.length > 0) : [];
  const savedImages = [];
  for (let imageIndex = 0; imageIndex < submittedImages.length; imageIndex += 1) {
    const media = await saveProtectedMedia(user.id, "print-product", product.id, "PRINT_PRODUCT_IMAGE", submittedImages[imageIndex], `print-product-${imageIndex + 1}`);
    if (!media) return res.status(400).json({ success: false, message: "Each catalog image must be a JPEG, PNG, or WebP image smaller than 8 MB." });
    savedImages.push(`/api/media/${media.mediaId}`);
  }
  if (savedImages.length > 0) {
    db.mediaFiles.filter((media) => media.entityType === "print-product" && media.entityId === product.id && media.purpose === "PRINT_PRODUCT_IMAGE").forEach((media) => {
      media.accessStatus = "deleted";
    });
  }
  db.printProducts[index] = {
    ...product,
    name: String(name).trim(),
    description: String(description || "Premium photo print option.").trim(),
    size: String(size).trim(),
    price: Number(price),
    estimatedHours: Number(estimatedHours) || 24,
    ...savedImages.length > 0 ? { image: savedImages[0], images: savedImages } : {}
  };
  await db.save();
  res.json({ success: true, product: db.printProducts[index] });
});
app.get("/api/print-orders", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { customerId, studioId } = req.query;
  let filtered = db.printOrders;
  if (user.role === "CUSTOMER" /* CUSTOMER */) filtered = filtered.filter((o) => o.customerId === user.id);
  else if (user.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */ || user.role === "STUDIO_STAFF" /* STUDIO_STAFF */) filtered = filtered.filter((o) => o.studioId === user.studioId);
  if (customerId && user.role === "SUPER_ADMIN" /* SUPER_ADMIN */) filtered = filtered.filter((o) => o.customerId === customerId);
  if (studioId && user.role === "SUPER_ADMIN" /* SUPER_ADMIN */) filtered = filtered.filter((o) => o.studioId === studioId);
  res.json({ success: true, printOrders: filtered });
});
app.post("/api/print-orders", async (req, res) => {
  const { studioId, customerId, productId, quantity, uploadedPhoto, totalAmount, paymentMethod, referenceNumber, proofOfPayment, shippingAddress } = req.body;
  const user = requireRole(req, res, "CUSTOMER" /* CUSTOMER */);
  if (!user) return;
  if (customerId !== user.id) return res.status(403).json({ success: false, message: "Customer identity is derived from the authenticated session." });
  const product = db.printProducts.find((item) => item.id === productId && item.studioId === studioId && item.isActive && item.inStock);
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
  if (shippingAddress !== void 0 && !String(shippingAddress).trim()) {
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
  const paymentMedia = proofOfPayment ? await saveProtectedMedia(user.id, "print-order", orderId, "PAYMENT_PROOF", proofOfPayment, "print-payment-proof") : null;
  const newOrder = {
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
    proofOfPayment: paymentMedia ? `/api/media/${paymentMedia.mediaId}` : void 0,
    referenceNumber: String(referenceNumber || "").trim() || void 0,
    shippingAddress: String(shippingAddress || "").trim() || void 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addPrintOrder(newOrder);
  const studioAdmin = db.users.find((u) => u.studioId === studioId && u.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */);
  if (studioAdmin) {
    notifyUser(studioAdmin.id, "New Print Order", `A new print order (${orderId}) has been received.`, "warning", studioId);
  }
  res.json({ success: true, printOrder: newOrder });
});
app.put("/api/print-orders/:id/cancel", (req, res) => {
  const index = db.printOrders.findIndex((o) => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Print order not found." });
  }
  const order = db.printOrders[index];
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const canCancel = user.role === "CUSTOMER" /* CUSTOMER */ && order.customerId === user.id || user.role === "SUPER_ADMIN" /* SUPER_ADMIN */ || (user.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */ || user.role === "STUDIO_STAFF" /* STUDIO_STAFF */) && user.studioId === order.studioId;
  if (!canCancel) {
    return res.status(403).json({ success: false, message: "You cannot cancel this print order." });
  }
  const cancellableStatuses = ["Pending", "Confirmed", "Processing", "Quality Check", "Ready for Pickup", "Out for Delivery"];
  if (!cancellableStatuses.includes(order.status)) {
    return res.status(400).json({ success: false, message: `Print orders in ${order.status} status cannot be cancelled.` });
  }
  const reason = String(req.body?.reason || "Customer requested cancellation").trim();
  db.printOrders[index] = {
    ...order,
    status: "Cancelled",
    paymentStatus: order.paymentStatus === "Paid" ? "Paid" : order.paymentStatus
  };
  db.save();
  notifyUser(order.customerId, "Print Order Cancelled", `Your print order ${order.id} has been cancelled. ${reason ? `Reason: ${reason}` : ""}`.trim(), "warning");
  res.json({ success: true, printOrder: db.printOrders[index] });
});
app.put("/api/print-orders/:id/status", (req, res) => {
  const { status } = req.body;
  const index = db.printOrders.findIndex((o) => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Print order not found." });
  }
  const original = db.printOrders[index];
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const canManage = user.role === "SUPER_ADMIN" /* SUPER_ADMIN */ || (user.role === "STUDIO_ADMIN" /* STUDIO_ADMIN */ || user.role === "STUDIO_STAFF" /* STUDIO_STAFF */) && user.studioId === original.studioId;
  if (!canManage) return res.status(403).json({ success: false, message: "You cannot update this print order." });
  const allowedTransitions = {
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
  const index = db.printOrders.findIndex((order2) => order2.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: "Print order not found." });
  const order = db.printOrders[index];
  const amount = Number(req.body.amount);
  if (user.role !== "CUSTOMER" /* CUSTOMER */ || order.customerId !== user.id) {
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
    proofOfPayment: media ? `/api/media/${media.mediaId}` : void 0,
    referenceNumber: String(req.body.referenceNumber || "").trim() || void 0
  };
  db.save();
  res.json({ success: true, printOrder: db.printOrders[index] });
});
app.put("/api/print-orders/:id/payment/verify", (req, res) => {
  const user = requireStudioAccess(req, res, db.printOrders.find((order) => order.id === req.params.id)?.studioId || "");
  if (!user) return;
  const index = db.printOrders.findIndex((order) => order.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: "Print order not found." });
  const { approved, reason } = req.body;
  if (typeof approved !== "boolean") return res.status(400).json({ success: false, message: "An explicit approval decision is required." });
  if (!approved && !String(reason || "").trim()) return res.status(400).json({ success: false, message: "A rejection reason is required." });
  if (db.printOrders[index].paymentStatus !== "Pending Verification") return res.status(400).json({ success: false, message: "Only pending print payments can be verified." });
  db.printOrders[index].paymentStatus = approved ? "Paid" : "Unpaid";
  db.save();
  const customer = db.customers.find((c) => c.id === db.printOrders[index].customerId) || db.users.find((u) => u.id === db.printOrders[index].customerId);
  if (approved && customer?.email) {
    const product = db.printProducts.find((p) => p.id === db.printOrders[index].productId);
    const receiptDoc = buildPrintOrderReceiptPDF(db.printOrders[index], db.studios.find((s) => s.id === db.printOrders[index].studioId), product);
    const pdfBuffer = Buffer.from(receiptDoc.output("arraybuffer"));
    sendReceiptCopyEmail(
      customer.email,
      "Print Order Receipt Copy",
      `Your payment receipt for Print Order ${db.printOrders[index].id} is attached here.`,
      `Print_Order_${db.printOrders[index].id}_Receipt.pdf`,
      pdfBuffer
    ).catch((err) => console.warn("[SMTP] Print receipt copy email warning:", err));
  }
  res.json({ success: true, printOrder: db.printOrders[index] });
});
app.put("/api/print-orders/:id/payment/record-cash", (req, res) => {
  const user = requireStudioAccess(req, res, db.printOrders.find((order) => order.id === req.params.id)?.studioId || "");
  if (!user) return;
  const index = db.printOrders.findIndex((order) => order.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: "Print order not found." });
  if (db.printOrders[index].paymentStatus === "Paid") {
    return res.status(400).json({ success: false, message: "Order is already paid." });
  }
  db.printOrders[index].paymentStatus = "Paid";
  db.printOrders[index].paymentMethod = "Cash";
  db.save();
  const customer = db.customers.find((c) => c.id === db.printOrders[index].customerId) || db.users.find((u) => u.id === db.printOrders[index].customerId);
  if (customer?.email) {
    const product = db.printProducts.find((p) => p.id === db.printOrders[index].productId);
    const receiptDoc = buildPrintOrderReceiptPDF(db.printOrders[index], db.studios.find((s) => s.id === db.printOrders[index].studioId), product);
    const pdfBuffer = Buffer.from(receiptDoc.output("arraybuffer"));
    sendReceiptCopyEmail(
      customer.email,
      "Print Order Receipt Copy",
      `Your cash payment receipt for Print Order ${db.printOrders[index].id} is attached here.`,
      `Print_Order_${db.printOrders[index].id}_Receipt.pdf`,
      pdfBuffer
    ).catch((err) => console.warn("[SMTP] Print receipt copy email warning:", err));
  }
  res.json({ success: true, printOrder: db.printOrders[index] });
});
app.post("/api/reviews", (req, res) => {
  const { studioId, customerId, customerName, bookingId, rating, comment } = req.body;
  const user = requireRole(req, res, "CUSTOMER" /* CUSTOMER */);
  if (!user) return;
  if (customerId !== user.id) return res.status(403).json({ success: false, message: "Customer identity is derived from the authenticated session." });
  const completedBooking = db.bookings.find((b) => b.id === bookingId && b.customerId === customerId && b.status === "Completed");
  if (!completedBooking) {
    return res.status(400).json({ success: false, message: "You can only review completed bookings." });
  }
  const alreadyReviewed = db.reviews.some((r) => r.bookingId === bookingId);
  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: "You have already reviewed this booking." });
  }
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || !String(comment || "").trim()) {
    return res.status(400).json({ success: false, message: "A rating from 1 to 5 and a comment are required." });
  }
  const reviewId = generateId("REV");
  const newReview = {
    id: reviewId,
    studioId,
    customerId,
    customerName,
    bookingId,
    rating: Number(rating),
    comment,
    status: "pending",
    // Requires admin approval before going public
    isVisible: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addReview(newReview);
  logAction(customerId, customerName, `Submitted review REV-${reviewId} for studio ${studioId}`, "REVIEW", reviewId);
  res.json({ success: true, review: newReview, message: "Your review has been submitted and is pending admin approval." });
});
app.get("/api/admin/reviews", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const allReviews = [...db.reviews].sort((a, b) => {
    const order = { pending: 0, approved: 1, rejected: 2 };
    return (order[a.status] ?? 1) - (order[b.status] ?? 1);
  });
  res.json({ success: true, reviews: allReviews });
});
app.put("/api/admin/reviews/:id/approve", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const { id } = req.params;
  const idx = db.reviews.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Review not found." });
  db.reviews[idx].status = "approved";
  db.save();
  const studioId = db.reviews[idx].studioId;
  const studioIdx = db.studios.findIndex((s) => s.id === studioId);
  if (studioIdx !== -1) {
    const approvedReviews = db.reviews.filter((r) => r.studioId === studioId && r.status === "approved");
    const avgRating = approvedReviews.length > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length : 0;
    db.studios[studioIdx].rating = parseFloat(avgRating.toFixed(1));
    db.studios[studioIdx].reviewCount = approvedReviews.length;
    db.save();
  }
  logAction("SYSTEM", "system@admin", `Approved review ${id}`, "REVIEW", id);
  res.json({ success: true, review: db.reviews[idx] });
});
app.put("/api/admin/reviews/:id/reject", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const { id } = req.params;
  const idx = db.reviews.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Review not found." });
  db.reviews[idx].status = "rejected";
  db.save();
  const studioId = db.reviews[idx].studioId;
  const studioIdx = db.studios.findIndex((s) => s.id === studioId);
  if (studioIdx !== -1) {
    const approvedReviews = db.reviews.filter((r) => r.studioId === studioId && r.status === "approved");
    const avgRating = approvedReviews.length > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length : 0;
    db.studios[studioIdx].rating = parseFloat(avgRating.toFixed(1));
    db.studios[studioIdx].reviewCount = approvedReviews.length;
    db.save();
  }
  logAction("SYSTEM", "system@admin", `Rejected review ${id}`, "REVIEW", id);
  res.json({ success: true, review: db.reviews[idx] });
});
app.delete("/api/admin/reviews/:id", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const { id } = req.params;
  const idx = db.reviews.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Review not found." });
  const studioId = db.reviews[idx].studioId;
  db.reviews.splice(idx, 1);
  db.save();
  const studioIdx = db.studios.findIndex((s) => s.id === studioId);
  if (studioIdx !== -1) {
    const approvedReviews = db.reviews.filter((r) => r.studioId === studioId && r.status === "approved");
    const avgRating = approvedReviews.length > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length : 0;
    db.studios[studioIdx].rating = parseFloat(avgRating.toFixed(1));
    db.studios[studioIdx].reviewCount = approvedReviews.length;
    db.save();
  }
  logAction("SYSTEM", "system@admin", `Deleted review ${id}`, "REVIEW", id);
  res.json({ success: true, message: "Review deleted successfully." });
});
app.get("/api/studio/reviews", (req, res) => {
  const { studioId } = req.query;
  if (!studioId) return res.status(400).json({ success: false, message: "studioId is required." });
  if (!requireStudioAccess(req, res, String(studioId))) return;
  const studioReviews = db.reviews.filter((r) => r.studioId === studioId && r.status !== "rejected").map((r) => ({ ...r, isVisible: r.isVisible !== false })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, reviews: studioReviews });
});
app.put("/api/studio/reviews/:id/visibility", (req, res) => {
  const { id } = req.params;
  const { studioId, visible } = req.body;
  if (!studioId) return res.status(400).json({ success: false, message: "studioId is required." });
  if (!requireStudioAccess(req, res, studioId)) return;
  const idx = db.reviews.findIndex((r) => r.id === id && r.studioId === studioId);
  if (idx === -1) return res.status(404).json({ success: false, message: "Review not found or not yours." });
  db.reviews[idx].isVisible = Boolean(visible);
  db.save();
  logAction(studioId, studioId, `Studio changed review ${id} visibility to ${Boolean(visible) ? "public" : "hidden"}`, "REVIEW", id);
  res.json({ success: true, review: db.reviews[idx] });
});
app.put("/api/studio/reviews/:id/reply", (req, res) => {
  const { id } = req.params;
  const { reply, studioId } = req.body;
  if (!reply || !studioId) return res.status(400).json({ success: false, message: "reply and studioId are required." });
  if (!requireStudioAccess(req, res, studioId)) return;
  const idx = db.reviews.findIndex((r) => r.id === id && r.studioId === studioId);
  if (idx === -1) return res.status(404).json({ success: false, message: "Review not found or not yours." });
  db.reviews[idx].reply = reply;
  db.reviews[idx].replyAt = (/* @__PURE__ */ new Date()).toISOString();
  db.save();
  logAction(studioId, studioId, `Studio replied to review ${id}`, "REVIEW", id);
  res.json({ success: true, review: db.reviews[idx] });
});
app.get("/api/favorites", (req, res) => {
  const { customerId } = req.query;
  const user = requireRole(req, res, "CUSTOMER" /* CUSTOMER */);
  if (!user) return;
  if (customerId !== user.id) return res.status(403).json({ success: false, message: "Favorite access is limited to the authenticated customer." });
  const filtered = db.favorites.filter((f) => f.customerId === customerId);
  res.json({ success: true, favorites: filtered });
});
app.post("/api/favorites", (req, res) => {
  const { customerId, studioId } = req.body;
  const user = requireRole(req, res, "CUSTOMER" /* CUSTOMER */);
  if (!user) return;
  if (customerId !== user.id) return res.status(403).json({ success: false, message: "Customer identity is derived from the authenticated session." });
  const exists = db.favorites.find((f) => f.customerId === customerId && f.studioId === studioId);
  if (exists) {
    return res.json({ success: true, message: "Already favorited" });
  }
  const newFav = {
    id: generateId("FAV"),
    customerId,
    studioId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addFavorite(newFav);
  res.json({ success: true, favorite: newFav });
});
app.delete("/api/favorites", (req, res) => {
  const { customerId, studioId } = req.body;
  const user = requireRole(req, res, "CUSTOMER" /* CUSTOMER */);
  if (!user) return;
  if (customerId !== user.id) return res.status(403).json({ success: false, message: "Customer identity is derived from the authenticated session." });
  const index = db.favorites.findIndex((f) => f.customerId === customerId && f.studioId === studioId);
  if (index !== -1) {
    db.favorites.splice(index, 1);
    db.save();
  }
  res.json({ success: true, message: "Favorite removed." });
});
app.get("/api/chatbot/faqs", (req, res) => {
  const { studioId } = req.query;
  const filtered = studioId ? db.faqs.filter((f) => f.studioId === studioId || f.studioId === "GLOBAL") : db.faqs;
  res.json({ success: true, faqs: filtered });
});
app.get("/api/chatbot/faq-suggestions", (_req, res) => {
  const suggestions = Array.from(faqSuggestionStore.values()).filter((s) => s.frequency >= 2).sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
  res.json({ success: true, suggestions });
});
app.post("/api/chatbot/faq-suggestions/:id/approve", (req, res) => {
  const suggestion = Array.from(faqSuggestionStore.values()).find((s) => s.id === req.params.id);
  if (!suggestion) {
    return res.status(404).json({ success: false, message: "Suggested FAQ not found." });
  }
  const newFAQ = {
    id: generateId("FAQ"),
    studioId: suggestion.studioId || "GLOBAL",
    question: suggestion.question,
    answer: suggestion.answer,
    category: suggestion.category || "Suggested",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    frequency: suggestion.frequency,
    isSuggestion: false,
    source: "chatbot"
  };
  db.addFAQ(newFAQ);
  faqSuggestionStore.delete(normalizeFaqQuestion(suggestion.question));
  res.json({ success: true, faq: newFAQ });
});
app.post("/api/chatbot/faqs", (req, res) => {
  const { studioId, question, answer, category } = req.body;
  if (!requireStudioAccess(req, res, studioId)) return;
  const newFAQ = {
    id: generateId("FAQ"),
    studioId,
    question,
    answer,
    category: category || "FAQ",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addFAQ(newFAQ);
  res.json({ success: true, faq: newFAQ });
});
app.delete("/api/chatbot/faqs/:id", (req, res) => {
  const index = db.faqs.findIndex((f) => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "FAQ not found." });
  }
  if (!requireStudioAccess(req, res, db.faqs[index].studioId)) return;
  db.faqs.splice(index, 1);
  db.save();
  res.json({ success: true, message: "FAQ removed." });
});
app.get("/api/notifications", (req, res) => {
  const { userId } = req.query;
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  if (userId !== user.id) return res.status(403).json({ success: false, message: "Notification access is limited to the authenticated user." });
  const filtered = db.notifications.filter((n) => n.userId === userId);
  res.json({ success: true, notifications: filtered });
});
app.put("/api/notifications/mark-read", (req, res) => {
  const { userId, notifId } = req.body;
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  if (userId && userId !== user.id) return res.status(403).json({ success: false, message: "Notification access is limited to the authenticated user." });
  if (notifId) {
    const notif = db.notifications.find((n) => n.id === notifId);
    if (notif) {
      notif.isRead = true;
      db.save();
    }
  } else if (userId) {
    db.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    db.save();
  }
  res.json({ success: true });
});
app.get("/api/audit-logs", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  res.json({ success: true, logs: db.auditLogs, auditLogs: db.auditLogs });
});
app.get("/api/reports/sales", (req, res) => {
  const user = requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */, "STUDIO_ADMIN" /* STUDIO_ADMIN */, "STUDIO_STAFF" /* STUDIO_STAFF */);
  if (!user) return;
  const { studioId, startDate, endDate } = req.query;
  const scopedStudioId = user.role === "SUPER_ADMIN" /* SUPER_ADMIN */ ? studioId : "studioId" in user ? user.studioId : void 0;
  let targetBookings = db.bookings.filter((b) => !["Cancelled", "Expired", "Rejected"].includes(b.status));
  let targetPrints = db.printOrders.filter((p) => !["Cancelled"].includes(p.status));
  if (scopedStudioId) {
    targetBookings = targetBookings.filter((b) => b.studioId === scopedStudioId);
    targetPrints = targetPrints.filter((p) => p.studioId === scopedStudioId);
  }
  if (startDate) {
    targetBookings = targetBookings.filter((b) => b.bookingDate >= startDate);
    targetPrints = targetPrints.filter((p) => p.createdAt >= startDate);
  }
  if (endDate) {
    targetBookings = targetBookings.filter((b) => b.bookingDate <= endDate);
    targetPrints = targetPrints.filter((p) => p.createdAt <= endDate);
  }
  const bookingSales = targetBookings.reduce((sum, b) => sum + db.payments.filter((p) => p.bookingId === b.id && p.paymentStatus === "Paid").reduce((paymentSum, p) => paymentSum + Number(p.amount), 0), 0);
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
  const user = requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */, "STUDIO_ADMIN" /* STUDIO_ADMIN */, "STUDIO_STAFF" /* STUDIO_STAFF */);
  if (!user) return;
  const { studioId } = req.query;
  let targetBookings = db.bookings;
  const scopedStudioId = user.role === "SUPER_ADMIN" /* SUPER_ADMIN */ ? studioId : "studioId" in user ? user.studioId : void 0;
  if (scopedStudioId) {
    targetBookings = targetBookings.filter((b) => b.studioId === scopedStudioId);
  }
  const statusCounts = targetBookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  const months = Array.from({ length: 12 }, (_, index) => new Date((/* @__PURE__ */ new Date()).getFullYear(), index, 1).toLocaleDateString("en-US", { month: "short" }));
  const trend = months.map((m) => {
    const val = db.bookings.filter((b) => {
      if (scopedStudioId && b.studioId !== scopedStudioId) return false;
      const bMonth = new Date(b.createdAt).getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[bMonth].substring(0, 3) === m && db.payments.some((p) => p.bookingId === b.id && p.paymentStatus === "Paid");
    });
    const printVal = db.printOrders.filter((p) => {
      if (scopedStudioId && p.studioId !== scopedStudioId) return false;
      const pMonth = new Date(p.createdAt).getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[pMonth].substring(0, 3) === m && p.paymentStatus === "Paid";
    });
    return {
      name: m,
      bookings: val.length,
      revenue: val.reduce((sum, b) => sum + db.payments.filter((p) => p.bookingId === b.id && p.paymentStatus === "Paid").reduce((paid, p) => paid + Number(p.amount), 0), 0) + printVal.reduce((sum, p) => sum + p.totalAmount, 0),
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
  const user = requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */, "STUDIO_ADMIN" /* STUDIO_ADMIN */);
  if (!user) return;
  const { studioId, date } = req.query;
  const targetStudioId = user.role === "SUPER_ADMIN" /* SUPER_ADMIN */ ? studioId : "studioId" in user ? user.studioId : void 0;
  const targetDate = date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const verifiedPayments = db.payments.filter((p) => {
    if (targetStudioId && p.studioId !== targetStudioId) return false;
    if (p.paymentStatus !== "Paid") return false;
    const paymentDay = (p.paymentDate || p.createdAt || "").split("T")[0];
    return paymentDay === targetDate;
  });
  const verifiedPrints = db.printOrders.filter((pr) => {
    if (targetStudioId && pr.studioId !== targetStudioId) return false;
    if (pr.paymentStatus !== "Paid") return false;
    const printDay = (pr.createdAt || "").split("T")[0];
    return printDay === targetDate;
  });
  const totalDownpayments = verifiedPayments.filter((p) => p.paymentType === "Downpayment").reduce((sum, p) => sum + Number(p.amount), 0);
  const totalBalanceCollections = verifiedPayments.filter((p) => p.paymentType === "Balance").reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPrintRevenue = verifiedPrints.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const grossCollections = totalDownpayments + totalBalanceCollections + totalPrintRevenue;
  const byMethod = {
    cash: verifiedPayments.filter((p) => p.paymentMethod === "Cash").reduce((s, p) => s + Number(p.amount), 0) + verifiedPrints.filter((p) => p.paymentMethod === "Cash").reduce((s, p) => s + Number(p.totalAmount), 0),
    gcash: verifiedPayments.filter((p) => p.paymentMethod === "GCash").reduce((s, p) => s + Number(p.amount), 0) + verifiedPrints.filter((p) => p.paymentMethod === "GCash").reduce((s, p) => s + Number(p.totalAmount), 0),
    bankTransfer: verifiedPayments.filter((p) => p.paymentMethod === "Bank Transfer").reduce((s, p) => s + Number(p.amount), 0) + verifiedPrints.filter((p) => p.paymentMethod === "Bank Transfer").reduce((s, p) => s + Number(p.totalAmount), 0),
    online: verifiedPayments.filter((p) => p.paymentMethod === "Online Payment").reduce((s, p) => s + Number(p.amount), 0) + verifiedPrints.filter((p) => p.paymentMethod === "Online Payment").reduce((s, p) => s + Number(p.totalAmount), 0)
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
      transactions: verifiedPayments.map((p) => ({
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
  const user = requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */, "STUDIO_ADMIN" /* STUDIO_ADMIN */);
  if (!user) return;
  const { entityType, entityId, limit } = req.query;
  let events = [...db.auditLogs];
  if (entityType) {
    events = events.filter((e) => e.entityType.toLowerCase() === String(entityType).toLowerCase());
  }
  if (entityId) {
    events = events.filter((e) => e.entityId === String(entityId));
  }
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const maxLimit = Number(limit) || 100;
  res.json({ success: true, auditEvents: events.slice(0, maxLimit) });
});
setInterval(() => {
  const now = /* @__PURE__ */ new Date();
  let updated = false;
  for (const b of db.bookings) {
    if (["Pending", "Awaiting Payment"].includes(b.status) && b.paymentDueAt && new Date(b.paymentDueAt) <= now && b.amountPaid < b.downPaymentAmount) {
      const hasPendingProof = db.payments.some((p) => p.bookingId === b.id && p.paymentStatus === "Pending Verification");
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
}, 60 * 1e3);
app.post("/api/chatbot/message", async (req, res) => {
  const { message, studioId, history } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: "Query message is required." });
  }
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const validGeminiKey = Boolean(
    apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.startsWith("AIza") && apiKey.length >= 39
  );
  if (!validGeminiKey) {
    console.warn("[Chatbot] Rejecting Gemini request: GEMINI_API_KEY is not configured or has an invalid format.");
    return res.status(503).json({
      success: false,
      message: "The chatbot is temporarily unavailable. Please try again shortly."
    });
  }
  try {
    let studioContext = "";
    let faqsContext = "";
    const relevantFAQs = db.faqs.filter((f) => f.studioId === "GLOBAL" || studioId && f.studioId === studioId);
    faqsContext = relevantFAQs.map((f) => `Q: ${f.question}
A: ${f.answer}`).join("\n\n");
    if (studioId) {
      const studio = db.studios.find((s) => s.id === studioId);
      if (studio) {
        const services = db.services.filter((s) => s.studioId === studioId && s.isActive);
        const packages = db.packages.filter((p) => p.studioId === studioId && p.isActive);
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
${services.map((s) => `- ${s.name} (Base Price: ${s.basePrice} PHP, Duration: ${s.durationMinutes} mins) - Description: ${s.description}`).join("\n")}

AVAILABLE CUSTOMIZABLE PACKAGES:
${packages.map((p) => `- ${p.name} (Price: ${p.price} PHP, Duration: ${p.durationMinutes} mins, Edited Photos: ${p.editedPhotosCount}, Prints: ${p.includedPrints}) - Description: ${p.description}`).join("\n")}
`;
      }
    } else {
      studioContext = `
ALL REGISTERED PHOTOGRAPHY STUDIOS IN CAINTA, RIZAL:
${db.studios.map((s) => `- ${s.name} (Location: ${s.location}, Rating: ${s.rating}, Starting Price: ${s.startingPrice} PHP). Focus categories: ${s.categories.join(", ")}. ID: ${s.id}`).join("\n")}
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
4. Keep replies warm, concise, and conversational, as if you are a helpful studio receptionist. Use plain text only: no asterisks, markdown headings, bullet symbols, numbered lists, backticks, or decorative formatting. Write in short natural paragraphs.
5. When guiding the user to book or explore, you can provide special action triggers enclosed in brackets, which the frontend will render as action buttons. Use:
- [view_services:${studioId || "GLOBAL"}] to view available services
- [view_packages:${studioId || "GLOBAL"}] to see custom packages
- [book_now:${studioId || "GLOBAL"}] to trigger the booking wizard

CURRENT DATABASE/STUDIO CONTEXT:
${studioContext}

FAQs & KNOWLEDGE BASE:
${faqsContext}
`;
    const contents = [
      ...(Array.isArray(history) ? history : []).filter((item) => item && (item.role === "user" || item.role === "model") && typeof item.text === "string").map((item) => ({ role: item.role, parts: [{ text: item.text }] })),
      { role: "user", parts: [{ text: String(message) }] }
    ];
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.3 }
        })
      }
    );
    const responseData = await geminiResponse.json();
    if (!geminiResponse.ok) {
      throw new Error(responseData.error?.message || `Gemini API request failed with HTTP ${geminiResponse.status}.`);
    }
    const responseText = responseData.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!responseText) {
      throw new Error("Gemini API returned an empty response.");
    }
    rememberFaqSuggestion(message, responseText, studioId || "GLOBAL");
    res.json({ success: true, text: responseText });
  } catch (error) {
    console.error("Gemini Chatbot API error:", error);
    res.status(503).json({
      success: false,
      message: "The chatbot is temporarily unavailable. Please try again shortly."
    });
  }
});
function getLocalNetworkIp() {
  const nets = import_os2.default.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal && !net.address.startsWith("169.254")) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}
var PAYMONGO_BASE = "https://api.paymongo.com/v1";
var GCASH_QR_LIFETIME_MS = 30 * 60 * 1e3;
var PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY || "";
var PAYMONGO_IS_LIVE = process.env.PAYMONGO_MODE === "live";
function paymongoHeaders() {
  return {
    "Authorization": `Basic ${Buffer.from(PAYMONGO_SECRET + ":").toString("base64")}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
}
async function callPayMongo(method, path3, body) {
  const res = await fetch(`${PAYMONGO_BASE}${path3}`, {
    method,
    headers: paymongoHeaders(),
    body: body ? JSON.stringify(body) : void 0
  });
  const json = await res.json();
  if (!res.ok) {
    const errDetail = json?.errors?.[0]?.detail || json?.message || "PayMongo API error";
    throw new Error(`PayMongo ${method} ${path3} failed (${res.status}): ${errDetail}`);
  }
  return json;
}
app.get("/api/payments/gcash/stream", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  const userId = user.id;
  if (!sseClients.has(userId)) sseClients.set(userId, /* @__PURE__ */ new Set());
  sseClients.get(userId).add(res);
  res.write(`data: ${JSON.stringify({ type: "connected", userId })}

`);
  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 25e3);
  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.get(userId)?.delete(res);
    if (sseClients.get(userId)?.size === 0) sseClients.delete(userId);
  });
});
app.post("/api/payments/gcash/create-qr", async (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { bookingId, printOrderId, studioId, amount, paymentType, description } = req.body;
  if (!studioId || !amount || !paymentType) {
    return res.status(400).json({ success: false, message: "studioId, amount, and paymentType are required." });
  }
  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum < 1) {
    return res.status(400).json({ success: false, message: "Invalid amount." });
  }
  if (bookingId) {
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }
    if (user.role === "CUSTOMER" && booking.customerId !== user.id) {
      return res.status(403).json({ success: false, message: "Not your booking." });
    }
  }
  if (!PAYMONGO_SECRET) {
    return res.status(503).json({
      success: false,
      message: "GCash QR payments are not configured yet. Please contact the studio."
    });
  }
  try {
    const studio = db.studios.find((s) => s.id === studioId);
    const studioName = studio?.name || "Photography Studio";
    const desc = description || `${paymentType} \u2014 ${studioName}`;
    const metadata = {
      studio_id: String(studioId),
      customer_id: String(user.id),
      payment_type: String(paymentType),
      platform: "cainta_photography_mis"
    };
    if (bookingId) metadata.booking_id = String(bookingId);
    if (printOrderId) metadata.print_order_id = String(printOrderId);
    const intentBody = {
      data: {
        attributes: {
          amount: Math.round(amountNum * 100),
          // convert to centavos
          payment_method_allowed: ["qrph"],
          currency: "PHP",
          capture_type: "automatic",
          description: desc,
          metadata
        }
      }
    };
    const intentResponse = await callPayMongo("POST", "/payment_intents", intentBody);
    const intentId = intentResponse?.data?.id;
    const clientKey = intentResponse?.data?.attributes?.client_key;
    if (!intentId) {
      throw new Error("PayMongo did not return a payment intent ID.");
    }
    const customerName = user.fullName || user.email?.split("@")[0] || "Customer";
    const customerEmail = user.email || "customer@cainta-studio.com";
    const customerPhone = user.contactNumber || "+63 900 000 0000";
    const pmBody = {
      data: {
        attributes: {
          type: "qrph",
          billing: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone
          }
        }
      }
    };
    const pmResponse = await callPayMongo("POST", "/payment_methods", pmBody);
    const paymentMethodId = pmResponse?.data?.id;
    if (!paymentMethodId) {
      throw new Error("PayMongo did not return a payment method ID for QR Ph.");
    }
    const attachBody = {
      data: {
        attributes: {
          payment_method: paymentMethodId,
          client_key: clientKey
        }
      }
    };
    const attachResponse = await callPayMongo("POST", `/payment_intents/${intentId}/attach`, attachBody);
    const nextAction = attachResponse?.data?.attributes?.next_action;
    let qrCodeData = nextAction?.code?.image_url || "";
    if (qrCodeData && !qrCodeData.startsWith("data:") && !qrCodeData.startsWith("http")) {
      qrCodeData = `data:image/png;base64,${qrCodeData}`;
    }
    const sessionId = `GQR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + GCASH_QR_LIFETIME_MS).toISOString();
    await db.pool.execute(
      `INSERT INTO gcash_qr_sessions
        (id, booking_id, print_order_id, studio_id, customer_id, gateway,
         gateway_payment_intent_id, gateway_source_id, gateway_checkout_url,
         qr_code_data, amount, payment_type, status, expires_at)
       VALUES (?, ?, ?, ?, ?, 'paymongo', ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        sessionId,
        bookingId || null,
        printOrderId || null,
        studioId,
        user.id,
        intentId,
        paymentMethodId || null,
        null,
        qrCodeData || null,
        amountNum,
        paymentType,
        expiresAt
      ]
    );
    const auditId = generateId("LOG");
    await db.pool.execute(
      "INSERT INTO audit_logs (id, user_id, user_email, action, entity_type, entity_id) VALUES (?, ?, ?, ?, 'GCASH_QR', ?)",
      [auditId, user.id, user.email, `Generated GCash QR for ${paymentType} \u20B1${amountNum}`, sessionId]
    );
    return res.json({
      success: true,
      session: {
        id: sessionId,
        gateway: "paymongo",
        gatewayPaymentIntentId: intentId,
        gatewaySourceId: paymentMethodId || null,
        gatewayCheckoutUrl: null,
        qrCodeData: qrCodeData || null,
        amount: amountNum,
        paymentType,
        status: "pending",
        expiresAt,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (err) {
    console.error("[GCash QR] Create QR error:", err?.message || err);
    return res.status(502).json({
      success: false,
      message: err?.message?.includes("PayMongo") ? err.message : "Failed to generate QR code. Please try again or use manual payment."
    });
  }
});
app.post("/api/payments/gcash/submit-proof", async (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { sessionId, referenceNumber, proofOfPayment } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: "sessionId is required." });
  }
  const [rows] = await db.pool.execute(
    "SELECT * FROM gcash_qr_sessions WHERE id = ? LIMIT 1",
    [sessionId]
  );
  if (!rows || rows.length === 0) {
    return res.status(404).json({ success: false, message: "GCash session not found." });
  }
  const session = rows[0];
  if (session.print_order_id) {
    const printOrderIndex = db.printOrders.findIndex((order) => order.id === session.print_order_id);
    if (printOrderIndex === -1) {
      return res.status(404).json({ success: false, message: "Print order not found." });
    }
    const media = proofOfPayment ? await saveProtectedMedia(user.id, "print-order", session.print_order_id, "PAYMENT_PROOF", proofOfPayment, "print-payment-proof") : null;
    if (proofOfPayment && !media) {
      return res.status(400).json({ success: false, message: "Payment proof must be a supported image smaller than 8 MB." });
    }
    const printOrder = db.printOrders[printOrderIndex];
    db.printOrders[printOrderIndex] = {
      ...printOrder,
      paymentStatus: "Pending Verification",
      proofOfPayment: media ? `/api/media/${media.mediaId}` : printOrder.proofOfPayment,
      referenceNumber: String(referenceNumber || session.gateway_payment_intent_id || "").trim() || printOrder.referenceNumber
    };
    db.save();
    return res.json({
      success: true,
      message: "Payment receipt submitted successfully for studio review.",
      paymentId: session.payment_id || ""
    });
  }
  let paymentId = session.payment_id;
  if (!paymentId) {
    paymentId = `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await db.pool.execute(
      `INSERT INTO payments
        (id, gcash_session_id, booking_id, studio_id, customer_id, amount, payment_type,
         payment_method, payment_status, reference_number, proof_of_payment, gateway_transaction_id,
         payment_channel, payment_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'GCash', 'Pending Verification', ?, ?, ?, 'gcash_qr', NOW(), NOW())`,
      [
        paymentId,
        session.id,
        session.booking_id,
        session.studio_id,
        session.customer_id,
        session.amount,
        session.payment_type,
        referenceNumber || session.gateway_payment_intent_id,
        proofOfPayment || null,
        session.gateway_payment_intent_id
      ]
    );
    await db.pool.execute(
      "UPDATE gcash_qr_sessions SET payment_id = ? WHERE id = ?",
      [paymentId, session.id]
    );
  } else {
    await db.pool.execute(
      `UPDATE payments SET
         reference_number = COALESCE(?, reference_number),
         proof_of_payment = COALESCE(?, proof_of_payment),
         payment_status = 'Pending Verification'
       WHERE id = ?`,
      [referenceNumber || null, proofOfPayment || null, paymentId]
    );
  }
  const existingPay = db.payments.find((p) => p.id === paymentId);
  if (existingPay) {
    if (referenceNumber) existingPay.referenceNumber = referenceNumber;
    if (proofOfPayment) existingPay.proofOfPayment = proofOfPayment;
    existingPay.paymentStatus = "Pending Verification";
    existingPay.status = "Pending";
  } else {
    db.payments.push({
      id: paymentId,
      bookingId: session.booking_id,
      studioId: session.studio_id,
      customerId: session.customer_id,
      amount: Number(session.amount),
      paymentMethod: "GCash",
      referenceNumber: referenceNumber || session.gateway_payment_intent_id,
      proofOfPayment: proofOfPayment || "",
      paymentStatus: "Pending Verification",
      paymentType: session.payment_type || "Downpayment",
      status: "Pending",
      paymentDate: (/* @__PURE__ */ new Date()).toISOString(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  if (session.booking_id) {
    const b = db.bookings.find((x) => x.id === session.booking_id);
    if (b) {
      b.status = "Pending";
      b.pendingPaymentAmount = Number(session.amount);
    }
  }
  return res.json({
    success: true,
    message: "Payment receipt submitted successfully for studio review.",
    paymentId
  });
});
app.get("/api/payments/gcash/session/:sessionId", async (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  const { sessionId } = req.params;
  const [rows] = await db.pool.execute(
    "SELECT * FROM gcash_qr_sessions WHERE id = ? LIMIT 1",
    [sessionId]
  );
  if (!rows || rows.length === 0) {
    return res.status(404).json({ success: false, message: "Session not found." });
  }
  const session = rows[0];
  if (user.role === "CUSTOMER" && session.customer_id !== user.id) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }
  if (session.status === "pending" && new Date(session.expires_at) < /* @__PURE__ */ new Date()) {
    await db.pool.execute(
      "UPDATE gcash_qr_sessions SET status = 'expired' WHERE id = ?",
      [sessionId]
    );
    session.status = "expired";
  }
  return res.json({
    success: true,
    session: {
      id: session.id,
      paymentId: session.payment_id,
      bookingId: session.booking_id,
      printOrderId: session.print_order_id,
      studioId: session.studio_id,
      customerId: session.customer_id,
      gateway: session.gateway,
      gatewayPaymentIntentId: session.gateway_payment_intent_id,
      qrCodeData: session.qr_code_data,
      amount: Number(session.amount),
      paymentType: session.payment_type,
      status: session.status,
      expiresAt: session.expires_at,
      paidAt: session.paid_at,
      createdAt: session.created_at
    }
  });
});
app.get("/api/payments/gcash/status/:intentId", async (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  if (!PAYMONGO_SECRET) {
    return res.status(503).json({ success: false, message: "Payment gateway not configured." });
  }
  try {
    const intentData = await callPayMongo("GET", `/payment_intents/${req.params.intentId}`);
    const attrs = intentData?.data?.attributes;
    return res.json({
      success: true,
      status: attrs?.status,
      amount: (attrs?.amount || 0) / 100,
      currency: attrs?.currency,
      payments: attrs?.payments || []
    });
  } catch (err) {
    return res.status(502).json({ success: false, message: err.message });
  }
});
app.post("/api/studios/:studioId/payment-credentials", async (req, res) => {
  const user = requireStudioAccess(req, res, req.params.studioId);
  if (!user) return;
  const { gcashMerchantName, gcashNumber } = req.body;
  const { studioId } = req.params;
  const credId = generateId("CRED");
  try {
    await db.pool.execute(
      `INSERT INTO studio_payment_credentials
         (id, studio_id, gateway, gcash_merchant_name, gcash_number)
       VALUES (?, ?, 'paymongo', ?, ?)
       ON DUPLICATE KEY UPDATE
         gcash_merchant_name = VALUES(gcash_merchant_name),
         gcash_number = VALUES(gcash_number),
         updated_at = NOW()`,
      [credId, studioId, gcashMerchantName || null, gcashNumber || null]
    );
    return res.json({ success: true, message: "GCash settings saved successfully." });
  } catch (err) {
    console.error("[GCash Creds]", err?.message);
    return res.status(500).json({ success: false, message: "Failed to save payment credentials." });
  }
});
app.get("/api/studios/:studioId/payment-credentials", async (req, res) => {
  const user = requireStudioAccess(req, res, req.params.studioId);
  if (!user) return;
  const [rows] = await db.pool.execute(
    "SELECT id, studio_id, gateway, gcash_merchant_name, gcash_number, is_live_mode, is_enabled, created_at FROM studio_payment_credentials WHERE studio_id = ? LIMIT 1",
    [req.params.studioId]
  );
  const creds = rows[0] || null;
  return res.json({ success: true, credentials: creds });
});
app.get("/api/payments/gcash/gateway-status", (req, res) => {
  const user = requireAuthenticatedUser(req, res);
  if (!user) return;
  res.json({
    success: true,
    configured: !!PAYMONGO_SECRET,
    mode: PAYMONGO_IS_LIVE ? "live" : "sandbox",
    publicKey: process.env.PAYMONGO_PUBLIC_KEY || null,
    gatewayName: "PayMongo"
  });
});
app.get("/api/system/network-info", (req, res) => {
  if (!requireRole(req, res, "SUPER_ADMIN" /* SUPER_ADMIN */)) return;
  const lanIp = getLocalNetworkIp();
  res.json({
    success: true,
    port: PORT,
    localUrl: `http://localhost:${PORT}`,
    networkUrl: `http://${lanIp}:${PORT}`,
    ipAddress: lanIp
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  const lanIp = getLocalNetworkIp();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
======================================================`);
    console.log(`\u{1F4F8} CAINTA PHOTOGRAPHY STUDIO MIS (LAN Access Ready)`);
    console.log(`\u279C Local:   http://localhost:${PORT}`);
    console.log(`\u279C Network: http://${lanIp}:${PORT}`);
    console.log(`  (Connect any smartphone, tablet, or PC on your Wi-Fi)`);
    console.log(`======================================================
`);
  });
}
var isServerlessEnvironment = !!(process.env.VERCEL === "1" || process.env.FIREBASE_CONFIG || process.env.FUNCTION_TARGET || process.env.K_SERVICE);
if (!isServerlessEnvironment) {
  startServer();
}

// src/index.ts
var rootApp = (0, import_express2.default)();
rootApp.use((req, _res, next) => {
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url === "/" ? "" : req.url}`;
  }
  next();
});
rootApp.use(app);
var api = (0, import_https.onRequest)(
  {
    region: "us-central1",
    cors: true,
    timeoutSeconds: 120,
    memory: "512MiB",
    maxInstances: 10,
    minInstances: 0
  },
  rootApp
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  api
});
//# sourceMappingURL=index.js.map
