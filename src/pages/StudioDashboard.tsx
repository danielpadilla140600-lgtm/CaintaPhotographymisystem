import React, { useEffect, useState } from "react";
import { 
  Calendar, Printer, Star, Settings, FileText, Check, X, KeyRound, 
  Trash2, Plus, Sparkles, TrendingUp, Users, DollarSign, Edit, Download, Image as ImageIcon, BarChart3, LineChart as LineChartIcon,
  Upload, CheckCircle, MapPin, ShieldAlert, FileCheck, Eye, Camera, User
} from "lucide-react";
import { 
  BarChart, Bar, AreaChart, Area, ComposedChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { generateStudioSalesReportPDF, generateBookingReceiptPDF, generatePrintOrderReceiptPDF } from "../utils/pdfGenerator";
import { ClientGallery } from "../components/ClientGallery";
import { SystemCalendar } from "../components/SystemCalendar";
import AvailabilityManager from "../components/AvailabilityManager";
import AccountSettings from "./AccountSettings.tsx";

export type StudioTab = "bookings" | "calendar" | "prints" | "reports" | "reviews" | "management" | "services" | "staff" | "settings";
export type StudioManagementSubTab = "catalog" | "branding" | "gcash" | "staff" | "availability" | "faqs" | "account";

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
  faqs?: any[];
  onAddFaq?: (payload: { question: string; answer: string; category: string }) => void;
  onDeleteFaq?: (faqId: string) => void;
  onUpdateStatus: (type: "booking" | "print" | "payment", id: string, status: string) => void;
  onVerifyPrintPayment?: (id: string, approved: boolean) => void;
  onRecordPrintCashPayment?: (id: string) => void;
  onUpdateStudioSettings: (settings: any) => void;
  onRefresh?: () => void;
  onNavigateToAccount?: () => void;
  initialTab?: StudioTab;
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
  faqs = [],
  onAddFaq,
  onDeleteFaq,
  onUpdateStatus,
  onVerifyPrintPayment,
  onRecordPrintCashPayment,
  onUpdateStudioSettings,
  onRefresh,
  onNavigateToAccount,
  initialTab = "bookings"
}: StudioDashboardProps) {
  const isInitialManagement = initialTab === "services" || initialTab === "staff" || initialTab === "settings" || initialTab === "management";
  const [activeTab, setActiveTab] = useState<StudioTab>(isInitialManagement ? "management" : initialTab);
  const [managementSubTab, setManagementSubTab] = useState<StudioManagementSubTab>(
    initialTab === "staff" ? "staff" : initialTab === "settings" ? "branding" : "catalog"
  );

  useEffect(() => {
    if (initialTab === "services") {
      setActiveTab("management");
      setManagementSubTab("catalog");
    } else if (initialTab === "staff") {
      setActiveTab("management");
      setManagementSubTab("staff");
    } else if (initialTab === "settings") {
      setActiveTab("management");
      setManagementSubTab("branding");
    } else if (initialTab === "management") {
      setActiveTab("management");
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  // Studio reviews state (fetched from /api/studio/reviews)
  const [studioOwnerReviews, setStudioOwnerReviews] = useState<any[]>([]);
  const [reviewsTabLoaded, setReviewsTabLoaded] = useState(false);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replySuccess, setReplySuccess] = useState<Record<string, boolean>>({});

  const fetchStudioReviews = async () => {
    try {
      const response = await fetch(`/api/studio/reviews?studioId=${studio.id}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.authToken || ""}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStudioOwnerReviews(data.reviews || []);
        setReviewsTabLoaded(true);
      }
    } catch (err) {
      console.error("Failed to fetch studio reviews:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "reviews" && currentUser?.authToken) {
      fetchStudioReviews();
    }
  }, [activeTab, studio.id, currentUser?.authToken]);

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
  const [saveStatus, setSaveStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [viewingReceipt, setViewingReceipt] = useState<{ url: string; ref: string; amount: number; method: string } | null>(null);

  // GCash Merchant & Payment Credentials state
  const [gcashMerchantName, setGcashMerchantName] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");
  const [gcashGatewayInfo, setGcashGatewayInfo] = useState<{ configured: boolean; mode: string; gatewayName: string } | null>(null);
  const [savingGcash, setSavingGcash] = useState(false);
  const [gcashSaveMsg, setGcashSaveMsg] = useState("");

  useEffect(() => {
    if ((activeTab === "settings" || activeTab === "management") && studio?.id && currentUser?.authToken) {
      fetch(`/api/studios/${studio.id}/payment-credentials`, {
        headers: { Authorization: `Bearer ${currentUser.authToken}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.credentials) {
            setGcashMerchantName(data.credentials.gcash_merchant_name || "");
            setGcashNumber(data.credentials.gcash_number || "");
          }
        })
        .catch(() => {});

      fetch("/api/payments/gcash/gateway-status", {
        headers: { Authorization: `Bearer ${currentUser.authToken}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setGcashGatewayInfo(data);
          }
        })
        .catch(() => {});
    }
  }, [activeTab, studio?.id, currentUser?.authToken]);

  const handleSaveGcashSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGcash(true);
    setGcashSaveMsg("");
    try {
      const res = await fetch(`/api/studios/${studio.id}/payment-credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.authToken || ""}`
        },
        body: JSON.stringify({ gcashMerchantName, gcashNumber })
      });
      const data = await res.json();
      if (data.success) {
        setGcashSaveMsg("✅ GCash merchant settings saved successfully!");
      } else {
        setGcashSaveMsg(`❌ ${data.message || "Failed to save settings."}`);
      }
    } catch {
      setGcashSaveMsg("❌ Failed to save GCash settings. Please retry.");
    } finally {
      setSavingGcash(false);
      setTimeout(() => setGcashSaveMsg(""), 4000);
    }
  };

  // CRUD form states for Services
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvName, setSrvName] = useState("");
  const [srvDesc, setSrvDesc] = useState("");
  const [srvCat, setSrvCat] = useState("Portrait Photography");
  const [srvPrice, setSrvPrice] = useState("");
  const [srvDuration, setSrvDuration] = useState("60");
  const [srvImages, setSrvImages] = useState<string[]>([]);

  const SERVICE_CATEGORY_TEMPLATES: Record<string, { name: string; description: string; price: string; duration: string }> = {
    "Portrait Photography": {
      name: "e.g. Signature Family Portrait Session",
      description: "e.g. 2 outfit changes, 5 final edited poses, soft natural light setup, and guided posing direction.",
      price: "1500",
      duration: "60"
    },
    "Graduation Shoots": {
      name: "e.g. Senior Graduation Portrait Set",
      description: "e.g. cap-and-gown portraits, campus backdrop styling, 10 retouched images, and instant preview selection.",
      price: "2500",
      duration: "90"
    },
    "Wedding Milestones": {
      name: "e.g. Prenup Storytelling Session",
      description: "e.g. romantic couple shoot, two location setups, dress and suit detail coverage, and 20 highlight edits.",
      price: "4000",
      duration: "120"
    },
    "Product Creative": {
      name: "e.g. Product Hero Shot Package",
      description: "e.g. clean studio light setup, 15 product angles, background changes, and commercial-ready editing.",
      price: "3000",
      duration: "90"
    },
    "Family Portrait": {
      name: "e.g. Family Portrait Mini Session",
      description: "e.g. in-studio family setup, playful candid moments, 5 edited final images, and printable wall-ready preview.",
      price: "2000",
      duration: "60"
    },
    "Baby & Milestone": {
      name: "e.g. Baby Milestone Monthly Shoot",
      description: "e.g. themed milestone portrait, soft props styling, 8 high-resolution edits, and parent prep guidance.",
      price: "1800",
      duration: "60"
    }
  };

  const currentServiceTemplate = SERVICE_CATEGORY_TEMPLATES[srvCat] || SERVICE_CATEGORY_TEMPLATES["Portrait Photography"];

  // CRUD form states for Packages
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [pkgCat, setPkgCat] = useState<string>(Array.isArray(studio.categories) && studio.categories.length > 0 ? studio.categories[0] : "Portrait Photography");
  const [pkgName, setPkgName] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgDuration, setPkgDuration] = useState("60");
  const [pkgPhotosCount, setPkgPhotosCount] = useState("15");
  const [pkgPrints, setPkgPrints] = useState("None");
  const [pkgPhotographerCount, setPkgPhotographerCount] = useState("1");
  const [pkgImage, setPkgImage] = useState("");

  const PACKAGE_CATEGORY_TEMPLATES: Record<string, { name: string; description: string; price: string; duration: string; photos: string; prints: string; photographers: string }> = {
    "Portrait Photography": {
      name: "e.g. Classic Portrait Story Package",
      description: "e.g. 2 hour portrait session with wardrobe guidance, location scouting, 20 edited photos, and digital gallery delivery.",
      price: "6500",
      duration: "120",
      photos: "20",
      prints: "2 8R prints",
      photographers: "1"
    },
    "Graduation Shoots": {
      name: "e.g. Grad Glow Signature Package",
      description: "e.g. cap and gown set, location styling, teaser images, 30 retouched outputs, and high-resolution online gallery.",
      price: "7800",
      duration: "150",
      photos: "30",
      prints: "1 10R print",
      photographers: "1"
    },
    "Wedding Milestones": {
      name: "e.g. Wedding Storytelling Deluxe",
      description: "e.g. full-day coverage, candid and formal frames, edited gallery, 1 photographer, and highlight album preview.",
      price: "18000",
      duration: "360",
      photos: "200",
      prints: "1 premium album",
      photographers: "2"
    },
    "Product Creative": {
      name: "e.g. Brand Launch Studio Kit",
      description: "e.g. product lighting setup, multiple background treatments, 25 edited commercial photos, and final asset delivery.",
      price: "9500",
      duration: "180",
      photos: "25",
      prints: "1 branded mockup display",
      photographers: "1"
    },
    "Family Portrait": {
      name: "e.g. Family Memory Collection",
      description: "e.g. in-studio family portraits, 3 outfit looks, 25 retouched finals, and digital gallery access.",
      price: "7000",
      duration: "120",
      photos: "25",
      prints: "2 family prints",
      photographers: "1"
    },
    "Baby & Milestone": {
      name: "e.g. Baby Growth Story Bundle",
      description: "e.g. monthly milestone shoot, prop styling, 12 final images, and curated personal keepsake gallery.",
      price: "5200",
      duration: "90",
      photos: "12",
      prints: "1 keepsake print",
      photographers: "1"
    }
  };

  const currentPackageTemplate = PACKAGE_CATEGORY_TEMPLATES[pkgCat] || PACKAGE_CATEGORY_TEMPLATES["Portrait Photography"];

  const handleStudioFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    onAddFaq?.({ question: faqQuestion.trim(), answer: faqAnswer.trim(), category: faqCategory.trim() || "General" });
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqCategory("General");
  };

  // Image upload helper
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setFn: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFn(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleServiceImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setSrvImages(current => [...current, reader.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handlePrintProductImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPrintProdImages(current => [...current, reader.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleAddonImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageFileUpload(e, setAddImage);
    e.target.value = "";
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
  const [addImage, setAddImage] = useState("");

  // Print product catalog form states
  const [isAddingPrintProduct, setIsAddingPrintProduct] = useState(false);
  const [printProdName, setPrintProdName] = useState("");
  const [printProdDesc, setPrintProdDesc] = useState("");
  const [printProdSize, setPrintProdSize] = useState("8x10 inches");
  const [printProdPrice, setPrintProdPrice] = useState("");
  const [printProdImages, setPrintProdImages] = useState<string[]>([]);
  const [printProdExistingImages, setPrintProdExistingImages] = useState<string[]>([]);
  const [printProdHours, setPrintProdHours] = useState("24");
  const [editingPrintProductId, setEditingPrintProductId] = useState<string | null>(null);

  // Blocked Dates management local state
  const [blockedDates, setBlockedDates] = useState<string[]>(studio.blockedDates || []);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("General");

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
  const [resolvedStudioPrintMedia, setResolvedStudioPrintMedia] = useState<Record<string, string>>({});
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);

  const resolveProtectedMediaUrl = async (url: string): Promise<string> => {
    if (!url || !url.startsWith("/api/media/")) return url;
    if (!currentUser?.authToken) return url;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${currentUser.authToken}`
      }
    });

    if (!response.ok) return url;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    if (!viewingReceipt) {
      setReceiptPreviewUrl(null);
      return;
    }

    let cancelled = false;
    let blobUrl: string | null = null;

    const loadReceiptPreview = async () => {
      try {
        const resolvedUrl = viewingReceipt.url.startsWith("/api/media/")
          ? await resolveProtectedMediaUrl(viewingReceipt.url)
          : viewingReceipt.url;

        if (!cancelled) {
          blobUrl = resolvedUrl.startsWith("blob:") ? resolvedUrl : null;
          setReceiptPreviewUrl(blobUrl || resolvedUrl);
        }
      } catch (err) {
        console.warn("Failed to resolve receipt preview:", err);
        if (!cancelled) {
          setReceiptPreviewUrl(viewingReceipt.url);
        }
      }
    };

    loadReceiptPreview();

    return () => {
      cancelled = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [viewingReceipt?.url, currentUser?.authToken]);

  useEffect(() => {
    let isCancelled = false;
    const activeBlobUrls: string[] = [];

    const hydrateStudioPrintMedia = async () => {
      const nextMap: Record<string, string> = {};

      for (const order of printOrders) {
        const protectedUrls = [order.uploadedPhoto, order.proofOfPayment].filter((value): value is string => !!value && value.startsWith("/api/media/"));

        for (const protectedUrl of protectedUrls) {
          try {
            const resolved = await resolveProtectedMediaUrl(protectedUrl);
            if (!isCancelled) {
              nextMap[protectedUrl] = resolved;
              if (resolved.startsWith("blob:")) activeBlobUrls.push(resolved);
            }
          } catch (err) {
            console.warn("Failed to resolve studio print media:", err);
            if (!isCancelled) nextMap[protectedUrl] = protectedUrl;
          }
        }
      }

      if (!isCancelled) setResolvedStudioPrintMedia(nextMap);
    };

    hydrateStudioPrintMedia();

    return () => {
      isCancelled = true;
      for (const blobUrl of activeBlobUrls) {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [printOrders, currentUser?.authToken]);

  // Photo Proofing Portal state for Admin
  const [proofingBookingId, setProofingBookingId] = useState<string | null>(null);

  // Revenue Overview Chart View Mode
  const [revenueChartType, setRevenueChartType] = useState<"composed" | "stacked" | "area">("composed");
  const [revenuePeriod, setRevenuePeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

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

  useEffect(() => {
    if ((activeTab === "staff" || (activeTab === "management" && managementSubTab === "staff")) && !staffLoaded && canManageStaff && currentUser?.authToken) {
      loadStaff();
    }
  }, [activeTab, managementSubTab, staffLoaded, canManageStaff, currentUser?.authToken]);

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
  const paidStudioPayments = studioPayments.filter(payment => payment.paymentStatus === "Paid");
  const totalBookingsValue = paidStudioPayments.filter(payment => payment.paymentType !== "PrintOrder").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const paidStudioPrints = studioPrints.filter(order => order.paymentStatus === "Paid");
  const totalPrintsValue = paidStudioPrints.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const overallIncome = totalBookingsValue + totalPrintsValue;

  // Group verified revenue by the selected reporting period.
  const revenueData = React.useMemo(() => {
    const now = new Date();
    const periodCount = revenuePeriod === "daily" ? 14 : revenuePeriod === "weekly" ? 12 : revenuePeriod === "yearly" ? 5 : 6;
    const periods = Array.from({ length: periodCount }, (_, index) => {
      const date = new Date(now);
      if (revenuePeriod === "daily") date.setDate(now.getDate() - (periodCount - 1 - index));
      if (revenuePeriod === "weekly") date.setDate(now.getDate() - (periodCount - 1 - index) * 7);
      if (revenuePeriod === "monthly") date.setMonth(now.getMonth() - (periodCount - 1 - index));
      if (revenuePeriod === "yearly") date.setFullYear(now.getFullYear() - (periodCount - 1 - index));
      const periodStart = new Date(date);
      if (revenuePeriod === "weekly") {
        const day = periodStart.getDay() || 7;
        periodStart.setDate(periodStart.getDate() - day + 1);
      }
      periodStart.setHours(0, 0, 0, 0);
      const nextPeriod = new Date(periodStart);
      if (revenuePeriod === "daily") nextPeriod.setDate(nextPeriod.getDate() + 1);
      if (revenuePeriod === "weekly") nextPeriod.setDate(nextPeriod.getDate() + 7);
      if (revenuePeriod === "monthly") nextPeriod.setMonth(nextPeriod.getMonth() + 1);
      if (revenuePeriod === "yearly") nextPeriod.setFullYear(nextPeriod.getFullYear() + 1);
      const label = revenuePeriod === "daily"
        ? periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : revenuePeriod === "weekly"
          ? `Week of ${periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
          : revenuePeriod === "monthly"
            ? periodStart.toLocaleDateString("en-US", { month: "short", year: "numeric" })
            : String(periodStart.getFullYear());
      return { periodStart, nextPeriod, label };
    });

    return periods.map(({ periodStart, nextPeriod, label }) => {
      const bookingIncome = paidStudioPayments.filter(payment => payment.paymentType !== "PrintOrder").reduce((sum, payment) => {
        const bookingDate = new Date(payment.paymentDate || payment.createdAt || Date.now());
        return bookingDate >= periodStart && bookingDate < nextPeriod ? sum + Number(payment.amount || 0) : sum;
      }, 0);

      const printSales = paidStudioPrints.reduce((sum, order) => {
        const orderDate = new Date(order.createdAt || Date.now());
        return orderDate >= periodStart && orderDate < nextPeriod ? sum + Number(order.totalAmount || 0) : sum;
      }, 0);

      return {
        label,
        bookingIncome,
        printSales,
        totalRevenue: bookingIncome + printSales,
      };
    });
  }, [paidStudioPayments, paidStudioPrints, revenuePeriod]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFieldsMissing = !location.trim() || !address.trim() || !contactInfo.trim() || !desc.trim();
    if (requiredFieldsMissing) {
      setSaveStatus({
        type: "error",
        message: "Please complete the required studio details before saving: location, address, contact info, and description."
      });
      return;
    }

    if (!logo.trim() && !coverImage.trim()) {
      setSaveStatus({
        type: "error",
        message: "Please upload at least a studio logo or cover image before saving."
      });
      return;
    }

    setSavingSettings(true);
    setSaveStatus({ type: "idle", message: "" });

    try {
      const res = await fetch(`/api/studios/${studio.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.authToken || ""}`
        },
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

      if (!res.ok || !data.success) {
        throw new Error(data.message || "The studio profile could not be saved.");
      }

      onRefresh?.();
      setSaveStatus({
        type: "success",
        message: "Studio profile saved successfully. Branding and contact details are now live."
      });
    } catch (err) {
      console.error(err);
      setSaveStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update studio settings."
      });
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

  const resetServiceForm = () => {
    setIsAddingService(false);
    setEditingServiceId(null);
    setSrvName("");
    setSrvDesc("");
    setSrvCat(Array.isArray(studio.categories) && studio.categories.length > 0 ? studio.categories[0] : "Portrait Photography");
    setSrvPrice("");
    setSrvDuration("60");
    setSrvImages([]);
  };

  const resetPackageForm = () => {
    setIsAddingPackage(false);
    setEditingPackageId(null);
    setPkgCat(Array.isArray(studio.categories) && studio.categories.length > 0 ? studio.categories[0] : "Portrait Photography");
    setPkgName("");
    setPkgDesc("");
    setPkgPrice("");
    setPkgDuration("60");
    setPkgPhotosCount("15");
    setPkgPrints("None");
    setPkgPhotographerCount("1");
    setPkgImage("");
  };

  const startEditingService = (service: any) => {
    setIsAddingService(true);
    setEditingServiceId(service.id);
    setSrvName(service.name || "");
    setSrvDesc(service.description || "");
    setSrvCat(service.category || "Portrait Photography");
    setSrvPrice(String(service.basePrice ?? ""));
    setSrvDuration(String(service.durationMinutes ?? "60"));
    setSrvImages(Array.isArray(service.images) && service.images.length > 0 ? service.images : (service.image ? [service.image] : []));
  };

  const startEditingPackage = (pkg: any) => {
    setIsAddingPackage(true);
    setEditingPackageId(pkg.id);
    setPkgCat(Array.isArray(studio.categories) && studio.categories.length > 0 ? studio.categories[0] : "Portrait Photography");
    setPkgName(pkg.name || "");
    setPkgDesc(pkg.description || "");
    setPkgPrice(String(pkg.price ?? ""));
    setPkgDuration(String(pkg.durationMinutes ?? "60"));
    setPkgPhotosCount(String(pkg.editedPhotosCount ?? "15"));
    setPkgPrints(pkg.includedPrints || "None");
    setPkgPhotographerCount(String(pkg.photographerCount ?? "1"));
    setPkgImage(pkg.image || "");
  };

  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim() || !srvPrice) return;
    try {
      const payload = {
        name: srvName,
        description: srvDesc,
        category: srvCat,
        basePrice: Number(srvPrice),
        durationMinutes: Number(srvDuration),
        image: srvImages[0] || undefined,
        images: srvImages
      };

      const res = await fetch(
        editingServiceId ? `/api/services/${editingServiceId}` : `/api/studios/${studio.id}/services`,
        {
          method: editingServiceId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.authToken || ""}`
          },
          body: JSON.stringify(payload)
        }
      );
      const data = await res.json();
      if (data.success) {
        resetServiceForm();
        onRefresh?.();
        alert(editingServiceId ? "Photoshoot service updated successfully!" : "New photoshoot service registered successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser?.authToken || ""}` }
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
      const payload = {
        name: pkgName,
        description: pkgDesc,
        price: Number(pkgPrice),
        durationMinutes: Number(pkgDuration),
        editedPhotosCount: Number(pkgPhotosCount),
        includedPrints: pkgPrints,
        photographerCount: Number(pkgPhotographerCount),
        image: pkgImage || undefined
      };

      const res = await fetch(
        editingPackageId ? `/api/packages/${editingPackageId}` : `/api/studios/${studio.id}/packages`,
        {
          method: editingPackageId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.authToken || ""}`
          },
          body: JSON.stringify(payload)
        }
      );
      const data = await res.json();
      if (data.success) {
        resetPackageForm();
        onRefresh?.();
        alert(editingPackageId ? "Custom photoshoot package updated successfully!" : "Custom photoshoot package added successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`/api/packages/${packageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser?.authToken || ""}` }
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.authToken || ""}`
        },
        body: JSON.stringify({
          name: addName,
          price: Number(addPrice),
          description: addDesc,
          image: addImage || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsAddingAddon(false);
        setAddName("");
        setAddPrice("");
        setAddDesc("");
        setAddImage("");
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
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser?.authToken || ""}` }
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

  const resetPrintProductForm = () => {
    setIsAddingPrintProduct(false);
    setEditingPrintProductId(null);
    setPrintProdName("");
    setPrintProdDesc("");
    setPrintProdSize("8x10 inches");
    setPrintProdPrice("");
    setPrintProdImages([]);
    setPrintProdExistingImages([]);
    setPrintProdHours("24");
  };

  const startEditingPrintProduct = (product: any) => {
    setEditingPrintProductId(product.id);
    setIsAddingPrintProduct(true);
    setPrintProdName(product.name || "");
    setPrintProdDesc(product.description || "");
    setPrintProdSize(product.size || "");
    setPrintProdPrice(String(product.price ?? ""));
    setPrintProdHours(String(product.estimatedHours ?? 24));
    setPrintProdImages([]);
    setPrintProdExistingImages(product.images?.length ? product.images : (product.image ? [product.image] : []));
  };

  const handleAddPrintProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!printProdName.trim() || !printProdPrice) return;
    const wasEditing = Boolean(editingPrintProductId);

    try {
      const res = await fetch(editingPrintProductId ? `/api/print-products/${editingPrintProductId}` : "/api/print-products", {
        method: editingPrintProductId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.authToken || ""}`
        },
        body: JSON.stringify({
          studioId: studio.id,
          name: printProdName,
          description: printProdDesc || "Premium photo print option.",
          size: printProdSize,
          price: Number(printProdPrice),
          images: printProdImages,
          estimatedHours: Number(printProdHours) || 24
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Unable to ${editingPrintProductId ? "update" : "add"} print product.`);
      }
      resetPrintProductForm();
      onRefresh?.();
      alert(`Print product ${wasEditing ? "updated" : "added"} successfully.`);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : `Unable to ${wasEditing ? "update" : "add"} print product.`);
    }
  };

  const handleDeletePrintProduct = async (productId: string) => {
    if (!confirm("Remove this print product from the studio catalog?")) return;

    try {
      const res = await fetch(`/api/print-products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser?.authToken || ""}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to delete print product.");
      }
      onRefresh?.();
      alert("Print product removed.");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unable to remove print product.");
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

      </div>

      {canManageStaff && (
      /* Interactive Studio Setup & Branding Checklist Banner */
      <div className="bg-gradient-to-r from-[#fffaf0] via-[#fffdf8] to-[#f3f8f8] text-[#26384a] p-6 rounded-3xl border border-[#eadfca] shadow-sm relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-[#fff1bd] text-[#8a5a00] border border-[#efd37a] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles size={12} /> Studio Onboarding & Style Control Center
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#26384a]">
              Customize Your Studio Page & Catalog
            </h3>
            <p className="text-xs text-[#526574] max-w-2xl leading-relaxed">
              Set up your studio's photos, Cainta location corridor, specialization categories, services with sample pictures, and packages to showcase your studio style to clients.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab("management");
                setManagementSubTab("branding");
              }}
              className="py-2 px-3.5 bg-[#f4bf3a] hover:bg-[#e7ae22] text-[#26384a] font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1"
            >
              <Settings size={14} /> Branding & Location
            </button>
            <button
              onClick={() => {
                setActiveTab("management");
                setManagementSubTab("catalog");
              }}
              className="py-2 px-3.5 bg-white/80 hover:bg-white text-[#526574] border border-[#dbe5e5] font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
            >
              <ImageIcon size={14} /> Services & Samples
            </button>
          </div>
        </div>

        {/* Setup Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#e8dfcf] text-xs">
          <div 
            onClick={() => { setActiveTab("management"); setManagementSubTab("branding"); }}
            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.01] ${logo && coverImage ? "bg-[#e8f7ef] border-[#9fd8b8] text-[#18734a]" : "bg-white/70 border-[#e5e0d7] text-[#71808d]"}`}
          >
            <CheckCircle size={14} className={logo && coverImage ? "text-[#1d9b61]" : "text-[#9aa7af]"} />
            <div>
              <p className="font-bold text-[11px]">1. Logo & Cover</p>
              <p className="text-[9px] opacity-80">{logo && coverImage ? "Images Set" : "Upload Photos"}</p>
            </div>
          </div>
          <div 
            onClick={() => { setActiveTab("management"); setManagementSubTab("branding"); }}
            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.01] ${location && (selectedCategories.length > 0) ? "bg-[#e8f7ef] border-[#9fd8b8] text-[#18734a]" : "bg-white/70 border-[#e5e0d7] text-[#71808d]"}`}
          >
            <CheckCircle size={14} className={location && (selectedCategories.length > 0) ? "text-[#1d9b61]" : "text-[#9aa7af]"} />
            <div>
              <p className="font-bold text-[11px]">2. Location & Category</p>
              <p className="text-[9px] opacity-80">{selectedCategories.length} Specialties</p>
            </div>
          </div>
          <div 
            onClick={() => { setActiveTab("management"); setManagementSubTab("catalog"); }}
            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.01] ${services.some(s => s.studioId === studio.id) ? "bg-[#e8f7ef] border-[#9fd8b8] text-[#18734a]" : "bg-white/70 border-[#e5e0d7] text-[#71808d]"}`}
          >
            <CheckCircle size={14} className={services.some(s => s.studioId === studio.id) ? "text-[#1d9b61]" : "text-[#9aa7af]"} />
            <div>
              <p className="font-bold text-[11px]">3. Shoot Services</p>
              <p className="text-[9px] opacity-80">{services.filter(s => s.studioId === studio.id).length} Services Listed</p>
            </div>
          </div>
          <div 
            onClick={() => { setActiveTab("management"); setManagementSubTab("catalog"); }}
            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.01] ${packages.some(p => p.studioId === studio.id) ? "bg-[#e8f7ef] border-[#9fd8b8] text-[#18734a]" : "bg-white/70 border-[#e5e0d7] text-[#71808d]"}`}
          >
            <CheckCircle size={14} className={packages.some(p => p.studioId === studio.id) ? "text-[#1d9b61]" : "text-[#9aa7af]"} />
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
          <h4 className="dashboard-stat-value text-2xl font-bold text-[#2c2a29]">{overallIncome} PHP</h4>
          <span className="text-[9px] text-[#7c756d] font-medium block mt-1">Bookings + Print copies</span>
        </div>

        <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-sm text-left">
          <div className="flex justify-between items-center text-[#7c756d] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Bookings count</span>
            <Calendar size={16} />
          </div>
          <h4 className="dashboard-stat-value text-2xl font-bold text-[#2c2a29]">{studioBookings.length} Total</h4>
          <span className="text-[9px] text-green-600 font-bold block mt-1">Active reservations</span>
        </div>

        <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-sm text-left">
          <div className="flex justify-between items-center text-[#7c756d] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Prints Fulfilled</span>
            <Printer size={16} />
          </div>
          <h4 className="dashboard-stat-value text-2xl font-bold text-[#2c2a29]">{studioPrints.length} Orders</h4>
          <span className="text-[9px] text-blue-600 font-bold block mt-1">Ready or Processing</span>
        </div>

        <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-sm text-left">
          <div className="flex justify-between items-center text-[#7c756d] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average Review</span>
            <Star size={16} className="fill-yellow-500 text-yellow-500" />
          </div>
          <h4 className="dashboard-stat-value text-2xl font-bold text-[#2c2a29]">
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
                                pmObj.status === "Verified" || pmObj.paymentStatus === "Paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-800"
                              }`}>
                                {pmObj.paymentStatus || pmObj.status} ({pmObj.paymentMethod})
                              </span>
                              {(pmObj as any).paymentChannel === "gcash_qr" && (
                                <span className="block text-[8px] font-extrabold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-1 py-0.5 rounded mt-0.5 w-fit">
                                  🛡️ QR Ph Gateway Captured
                                </span>
                              )}
                              {(pmObj as any).gatewayTransactionId && (
                                <span className="block text-[8px] font-mono text-gray-400 truncate max-w-[120px]" title={(pmObj as any).gatewayTransactionId}>
                                  ID: {(pmObj as any).gatewayTransactionId}
                                </span>
                              )}
                              {pmObj.referenceNumber && (
                                <span className="block text-[8px] font-semibold text-gray-600">
                                  Ref: {pmObj.referenceNumber}
                                </span>
                              )}
                              {pmObj.proofOfPayment && (
                                <button
                                  type="button"
                                  onClick={() => setViewingReceipt({
                                    url: pmObj.proofOfPayment,
                                    ref: pmObj.referenceNumber || (pmObj as any).gatewayTransactionId || "N/A",
                                    amount: Number(pmObj.amount),
                                    method: pmObj.paymentMethod
                                  })}
                                  className="inline-flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline cursor-pointer bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-0.5"
                                >
                                  <Eye size={10} /> View Screenshot
                                </button>
                              )}
                              {(pmObj as any).fraudScore === -1 && (
                                <span className="block text-[8px] font-extrabold text-red-700 bg-red-100 border border-red-300 px-1 py-0.5 rounded mt-0.5 w-fit">
                                  ⚠️ Amount Mismatch Flag
                                </span>
                              )}
                              {canManageDownpayments && pmObj.paymentStatus === "Pending Verification" && (
                                <div className="space-y-1 pt-1">
                                  <button
                                    onClick={() => onUpdateStatus("payment", pmObj.id, "Verified")}
                                    className="block text-[10px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded font-bold cursor-pointer"
                                  >
                                    ✓ Approve & Confirm Booking
                                  </button>
                                  <button
                                    onClick={() => onUpdateStatus("payment", pmObj.id, "Rejected")}
                                    className="block text-[9px] text-red-600 hover:underline cursor-pointer"
                                  >
                                    ✕ Reject Receipt
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
                        <img src={resolvedStudioPrintMedia[ord.uploadedPhoto] || ord.uploadedPhoto} alt="to print" className="w-10 h-10 rounded object-cover border" />
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
                          {ord.paymentStatus === "Unpaid" && onRecordPrintCashPayment && (
                            <button
                              onClick={() => {
                                if (confirm(`Record cash payment of ₱${ord.totalAmount} for Order ${ord.id}?`)) {
                                  onRecordPrintCashPayment(ord.id);
                                }
                              }}
                              className="mt-1 inline-flex items-center gap-1 text-[9px] text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              💵 Record Cash Payment
                            </button>
                          )}
                          {ord.paymentStatus === "Pending Verification" && onVerifyPrintPayment && (
                            <div className="flex gap-2 text-[9px] font-bold">
                              {ord.proofOfPayment && <a href={resolvedStudioPrintMedia[ord.proofOfPayment] || ord.proofOfPayment} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View receipt</a>}
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
                  Compare verified booking income and print sales by day, week, month, or year.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Chart Type Selector */}
                <div className="bg-[#faf9f6] p-1 rounded-xl border border-[#e5e1da] flex items-center gap-1">
                  {(["daily", "weekly", "monthly", "yearly"] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setRevenuePeriod(period)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${revenuePeriod === period ? "bg-amber-600 text-white shadow-xs" : "text-[#7c756d] hover:text-[#2c2a29]"}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>

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
                  onClick={() => generateStudioSalesReportPDF(studio, studioBookings, studioPrints)}
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
                    ₱{revenueData.reduce((s, m) => s + m.bookingIncome, 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {Math.round(
                      (revenueData.reduce((s, m) => s + m.bookingIncome, 0) /
                        (revenueData.reduce((s, m) => s + m.totalRevenue, 0) || 1)) *
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
                    ₱{revenueData.reduce((s, m) => s + m.printSales, 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    {Math.round(
                      (revenueData.reduce((s, m) => s + m.printSales, 0) /
                        (revenueData.reduce((s, m) => s + m.totalRevenue, 0) || 1)) *
                        100
                    )}%
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 block mt-1">Physical prints & photo orders</span>
              </div>

              <div className="bg-[#2c2a29] text-white p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                  {revenuePeriod === "daily" ? "14-Day Total" : revenuePeriod === "weekly" ? "12-Week Total" : revenuePeriod === "monthly" ? "6-Month Total" : "5-Year Total"}
                </span>
                <span className="text-2xl font-black text-white">
                  ₱{revenueData.reduce((s, m) => s + m.totalRevenue, 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-300 block mt-1">Combined Studio Revenue</span>
              </div>
            </div>

            {/* Recharts Main Visualization Canvas */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {revenueChartType === "composed" ? (
                  <ComposedChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e1da" />
                    <XAxis dataKey="label" stroke="#7c756d" fontSize={11} tickLine={false} />
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
                  <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e1da" />
                    <XAxis dataKey="label" stroke="#7c756d" fontSize={11} tickLine={false} />
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
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                    <XAxis dataKey="label" stroke="#7c756d" fontSize={11} tickLine={false} />
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
                {revenuePeriod[0].toUpperCase() + revenuePeriod.slice(1)} Financial Breakdown
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#e5e1da] text-[#7c756d] font-bold uppercase tracking-wider text-[10px] bg-[#faf9f6]">
                      <th className="py-2.5 px-3 rounded-l-lg">{revenuePeriod[0].toUpperCase() + revenuePeriod.slice(1)}</th>
                      <th className="py-2.5 px-3">Photoshoot Bookings</th>
                      <th className="py-2.5 px-3">Print Creative Sales</th>
                      <th className="py-2.5 px-3">Total Monthly Revenue</th>
                      <th className="py-2.5 px-3 text-right rounded-r-lg">Growth Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-[#2c2a29]">
                    {revenueData.map((m, idx) => {
                      const previousTotal = idx > 0 ? revenueData[idx - 1].totalRevenue : m.totalRevenue;
                      const diff = m.totalRevenue - previousTotal;
                      const isUp = diff >= 0;

                      return (
                        <tr key={m.label} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-[#2c2a29]">{m.label}</td>
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

      {/* UNIFIED STUDIO MANAGEMENT & SETTINGS HUB */}
      {["management", "services", "staff", "settings"].includes(activeTab) && (
        <div className="space-y-6 text-left">
          {/* Management Hub Container Card */}
          <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e1da] pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#fff1bd] text-[#8a5a00] border border-[#efd37a] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  <Sparkles size={12} /> Studio Operations & Settings Hub
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#2c2a29]">
                  Studio Management & Settings
                </h3>
                <p className="text-xs text-[#7c756d] mt-1">
                  Manage your photography services catalog, studio branding, GCash payments, team accounts, scheduling rules, and account security in one place.
                </p>
              </div>
            </div>

            {/* Sub-Tab Navigation Pill Bar */}
            <div className="flex flex-wrap gap-2 pt-1 border-b border-[#e5e1da] pb-4">
              {[
                { id: "catalog" as const, label: "Services & Catalog", icon: Camera, desc: "Services, packages & prints" },
                { id: "branding" as const, label: "Branding & Profile", icon: Settings, desc: "Logo, location & bio" },
                { id: "gcash" as const, label: "GCash & Payments", icon: DollarSign, desc: "QR setup & credentials" },
                ...(canManageStaff ? [{ id: "staff" as const, label: "Staff Accounts", icon: User, desc: "Team members & invites" }] : []),
                { id: "availability" as const, label: "Availability & Calendar", icon: Calendar, desc: "Blocked dates & hours" },
                { id: "faqs" as const, label: "Studio FAQs", icon: FileText, desc: "Chatbot & inquiries" },
                { id: "account" as const, label: "Account & Password", icon: KeyRound, desc: "My login credentials" }
              ].map((subTab) => {
                const Icon = subTab.icon;
                const isSelected = managementSubTab === subTab.id;
                return (
                  <button
                    key={subTab.id}
                    type="button"
                    onClick={() => setManagementSubTab(subTab.id)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#2c2a29] text-white shadow-md shadow-black/10 scale-[1.02]"
                        : "bg-[#faf9f6] text-[#7c756d] hover:bg-gray-100 hover:text-[#2c2a29] border border-[#e5e1da]"
                    }`}
                  >
                    <Icon size={14} className={isSelected ? "text-yellow-400" : "text-[#7c756d]"} />
                    <span>{subTab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SUB-TAB 1: SERVICES & PACKAGES CATALOG */}
            {managementSubTab === "catalog" && (
              <div className="space-y-8 pt-2">
          {/* Section 1: Services */}
          <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#2c2a29]">Photography Services Catalog</h3>
                <p className="text-xs text-[#7c756d]">Services represent individual shoot offerings listed in your directory profile.</p>
              </div>
              <button
                onClick={() => {
                  if (isAddingService && editingServiceId) {
                    resetServiceForm();
                    return;
                  }
                  if (isAddingService) {
                    setIsAddingService(false);
                    return;
                  }
                  resetServiceForm();
                  setIsAddingService(true);
                }}
                className="py-2 px-4 bg-[#2c2a29] text-[#faf9f6] hover:bg-[#1a1918] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isAddingService ? <X size={14} /> : <Plus size={14} />} 
                {isAddingService ? "Cancel" : "Add Service"}
              </button>
            </div>

            {isAddingService && (
              <form onSubmit={handleAddServiceSubmit} className="bg-[#faf9f6] border border-[#e5e1da] p-5 rounded-2xl max-w-xl space-y-4 text-xs">
                <h4 className="font-bold text-[#2c2a29] uppercase tracking-wider text-[10px]">{editingServiceId ? "Edit Shoot Service" : "Create New Shoot Service"}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Service Name</label>
                    <input
                      type="text"
                      required
                      value={srvName}
                      onChange={e => setSrvName(e.target.value)}
                      placeholder={currentServiceTemplate.name}
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
                      placeholder={currentServiceTemplate.price}
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
                      placeholder={currentServiceTemplate.description}
                      className="w-full bg-white border border-[#e5e1da] rounded-xl p-3 text-xs focus:outline-none focus:border-[#2c2a29] h-20"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Service Sample Showcase Photos</label>
                    <div className="flex items-start gap-3">
                      {srvImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 max-w-[220px]">
                          {srvImages.map((image, index) => (
                            <div key={`${image.slice(0, 24)}-${index}`} className="relative">
                              <img src={image} alt={`Sample ${index + 1}`} className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
                              <button type="button" onClick={() => setSrvImages(current => current.filter((_, imageIndex) => imageIndex !== index))} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs leading-none cursor-pointer" aria-label={`Remove sample ${index + 1}`}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleServiceImagesUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <button type="button" className="w-full py-2 bg-white border border-[#e5e1da] rounded-xl text-xs font-bold text-gray-700 hover:border-[#2c2a29] transition-colors flex items-center justify-center gap-1">
                            <Upload size={12} /> Add Sample Photos
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Paste an image URL, then press Enter"
                          onKeyDown={e => {
                            if (e.key === "Enter" && e.currentTarget.value.trim()) {
                              e.preventDefault();
                              setSrvImages(current => [...current, e.currentTarget.value.trim()]);
                              e.currentTarget.value = "";
                            }
                          }}
                          className="w-full bg-white border border-[#e5e1da] rounded-xl px-2.5 py-1 text-[11px] focus:outline-none focus:border-[#2c2a29]"
                        />
                        <p className="text-[10px] text-[#7c756d]">You can upload multiple sample images.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2c2a29] text-white font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  {editingServiceId ? "Update Service" : "Save Service"}
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
                  <div className="pt-2 border-t border-[#e5e1da]/50 flex justify-end gap-2">
                    <button
                      onClick={() => startEditingService(s)}
                      className="text-[#2c2a29] hover:text-[#1a1918] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit size={12} /> Edit
                    </button>
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

          {/* Section 2: Print Products */}
          <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#2c2a29]">Print Product Catalog</h3>
                <p className="text-xs text-[#7c756d]">Create the physical print options your customers can order from the studio storefront.</p>
              </div>
              <button
                onClick={() => isAddingPrintProduct ? resetPrintProductForm() : setIsAddingPrintProduct(true)}
                className="py-2 px-4 bg-[#2c2a29] text-[#faf9f6] hover:bg-[#1a1918] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isAddingPrintProduct ? <X size={14} /> : <Plus size={14} />} 
                {isAddingPrintProduct ? "Cancel" : "Add Print Product"}
              </button>
            </div>

            {isAddingPrintProduct && (
              <form onSubmit={handleAddPrintProductSubmit} className="bg-[#faf9f6] border border-[#e5e1da] p-5 rounded-2xl max-w-xl space-y-4 text-xs">
                <h4 className="font-bold text-[#2c2a29] uppercase tracking-wider text-[10px]">{editingPrintProductId ? "Edit Print Product" : "Create Print Product"}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Product Name</label>
                    <input
                      type="text"
                      required
                      value={printProdName}
                      onChange={e => setPrintProdName(e.target.value)}
                      placeholder="e.g. 8R Matte Portrait Print"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2c2a29]">Price (PHP)</label>
                    <input
                      type="number"
                      required
                      value={printProdPrice}
                      onChange={e => setPrintProdPrice(e.target.value)}
                      placeholder="450"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2c2a29]">Size</label>
                    <input
                      type="text"
                      required
                      value={printProdSize}
                      onChange={e => setPrintProdSize(e.target.value)}
                      placeholder="8x10 inches"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2c2a29]">Estimated Hours</label>
                    <input
                      type="number"
                      required
                      value={printProdHours}
                      onChange={e => setPrintProdHours(e.target.value)}
                      placeholder="24"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Product Photos (multiple)</label>
                    <input
                      type="file"
                      required={printProdImages.length === 0}
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handlePrintProductImagesUpload}
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                    {printProdImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {printProdImages.map((image, index) => (
                          <img key={`${image.slice(0, 20)}-${index}`} src={image} alt={`Product preview ${index + 1}`} className="h-16 w-full rounded-lg object-cover border border-[#e5e1da]" />
                        ))}
                      </div>
                    )}
                    {printProdExistingImages.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {printProdExistingImages.slice(0, 5).map((image, index) => (
                          <img key={`${image}-${index}`} src={image} alt={`Current product photo ${index + 1}`} className="h-12 w-12 rounded-lg object-cover border border-[#e5e1da]" />
                        ))}
                        <p className="self-center text-[10px] text-[#7c756d]">Current photos are kept unless replacement photos are uploaded.</p>
                      </div>
                    )}
                    <p className="text-[10px] text-[#7c756d]">Upload photos showing the actual paper, material, frame, or finish. Add each size/style as its own product with its own price.</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Description</label>
                    <textarea
                      value={printProdDesc}
                      onChange={e => setPrintProdDesc(e.target.value)}
                      placeholder="Premium archival print with a fine matte finish and rich color depth."
                      className="w-full bg-white border border-[#e5e1da] rounded-xl p-3 text-xs focus:outline-none focus:border-[#2c2a29] h-20"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  {editingPrintProductId ? "Update Print Product" : "Save Print Product"}
                </button>
              </form>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {printProducts.filter(p => p.studioId === studio.id).map((prod) => (
                <div key={prod.id} className="p-4 border border-[#e5e1da] rounded-2xl bg-[#faf9f6] flex flex-col justify-between space-y-3 text-xs">
                  <div className="space-y-2 text-left">
                    <img src={prod.images?.[0] || prod.image} alt={prod.name} className="w-full h-32 rounded-xl object-cover border border-[#e5e1da]" />
                    {prod.images && prod.images.length > 1 && (
                      <div className="flex gap-1.5 overflow-hidden">
                        {prod.images.slice(1, 5).map((image: string, index: number) => (
                          <img key={`${image}-${index}`} src={image} alt={`${prod.name} detail ${index + 2}`} className="h-10 w-10 rounded object-cover border border-[#e5e1da]" />
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="font-bold text-sm text-[#2c2a29]">{prod.name}</h4>
                      <span className="font-bold font-mono text-xs text-[#2c2a29]">₱{prod.price}</span>
                    </div>
                    <p className="text-[#7c756d] text-[11px] leading-snug">{prod.description}</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px] text-gray-500 font-semibold">
                      <span>📏 {prod.size}</span>
                      <span>⏱️ {prod.estimatedHours} hrs</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#e5e1da]/50 flex justify-end gap-2">
                    <button
                      onClick={() => startEditingPrintProduct(prod)}
                      className="text-[#2c2a29] hover:text-black font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeletePrintProduct(prod.id)}
                      className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} /> Remove
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
                onClick={() => {
                  if (isAddingPackage && editingPackageId) {
                    resetPackageForm();
                    return;
                  }
                  if (isAddingPackage) {
                    setIsAddingPackage(false);
                    return;
                  }
                  resetPackageForm();
                  setIsAddingPackage(true);
                }}
                className="py-2 px-4 bg-[#2c2a29] text-[#faf9f6] hover:bg-[#1a1918] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isAddingPackage ? <X size={14} /> : <Plus size={14} />} 
                {isAddingPackage ? "Cancel" : "Add Package"}
              </button>
            </div>

            {isAddingPackage && (
              <form onSubmit={handleAddPackageSubmit} className="bg-[#faf9f6] border border-[#e5e1da] p-5 rounded-2xl max-w-xl space-y-4 text-xs">
                <h4 className="font-bold text-[#2c2a29] uppercase tracking-wider text-[10px]">{editingPackageId ? "Edit Custom Photo Package" : "Create Custom Photo Package"}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Package Category</label>
                    <select
                      value={pkgCat}
                      onChange={e => setPkgCat(e.target.value)}
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    >
                      {selectedCategories.length > 0 ? selectedCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      )) : [
                        "Portrait Photography",
                        "Graduation Shoots",
                        "Wedding Milestones",
                        "Product Creative",
                        "Family Portrait",
                        "Baby & Milestone"
                      ].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Package Bundle Name</label>
                    <input
                      type="text"
                      required
                      value={pkgName}
                      onChange={e => setPkgName(e.target.value)}
                      placeholder={currentPackageTemplate.name}
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
                      placeholder={currentPackageTemplate.price}
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
                      placeholder={currentPackageTemplate.duration}
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
                      placeholder={currentPackageTemplate.photos}
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
                      placeholder={currentPackageTemplate.prints}
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
                      placeholder={currentPackageTemplate.photographers}
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Inclusions & Terms Description</label>
                    <textarea
                      required
                      value={pkgDesc}
                      onChange={e => setPkgDesc(e.target.value)}
                      placeholder={currentPackageTemplate.description}
                      className="w-full bg-white border border-[#e5e1da] rounded-xl p-3 text-xs focus:outline-none focus:border-[#2c2a29] h-20"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Package Catalog Image</label>
                    <div className="flex items-center gap-3">
                      {pkgImage && <img src={pkgImage} alt="Package preview" className="w-20 h-16 rounded-lg object-cover border border-[#e5e1da]" />}
                      <div className="relative flex-1">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleImageFileUpload(e, setPkgImage)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        <button type="button" className="w-full py-2 bg-white border border-[#e5e1da] rounded-xl text-xs font-bold text-gray-700 hover:border-[#2c2a29] transition-colors flex items-center justify-center gap-1">
                          <Upload size={12} /> {pkgImage ? "Replace Package Image" : "Upload Package Image"}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#7c756d]">This image appears when customers choose the package while booking.</p>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  {editingPackageId ? "Update Package Bundle" : "Save Package Bundle"}
                </button>
              </form>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {packages.filter(p => p.studioId === studio.id).map((p) => (
                <div key={p.id} className="p-4 border border-[#e5e1da] rounded-2xl bg-[#faf9f6] flex flex-col justify-between space-y-3 text-xs">
                  <div className="space-y-1 text-left">
                    {p.image && <img src={p.image} alt={p.name} className="w-full h-32 rounded-xl object-cover border border-[#e5e1da]" />}
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
                  <div className="pt-2 border-t border-[#e5e1da]/50 flex justify-end gap-2">
                    <button
                      onClick={() => startEditingPackage(p)}
                      className="text-[#2c2a29] hover:text-[#1a1918] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit size={12} /> Edit
                    </button>
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
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-[#2c2a29]">Add-on Catalog Image</label>
                    <div className="flex items-center gap-3">
                      {addImage && <img src={addImage} alt="Add-on preview" className="w-20 h-16 rounded-lg object-cover border border-[#e5e1da]" />}
                      <div className="relative flex-1">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAddonImageUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        <button type="button" className="w-full py-2 bg-white border border-[#e5e1da] rounded-xl text-xs font-bold text-gray-700 hover:border-[#2c2a29] transition-colors flex items-center justify-center gap-1">
                          <Upload size={12} /> {addImage ? "Replace Add-on Image" : "Upload Add-on Image"}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#7c756d]">This image appears when customers choose the add-on while booking.</p>
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
                  {addon.image && <img src={addon.image} alt={addon.name} className="w-14 h-14 rounded-lg object-cover border border-[#e5e1da] mr-3" />}
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

          {/* SUB-TAB 4: STAFF ACCOUNTS */}
          {managementSubTab === "staff" && canManageStaff && (
            <div className="space-y-6 pt-2">
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

          {/* SUB-TAB 3: GCASH & PAYMENTS */}
          {managementSubTab === "gcash" && (
            <div className="space-y-6 pt-2">
              {/* GCash Digital QR Payment Settings */}
              <div className="p-5 bg-gradient-to-br from-emerald-950/80 to-emerald-900/60 border border-emerald-700/50 rounded-2xl text-left text-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#00a94f] flex items-center justify-center font-bold text-white text-sm shadow">
                  G
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">GCash Digital QR Payment Integration</h4>
                  <p className="text-emerald-300/80 text-xs">Configure your studio's merchant identification for QR Ph & GCash payments.</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                gcashGatewayInfo?.configured
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }`}>
                {gcashGatewayInfo?.configured ? `● Gateway Online (${gcashGatewayInfo.mode})` : "○ Gateway Standby"}
              </span>
            </div>

            <form onSubmit={handleSaveGcashSettings} className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-emerald-200 font-bold block">Studio GCash Merchant Name</label>
                <input
                  type="text"
                  value={gcashMerchantName}
                  onChange={e => setGcashMerchantName(e.target.value)}
                  placeholder={studio.name || "e.g. Ellacapstudio"}
                  className="w-full bg-emerald-900/40 border border-emerald-600/40 rounded-xl px-3 py-2 text-white placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[10px] text-emerald-400/70 block">Name displayed to customers on the dynamic QR checkout screen</span>
              </div>

              <div className="space-y-1">
                <label className="text-emerald-200 font-bold block">GCash Account Number (Reference)</label>
                <input
                  type="text"
                  value={gcashNumber}
                  onChange={e => setGcashNumber(e.target.value)}
                  placeholder="09XX XXX XXXX"
                  className="w-full bg-emerald-900/40 border border-emerald-600/40 rounded-xl px-3 py-2 text-white placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[10px] text-emerald-400/70 block">Official GCash registered phone number for reconciliation</span>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between pt-1">
                {gcashSaveMsg ? (
                  <span className="text-xs font-bold text-emerald-300">{gcashSaveMsg}</span>
                ) : (
                  <span className="text-[10px] text-emerald-400/60">
                    🛡️ Protected by 5-Layer Anti-Fraud (HMAC signature, idempotency guard, and amount integrity checks).
                  </span>
                )}
                <button
                  type="submit"
                  disabled={savingGcash}
                  className="px-4 py-2 bg-[#00a94f] hover:bg-[#008f43] text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow transition-all disabled:opacity-50"
                >
                  {savingGcash ? "Saving..." : "Save GCash Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          {/* SUB-TAB 6: STUDIO FAQS */}
          {managementSubTab === "faqs" && (
            <div className="space-y-6 pt-2 max-w-2xl">
              <div className="space-y-4 p-5 bg-[#faf9f6] rounded-2xl border border-[#e5e1da]">
                <h4 className="font-extrabold text-xs text-[#2c2a29] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-amber-600" /> Studio Frequently Asked Questions
                </h4>

              <form onSubmit={handleStudioFaqSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#2c2a29] block">Question</label>
                    <input
                      value={faqQuestion}
                      onChange={e => setFaqQuestion(e.target.value)}
                      placeholder="How do I secure my booking date?"
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#2c2a29] block">Category</label>
                    <select
                      value={faqCategory}
                      onChange={e => setFaqCategory(e.target.value)}
                      className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2c2a29]"
                    >
                      <option value="General">General</option>
                      <option value="Booking">Booking</option>
                      <option value="Payments">Payments</option>
                      <option value="Policies">Policies</option>
                      <option value="Services">Services</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-[#2c2a29] block">Answer</label>
                  <textarea
                    value={faqAnswer}
                    onChange={e => setFaqAnswer(e.target.value)}
                    rows={4}
                    placeholder="Write the real answer for your clients."
                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-[#2c2a29] text-white rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                    Save FAQ
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {faqs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#e5e1da] bg-white p-4 text-center text-xs text-[#7c756d]">
                    No studio FAQs created yet.
                  </div>
                ) : (
                  faqs.map((faq) => (
                    <div key={faq.id} className="rounded-2xl border border-[#e5e1da] bg-white p-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7c756d]">{faq.category || "General"}</p>
                          <h4 className="font-bold text-sm text-[#2c2a29]">{faq.question}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteFaq?.(faq.id)}
                          className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

          {/* SUB-TAB 2: BRANDING & PROFILE */}
          {managementSubTab === "branding" && (
            <div className="space-y-6 pt-2">
              <form onSubmit={handleSettingsSubmit} className="space-y-6 max-w-2xl text-left">
                {/* 1. Studio Logo & Cover Image Uploads */}
                <div className="space-y-3 p-5 bg-[#faf9f6] rounded-2xl border border-[#e5e1da]">
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

            <div className="space-y-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 bg-[#2c2a29] hover:bg-[#1a1918] text-white text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} className="fill-current text-yellow-500" />
                {savingSettings ? "Saving Studio Profile..." : "Save & Publish Studio Style Profile"}
              </button>

              {saveStatus.type !== "idle" && (
                <div
                  className={`rounded-xl border px-3 py-2 text-[11px] font-medium ${
                    saveStatus.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {saveStatus.message}
                </div>
              )}
            </div>
          </form>
        </div>
      )}

          {/* SUB-TAB 5: AVAILABILITY & CALENDAR */}
          {managementSubTab === "availability" && (
            <div className="space-y-6 pt-2">
              <AvailabilityManager currentUser={currentUser} studio={studio} onRefresh={onRefresh} />

              {/* Section: Blocked Dates Holiday Scheduler */}
              <div className="p-5 bg-[#faf9f6] rounded-2xl border border-[#e5e1da] max-w-xl space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-[#2c2a29] uppercase tracking-wider">Closed Holidays & Blocked Dates</h4>
                  <p className="text-[11px] text-[#7c756d]">Customers will be blocked from making online scheduler bookings on dates selected here.</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={e => setNewBlockedDate(e.target.value)}
                    className="bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29] flex-1"
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

          {/* SUB-TAB 7: OPERATOR ACCOUNT & SECURITY */}
          {managementSubTab === "account" && (
            <div className="space-y-6 pt-2">
              <AccountSettings currentUser={currentUser} onUserUpdated={onRefresh || (() => {})} />
            </div>
          )}
        </div>
      </div>
      )}

      {/* Tab: Studio Reviews (Studio Owner View) */}
      {activeTab === "reviews" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-[#2c2a29]">Customer Reviews for {studio.name}</h3>
              <p className="text-xs text-[#7c756d]">View reviews submitted by your customers. You can show or hide each review from the public landing page and reply to them as needed.</p>
            </div>
            <button
              onClick={fetchStudioReviews}
              className="text-xs bg-[#2c2a29] text-white px-3 py-2 rounded-xl font-bold hover:bg-[#44403c] transition-colors cursor-pointer"
            >↻ Refresh</button>
          </div>

          {!reviewsTabLoaded && studioOwnerReviews.length === 0 && (
            <div className="py-6 text-center">
              <button
                onClick={fetchStudioReviews}
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
                        rev.isVisible === false ? "bg-gray-200 text-gray-700" :
                        rev.status === "approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}>{rev.isVisible === false ? "Hidden" : rev.status}</span>
                    </div>
                    <p className="text-xs text-[#2c2a29] mt-1 leading-relaxed">"{rev.comment}"</p>
                    <span className="text-[10px] text-[#7c756d]">
                      {new Date(rev.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="ml-12 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const nextVisible = rev.isVisible !== false;
                      const response = await fetch(`/api/studio/reviews/${rev.id}/visibility`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${currentUser?.authToken || ""}`
                        },
                        body: JSON.stringify({ studioId: studio.id, visible: !nextVisible })
                      });
                      const data = await response.json();
                      if (data.success) {
                        setStudioOwnerReviews(prev => prev.map(item => item.id === rev.id ? data.review : item));
                        onRefresh?.();
                      }
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg font-bold cursor-pointer border border-[#e5e1da] bg-white text-[#2c2a29] hover:bg-[#faf9f6]"
                  >
                    {rev.isVisible === false ? "Show on Public Page" : "Hide from Public Page"}
                  </button>
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
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${currentUser?.authToken || ""}`
                            },
                            body: JSON.stringify({ reply: replyText, studioId: studio.id })
                          })
                            .then(r => r.json())
                            .then(d => {
                              if (d.success) {
                                setStudioOwnerReviews(prev => prev.map(r => r.id === rev.id ? d.review : r));
                                onRefresh?.();
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
      {/* Receipt Screenshot Lightbox Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">GCash Payment Receipt Proof</p>
                <p className="text-[11px] text-gray-300">Ref: {viewingReceipt.ref} · ₱{viewingReceipt.amount.toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 bg-gray-100 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={receiptPreviewUrl || viewingReceipt.url}
                alt="Payment Screenshot"
                className="max-h-[70vh] w-auto rounded-xl object-contain shadow"
              />
            </div>
            <div className="p-3 bg-white flex justify-end gap-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-1.5 bg-gray-800 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-black"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
