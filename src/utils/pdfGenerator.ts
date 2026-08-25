import { jsPDF } from "jspdf";
import { Booking, Payment, Studio, PrintOrder } from "../db/types";

/**
 * Generates and downloads an Official Booking Receipt PDF
 */
export function generateBookingReceiptPDF(
  booking: Booking,
  studio?: Studio,
  payment?: Payment
) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(studio?.name || "CAINTA PHOTOGRAPHY STUDIO", 14, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Official Booking Confirmation & Acknowledgement Receipt", 14, 18);
  doc.text("Cainta Studio Management Information System (MIS)", 14, 23);

  // Status Badge
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth - 55, 8, 42, 12, 2, 2, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`STATUS: ${booking.status.toUpperCase()}`, pageWidth - 52, 15);

  let y = 38;

  // Invoice & Customer Info Box
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

  // Column 1 - Booking
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

  doc.setFont("helvetica", "bold");
  doc.text(`Studio Location:`, 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(studio?.address || "Cainta, Rizal", 50, y);

  doc.setFont("helvetica", "bold");
  doc.text(`Payment Status:`, 110, y);
  doc.setFont("helvetica", "normal");
  doc.text(booking.paymentStatus, 145, y);
  y += 12;

  // Itemized Pricing Table
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, pageWidth - 28, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text("Description / Package Item", 18, y + 5.5);
  doc.text("Qty", 130, y + 5.5);
  doc.text("Amount (PHP)", pageWidth - 45, y + 5.5);
  y += 10;

  // Base Package row
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text("Photography Shoot Package", 18, y);
  doc.text("1", 132, y);
  doc.text(`PHP ${(booking.totalAmount - (booking.addons?.reduce((acc, a) => acc + (a.price * a.quantity), 0) || 0)).toLocaleString()}`, pageWidth - 45, y);
  y += 7;

  // Addons if any
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

  // Totals Summary
  const rightXLabel = pageWidth - 80;
  const rightXVal = pageWidth - 45;

  doc.setFont("helvetica", "bold");
  doc.text("Total Package Price:", rightXLabel, y);
  doc.text(`PHP ${booking.totalAmount.toLocaleString()}`, rightXVal, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Amount Paid / Downpayment:", rightXLabel, y);
  doc.text(`PHP ${(booking.amountPaid || 0).toLocaleString()}`, rightXVal, y);
  y += 6;

  const remainingBalance = Math.max(0, booking.totalAmount - (booking.amountPaid || 0));
  doc.setFont("helvetica", "bold");
  doc.setTextColor(remainingBalance > 0 ? 180 : 22, remainingBalance > 0 ? 83 : 101, remainingBalance > 0 ? 9 : 52);
  doc.text("Remaining Balance:", rightXLabel, y);
  doc.text(`PHP ${remainingBalance.toLocaleString()}`, rightXVal, y);
  y += 12;

  // Payment Reference box if available
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

  // Terms and Footer
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

  // Stamp / Watermark text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("CAINTA PHOTOGRAPHY STUDIO MIS - OFFICIAL DIGITAL RECEIPT", pageWidth / 2, y, { align: "center" });

  doc.save(`Receipt_${booking.id}_CaintaMIS.pdf`);
}

/**
 * Generates a Studio Financial & Sales Analytics PDF Report
 */
export function generateStudioSalesReportPDF(
  studio: Studio,
  bookings: Booking[],
  printOrders: PrintOrder[],
  dateRangeLabel: string = "All-Time Financial Ledger"
) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`${studio.name.toUpperCase()} - FINANCIAL REPORT`, 14, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Scope: ${dateRangeLabel} | Generated on: ${new Date().toLocaleString()}`, 14, 22);
  doc.text(`Studio Location: ${studio.address}`, 14, 27);

  let y = 42;

  // Metrics KPI summary cards
  const totalBookingRevenue = bookings.filter(b => b.paymentStatus === "Paid" || b.paymentStatus === "Partially Paid").reduce((acc, b) => acc + b.amountPaid, 0);
  const totalPrintRevenue = printOrders.filter(p => p.paymentStatus === "Paid").reduce((acc, p) => acc + p.totalAmount, 0);
  const totalRevenue = totalBookingRevenue + totalPrintRevenue;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 55, 20, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL REVENUE", 18, y + 6);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`PHP ${totalRevenue.toLocaleString()}`, 18, y + 14);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(75, y, 55, 20, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("CONFIRMED BOOKINGS", 79, y + 6);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${bookings.length} Orders`, 79, y + 14);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(136, y, 55, 20, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("PRINTING ORDERS", 140, y + 6);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${printOrders.length} Orders`, 140, y + 14);

  y += 28;

  // Bookings Ledger Header
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Bookings Revenue Ledger", 14, y);
  y += 6;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, "F");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text("ID", 16, y + 5);
  doc.text("Customer", 42, y + 5);
  doc.text("Date / Slot", 85, y + 5);
  doc.text("Status", 130, y + 5);
  doc.text("Amount Paid", pageWidth - 35, y + 5);
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  bookings.slice(0, 15).forEach((b) => {
    doc.text(b.id, 16, y);
    doc.text(b.customerDetails.fullName.slice(0, 20), 42, y);
    doc.text(`${b.bookingDate} (${b.timeSlot})`, 85, y);
    doc.text(b.status, 130, y);
    doc.text(`PHP ${b.amountPaid.toLocaleString()}`, pageWidth - 35, y);
    y += 6;
  });

  if (bookings.length > 15) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text(`... plus ${bookings.length - 15} additional booking records.`, 16, y);
    y += 8;
  }

  y += 10;

  // Signatures
  doc.setLineWidth(0.3);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 70, y);
  doc.line(pageWidth - 70, y, pageWidth - 14, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Prepared By: Studio Administrator", 14, y);
  doc.text("Approved By: Cainta MIS Super Admin", pageWidth - 70, y);

  doc.save(`${studio.name.replace(/[^a-z0-9]/gi, "_")}_Financial_Report.pdf`);
}
