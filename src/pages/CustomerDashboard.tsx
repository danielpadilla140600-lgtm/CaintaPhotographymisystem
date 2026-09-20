import React, { useState, useEffect } from "react";
import { 
  Calendar, Printer, Star, Upload, Check, AlertCircle, 
  MapPin, Heart, Clock, Sparkles, DollarSign, CreditCard, X, Download, Image as ImageIcon, CalendarPlus,
  FileText, Layers, Package, Truck, ChevronDown, ChevronUp, ShoppingBag, Eye, Scissors, CheckCircle2, ShieldAlert,
  RefreshCw, RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateBookingReceiptPDF, generatePrintOrderReceiptPDF } from "../utils/pdfGenerator";
import { getGoogleCalendarUrl, downloadIcsFile } from "../utils/calendarSync";
import { ClientGallery } from "../components/ClientGallery";
import GCashQRModal from "../components/GCashQRModal.tsx";
import RescheduleModal from "../components/RescheduleModal.tsx";
import { QrCode, Zap } from "lucide-react";
import { apiRequest, resolveApiUrl, ApiError } from "../utils/apiClient.ts";


interface CustomerDashboardProps {
  currentUser: any;
  bookings: any[];
  printOrders: any[];
  favorites: any[];
  studios: any[];
  printProducts?: any[];
  services?: any[];
  packages?: any[];
  initialSubTab?: "bookings" | "prints" | "favorites";
  onNavigate: (page: string, params?: any) => void;
  onUploadPayment: (bookingId: string, payload: any) => void;
  onSubmitPrintPayment?: (orderId: string, payload: any) => void;
  onCancelBooking: (bookingId: string, reason?: string) => void;
  onRescheduleBooking?: (bookingId: string, newDate: string, newTimeSlot: string, reason?: string) => void;
  onUploadRequirement: (bookingId: string, fileName: string, fileData: string) => void;
  onSubmitReview: (reviewPayload: any) => Promise<boolean> | boolean;
  onRemoveFavorite: (studioId: string) => void;
}

export default function CustomerDashboard({
  currentUser,
  bookings,
  printOrders,
  favorites,
  studios,
  printProducts = [],
  services = [],
  packages = [],
  initialSubTab = "bookings",
  onNavigate,
  onUploadPayment,
  onSubmitPrintPayment,
  onCancelBooking,
  onRescheduleBooking,
  onUploadRequirement,
  onSubmitReview,
  onRemoveFavorite
}: CustomerDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"bookings" | "prints" | "favorites">(initialSubTab);
  
  // Track expanded print order for timeline and mockup preview
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Interactive mockup choices within tracking portal
  const [trackFrame, setTrackFrame] = useState<"oak" | "black" | "gold" | "frameless">("black");
  const [trackMatte, setTrackMatte] = useState<"glossy" | "matte">("glossy");

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);
  
  // Payment Proof Modal state
  const [payingBooking, setPayingBooking] = useState<any | null>(null);
  const [payingPrintOrder, setPayingPrintOrder] = useState<any | null>(null);
  const [payingPaymentType, setPayingPaymentType] = useState<"Downpayment" | "Full Payment">("Downpayment");
  // GCash QR Modal target state
  const [gcashQRTarget, setGcashQRTarget] = useState<{
    bookingId?: string;
    printOrderId?: string;
    studioId: string;
    amount: number;
    paymentType: "Downpayment" | "Balance" | "Full Payment" | "PrintOrder";
    studioName: string;
    description?: string;
  } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"GCash" | "Bank Transfer" | "Online Payment">("GCash");
  const [printPaymentMethod, setPrintPaymentMethod] = useState<"GCash" | "Bank Transfer" | "Online Payment">("GCash");
  const [refNo, setRefNo] = useState("");
  const [printRefNo, setPrintRefNo] = useState("");
  const [proofBase64, setProofBase64] = useState("");
  const [printProofBase64, setPrintProofBase64] = useState("");

  // Review Modal state
  const [reviewingBooking, setReviewingBooking] = useState<any | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");

  // Photo Proofing Portal state
  const [proofingBookingId, setProofingBookingId] = useState<string | null>(null);
  const [resolvedPrintMedia, setResolvedPrintMedia] = useState<Record<string, string>>({});

  // Requirements state
  const [reqBookingId, setReqBookingId] = useState<string | null>(null);

  // Reschedule Modal state
  const [reschedulingBooking, setReschedulingBooking] = useState<any | null>(null);

  // Refund request state
  const [refundingBooking, setRefundingBooking] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundMsg, setRefundMsg] = useState("");

  const resolveProtectedMediaUrl = async (url: string): Promise<string> => {
    if (!url || !url.startsWith("/api/media/")) return url;
    if (!currentUser?.authToken) return url;

    const response = await fetch(resolveApiUrl(url), {
      headers: {
        Authorization: `Bearer ${currentUser.authToken}`
      }
    });

    if (!response.ok) return url;

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    let isCancelled = false;
    const blobUrls: string[] = [];

    const hydratePrintMedia = async () => {
      const nextMap: Record<string, string> = {};

      for (const order of printOrders) {
        const protectedUrls = [order.uploadedPhoto, order.proofOfPayment].filter((value): value is string => !!value && value.startsWith("/api/media/"));

        for (const protectedUrl of protectedUrls) {
          try {
            const resolved = await resolveProtectedMediaUrl(protectedUrl);
            if (!isCancelled) {
              nextMap[protectedUrl] = resolved;
              if (resolved.startsWith("blob:")) blobUrls.push(resolved);
            }
          } catch (err) {
            console.warn("Failed to resolve protected media URL:", err);
            if (!isCancelled) nextMap[protectedUrl] = protectedUrl;
          }
        }
      }

      if (!isCancelled) {
        setResolvedPrintMedia(nextMap);
      }
    };

    hydratePrintMedia();

    return () => {
      isCancelled = true;
      for (const blobUrl of blobUrls) {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [printOrders, currentUser?.authToken]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingBooking) return;
    const success = await onSubmitReview({
      studioId: reviewingBooking.studioId,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      bookingId: reviewingBooking.id,
      rating,
      comment: reviewComment
    });
    if (success) {
      setReviewingBooking(null);
      setReviewComment("");
      setRating(5);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBooking) return;
    const isFull = payingPaymentType === "Full Payment" || payingBooking.paymentOption === "Full Payment";
    const paymentAmount = isFull
      ? (Number(payingBooking.remainingBalance) > 0 ? Number(payingBooking.remainingBalance) : Number(payingBooking.totalAmount))
      : (Number(payingBooking.downPaymentAmount) || Math.round(Number(payingBooking.totalAmount) * 0.3 * 100) / 100);

    onUploadPayment(payingBooking.id, {
      bookingId: payingBooking.id,
      studioId: payingBooking.studioId,
      customerId: currentUser.id,
      amount: paymentAmount,
      paymentType: isFull ? "Full Payment" : "Downpayment",
      paymentMethod,
      referenceNumber: refNo,
      proofOfPayment: proofBase64
    });
    setPayingBooking(null);
    setRefNo("");
    setProofBase64("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "payment" | "print-payment" | "requirement") => {
    const file = e.target.files?.[0];
    if (file) {
      if ((type === "payment" || type === "print-payment") && (!file.type.startsWith("image/") || file.size > 9 * 1024 * 1024)) {
        alert("Please choose an image smaller than 9 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "payment") {
          setProofBase64(reader.result as string);
        } else if (type === "print-payment") {
          setPrintProofBase64(reader.result as string);
        } else if (type === "requirement" && reqBookingId) {
          onUploadRequirement(reqBookingId, file.name, reader.result as string);
          setReqBookingId(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle refund request (customer requests via reason → studio processes)
  const handleRequestRefund = async () => {
    if (!refundingBooking) return;
    if (!refundReason.trim()) {
      setRefundMsg("Please provide a reason for your refund request.");
      return;
    }
    setRefundLoading(true);
    setRefundMsg("");
    try {
      // Customers submit a cancellation request with refund note —
      // the actual refund payment is processed by the studio admin.
      await apiRequest(`/api/bookings/${refundingBooking.id}/cancel`, {
        method: "PUT",
        body: { reason: `[REFUND REQUESTED] ${refundReason.trim()}` }
      });
      setRefundMsg("Refund request submitted. The studio will process your refund and you will be notified by email.");
      setTimeout(() => {
        setRefundingBooking(null);
        setRefundReason("");
        setRefundMsg("");
      }, 2800);
    } catch (err: any) {
      setRefundMsg(err instanceof ApiError ? err.message : "Failed to submit refund request. Please contact the studio directly.");
    } finally {
      setRefundLoading(false);
    }
  };

  const handlePrintPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingPrintOrder || !onSubmitPrintPayment) return;

    onSubmitPrintPayment(payingPrintOrder.id, {
      amount: payingPrintOrder.totalAmount,
      paymentMethod: printPaymentMethod,
      referenceNumber: printRefNo,
      proofOfPayment: printProofBase64
    });

    setPayingPrintOrder(null);
    setPrintPaymentMethod("GCash");
    setPrintRefNo("");
    setPrintProofBase64("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 grid lg:grid-cols-12 gap-6 lg:gap-8 items-start pb-20 md:pb-10">
      {payingPrintOrder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl border border-[#e5e1da]">
            <div className="flex items-center justify-between border-b border-[#e5e1da] pb-3 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#7c756d] font-bold">Print Order Payment</p>
                <h4 className="font-display text-lg font-bold text-[#2c2a29]">{payingPrintOrder.id}</h4>
              </div>
              <button onClick={() => setPayingPrintOrder(null)} className="p-1.5 rounded-full hover:bg-gray-100 text-[#2c2a29] cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handlePrintPaymentSubmit} className="space-y-4 text-xs">
              <div className="bg-[#faf9f6] border border-[#e5e1da] rounded-2xl p-3">
                <div className="flex justify-between text-[11px] text-[#7c756d]">
                  <span>Order total</span>
                  <span className="font-bold text-[#2c2a29]">₱{Number(payingPrintOrder.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2c2a29]">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["GCash", "Bank Transfer", "Online Payment"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPrintPaymentMethod(method)}
                      className={`px-2 py-2 rounded-lg border text-[10px] font-bold ${printPaymentMethod === method ? "bg-[#2c2a29] text-white" : "bg-white text-[#2c2a29] border-[#e5e1da]"}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2c2a29]">Reference / Transaction ID</label>
                <input
                  value={printRefNo}
                  onChange={(e) => setPrintRefNo(e.target.value)}
                  placeholder="e.g. 123456789"
                  className="w-full border border-[#e5e1da] rounded-xl px-3 py-2 bg-white text-xs focus:outline-none focus:border-[#2c2a29]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2c2a29]">Upload Payment Proof</label>
                <label className="flex items-center justify-center border-2 border-dashed border-[#e5e1da] rounded-xl p-3 text-center cursor-pointer hover:border-[#7c756d] transition-colors bg-[#faf9f6]">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "print-payment")} />
                  <span className="text-[10px] font-semibold text-[#2c2a29]">
                    {printProofBase64 ? "Receipt uploaded - click to replace" : "Choose payment receipt image"}
                  </span>
                </label>
                {printProofBase64 && (
                  <img src={printProofBase64} alt="Print payment proof" className="max-h-28 rounded-xl object-contain mx-auto border border-[#e5e1da]" />
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#2c2a29] text-[#faf9f6] hover:bg-[#4a4644] rounded-xl py-2.5 font-bold text-[10px] uppercase tracking-wider cursor-pointer"
              >
                Submit Payment Proof
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 1. Profile Sidebar - Left */}
      <aside className="lg:col-span-3 bg-white border border-[#e5e1da] rounded-3xl p-5 sm:p-6 text-left shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#e5e1da] text-[#2c2a29] flex items-center justify-center font-bold text-lg uppercase shadow-sm">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <h4 className="font-display font-bold text-[#2c2a29] leading-snug">{currentUser.fullName}</h4>
            <span className="text-[10px] text-[#7c756d] font-semibold tracking-wide uppercase">Cainta Customer</span>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100 text-xs text-[#2c2a29]">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#7c756d] block font-bold mb-0.5">Contact</span>
            <p className="font-semibold">{currentUser.contactNumber || "Not configured"}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#7c756d] block font-bold mb-0.5">Address</span>
            <p className="font-semibold">{currentUser.address || "Cainta, Rizal"}</p>
          </div>
        </div>

      </aside>

      {/* 2. Primary Workspace Panel - Right */}
      <main className="lg:col-span-9 space-y-6">
        
        {/* A. My Photo Bookings Panel */}
        {activeSubTab === "bookings" && (
          <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 text-left space-y-6">
            <h3 className="font-display text-xl font-bold text-[#2c2a29]">My Photography Appointments</h3>

            {bookings.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7c756d]">
                No appointment history found. Discover Cainta studios and book one today!
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {bookings.map((bk) => {
                  const studioObj = studios.find(s => s.id === bk.studioId);
                  return (
                    <div key={bk.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-gray-100 text-[#2c2a29] px-2 py-0.5 rounded font-extrabold">{bk.id}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            bk.status === "Completed" ? "bg-green-50 text-green-700 border border-green-200" 
                            : bk.status === "Confirmed" ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : bk.status === "Pending" ? "bg-yellow-50 text-yellow-800 border border-yellow-200 animate-pulse"
                            : "bg-gray-50 text-gray-500 border border-gray-200"
                          }`}>
                            {bk.status}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-[#2c2a29] text-base leading-tight">
                          {studioObj?.name || "Lumina Portraiture"}
                        </h4>
                        <p className="text-xs text-[#7c756d] font-medium flex items-center gap-3">
                          <span>Date: <strong>{bk.bookingDate}</strong></span>
                          <span>•</span>
                          <span>Time: <strong>{bk.timeSlot}</strong></span>
                          <span>•</span>
                          <span>Total: <strong>{bk.totalAmount} PHP</strong></span>
                          <span>Paid: <strong className="text-emerald-700">{bk.amountPaid || 0} PHP</strong></span>
                          {(bk.pendingPaymentAmount || 0) > 0 && (
                            <span>Submitted: <strong className="text-yellow-700">{bk.pendingPaymentAmount} PHP (For verification)</strong></span>
                          )}
                          <span>Balance: <strong className="text-amber-700">{bk.remainingBalance ?? Math.max(0, bk.totalAmount - (bk.amountPaid || 0))} PHP</strong></span>
                        </p>
                        
                        {/* Requirement Upload Tracker (Section 4/34) */}
                        {bk.requirementsDoc ? (
                          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                            <Check size={12} /> Requirement Submitted: {bk.requirementsDoc}
                          </p>
                        ) : (
                          <div className="relative inline-block mt-1">
                            <input
                              type="file"
                              onChange={(e) => {
                                setReqBookingId(bk.id);
                                handleFileUpload(e, "requirement");
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <button className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer">
                              <Upload size={12} /> Upload booking requirements (Dress, theme docs)
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Side Actions (Pay/Review/PDF/Calendar/Proofing) */}
                      <div className="flex sm:flex-col items-start sm:items-end gap-2 text-xs">
                        {(bk.paymentStatus === "Unpaid" || bk.paymentStatus === "Failed") && bk.status !== "Cancelled" && bk.status !== "Expired" && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {bk.paymentOption === "Full Payment" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setGcashQRTarget({
                                    bookingId: bk.id,
                                    studioId: bk.studioId,
                                    amount: bk.totalAmount,
                                    paymentType: "Full Payment",
                                    studioName: studioObj?.name || "Studio",
                                    description: `Full Payment for Booking #${bk.id}`
                                  });
                                }}
                                className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <Zap size={11} className="fill-current text-yellow-300" /> Pay Full (₱{Number(bk.totalAmount).toLocaleString()}) via QR
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGcashQRTarget({
                                      bookingId: bk.id,
                                      studioId: bk.studioId,
                                      amount: bk.downPaymentAmount || Math.round(bk.totalAmount * 0.3 * 100) / 100,
                                      paymentType: "Downpayment",
                                      studioName: studioObj?.name || "Studio",
                                      description: `Downpayment for Booking #${bk.id}`
                                    });
                                  }}
                                  className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                                >
                                  <Zap size={11} className="fill-current text-yellow-300" /> Pay Downpayment (₱{(bk.downPaymentAmount || Math.round(bk.totalAmount * 0.3 * 100) / 100).toLocaleString()}) via QR
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGcashQRTarget({
                                      bookingId: bk.id,
                                      studioId: bk.studioId,
                                      amount: bk.totalAmount,
                                      paymentType: "Full Payment",
                                      studioName: studioObj?.name || "Studio",
                                      description: `Full Payment for Booking #${bk.id}`
                                    });
                                  }}
                                  className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                                >
                                  <Zap size={11} className="fill-current text-yellow-300" /> Pay Full (₱{Number(bk.totalAmount).toLocaleString()}) via QR
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setPayingBooking(bk);
                                setPayingPaymentType(bk.paymentOption === "Full Payment" ? "Full Payment" : "Downpayment");
                                setRefNo("");
                                setProofBase64("");
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                              title="Upload bank/GCash receipt screenshot manually"
                            >
                              <Upload size={11} /> Manual Receipt
                            </button>
                          </div>
                        )}
                        {/* Pay Remaining Balance via QR */}
                        {bk.status === "Confirmed" && (bk.remainingBalance || 0) > 0 && bk.finalPaymentStatus !== "Paid" && (
                          <button
                            type="button"
                            onClick={() => {
                              setGcashQRTarget({
                                bookingId: bk.id,
                                studioId: bk.studioId,
                                amount: bk.remainingBalance,
                                paymentType: "Balance",
                                studioName: studioObj?.name || "Studio",
                                description: `Final Balance for Booking #${bk.id}`
                              });
                            }}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Zap size={11} className="fill-current text-yellow-200" /> Pay Balance (₱{bk.remainingBalance}) via GCash
                          </button>
                        )}
                        {bk.paymentStatus === "Pending Verification" && (
                          <span className="text-[10px] text-yellow-600 font-bold flex items-center gap-1">
                            <Clock size={12} /> Payment Pending Verification
                          </span>
                        )}
                        {["Pending", "Awaiting Payment", "Confirmed", "Rescheduled"].includes(bk.status) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!window.confirm("Cancel this photography booking?")) return;
                              const reason = window.prompt("Reason for cancellation (optional):") || "Customer requested cancellation";
                              onCancelBooking(bk.id, reason);
                            }}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <X size={12} /> Cancel Booking
                          </button>
                        )}
                        {/* Reschedule Button — available for confirmed/rescheduled bookings */}
                        {["Confirmed", "Rescheduled", "Pending", "Awaiting Payment"].includes(bk.status) && (
                          <button
                            type="button"
                            onClick={() => setReschedulingBooking(bk)}
                            className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw size={12} /> Reschedule
                          </button>
                        )}
                        {/* Refund Request — for paid bookings that are cancelled or completed */}
                        {(bk.paymentStatus === "Partially Paid" || bk.paymentStatus === "Paid") &&
                          ["Cancelled", "Completed", "Confirmed"].includes(bk.status) && (
                          <button
                            type="button"
                            onClick={() => { setRefundingBooking(bk); setRefundReason(""); setRefundMsg(""); }}
                            className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw size={12} /> Request Refund
                          </button>
                        )}
                        {bk.status === "Expired" && (
                          <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                            <AlertCircle size={12} /> Hold Expired
                          </span>
                        )}
                        {bk.finalPaymentStatus === "Paid" && (
                          <button
                            onClick={() => generateBookingReceiptPDF(bk, studioObj)}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Download size={12} /> Official Receipt PDF
                          </button>
                        )}

                        {/* Calendar Sync Buttons */}
                        {bk.status !== "Cancelled" && (
                          <div className="flex items-center gap-1">
                            <a
                              href={getGoogleCalendarUrl({
                                title: `Photoshoot @ ${studioObj?.name || 'Cainta Studio'}`,
                                description: `Confirmed photoshoot schedule (Booking #${bk.id}). Address: ${studioObj?.address || 'Cainta, Rizal'}`,
                                location: studioObj?.address || 'Cainta, Rizal',
                                startDate: bk.bookingDate,
                                timeSlot: bk.timeSlot
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-md flex items-center gap-1"
                              title="Sync to Google Calendar"
                            >
                              <CalendarPlus size={11} /> Google Cal
                            </a>
                            <button
                              onClick={() => downloadIcsFile({
                                title: `Photoshoot @ ${studioObj?.name || 'Cainta Studio'}`,
                                description: `Confirmed photoshoot schedule (Booking #${bk.id}).`,
                                location: studioObj?.address || 'Cainta, Rizal',
                                startDate: bk.bookingDate,
                                timeSlot: bk.timeSlot
                              })}
                              className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-[10px] font-bold rounded-md"
                              title="Download .ics Calendar File"
                            >
                              .iCal
                            </button>
                          </div>
                        )}

                        {/* Photo Proofing Portal Trigger */}
                        <button
                          onClick={() => setProofingBookingId(bk.id)}
                          className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <ImageIcon size={12} /> Photo Proofs
                        </button>

                        {bk.status === "Completed" && (
                          <button
                            onClick={() => setReviewingBooking(bk)}
                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                          >
                            <Star size={11} className="fill-current" /> Review Studio
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* B. My Print Orders Panel */}
        {activeSubTab === "prints" && (
          <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[#2c2a29] flex items-center gap-2">
                  <Printer className="text-amber-600" size={20} />
                  <span>My Creative Print Orders</span>
                </h3>
                <p className="text-xs text-[#7c756d]">Track the active printing production, framing stages, and live fulfillment status.</p>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200/50 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {printOrders.length} Active Print{printOrders.length !== 1 && "s"}
              </span>
            </div>

            {printOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7c756d] space-y-2">
                <ImageIcon size={36} className="mx-auto text-gray-300 stroke-[1.5]" />
                <p>No print order history found.</p>
                <p className="text-[11px] text-gray-400">Order high-gloss canvas sizes or custom wood frame styles from Cainta studios!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {printOrders.map((ord) => {
                  const sObj = studios.find(s => s.id === ord.studioId);
                  const isExpanded = expandedOrderId === ord.id;
                  
                  // Calculate active status step & percentage
                  const statusNormalized = (ord.status || "Pending").toLowerCase();
                  let currentStep = 1;
                  let percent = 25;
                  if (statusNormalized === "processing" || statusNormalized === "accepted") {
                    currentStep = 2;
                    percent = 50;
                  } else if (statusNormalized === "ready for pickup" || statusNormalized === "shipped" || statusNormalized === "out for delivery" || statusNormalized === "ready") {
                    currentStep = 3;
                    percent = 75;
                  } else if (statusNormalized === "completed" || statusNormalized === "delivered") {
                    currentStep = 4;
                    percent = 100;
                  }

                  // Estimated hours fallback
                  const estCompletionDate = new Date(new Date(ord.createdAt).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });

                  return (
                    <div 
                      key={ord.id} 
                      className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                        isExpanded ? "border-[#2c2a29] shadow-md bg-white" : "border-[#e5e1da] bg-[#faf9f6]/40 hover:bg-[#faf9f6]/80"
                      }`}
                    >
                      {/* Accordion Summary Header */}
                      <div 
                        onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                        className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative group flex-shrink-0">
                            <img 
                              src={resolvedPrintMedia[ord.uploadedPhoto] || ord.uploadedPhoto} 
                              alt="to print" 
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-gray-200 shadow-sm transition-transform group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent rounded-xl transition-colors" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] bg-[#2c2a29] text-[#faf9f6] px-2 py-0.5 rounded-md font-bold tracking-wider">{ord.id}</span>
                              <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${
                                currentStep === 4 ? "bg-green-50 text-green-700 border-green-200" :
                                currentStep === 3 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                currentStep === 2 ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-gray-100 text-[#7c756d] border-gray-200"
                              }`}>
                                {ord.status || "Pending"}
                              </span>
                            </div>

                            <h4 className="font-display font-extrabold text-sm sm:text-base text-[#2c2a29]">
                              {sObj?.name || "Lumina Printing Hub"}
                            </h4>

                            <p className="text-[11px] text-[#7c756d] font-semibold flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span>Copies: <strong className="text-[#2c2a29]">{ord.quantity}</strong></span>
                              <span>•</span>
                              <span>Total: <strong className="text-[#2c2a29]">{ord.totalAmount} PHP</strong></span>
                              <span>Payment: <strong className={ord.paymentStatus === "Paid" ? "text-emerald-700" : "text-amber-700"}>{ord.paymentStatus}</strong></span>
                              <span>•</span>
                              <span>Delivery: <strong className="text-[#2c2a29]">{ord.shippingAddress ? "Rizal Shipping" : "Self-Pickup"}</strong></span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          {ord.status !== "Cancelled" && ord.status !== "Completed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Cancel this print order?")) {
                                  apiRequest(`/api/print-orders/${ord.id}/cancel`, {
                                    method: "PUT",
                                    body: { reason: "Customer requested cancellation" }
                                  })
                                    .then(() => {
                                      window.location.reload();
                                    })
                                    .catch((err: any) => alert(err.message || "Unable to cancel print order."));
                                }
                              }}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <X size={12} /> Cancel Order
                            </button>
                          )}
                          {ord.paymentStatus !== "Paid" && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGcashQRTarget({
                                    printOrderId: ord.id,
                                    studioId: ord.studioId,
                                    amount: Number(ord.totalAmount),
                                    paymentType: "PrintOrder",
                                    studioName: "Studio Prints",
                                    description: `Print Order #${ord.id}`
                                  });
                                }}
                                className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <Zap size={11} className="fill-current text-yellow-300" /> Pay Print Order via GCash QR
                              </button>
                              {onSubmitPrintPayment && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPayingPrintOrder(ord);
                                    setPrintRefNo("");
                                    setPrintProofBase64("");
                                  }}
                                  className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                                >
                                  <Upload size={11} /> Manual Receipt
                                </button>
                              )}
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const product = printProducts.find(p => p.id === ord.productId);
                              generatePrintOrderReceiptPDF(ord, sObj, product);
                            }}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Download size={12} /> Receipt PDF
                          </button>
                        </div>

                        {/* Right Quick Summary & Toggle */}
                        <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                          <div className="text-left md:text-right">
                            <span className="text-[9px] text-[#7c756d] uppercase block font-bold">Est. Dispatch</span>
                            <span className="text-xs font-bold text-[#2c2a29]">{estCompletionDate}</span>
                          </div>
                          
                          <button 
                            type="button"
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-[#2c2a29] transition-colors flex items-center justify-center"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Continuous Visual Progress Bar (Always visible to keep at-a-glance status clear) */}
                      <div className="h-1 bg-gray-100 relative w-full">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 transition-all duration-1000"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Collapsible Production Hub Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-100 bg-[#faf9f6]/30 overflow-hidden"
                          >
                            <div className="p-4 sm:p-6 grid lg:grid-cols-12 gap-6">
                              {/* Left Column: Multi-Step Interactive Timeline (Lg: col-span-7) */}
                              <div className="lg:col-span-7 space-y-6">
                                <h5 className="text-xs font-bold uppercase text-[#7c756d] tracking-wider flex items-center gap-1.5">
                                  <Layers size={14} className="text-[#2c2a29]" />
                                  <span>Live Printing Timeline & Milestone Steps</span>
                                </h5>

                                {/* Stepper Visualizer Container */}
                                <div className="relative pl-6 sm:pl-0 grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                                  {/* Milestone 1: Placed */}
                                  <div className="relative flex sm:flex-col items-start sm:items-center text-left sm:text-center space-y-1 gap-3 sm:gap-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${
                                      currentStep >= 1 ? "bg-emerald-600 text-white shadow-md shadow-green-100" : "bg-gray-100 text-gray-400"
                                    }`}>
                                      {currentStep > 1 ? <Check size={14} /> : <FileText size={14} />}
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[11px] font-extrabold text-[#2c2a29] block">1. Order Placed</span>
                                      <span className="text-[10px] text-[#7c756d] block leading-tight">Spec sheets loaded in queue</span>
                                    </div>
                                  </div>

                                  {/* Milestone 2: Printing */}
                                  <div className="relative flex sm:flex-col items-start sm:items-center text-left sm:text-center space-y-1 gap-3 sm:gap-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${
                                      currentStep >= 2 ? "bg-emerald-600 text-white shadow-md shadow-green-100" : "bg-gray-100 text-gray-400 border border-gray-200"
                                    }`}>
                                      {currentStep > 2 ? <Check size={14} /> : <Printer size={14} className={currentStep === 2 ? "animate-pulse" : ""} />}
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[11px] font-extrabold text-[#2c2a29] block">2. In Production</span>
                                      <span className="text-[10px] text-[#7c756d] block leading-tight">Fine art inkjet plotting</span>
                                    </div>
                                  </div>

                                  {/* Milestone 3: QA & Wood Frame Mounting */}
                                  <div className="relative flex sm:flex-col items-start sm:items-center text-left sm:text-center space-y-1 gap-3 sm:gap-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${
                                      currentStep >= 3 ? "bg-emerald-600 text-white shadow-md shadow-green-100" : "bg-gray-100 text-gray-400 border border-gray-200"
                                    }`}>
                                      {currentStep > 3 ? <Check size={14} /> : <Scissors size={14} className={currentStep === 3 ? "animate-bounce" : ""} />}
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[11px] font-extrabold text-[#2c2a29] block">3. Framing & QA</span>
                                      <span className="text-[10px] text-[#7c756d] block leading-tight">Hand-mounting & color review</span>
                                    </div>
                                  </div>

                                  {/* Milestone 4: Handover / Dispatch */}
                                  <div className="relative flex sm:flex-col items-start sm:items-center text-left sm:text-center space-y-1 gap-3 sm:gap-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${
                                      currentStep >= 4 ? "bg-emerald-600 text-white shadow-md shadow-green-100" : "bg-gray-100 text-gray-400 border border-gray-200"
                                    }`}>
                                      <Truck size={14} />
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[11px] font-extrabold text-[#2c2a29] block">4. Dispatch Ready</span>
                                      <span className="text-[10px] text-[#7c756d] block leading-tight">Courier pick-up / counter wait</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Dynamic Logs depending on Status */}
                                <div className="bg-white border border-[#e5e1da] rounded-2xl p-4 space-y-3 shadow-xs">
                                  <span className="text-[10px] uppercase font-bold text-[#7c756d] tracking-wider block">Production Event Logs</span>
                                  
                                  <div className="space-y-2.5 text-xs">
                                    {currentStep >= 1 && (
                                      <div className="flex items-start gap-2.5">
                                        <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="font-bold text-[#2c2a29]">Order Placed successfully & Payment Authorized</p>
                                          <p className="text-[10px] text-gray-400">Specs: {ord.quantity}x Custom High Definition Print, framed inside Cainta, Rizal printing hub.</p>
                                        </div>
                                      </div>
                                    )}

                                    {currentStep >= 2 ? (
                                      <div className="flex items-start gap-2.5">
                                        <CheckCircle2 size={14} className={currentStep > 2 ? "text-emerald-600 mt-0.5 flex-shrink-0" : "text-amber-500 mt-0.5 flex-shrink-0 animate-pulse"} />
                                        <div>
                                          <p className="font-bold text-[#2c2a29]">
                                            {currentStep > 2 ? "Fine-art inkjet print completed" : "Active printing on premium wide-gamut plotter"}
                                          </p>
                                          <p className="text-[10px] text-gray-400">High-fidelity color correction applied. Utilizing 12-channel archival ink feed.</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-start gap-2.5 text-gray-400">
                                        <Clock size={14} className="mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="font-semibold">Awaiting plot and machine slot calibration</p>
                                        </div>
                                      </div>
                                    )}

                                    {currentStep >= 3 ? (
                                      <div className="flex items-start gap-2.5">
                                        <CheckCircle2 size={14} className={currentStep > 3 ? "text-emerald-600 mt-0.5 flex-shrink-0" : "text-amber-500 mt-0.5 flex-shrink-0 animate-pulse"} />
                                        <div>
                                          <p className="font-bold text-[#2c2a29]">
                                            {currentStep > 3 ? "QA Inspection passed & mounted" : "Quality assurance: color balance assessment & border alignment"}
                                          </p>
                                          <p className="text-[10px] text-gray-400">Custom beveling, mounting, glass sheen layout protection verification.</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-start gap-2.5 text-gray-400">
                                        <Clock size={14} className="mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="font-semibold">Framing assembly & quality check pending</p>
                                        </div>
                                      </div>
                                    )}

                                    {currentStep >= 4 ? (
                                      <div className="flex items-start gap-2.5">
                                        <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="font-bold text-[#2c2a29]">Product Fulfilled</p>
                                          <p className="text-[10px] text-gray-400">Successfully handed over or delivered to address: {ord.shippingAddress || "Picked up at local studio counter"}.</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-start gap-2.5 text-gray-400">
                                        <Clock size={14} className="mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="font-semibold">Final delivery dispatch / counter hand-off</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right Column: Live Mockup Simulator (Lg: col-span-5) */}
                              <div className="lg:col-span-5 space-y-4">
                                <h5 className="text-xs font-bold uppercase text-[#7c756d] tracking-wider flex items-center gap-1.5">
                                  <Sparkles size={14} className="text-yellow-500 fill-yellow-500 animate-pulse" />
                                  <span>Dynamic Mockup Visualizer</span>
                                </h5>

                                {/* Mockup Board */}
                                <div className="bg-stone-100 rounded-2xl p-6 flex items-center justify-center relative shadow-inner h-[210px] border border-stone-200">
                                  <motion.div 
                                    layout
                                    className={`relative transition-all duration-300 flex items-center justify-center max-w-[85%] max-h-[85%] shadow-xl ${
                                      trackFrame === "oak" ? "border-8 border-[#b48a53] ring-1 ring-[#926c3d]" :
                                      trackFrame === "black" ? "border-8 border-[#18181b] ring-1 ring-black" :
                                      trackFrame === "gold" ? "border-8 border-[#d4af37] ring-1 ring-[#b2932a]" :
                                      "border border-gray-200 bg-white p-0.5"
                                    }`}
                                    style={{ aspectRatio: "4/3", width: "160px" }}
                                  >
                                    <div className={`w-full h-full flex items-center justify-center ${trackFrame !== "frameless" ? "p-1.5 bg-[#faf9f6]" : "p-0"}`}>
                                      <div className="w-full h-full relative overflow-hidden bg-stone-200">
                                        <img 
                                          src={resolvedPrintMedia[ord.uploadedPhoto] || ord.uploadedPhoto} 
                                          alt="Visual print mockup" 
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover"
                                        />
                                        {trackMatte === "glossy" && (
                                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/30 pointer-events-none mix-blend-overlay" />
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>

                                  <span className="absolute bottom-2 left-2 text-[9px] uppercase font-bold text-stone-500 bg-white/60 px-2 py-0.5 rounded tracking-wider">
                                    {trackFrame} / {trackMatte}
                                  </span>
                                </div>

                                {/* Customizers in Tracking Panel */}
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Simulate Frame Style</span>
                                    <div className="flex gap-1">
                                      {["black", "oak", "gold", "frameless"].map((f) => (
                                        <button
                                          key={f}
                                          onClick={() => setTrackFrame(f as any)}
                                          className={`flex-1 py-1 text-[9px] font-bold rounded-lg border uppercase transition-all cursor-pointer ${
                                            trackFrame === f ? "border-stone-800 bg-stone-800 text-white" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                                          }`}
                                        >
                                          {f === "black" ? "Black" : f === "oak" ? "Oak" : f === "gold" ? "Gold" : "Canvas"}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Paper Sheen Finish</span>
                                    <div className="flex gap-1">
                                      {["glossy", "matte"].map((m) => (
                                        <button
                                          key={m}
                                          onClick={() => setTrackMatte(m as any)}
                                          className={`flex-1 py-1 text-[9px] font-bold rounded-lg border uppercase transition-all cursor-pointer ${
                                            trackMatte === m ? "border-stone-800 bg-stone-800 text-white" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                                          }`}
                                        >
                                          {m}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* C. Favorites Panel */}
        {activeSubTab === "favorites" && (
          <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 text-left space-y-6">
            <h3 className="font-display text-xl font-bold text-[#2c2a29]">My Saved Rizal Studios</h3>

            {favorites.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7c756d]">
                Your favorites list is empty. Click heart icons on the explore directory!
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {favorites.map((fav) => {
                  const stObj = studios.find(s => s.id === fav.studioId);
                  if (!stObj) return null;
                  return (
                    <div key={fav.id} className="p-4 rounded-xl border border-[#e5e1da] bg-[#faf9f6] flex justify-between items-center">
                      <div className="text-left space-y-1">
                        <h4 className="font-display font-bold text-sm text-[#2c2a29]">{stObj.name}</h4>
                        <p className="text-[10px] text-[#7c756d] font-semibold flex items-center gap-1">
                          <MapPin size={11} /> {stObj.location}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveFavorite(stObj.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                        title="Remove"
                      >
                        <Heart size={18} className="fill-current" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* PAYMENT PROOF DIALOG MODAL */}
      {payingBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-left space-y-4 border border-[#e5e1da]">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-bold text-sm text-[#2c2a29]">
                Submit {payingPaymentType === "Full Payment" ? "Full Payment" : "Downpayment"} of {
                  payingPaymentType === "Full Payment"
                    ? (Number(payingBooking.remainingBalance) > 0 ? Number(payingBooking.remainingBalance) : Number(payingBooking.totalAmount)).toLocaleString()
                    : (Number(payingBooking.downPaymentAmount) || Math.round(Number(payingBooking.totalAmount) * 0.3 * 100) / 100).toLocaleString()
                } PHP
              </h4>
              <button onClick={() => setPayingBooking(null)} className="text-gray-400 hover:text-black cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7c756d] uppercase">Payment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayingPaymentType("Downpayment")}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      payingPaymentType === "Downpayment"
                        ? "border-[#2c2a29] bg-[#2c2a29] text-white"
                        : "border-[#e5e1da] bg-[#faf9f6] text-[#7c756d] hover:border-[#2c2a29]"
                    }`}
                  >
                    Downpayment (₱{(Number(payingBooking.downPaymentAmount) || Math.round(Number(payingBooking.totalAmount) * 0.3 * 100) / 100).toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayingPaymentType("Full Payment")}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      payingPaymentType === "Full Payment"
                        ? "border-[#2c2a29] bg-[#2c2a29] text-white"
                        : "border-[#e5e1da] bg-[#faf9f6] text-[#7c756d] hover:border-[#2c2a29]"
                    }`}
                  >
                    Full Payment (₱{(Number(payingBooking.remainingBalance) > 0 ? Number(payingBooking.remainingBalance) : Number(payingBooking.totalAmount)).toLocaleString()})
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7c756d] uppercase">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7c756d] uppercase">Reference Transaction Number</label>
                <input
                  type="text"
                  required
                  value={refNo}
                  onChange={e => setRefNo(e.target.value)}
                  placeholder="Paste transaction reference"
                  className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7c756d] uppercase">Upload Receipt Shot</label>
                <div className="border-2 border-dashed border-[#e5e1da] rounded-xl p-3 text-center bg-[#faf9f6] relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileUpload(e, "payment")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {proofBase64 ? (
                    <span className="text-[10px] text-green-600 font-bold">Image loaded successfully!</span>
                  ) : (
                    <span className="text-[10px] text-[#7c756d]">Click to select photo</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#2c2a29] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow"
              >
                Upload & Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GCash QR Modal */}
      {gcashQRTarget && (
        <GCashQRModal
          isOpen={!!gcashQRTarget}
          onClose={() => setGcashQRTarget(null)}
          onPaymentSuccess={(_sessionId, _paymentId) => {
            setGcashQRTarget(null);
            window.location.reload(); // Refresh to reflect instant payment status
          }}
          bookingId={gcashQRTarget.bookingId}
          printOrderId={gcashQRTarget.printOrderId}
          studioId={gcashQRTarget.studioId}
          amount={gcashQRTarget.amount}
          paymentType={gcashQRTarget.paymentType}
          studioName={gcashQRTarget.studioName}
          description={gcashQRTarget.description}
          authToken={currentUser?.authToken || ""}
        />
      )}

      {/* REVIEW FEEDBACK DIALOG MODAL */}
      {reviewingBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-left space-y-4 border border-[#e5e1da]">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-bold text-sm text-[#2c2a29]">Submit Studio Review</h4>
              <button onClick={() => setReviewingBooking(null)} className="text-gray-400 hover:text-black cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7c756d] uppercase">Rating stars</label>
                <div className="flex gap-2 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setRating(stars)}
                      className="cursor-pointer"
                    >
                      <Star size={20} className={rating >= stars ? "fill-current" : ""} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7c756d] uppercase">Commentary Feedback</label>
                <textarea
                  required
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your photography experience with this studio..."
                  className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl p-3 text-xs focus:outline-none h-24"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-yellow-500 text-black rounded-xl text-xs font-bold uppercase tracking-wider shadow"
              >
                Submit Review Rating
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT PHOTO PROOFING PORTAL MODAL */}
      {proofingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 text-left relative shadow-2xl border border-[#e5e1da]">
            <button
              onClick={() => setProofingBookingId(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-[#2c2a29] rounded-full cursor-pointer z-10"
              title="Close Portal"
            >
              <X size={20} />
            </button>
            <ClientGallery
              bookingId={proofingBookingId}
              currentUser={currentUser}
              onClose={() => setProofingBookingId(null)}
            />
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {reschedulingBooking && (
        <RescheduleModal
          booking={reschedulingBooking}
          studio={studios.find(s => s.id === reschedulingBooking.studioId) || {}}
          services={services}
          packages={packages}
          currentUser={currentUser}
          onClose={() => setReschedulingBooking(null)}
          onSuccess={(updatedBooking) => {
            setReschedulingBooking(null);
            if (onRescheduleBooking) {
              onRescheduleBooking(
                updatedBooking.id,
                updatedBooking.bookingDate,
                updatedBooking.timeSlot
              );
            }
          }}
        />
      )}

      {/* REFUND REQUEST MODAL */}
      {refundingBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRefundingBooking(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md border border-[#e5e1da] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                  <RotateCcw size={18} className="text-purple-700" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#2c2a29]">Request a Refund</h3>
                  <p className="text-xs text-[#7c756d]">Booking {refundingBooking.id}</p>
                </div>
              </div>
              <button
                onClick={() => setRefundingBooking(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-800 space-y-1">
              <p className="font-bold">Amount Paid: ₱{Number(refundingBooking.amountPaid || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
              <p>Refund requests are reviewed by the studio. Processing typically takes 3–7 business days.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2c2a29] mb-2">
                Reason for Refund <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={refundReason}
                onChange={e => { setRefundReason(e.target.value); setRefundMsg(""); }}
                placeholder="Explain why you are requesting a refund…"
                rows={3}
                maxLength={400}
                className="w-full border border-[#e5e1da] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none text-[#2c2a29] placeholder-gray-400"
              />
            </div>

            {refundMsg && (
              <div className={`text-xs rounded-xl px-4 py-3 border ${refundMsg.startsWith("Refund request submitted") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
                {refundMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setRefundingBooking(null)}
                className="flex-1 py-2.5 bg-white border border-[#e5e1da] text-[#2c2a29] text-sm font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRefund}
                disabled={refundLoading || !refundReason.trim()}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {refundLoading ? (
                  <><RotateCcw size={14} className="animate-spin" /> Submitting…</>
                ) : (
                  <><RotateCcw size={14} /> Submit Request</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
