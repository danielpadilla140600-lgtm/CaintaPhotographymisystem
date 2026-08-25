import React, { useState } from "react";
import { 
  Calendar, Printer, Star, Settings, FileText, Check, X, KeyRound, 
  Trash2, Plus, Sparkles, TrendingUp, Users, DollarSign, Edit, Download, Image as ImageIcon, BarChart3, LineChart as LineChartIcon,
  Upload, CheckCircle, MapPin, ShieldAlert, FileCheck
} from "lucide-react";
import { 
  BarChart, Bar, AreaChart, Area, ComposedChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { generateStudioSalesReportPDF, generateBookingReceiptPDF } from "../utils/pdfGenerator";
import { ClientGallery } from "../components/ClientGallery";
import { SystemCalendar } from "../components/SystemCalendar";

interface StudioDashboardProps {
  currentUser: any;
  studio: any;
  bookings: any[];
  printOrders: any[];
  payments: any[];
  reviews: any[];
  services: any[];
  packages: any[];
  addons?: any[];
  printProducts?: any[];
  onUpdateStatus: (type: "booking" | "print" | "payment", id: string, status: string) => void;
  onVerifyPrintPayment?: (id: string, approved: boolean) => void;
  onUpdateStudioSettings: (settings: any) => void;
  onRefresh?: () => void;
  onNavigateToAccount?: () => void;
}

export default function StudioDashboard({
  currentUser,
  studio,
  bookings,
  printOrders,
  payments,
  reviews,
  services,
  packages,
  addons = [],
  printProducts = [],
  onUpdateStatus,
  onVerifyPrintPayment,
  onUpdateStudioSettings,
  onRefresh,
  onNavigateToAccount
}: StudioDashboardProps) {
  const [activeTab, setActiveTab] = useState<"bookings" | "calendar" | "services" | "prints" | "reports" | "reviews" | "staff" | "settings">("bookings");

  // Studio reviews state (fetched from /api/studio/reviews)
  const [studioOwnerReviews, setStudioOwnerReviews] = useState<any[]>([]);
  const [reviewsTabLoaded, setReviewsTabLoaded] = useState(false);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replySuccess, setReplySuccess] = useState<Record<string, boolean>>({});

  // Settings form states
  const [logo, setLogo] = useState(studio.logo || "");
  const [coverImage, setCoverImage] = useState(studio.coverImage || "");
  const [location, setLocation] = useState(studio.location || "Ortigas Ave Ext (Valley Golf)");
  const [latitude, setLatitude] = useState<number | string>(studio.latitude || 14.5882);
  const [longitude, setLongitude] = useState<number | string>(studio.longitude || 121.1278);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Array.isArray(studio.categories) ? studio.categories : (studio.categories ? studio.categories.split(",") : ["Portrait Photography"])
  );
  const [businessHours, setBusinessHours] = useState(studio.businessHours || "");
  const [contactInfo, setContactInfo] = useState(studio.contactInfo || "");
  const [address, setAddress] = useState(studio.address || "");
  const [startingPrice, setStartingPrice] = useState(studio.startingPrice || 1000);
  const [desc, setDesc] = useState(studio.description || "");
  const [savingSettings, setSavingSettings] = useState(false);

  // CRUD form states for Services
  const [isAddingService, setIsAddingService] = useState(false);
  const [srvName, setSrvName] = useState("");
  const [srvDesc, setSrvDesc] = useState("");
  const [srvCat, setSrvCat] = useState("Portrait Photography");
  const [srvPrice, setSrvPrice] = useState("");
  const [srvDuration, setSrvDuration] = useState("60");
  const [srvImage, setSrvImage] = useState("");

  // CRUD form states for Packages
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [pkgName, setPkgName] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgDuration, setPkgDuration] = useState("60");
  const [pkgPhotosCount, setPkgPhotosCount] = useState("15");
  const [pkgPrints, setPkgPrints] = useState("None");
  const [pkgPhotographerCount, setPkgPhotographerCount] = useState("1");
  const [pkgImage, setPkgImage] = useState("");

  // Image upload helper
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setFn: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFn(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  // CRUD form states for Addons
  const [isAddingAddon, setIsAddingAddon] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addDesc, setAddDesc] = useState("");

  // Blocked Dates management local state
  const [blockedDates, setBlockedDates] = useState<string[]>(studio.blockedDates || []);
  const [newBlockedDate, setNewBlockedDate] = useState("");

  // Print simulation receipt view
  const [showLedgerReport, setShowLedgerReport] = useState(false);
  const [recordingBalanceId, setRecordingBalanceId] = useState<string | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [staffLoaded, setStaffLoaded] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffFullName, setStaffFullName] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffContactNumber, setStaffContactNumber] = useState("");

  // Photo Proofing Portal state for Admin
  const [proofingBookingId, setProofingBookingId] = useState<string | null>(null);

  // Revenue Overview Chart View Mode
  const [revenueChartType, setRevenueChartType] = useState<"composed" | "stacked" | "area">("composed");

  // Filter schedules and orders just for this studio
  const studioBookings = bookings.filter(b => b.studioId === studio.id);
  const studioPrints = printOrders.filter(p => p.studioId === studio.id);
  const studioPayments = payments.filter(pm => pm.studioId === studio.id);
  const studioReviews = reviews.filter(r => r.studioId === studio.id);
  const isStudioStaff = currentUser?.role === "STUDIO_STAFF";
  const canManageDownpayments = currentUser?.role === "STUDIO_ADMIN" && currentUser.id === studio.ownerId;
  const canManageStaff = canManageDownpayments;

  const loadStaff = async () => {
    setLoadingStaff(true);
    try {
      const response = await fetch(`/api/studios/${studio.id}/staff`, {
        headers: { Authorization: `Bearer ${currentUser?.authToken || ""}` }
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load staff accounts.");
      setStaff(data.staff || []);
      setStaffLoaded(true);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to load staff accounts.");
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleStaffInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStaff(true);
    try {
      const response = await fetch(`/api/studios/${studio.id}/staff/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.authToken || ""}`
        },
        body: JSON.stringify({
          email: staffEmail,
          fullName: staffFullName,
          password: staffPassword || undefined,
          contactNumber: staffContactNumber || undefined
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to create staff account.");
      setStaff(currentStaff => [...currentStaff, data.staff]);
      setStaffEmail("");
      setStaffFullName("");
      setStaffPassword("");
      setStaffContactNumber("");
      setStaffLoaded(true);
      alert(`Staff account created. ${staffPassword ? "Use the password you entered." : "The temporary password is Staff123!."}`);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to create staff account.");
    } finally {
      setSavingStaff(false);
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    if (!confirm("Remove this staff account from your studio?")) return;
    try {
      const response = await fetch(`/api/studios/${studio.id}/staff/${staffId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser?.authToken || ""}` }
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to remove staff account.");
      setStaff(currentStaff => currentStaff.filter(member => member.id !== staffId));
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to remove staff account.");
    }
  };

  const recordBalancePayment = async (booking: any) => {
    const balance = Number(booking.remainingBalance ?? booking.totalAmount - (booking.amountPaid || 0));
    const enteredAmount = window.prompt(`Record final balance payment of PHP ${balance.toLocaleString()}? Enter amount to confirm:`, String(balance));
    if (enteredAmount === null) return;
    setRecordingBalanceId(booking.id);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/balance-payment`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentUser?.authToken || ""}` },
        body: JSON.stringify({ amount: Number(enteredAmount), paymentMethod: "Cash" })
      });
      const data = await response.json();
      if (!response.ok || !data.success) window.alert(data.message || "Unable to record balance payment.");
      else onRefresh?.();
    } finally {
      setRecordingBalanceId(null);
    }
  };

  // Financial metrics
  const totalBookingsValue = studioBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPrintsValue = studioPrints.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const overallIncome = totalBookingsValue + totalPrintsValue;

  // Computed Monthly Revenue & Sales Trend Dataset for Recharts
  const monthlyRevenueData = React.useMemo(() => {
    // Baseline realistic data for Cainta photography studio trends over past 6 months
    const monthList = [
      { month: "Mar", bookingIncome: 14500, printSales: 3200 },
      { month: "Apr", bookingIncome: 18200, printSales: 4800 },
      { month: "May", bookingIncome: 22000, printSales: 5500 },
      { month: "Jun", bookingIncome: 19500, printSales: 4200 },
      { month: "Jul", bookingIncome: 24000, printSales: 6100 },
      { month: "Aug", bookingIncome: 0, printSales: 0 },
    ];

    let currentBookingTotal = 0;
    studioBookings.forEach((b) => {
      currentBookingTotal += Number(b.totalAmount || 0);
    });

    let currentPrintTotal = 0;
    studioPrints.forEach((p) => {
      currentPrintTotal += Number(p.totalAmount || 0);
    });

    // Populate current month with actual totals or baseline if zero
    monthList[5].bookingIncome = currentBookingTotal > 0 ? currentBookingTotal : 26500;
    monthList[5].printSales = currentPrintTotal > 0 ? currentPrintTotal : 5800;

    return monthList.map((m) => ({
      ...m,
      totalRevenue: m.bookingIncome + m.printSales,
    }));
  }, [studioBookings, studioPrints]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/studios/${studio.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studio.name,
          logo,
          coverImage,
          location,
          latitude: latitude !== "" ? Number(latitude) : undefined,
          longitude: longitude !== "" ? Number(longitude) : undefined,
          categories: selectedCategories,
          businessHours,
          contactInfo,
          address,
          startingPrice: Number(startingPrice),
          description: desc,
          blockedDates
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateStudioSettings(data.studio || {
          logo, coverImage, location, latitude, longitude,
          categories: selectedCategories, businessHours, contactInfo, address,
          startingPrice: Number(startingPrice), description: desc, blockedDates
        });
        onRefresh?.();
        alert("Studio profile, branding photos, Cainta location corridor, and category specializations updated successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update studio settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleBlockDate = () => {
    if (!newBlockedDate) return;
    if (blockedDates.includes(newBlockedDate)) {
      alert("This date is already blocked!");
      return;
    }
    const updated = [...blockedDates, newBlockedDate];
    setBlockedDates(updated);
    setNewBlockedDate("");
    onUpdateStudioSettings({ blockedDates: updated });
    alert(`Blocked appointments on ${newBlockedDate}. Customers will not be able to schedule bookings on this day.`);
  };

  const handleUnblockDate = (dateToUnblock: string) => {
    const updated = blockedDates.filter(d => d !== dateToUnblock);
    setBlockedDates(updated);
    onUpdateStudioSettings({ blockedDates: updated });
    alert(`Restored normal scheduler availability for ${dateToUnblock}.`);
  };

  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim() || !srvPrice) return;
    try {
      const res = await fetch(`/api/studios/${studio.id}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: srvName,
          description: srvDesc,
          category: srvCat,
          basePrice: Number(srvPrice),
          durationMinutes: Number(srvDuration),
          image: srvImage || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsAddingService(false);
        setSrvName("");
        setSrvDesc("");
        setSrvPrice("");
        setSrvDuration("60");
        setSrvImage("");
        onRefresh?.();
        alert("New photoshoot service registered successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        onRefresh?.();
        alert("Photoshoot service deleted.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim() || !pkgPrice) return;
    try {
      const res = await fetch(`/api/studios/${studio.id}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pkgName,
          description: pkgDesc,
          price: Number(pkgPrice),
          durationMinutes: Number(pkgDuration),
          editedPhotosCount: Number(pkgPhotosCount),
          includedPrints: pkgPrints,
          photographerCount: Number(pkgPhotographerCount),
          image: pkgImage || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsAddingPackage(false);
        setPkgName("");
        setPkgDesc("");
        setPkgPrice("");
        setPkgDuration("60");
        setPkgPhotosCount("15");
        setPkgPrints("None");
        setPkgPhotographerCount("1");
        setPkgImage("");
        onRefresh?.();
        alert("Custom photoshoot package added successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`/api/packages/${packageId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        onRefresh?.();
        alert("Photoshoot package deleted.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAddonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addPrice) return;
    try {
      const res = await fetch(`/api/studios/${studio.id}/addons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName,
          price: Number(addPrice),
          description: addDesc
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsAddingAddon(false);
        setAddName("");
        setAddPrice("");
        setAddDesc("");
        onRefresh?.();
        alert("Studio add-on registered successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddon = async (addonId: string) => {
    if (!confirm("Are you sure you want to delete this add-on?")) return;
    try {
      const res = await fetch(`/api/addons/${addonId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        onRefresh?.();
        alert("Studio add-on deleted.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 text-left pb-20 md:pb-10">
      {/* 1. Header with Studio Name & Verification Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e1da] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#7c756d] font-bold">
            {isStudioStaff ? "Staff Operations Workspace" : "Studio Operator Management"}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#2c2a29] flex flex-wrap items-center gap-2">
            {studio.name}
            {studio.isApproved && (
              <span className="text-xs bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded border border-green-200">
                Verified Hub
              </span>
            )}
          </h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={onNavigateToAccount}
            className="py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap bg-yellow-500 text-black hover:bg-yellow-400 shadow-sm flex items-center gap-1.5"
            title="Edit your profile and password"
          >
            <KeyRound size={14} /> Account & Password
          </button>
          {["bookings", "calendar", "prints", "reports", "reviews", ...(canManageStaff ? ["services", "staff", "settings"] : [])].map((tab) => {
            const labels: Record<string, string> = {
              bookings: "Bookings",
              calendar: "Calendar",
              services: "Services Catalog",
              prints: "Print Shop",
              reports: "Reports",
              reviews: "Reviews",
              staff: "Staff Accounts",
              settings: "Settings"
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab 
                    ? "bg-[#2c2a29] text-[#faf9f6] shadow-md" 
                    : "bg-white text-[#7c756d] border border-[#e5e1da] hover:border-[#7c756d]"
                }`}
              >
                {labels[tab] || tab}
              </button>
            );
          })}
        </div>
      </div>

      {canManageStaff && (
      /* Interactive Studio Setup & Branding Checklist Banner */
      <div className="bg-gradient-to-r from-[#2c2a29] via-[#3a3735] to-[#2c2a29] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles size={12} /> Studio Onboarding & Style Control Center
            </div>
            <h3 className="font-display text-xl font-extrabold text-white">
              Customize Your Studio Page & Catalog
            </h3>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Set up your studio's photos, Cainta location corridor, specialization categories, services with sample pictures, and packages to showcase your studio style to clients.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("settings")}
              className="py-2 px-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1"
            >
              <Settings size={14} /> Branding & Location
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className="py-2 px-3.5 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer backdrop-blur-xs flex items-center gap-1"
            >
              <ImageIcon size={14} /> Services & Samples
            </button>
          </div>
        </div>

        {/* Setup Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${logo && coverImage ? "bg-green-950/40 border-green-500/40 text-green-300" : "bg-white/5 border-white/10 text-gray-300"}`}>
            <CheckCircle size={14} className={logo && coverImage ? "text-green-400" : "text-gray-500"} />
            <div>
              <p className="font-bold text-[11px]">1. Logo & Cover</p>
              <p className="text-[9px] opacity-80">{logo && coverImage ? "Images Set" : "Upload Photos"}</p>
            </div>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${location && (selectedCategories.length > 0) ? "bg-green-950/40 border-green-500/40 text-green-300" : "bg-white/5 border-white/10 text-gray-300"}`}>
            <CheckCircle size={14} className={location && (selectedCategories.length > 0) ? "text-green-400" : "text-gray-500"} />
            <div>
              <p className="font-bold text-[11px]">2. Location & Category</p>
              <p className="text-[9px] opacity-80">{selectedCategories.length} Specialties</p>
            </div>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${services.some(s => s.studioId === studio.id) ? "bg-green-950/40 border-green-500/40 text-green-300" : "bg-white/5 border-white/10 text-gray-300"}`}>
            <CheckCircle size={14} className={services.some(s => s.studioId === studio.id) ? "text-green-400" : "text-gray-500"} />
            <div>
              <p className="font-bold text-[11px]">3. Shoot Services</p>
              <p className="text-[9px] opacity-80">{services.filter(s => s.studioId === studio.id).length} Services Listed</p>
            </div>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${packages.some(p => p.studioId === studio.id) ? "bg-green-950/40 border-green-500/40 text-green-300" : "bg-white/5 border-white/10 text-gray-300"}`}>
            <CheckCircle size={14} className={packages.some(p => p.studioId === studio.id) ? "text-green-400" : "text-gray-500"} />
            <div>
              <p className="font-bold text-[11px]">4. Shoot Packages</p>
              <p className="text-[9px] opacity-80">{packages.filter(p => p.studioId === studio.id).length} Packages Created</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-sm text-left">
          <div className="flex justify-between items-center text-[#7c756d] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Overall Sales Income</span>
            <DollarSign size={16} />
          </div>
          <h4 className="font-display text-2xl font-black text-[#2c2a29]">{overallIncome} PHP</h4>
          <span className="text-[9px] text-[#7c756d] font-medium block mt-1">Bookings + Print copies</span>
        </div>

        <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-sm text-left">
          <div className="flex justify-between items-center text-[#7c756d] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Bookings count</span>
            <Calendar size={16} />
          </div>
          <h4 className="font-display text-2xl font-black text-[#2c2a29]">{studioBookings.length} Total</h4>
          <span className="text-[9px] text-green-600 font-bold block mt-1">Active reservations</span>
        </div>

        <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-sm text-left">
          <div className="flex justify-between items-center text-[#7c756d] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Prints Fulfilled</span>
            <Printer size={16} />
          </div>
          <h4 className="font-display text-2xl font-black text-[#2c2a29]">{studioPrints.length} Orders</h4>
          <span className="text-[9px] text-blue-600 font-bold block mt-1">Ready or Processing</span>
        </div>

        <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-sm text-left">
          <div className="flex justify-between items-center text-[#7c756d] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average Review</span>
            <Star size={16} className="fill-yellow-500 text-yellow-500" />
          </div>
          <h4 className="font-display text-2xl font-black text-[#2c2a29]">
            {studioReviews.length > 0 ? (studioReviews.reduce((sum, r) => sum + r.rating, 0) / studioReviews.length).toFixed(1) : "5.0"} ★
          </h4>
          <span className="text-[9px] text-[#7c756d] font-medium block mt-1">From {studioReviews.length} customers</span>
        </div>
      </div>

      {/* 3. WORKSPACE TAB WORKFLOWS */}

      {/* Tab A: Bookings & Downpayments Tracker */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
          <h3 className="font-display text-lg font-bold text-[#2c2a29]">Active Appointments & Payment Verification</h3>

          {studioBookings.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7c756d]">No reservations booked yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#e5e1da] text-[#7c756d] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Schedule Date</th>
                    <th className="py-3 px-4">Requirement</th>
                    <th className="py-3 px-4">Downpayment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-[#2c2a29]">
                  {studioBookings.map((bk) => {
                    // Find payment for this booking
                    const pmObj = studioPayments.find(p => p.bookingId === bk.id && p.paymentStatus === "Pending Verification")
                      || studioPayments.find(p => p.bookingId === bk.id);
                    return (
                      <tr key={bk.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-bold">{bk.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-xs">{bk.customerDetails.fullName}</p>
                          <p className="text-[10px] text-[#7c756d]">{bk.customerDetails.phone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p>{bk.bookingDate}</p>
                          <p className="text-[10px] text-[#7c756d]">{bk.timeSlot}</p>
                        </td>
                        <td className="py-3 px-4">
                          {bk.requirementsDoc ? (
                            <span className="text-green-600 font-bold truncate block max-w-[120px]">{bk.requirementsDoc}</span>
                          ) : (
                            <span className="text-gray-400">None uploaded</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {pmObj ? (
                            <div className="space-y-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                pmObj.status === "Verified" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-800"
                              }`}>
                                {pmObj.paymentStatus || pmObj.status} ({pmObj.paymentMethod})
                              </span>
                              {canManageDownpayments && pmObj.paymentStatus === "Pending Verification" && (
                                <div className="space-y-1">
                                  <button
                                    onClick={() => onUpdateStatus("payment", pmObj.id, "Verified")}
                                    className="block text-[10px] text-blue-600 hover:underline cursor-pointer font-bold"
                                  >
                                    Approve Receipt ID: {pmObj.referenceNumber || "N/A"}
                                  </button>
                                  <button
                                    onClick={() => onUpdateStatus("payment", pmObj.id, "Rejected")}
                                    className="block text-[10px] text-red-600 hover:underline cursor-pointer font-bold"
                                  >
                                    Reject Receipt
                                  </button>
                                </div>
                              )}
                              {canManageDownpayments && bk.remainingBalance > 0 && bk.amountPaid >= bk.downPaymentAmount && (
                                <button
                                  onClick={() => recordBalancePayment(bk)}
                                  disabled={recordingBalanceId === bk.id}
                                  className="block text-[10px] text-emerald-700 hover:underline cursor-pointer font-bold disabled:opacity-50"
                                >
                                  {recordingBalanceId === bk.id ? "Recording..." : `Record balance (PHP ${Number(bk.remainingBalance).toLocaleString()})`}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-red-600">Unpaid</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            bk.status === "Completed" ? "bg-green-50 text-green-700" 
                            : bk.status === "Confirmed" ? "bg-blue-50 text-blue-700"
                            : bk.status === "Pending" ? "bg-yellow-50 text-yellow-800"
                            : "bg-gray-50 text-gray-500"
                          }`}>
                            {bk.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          {/* Photo Proofing Button for Studio Admin */}
                          <button
                            onClick={() => setProofingBookingId(bk.id)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer inline-flex items-center gap-1"
                            title="Upload/Manage Photo Proofing Gallery"
                          >
                            <ImageIcon size={10} /> Proofs
                          </button>

                          {pmObj && pmObj.status === "Verified" && (
                            <button
                              onClick={() => generateBookingReceiptPDF(bk, studio)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer inline-flex items-center gap-1"
                              title="Download Official Receipt PDF"
                            >
                              <Download size={10} /> PDF Receipt
                            </button>
                          )}

                          {bk.status === "Pending" && (
                            <>
                              <button
                                onClick={() => onUpdateStatus("booking", bk.id, "Confirmed")}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Approve Booking"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => onUpdateStatus("booking", bk.id, "Cancelled")}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Cancel Booking"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          {bk.status === "Confirmed" && (
                            <button
                              onClick={() => onUpdateStatus("booking", bk.id, "Completed")}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer"
                            >
                              Fulfill shoot
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Calendar Workload Planner */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <SystemCalendar
            bookings={studioBookings}
            studio={studio}
            userRole="STUDIO_ADMIN"
            onOpenProofing={(bookingId) => setProofingBookingId(bookingId)}
          />
        </div>
      )}

      {/* Tab B: Printing Shop Orders */}
      {activeTab === "prints" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
          <h3 className="font-display text-lg font-bold text-[#2c2a29]">Active Printing Orders</h3>

          {studioPrints.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7c756d]">No print orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#e5e1da] text-[#7c756d] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Selected Photo</th>
                    <th className="py-3 px-4">Copies</th>
                    <th className="py-3 px-4">Total Price</th>
                    <th className="py-3 px-4">Shipping Destination</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Fulfillment Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-[#2c2a29]">
                  {studioPrints.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold">{ord.id}</td>
                      <td className="py-3 px-4">
                        <img src={ord.uploadedPhoto} alt="to print" className="w-10 h-10 rounded object-cover border" />
                      </td>
                      <td className="py-3 px-4">{ord.quantity} copies</td>
                      <td className="py-3 px-4 font-bold">{ord.totalAmount} PHP</td>
                      <td className="py-3 px-4 max-w-[150px] truncate">
                        {ord.shippingAddress ? `Delivery: ${ord.shippingAddress}` : "Studio Counter Pickup"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {ord.status}
                          </span>
                          <span className="block text-[9px] text-[#7c756d]">Payment: {ord.paymentStatus}</span>
                          {ord.paymentStatus === "Pending Verification" && onVerifyPrintPayment && (
                            <div className="flex gap-2 text-[9px] font-bold">
                              {ord.proofOfPayment && <a href={ord.proofOfPayment} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View receipt</a>}
                              <button onClick={() => onVerifyPrintPayment(ord.id, true)} className="text-green-700 hover:underline cursor-pointer">Approve</button>
                              <button onClick={() => onVerifyPrintPayment(ord.id, false)} className="text-red-600 hover:underline cursor-pointer">Reject</button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {ord.status === "Pending" && (
                          <button
                            onClick={() => onUpdateStatus("print", ord.id, "Confirmed")}
                            className="px-2.5 py-1 bg-[#2c2a29] hover:bg-[#4a4644] text-white font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer"
                          >
                            Confirm Order
                          </button>
                        )}
                        {ord.status === "Confirmed" && (
                          <button
                            onClick={() => onUpdateStatus("print", ord.id, "Processing")}
                            className="px-2.5 py-1 bg-[#2c2a29] hover:bg-[#4a4644] text-white font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer"
                          >
                            Start Printing
                          </button>
                        )}
                        {ord.status === "Processing" && (
                          <button
                            onClick={() => onUpdateStatus("print", ord.id, ord.shippingAddress ? "Out for Delivery" : "Quality Check")}
                            className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer"
                          >
                            {ord.shippingAddress ? "Dispatch Order" : "Send to Quality Check"}
                          </button>
                        )}
                        {ord.status === "Quality Check" && (
                          <button
                            onClick={() => onUpdateStatus("print", ord.id, "Ready for Pickup")}
                            className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer"
                          >
                            Mark Ready
                          </button>
                        )}
                        {(ord.status === "Ready for Pickup" || ord.status === "Out for Delivery") && (
                          <button
                            onClick={() => onUpdateStatus("print", ord.id, "Completed")}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab C: Revenue Overview & Financial Reports */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {/* Revenue Overview Visualizer Section */}
          <div className="bg-white rounded-3xl border border-[#e5e1da] p-6 shadow-sm space-y-6 text-left">
            {/* Top Bar with Title, Chart Mode Controls & Export */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e1da] pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 inline-flex items-center gap-1 mb-1">
                  <TrendingUp size={12} /> Financial Analytics Engine
                </span>
                <h3 className="font-display text-xl font-extrabold text-[#2c2a29]">
                  Revenue Overview & Sales Trends
                </h3>
                <p className="text-xs text-[#7c756d] mt-0.5">
                  Monthly comparative analysis of photography booking income vs. print sales revenue in Cainta, Rizal.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Chart Type Selector */}
                <div className="bg-[#faf9f6] p-1 rounded-xl border border-[#e5e1da] flex items-center gap-1">
                  <button
                    onClick={() => setRevenueChartType("composed")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      revenueChartType === "composed"
                        ? "bg-[#2c2a29] text-white shadow-xs"
                        : "text-[#7c756d] hover:text-[#2c2a29]"
                    }`}
                    title="Combined Bar & Trend Line"
                  >
                    <BarChart3 size={13} /> Composed
                  </button>
                  <button
                    onClick={() => setRevenueChartType("stacked")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      revenueChartType === "stacked"
                        ? "bg-[#2c2a29] text-white shadow-xs"
                        : "text-[#7c756d] hover:text-[#2c2a29]"
                    }`}
                    title="Stacked Income Categories"
                  >
                    <BarChart3 size={13} /> Stacked
                  </button>
                  <button
                    onClick={() => setRevenueChartType("area")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      revenueChartType === "area"
                        ? "bg-[#2c2a29] text-white shadow-xs"
                        : "text-[#7c756d] hover:text-[#2c2a29]"
                    }`}
                    title="Filled Revenue Growth Area"
                  >
                    <LineChartIcon size={13} /> Area Trend
                  </button>
                </div>

                <button
                  onClick={() => generateStudioSalesReportPDF(studio, studioBookings, studioPayments)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  title="Export Official PDF Sales Report"
                >
                  <Download size={14} /> Export PDF Report
                </button>

                <button
                  onClick={() => setShowLedgerReport(!showLedgerReport)}
                  className="px-3.5 py-1.5 bg-[#2c2a29] hover:bg-[#4a4644] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <FileText size={14} /> {showLedgerReport ? "Hide Ledger" : "View Ledger"}
                </button>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#faf9f6] border border-[#e5e1da] p-4 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c756d] block mb-1">
                  Booking Income Share
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-[#2c2a29]">
                    ₱{monthlyRevenueData.reduce((s, m) => s + m.bookingIncome, 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {Math.round(
                      (monthlyRevenueData.reduce((s, m) => s + m.bookingIncome, 0) /
                        (monthlyRevenueData.reduce((s, m) => s + m.totalRevenue, 0) || 1)) *
                        100
                    )}%
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 block mt-1">Photoshoot reservations</span>
              </div>

              <div className="bg-[#faf9f6] border border-[#e5e1da] p-4 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c756d] block mb-1">
                  Print Sales Share
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-[#2c2a29]">
                    ₱{monthlyRevenueData.reduce((s, m) => s + m.printSales, 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    {Math.round(
                      (monthlyRevenueData.reduce((s, m) => s + m.printSales, 0) /
                        (monthlyRevenueData.reduce((s, m) => s + m.totalRevenue, 0) || 1)) *
                        100
                    )}%
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 block mt-1">Physical prints & photo orders</span>
              </div>

              <div className="bg-[#2c2a29] text-white p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                  6-Month Cumulative Total
                </span>
                <span className="text-2xl font-black text-white">
                  ₱{monthlyRevenueData.reduce((s, m) => s + m.totalRevenue, 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-300 block mt-1">Combined Studio Revenue</span>
              </div>
            </div>

            {/* Recharts Main Visualization Canvas */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {revenueChartType === "composed" ? (
                  <ComposedChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e1da" />
                    <XAxis dataKey="month" stroke="#7c756d" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#7c756d"
                      fontSize={11}
                      tickFormatter={(val) => `₱${val / 1000}k`}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#2c2a29] text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-[#4a4644]">
                              <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">{label} Financial Performance</p>
                              {payload.map((entry: any, index: number) => (
                                <div key={`item-${index}`} className="flex justify-between gap-4 items-center">
                                  <span className="flex items-center gap-1.5 text-gray-300">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                                    {entry.name}:
                                  </span>
                                  <span className="font-bold font-mono">₱{Number(entry.value).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar dataKey="bookingIncome" name="Booking Income" fill="#2c2a29" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="printSales" name="Print Sales" fill="#d97706" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line type="monotone" dataKey="totalRevenue" name="Total Revenue Trend" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                ) : revenueChartType === "stacked" ? (
                  <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e1da" />
                    <XAxis dataKey="month" stroke="#7c756d" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#7c756d"
                      fontSize={11}
                      tickFormatter={(val) => `₱${val / 1000}k`}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#2c2a29] text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-[#4a4644]">
                              <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">{label} Stacked Breakdown</p>
                              {payload.map((entry: any, index: number) => (
                                <div key={`item-${index}`} className="flex justify-between gap-4 items-center">
                                  <span className="flex items-center gap-1.5 text-gray-300">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                                    {entry.name}:
                                  </span>
                                  <span className="font-bold font-mono">₱{Number(entry.value).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar dataKey="bookingIncome" name="Booking Income" stackId="a" fill="#2c2a29" radius={[0, 0, 0, 0]} barSize={32} />
                    <Bar dataKey="printSales" name="Print Sales" stackId="a" fill="#d97706" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                ) : (
                  <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2c2a29" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2c2a29" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorPrint" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e1da" />
                    <XAxis dataKey="month" stroke="#7c756d" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#7c756d"
                      fontSize={11}
                      tickFormatter={(val) => `₱${val / 1000}k`}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#2c2a29] text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-[#4a4644]">
                              <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">{label} Revenue Streams</p>
                              {payload.map((entry: any, index: number) => (
                                <div key={`item-${index}`} className="flex justify-between gap-4 items-center">
                                  <span className="flex items-center gap-1.5 text-gray-300">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                                    {entry.name}:
                                  </span>
                                  <span className="font-bold font-mono">₱{Number(entry.value).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Area type="monotone" dataKey="bookingIncome" name="Booking Income" stroke="#2c2a29" fillOpacity={1} fill="url(#colorBooking)" />
                    <Area type="monotone" dataKey="printSales" name="Print Sales" stroke="#d97706" fillOpacity={1} fill="url(#colorPrint)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Detailed Monthly Revenue Breakdown Table */}
            <div className="border-t border-[#e5e1da] pt-5 space-y-3">
              <h4 className="font-bold text-xs text-[#2c2a29] uppercase tracking-wider">
                Monthly Financial Breakdown
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#e5e1da] text-[#7c756d] font-bold uppercase tracking-wider text-[10px] bg-[#faf9f6]">
                      <th className="py-2.5 px-3 rounded-l-lg">Month</th>
                      <th className="py-2.5 px-3">Photoshoot Bookings</th>
                      <th className="py-2.5 px-3">Print Creative Sales</th>
                      <th className="py-2.5 px-3">Total Monthly Revenue</th>
                      <th className="py-2.5 px-3 text-right rounded-r-lg">Growth Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-[#2c2a29]">
                    {monthlyRevenueData.map((m, idx) => {
                      const prevMonthTotal = idx > 0 ? monthlyRevenueData[idx - 1].totalRevenue : m.totalRevenue;
                      const diff = m.totalRevenue - prevMonthTotal;
                      const isUp = diff >= 0;

                      return (
                        <tr key={m.month} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-[#2c2a29]">{m.month} 2026</td>
                          <td className="py-2.5 px-3 font-mono">₱{m.bookingIncome.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono">₱{m.printSales.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-bold font-mono text-[#2c2a29]">
                            ₱{m.totalRevenue.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold">
                            {idx === 0 ? (
                              <span className="text-gray-400 text-[10px] uppercase">Baseline</span>
                            ) : isUp ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                                ▲ +₱{diff.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                                ▼ -₱{Math.abs(diff).toLocaleString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {showLedgerReport && (
            <div className="bg-white border border-[#2c2a29] rounded-2xl p-8 max-w-xl mx-auto space-y-6 shadow-md text-xs relative overflow-hidden font-mono text-left">
              <div className="border-b border-double border-[#2c2a29] pb-4 text-center">
                <span className="text-base font-extrabold uppercase tracking-widest">{studio.name}</span>
                <p className="text-[10px] text-gray-500 mt-1">Official Financial Ledger Report • Cainta Rizal MIS</p>
              </div>

              <div className="space-y-1 text-left text-gray-700">
                <p>Report Date: {new Date().toLocaleDateString()}</p>
                <p>Studio Address: {studio.address}</p>
                <p>Contact Details: {studio.contactInfo}</p>
              </div>

              <div className="border-t border-[#e5e1da] pt-4 text-left space-y-2">
                <span className="font-extrabold block text-[10px] uppercase">A. Photography Sales Breakdown</span>
                {studioBookings.map((b, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>Shoot Appointment - {b.id} ({b.status})</span>
                    <span>₱{b.totalAmount}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e5e1da] pt-4 text-left space-y-2">
                <span className="font-extrabold block text-[10px] uppercase">B. Print Creative Sales Breakdown</span>
                {studioPrints.map((p, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>Physical Print Order - {p.id} ({p.status})</span>
                    <span>₱{p.totalAmount}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-double border-[#2c2a29] pt-4 flex justify-between font-extrabold text-sm text-[#2c2a29]">
                <span>OVERALL LEDGER INCOME SUMMARY:</span>
                <span>₱{overallIncome.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Services, Packages and Addons catalog editor */}
      {activeTab === "services" && (
        <div className="space-y-8">
          {/* Section 1: Services */}
          <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#2c2a29]">Photography Services Catalog</h3>
                <p className="text-xs text-[#7c756d]">Services represent individual shoot offerings listed in your directory profile.</p>
              </div>
              <button
                onClick={() => setIsAddingService(!isAddingService)}
                className="py-2 px-4 bg-[#2c2a29] text-[#faf9f6] hover:bg-[#1a1918] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isAddingService ? <X size={14} /> : <Plus size={14} />} 
                {isAddingService ? "Cancel" : "Add Service"}
              </button>
            </div>

            {isAddingService && (
              <form onSubmit={handleAddServiceSubmit} className="bg-[#faf9f6] border border-[#e5e1da] p-5 rounded-2xl max-w-xl space-y-4 text-xs">
                <h4 className="font-bold text-[#2c2a29] uppercase tracking-wider text-[10px]">Create New Shoot Service</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Service Name</label>
                    <input
                      type="text"
                      required
                      value={srvName}
                      onChange={e => setSrvName(e.target.value)}
                      placeholder="e.g. Creative Graduation Portrait"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2c2a29]">Base Price (PHP)</label>
                    <input
                      type="number"
                      required
                      value={srvPrice}
                      onChange={e => setSrvPrice(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2c2a29]">Shoot Duration (Minutes)</label>
                    <select
                      value={srvDuration}
                      onChange={e => setSrvDuration(e.target.value)}
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                      <option value="180">3 hours</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Category Classification</label>
                    <select
                      value={srvCat}
                      onChange={e => setSrvCat(e.target.value)}
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    >
                      <option value="Portrait Photography">Portrait Photography</option>
                      <option value="Graduation Shoots">Graduation Shoots</option>
                      <option value="Wedding Milestones">Wedding Milestones</option>
                      <option value="Product Creative">Product Creative</option>
                      <option value="Family Portrait">Family Portrait</option>
                      <option value="Baby & Milestone">Baby & Milestone</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Description / Inclusions Summary</label>
                    <textarea
                      required
                      value={srvDesc}
                      onChange={e => setSrvDesc(e.target.value)}
                      placeholder="List details of what the client gets with this base service (e.g., raw images, background changes)..."
                      className="w-full bg-white border border-[#e5e1da] rounded-xl p-3 text-xs focus:outline-none focus:border-[#2c2a29] h-20"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Service Sample Showcase Photo</label>
                    <div className="flex items-center gap-3">
                      {srvImage && (
                        <img src={srvImage} alt="Sample" className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleImageFileUpload(e, setSrvImage)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <button type="button" className="w-full py-2 bg-white border border-[#e5e1da] rounded-xl text-xs font-bold text-gray-700 hover:border-[#2c2a29] transition-colors flex items-center justify-center gap-1">
                            <Upload size={12} /> {srvImage ? "Change Sample Photo" : "Upload Sample Photo"}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={srvImage}
                          onChange={e => setSrvImage(e.target.value)}
                          placeholder="Or paste Sample Photo Image URL"
                          className="w-full bg-white border border-[#e5e1da] rounded-xl px-2.5 py-1 text-[11px] focus:outline-none focus:border-[#2c2a29]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2c2a29] text-white font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Save Service
                </button>
              </form>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {services.filter(s => s.studioId === studio.id).map((s) => (
                <div key={s.id} className="p-4 border border-[#e5e1da] rounded-2xl bg-[#faf9f6] flex flex-col justify-between space-y-3 text-xs overflow-hidden">
                  {s.image && (
                    <img src={s.image} alt={s.name} className="w-full h-36 object-cover rounded-xl border border-gray-200 shadow-xs" />
                  )}
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{s.category}</span>
                      <span className="font-bold font-mono text-xs text-[#2c2a29]">₱{s.basePrice}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#2c2a29]">{s.name}</h4>
                    <p className="text-[#7c756d] leading-snug text-[11px] line-clamp-3">{s.description}</p>
                    <p className="text-[10px] text-gray-500 font-semibold">🕒 Duration: {s.durationMinutes} minutes</p>
                  </div>
                  <div className="pt-2 border-t border-[#e5e1da]/50 flex justify-end">
                    <button
                      onClick={() => handleDeleteService(s.id)}
                      className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} /> Remove Offering
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Packages */}
          <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#2c2a29]">Customizable Packages</h3>
                <p className="text-xs text-[#7c756d]">Packages are bundle plans representing multi-value photography packages with custom deliverables.</p>
              </div>
              <button
                onClick={() => setIsAddingPackage(!isAddingPackage)}
                className="py-2 px-4 bg-[#2c2a29] text-[#faf9f6] hover:bg-[#1a1918] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isAddingPackage ? <X size={14} /> : <Plus size={14} />} 
                {isAddingPackage ? "Cancel" : "Add Package"}
              </button>
            </div>

            {isAddingPackage && (
              <form onSubmit={handleAddPackageSubmit} className="bg-[#faf9f6] border border-[#e5e1da] p-5 rounded-2xl max-w-xl space-y-4 text-xs">
                <h4 className="font-bold text-[#2c2a29] uppercase tracking-wider text-[10px]">Create Custom Photo Package</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Package Bundle Name</label>
                    <input
                      type="text"
                      required
                      value={pkgName}
                      onChange={e => setPkgName(e.target.value)}
                      placeholder="e.g. Premium Wedding Package Deluxe"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2c2a29]">Price (PHP)</label>
                    <input
                      type="number"
                      required
                      value={pkgPrice}
                      onChange={e => setPkgPrice(e.target.value)}
                      placeholder="e.g. 8500"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2c2a29]">Shoot Duration (Minutes)</label>
                    <input
                      type="number"
                      required
                      value={pkgDuration}
                      onChange={e => setPkgDuration(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2c2a29]">Retouched & Edited Photos Deliverable</label>
                    <input
                      type="number"
                      required
                      value={pkgPhotosCount}
                      onChange={e => setPkgPhotosCount(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2c2a29]">Physical Prints Included</label>
                    <input
                      type="text"
                      required
                      value={pkgPrints}
                      onChange={e => setPkgPrints(e.target.value)}
                      placeholder="e.g. 3x 8R prints + customized case"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2c2a29]">Photographer Headcount</label>
                    <input
                      type="number"
                      required
                      value={pkgPhotographerCount}
                      onChange={e => setPkgPhotographerCount(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Inclusions & Terms Description</label>
                    <textarea
                      required
                      value={pkgDesc}
                      onChange={e => setPkgDesc(e.target.value)}
                      placeholder="Describe high-quality bundle specs (e.g. makeup artist included, complete frame packages)..."
                      className="w-full bg-white border border-[#e5e1da] rounded-xl p-3 text-xs focus:outline-none focus:border-[#2c2a29] h-20"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Save Package Bundle
                </button>
              </form>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {packages.filter(p => p.studioId === studio.id).map((p) => (
                <div key={p.id} className="p-4 border border-[#e5e1da] rounded-2xl bg-[#faf9f6] flex flex-col justify-between space-y-3 text-xs">
                  <div className="space-y-1 text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] bg-green-50 text-green-800 border border-green-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Bundle Package</span>
                      <span className="font-bold font-mono text-xs text-[#2c2a29]">₱{p.price}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#2c2a29]">{p.name}</h4>
                    <p className="text-[#7c756d] leading-snug text-[11px] line-clamp-3">{p.description}</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 text-[10px] text-gray-500 font-semibold">
                      <span>🕒 Shoot: {p.durationMinutes} mins</span>
                      <span>✨ Retouched: {p.editedPhotosCount} photos</span>
                      <span>📷 Staff count: {p.photographerCount} photographer</span>
                      <span className="col-span-2">🖼️ Prints: {p.includedPrints}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#e5e1da]/50 flex justify-end">
                    <button
                      onClick={() => handleDeletePackage(p.id)}
                      className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} /> Remove Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Addons */}
          <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#2c2a29]">Studio Add-on Enhancements</h3>
                <p className="text-xs text-[#7c756d]">Add-ons provide optional customer selection boosts during checkout (makeup, extra copies, layout designs).</p>
              </div>
              <button
                onClick={() => setIsAddingAddon(!isAddingAddon)}
                className="py-2 px-4 bg-[#2c2a29] text-[#faf9f6] hover:bg-[#1a1918] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isAddingAddon ? <X size={14} /> : <Plus size={14} />} 
                {isAddingAddon ? "Cancel" : "Add Addon"}
              </button>
            </div>

            {isAddingAddon && (
              <form onSubmit={handleAddAddonSubmit} className="bg-[#faf9f6] border border-[#e5e1da] p-5 rounded-2xl max-w-xl space-y-4 text-xs">
                <h4 className="font-bold text-[#2c2a29] uppercase tracking-wider text-[10px]">Create Studio Add-on</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Add-on Title</label>
                    <input
                      type="text"
                      required
                      value={addName}
                      onChange={e => setAddName(e.target.value)}
                      placeholder="e.g. Makeup & Hair-styling service"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2c2a29]">Price Tag (PHP)</label>
                    <input
                      type="number"
                      required
                      value={addPrice}
                      onChange={e => setAddPrice(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Inclusion Description (Optional)</label>
                    <input
                      type="text"
                      value={addDesc}
                      onChange={e => setAddDesc(e.target.value)}
                      placeholder="e.g. Includes full visual styling + hair touchups during shoot..."
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Save Add-on
                </button>
              </form>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {addons.filter(a => a.studioId === studio.id).map((addon) => (
                <div key={addon.id} className="p-3 bg-[#faf9f6] border border-[#e5e1da] rounded-2xl flex justify-between items-center text-xs font-semibold text-[#2c2a29]">
                  <div className="text-left space-y-0.5">
                    <p className="font-bold text-[#2c2a29] leading-snug">{addon.name}</p>
                    <span className="text-[10px] text-gray-500 font-bold font-mono">₱{addon.price}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAddon(addon.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 cursor-pointer"
                    title="Remove Addon"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "staff" && canManageStaff && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-[#2c2a29]">Staff Accounts</h3>
              <p className="text-xs text-[#7c756d]">Create accounts for team members who help manage {studio.name}.</p>
            </div>
            <button
              type="button"
              onClick={loadStaff}
              disabled={loadingStaff}
              className="px-3 py-2 bg-[#2c2a29] text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {loadingStaff ? "Loading..." : "Refresh Staff"}
            </button>
          </div>

          <form onSubmit={handleStaffInvite} className="grid sm:grid-cols-2 gap-4 p-4 bg-[#faf9f6] rounded-2xl border border-[#e5e1da]">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2c2a29]">Full Name</label>
              <input required value={staffFullName} onChange={e => setStaffFullName(e.target.value)} placeholder="e.g. Maria Santos" className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2c2a29]">Email Address</label>
              <input required type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} placeholder="staff@example.com" className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2c2a29]">Temporary Password (Optional)</label>
              <input type="password" minLength={6} value={staffPassword} onChange={e => setStaffPassword(e.target.value)} placeholder="Defaults to Staff123!" className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2c2a29]">Contact Number (Optional)</label>
              <input value={staffContactNumber} onChange={e => setStaffContactNumber(e.target.value)} placeholder="09XX XXX XXXX" className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]" />
            </div>
            <button type="submit" disabled={savingStaff} className="sm:col-span-2 w-fit px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50">
              <span className="inline-flex items-center gap-1.5"><Plus size={14} /> {savingStaff ? "Creating Account..." : "Add Staff Account"}</span>
            </button>
          </form>

          {!staffLoaded ? (
            <div className="py-6 text-center text-xs text-[#7c756d]">Select Refresh Staff to load your current team.</div>
          ) : staff.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7c756d]">No staff accounts yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead><tr className="border-b border-[#e5e1da] text-[#7c756d] font-bold uppercase tracking-wider text-[10px]"><th className="py-3 px-4">Name</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Contact</th><th className="py-3 px-4">Created</th><th className="py-3 px-4 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-gray-100 font-medium text-[#2c2a29]">
                  {staff.map(member => (
                    <tr key={member.id}>
                      <td className="py-3 px-4 font-bold">{member.fullName}</td>
                      <td className="py-3 px-4">{member.email}</td>
                      <td className="py-3 px-4">{member.contactNumber || "-"}</td>
                      <td className="py-3 px-4">{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "-"}</td>
                      <td className="py-3 px-4 text-right"><button type="button" onClick={() => handleRemoveStaff(member.id)} className="text-red-600 hover:text-red-800 p-1 cursor-pointer" title="Remove staff account"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab D: Knowledge Base & Policies Settings */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-[#2c2a29]">Studio Knowledge Base & Policies</h3>
            <p className="text-xs text-[#7c756d]">Update your operating parameters. The integrated AI chatbot fetches these configurations instantly to answer user inquiries accurately.</p>
          </div>

          <form onSubmit={handleSettingsSubmit} className="space-y-6 max-w-2xl text-left">
            
            {/* 1. Studio Logo & Cover Image Uploads */}
            <div className="space-y-3 p-4 bg-[#faf9f6] rounded-2xl border border-[#e5e1da]">
              <h4 className="font-extrabold text-xs text-[#2c2a29] uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon size={14} className="text-amber-600" /> Studio Branding Photos & Logo
              </h4>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Logo Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2c2a29]">Studio Logo Image</label>
                  <div className="flex items-center gap-3">
                    {logo ? (
                      <img src={logo} alt="Logo" className="w-14 h-14 object-cover rounded-xl border border-[#e5e1da] shadow-xs flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 font-bold text-xs flex-shrink-0">
                        Logo
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageFileUpload(e, setLogo)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <button type="button" className="w-full py-2 bg-white border border-[#e5e1da] rounded-xl text-xs font-bold text-gray-700 hover:border-[#2c2a29] transition-colors flex items-center justify-center gap-1">
                          <Upload size={12} /> Upload Logo Photo
                        </button>
                      </div>
                      <input
                        type="text"
                        value={logo}
                        onChange={e => setLogo(e.target.value)}
                        placeholder="Or paste Logo URL"
                        className="w-full bg-white border border-[#e5e1da] rounded-xl px-2.5 py-1 text-[11px] focus:outline-none focus:border-[#2c2a29]"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2c2a29]">Studio Header Cover Image</label>
                  <div className="space-y-1">
                    {coverImage && (
                      <img src={coverImage} alt="Cover" className="w-full h-16 object-cover rounded-xl border border-[#e5e1da] shadow-xs" />
                    )}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageFileUpload(e, setCoverImage)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <button type="button" className="w-full py-2 bg-white border border-[#e5e1da] rounded-xl text-xs font-bold text-gray-700 hover:border-[#2c2a29] transition-colors flex items-center justify-center gap-1">
                        <Upload size={12} /> Upload Cover Banner Photo
                      </button>
                    </div>
                    <input
                      type="text"
                      value={coverImage}
                      onChange={e => setCoverImage(e.target.value)}
                      placeholder="Or paste Cover Banner Image URL"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-2.5 py-1 text-[11px] focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Studio Location & Categories */}
            <div className="space-y-3 p-4 bg-[#faf9f6] rounded-2xl border border-[#e5e1da]">
              <h4 className="font-extrabold text-xs text-[#2c2a29] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-red-500" /> Cainta Location Corridor & Categories
              </h4>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2c2a29]">Cainta Location Corridor</label>
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#2c2a29]"
                  >
                    <option value="Ortigas Ave Ext (Valley Golf)">Ortigas Ave Ext (Valley Golf)</option>
                    <option value="Felix Ave (Rublou Marketplace)">Felix Ave (Rublou Marketplace)</option>
                    <option value="Imelda Ave / Bypass Junction">Imelda Ave / Bypass Junction</option>
                    <option value="Town Center (San Roque)">Town Center (San Roque)</option>
                    <option value="Vista Verde Village">Vista Verde Village</option>
                    <option value="Cainta, Rizal">Cainta, Rizal (General)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2c2a29]">Physical Street Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Unit 4, Felix Ave Junction, Cainta"
                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>
              </div>

              {/* GIS Coordinates */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <label className="block font-bold text-gray-600 text-[11px] mb-0.5">GPS Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={e => setLatitude(e.target.value)}
                    placeholder="14.5882"
                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-600 text-[11px] mb-0.5">GPS Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={e => setLongitude(e.target.value)}
                    placeholder="121.1278"
                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>
              </div>

              {/* Specialization Categories Buttons */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-[#2c2a29]">Studio Category Specializations (Pick 1 or more)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "Portrait Photography", "Graduation Shoots", "Wedding Milestones",
                    "Product Creative", "Self-Shoot Studio", "Family Portrait",
                    "Baby & Milestone", "Event Coverage", "ID/Passport Photography"
                  ].map((catName) => {
                    const checked = selectedCategories.includes(catName);
                    return (
                      <button
                        type="button"
                        key={catName}
                        onClick={() => handleToggleCategory(catName)}
                        className={`p-2 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                          checked
                            ? "bg-[#2c2a29] text-white border-[#2c2a29]"
                            : "bg-white text-gray-700 border-[#e5e1da] hover:border-[#7c756d]"
                        }`}
                      >
                        <span className="truncate">{catName}</span>
                        {checked && <CheckCircle size={12} className="text-yellow-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Operating Details & Description */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2c2a29]">Operating Business Hours</label>
                <input
                  type="text"
                  required
                  value={businessHours}
                  onChange={e => setBusinessHours(e.target.value)}
                  placeholder="e.g. Mon-Sat: 9:00 AM - 7:00 PM"
                  className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#2c2a29]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2c2a29]">Contact Phone / Mobile</label>
                <input
                  type="text"
                  required
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  placeholder="e.g. +63 919 444 5555"
                  className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#2c2a29]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2c2a29]">Catalog Starting Price (PHP)</label>
              <input
                type="number"
                required
                value={startingPrice}
                onChange={e => setStartingPrice(Number(e.target.value))}
                className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-800 focus:outline-none focus:border-[#2c2a29]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2c2a29]">Studio Description Profile</label>
              <textarea
                required
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Describe your studio specialty, backdrop choices, studio strobes, equipment, raw files policy..."
                className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl p-3 text-xs focus:outline-none focus:border-[#2c2a29] h-28"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 bg-[#2c2a29] hover:bg-[#1a1918] text-white text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Sparkles size={14} className="fill-current text-yellow-500" />
              {savingSettings ? "Saving Studio Profile..." : "Save & Publish Studio Style Profile"}
            </button>
          </form>

          {/* Section: Blocked Dates Holiday Scheduler */}
          <div className="border-t border-[#e5e1da] pt-6 max-w-lg space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-[#2c2a29] uppercase tracking-wider">Closed Holidays & Blocked Dates</h4>
              <p className="text-[11px] text-[#7c756d]">Customers will be blocked from making online scheduler bookings on dates selected here.</p>
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                value={newBlockedDate}
                onChange={e => setNewBlockedDate(e.target.value)}
                className="bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29] flex-1"
              />
              <button
                type="button"
                onClick={handleBlockDate}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl uppercase tracking-wider hover:bg-red-700 cursor-pointer shadow"
              >
                Block Date
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {blockedDates.length === 0 ? (
                <span className="text-[11px] text-gray-400 italic">No blocked dates set. The studio calendar is fully open.</span>
              ) : (
                blockedDates.map(dateStr => (
                  <span
                    key={dateStr}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-50 text-red-800 border border-red-200 px-2 py-1 rounded-lg"
                  >
                    {new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    <button
                      type="button"
                      onClick={() => handleUnblockDate(dateStr)}
                      className="hover:text-red-900 cursor-pointer ml-1 p-0.5"
                      title="Unblock Date"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Studio Reviews (Studio Owner View) */}
      {activeTab === "reviews" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-[#2c2a29]">Customer Reviews for {studio.name}</h3>
              <p className="text-xs text-[#7c756d]">View reviews submitted by your customers. Approved reviews are visible publicly. You can reply to each review to engage your clients.</p>
            </div>
            <button
              onClick={() => {
                fetch(`/api/studio/reviews?studioId=${studio.id}`)
                  .then(r => r.json())
                  .then(d => { if (d.success) { setStudioOwnerReviews(d.reviews); setReviewsTabLoaded(true); } });
              }}
              className="text-xs bg-[#2c2a29] text-white px-3 py-2 rounded-xl font-bold hover:bg-[#44403c] transition-colors cursor-pointer"
            >↻ Refresh</button>
          </div>

          {/* Load on first open */}
          {!reviewsTabLoaded && studioOwnerReviews.length === 0 && (
            <div className="py-6 text-center">
              <button
                onClick={() => {
                  fetch(`/api/studio/reviews?studioId=${studio.id}`)
                    .then(r => r.json())
                    .then(d => { if (d.success) { setStudioOwnerReviews(d.reviews); setReviewsTabLoaded(true); } });
                }}
                className="text-xs text-[#7c756d] underline cursor-pointer"
              >Load your reviews</button>
            </div>
          )}

          {reviewsTabLoaded && studioOwnerReviews.length === 0 && (
            <div className="py-10 text-center text-xs text-[#7c756d]">
              No reviews yet. Once customers complete bookings and submit feedback, their reviews will appear here after admin approval.
            </div>
          )}

          <div className="space-y-4">
            {studioOwnerReviews.map((rev) => (
              <div key={rev.id} className="border border-[#e5e1da] rounded-2xl p-4 space-y-3 bg-[#faf9f6]">
                {/* Review Header */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {rev.customerName?.[0]?.toUpperCase() || "C"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#2c2a29]">{rev.customerName}</span>
                      <span className="text-amber-500 text-xs">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        rev.status === "approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}>{rev.status}</span>
                    </div>
                    <p className="text-xs text-[#2c2a29] mt-1 leading-relaxed">"{rev.comment}"</p>
                    <span className="text-[10px] text-[#7c756d]">
                      {new Date(rev.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Existing Reply Display */}
                {rev.reply && (
                  <div className="ml-12 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs text-blue-900">
                    <span className="font-bold block text-[10px] uppercase tracking-wider text-blue-600 mb-0.5">Your Studio Reply</span>
                    {rev.reply}
                    {rev.replyAt && <span className="text-[10px] text-blue-400 ml-2">· {new Date(rev.replyAt).toLocaleDateString("en-PH")}</span>}
                  </div>
                )}

                {/* Reply Form */}
                <div className="ml-12 space-y-2">
                  {replySuccess[rev.id] ? (
                    <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">✅ Reply published successfully!</div>
                  ) : (
                    <>
                      <textarea
                        value={replyTexts[rev.id] || ""}
                        onChange={e => setReplyTexts(prev => ({ ...prev, [rev.id]: e.target.value }))}
                        placeholder="Write a professional response to this customer review..."
                        rows={2}
                        className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29] resize-none"
                      />
                      <button
                        disabled={!replyTexts[rev.id]?.trim()}
                        onClick={() => {
                          const replyText = replyTexts[rev.id]?.trim();
                          if (!replyText) return;
                          fetch(`/api/studio/reviews/${rev.id}/reply`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ reply: replyText, studioId: studio.id })
                          })
                            .then(r => r.json())
                            .then(d => {
                              if (d.success) {
                                setStudioOwnerReviews(prev => prev.map(r => r.id === rev.id ? d.review : r));
                                setReplySuccess(prev => ({ ...prev, [rev.id]: true }));
                                setReplyTexts(prev => ({ ...prev, [rev.id]: "" }));
                                setTimeout(() => setReplySuccess(prev => ({ ...prev, [rev.id]: false })), 3000);
                              }
                            });
                        }}
                        className="text-[11px] bg-[#2c2a29] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#44403c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        {rev.reply ? "Update Reply" : "Post Reply"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {studioOwnerReviews.length > 0 && (
            <div className="text-[10px] text-[#7c756d] text-center pt-1">
              {studioOwnerReviews.length} total reviews · {studioOwnerReviews.filter(r => r.status === "approved").length} approved
            </div>
          )}
        </div>
      )}


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
    </div>
  );
}
