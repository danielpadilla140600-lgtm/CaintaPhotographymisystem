import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { configureLeafletDefaultMarkerIcons } from "../utils/leafletConfig";
import { 
  ShieldAlert, ShieldCheck, Check, X, FileText, Plus, RefreshCw, DollarSign,
  Trash2, Users, Briefcase, Calendar, Star, Sparkles, Edit,
  MapPin, Upload, FileUp, Eye, Globe, Settings, FileCheck, CheckCircle, GripVertical,
  Volume2, Music, KeyRound, Radio, Mail, Smartphone, ExternalLink, Copy
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CustomPageView from "../components/CustomPageView.tsx";
import { CustomAudioPlayer } from "../components/CustomAudioPlayer.tsx";
import { UserRole } from "../db/types.ts";
import AccountSettings from "./AccountSettings.tsx";

export type AdminPrimarySection = "dashboard" | "studios" | "finance" | "management";
export type AdminStudiosSubTab = "pending" | "onboard" | "approved";
export type AdminFinanceSubTab = "payments" | "reviews";
export type AdminManagementSubTab = "users" | "categories" | "cms" | "pages" | "theme" | "modules" | "audio" | "audit" | "account";

export type AdminTab = 
  | AdminPrimarySection 
  | "pending" | "onboard" | "approved" | "users" | "cms" | "theme" | "audio" | "modules" | "pages" | "categories" | "reviews" | "payments" | "audit" | "account" | "settings";

interface AdminDashboardProps {
  studios: any[];
  bookings: any[];
  printOrders: any[];
  payments: any[];
  users: any[];
  categories: any[];
  auditLogs: any[];
  reviews?: any[];
  cms?: { [key: string]: string };
  faqs?: any[];
  faqSuggestions?: any[];
  onApproveFaqSuggestion?: (suggestionId: string) => void;
  onApproveStudio: (studioId: string) => void;
  onRejectStudio: (studioId: string) => void;
  authToken?: string;
  onAddCategory: (categoryName: string, description?: string) => void;
  onUpdateCategory: (categoryId: string, categoryName: string, description?: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onAddFaq?: (payload: { question: string; answer: string; category: string }) => void;
  onDeleteFaq?: (faqId: string) => void;
  onRefresh: () => void;
  activeTab: AdminTab;
  onActiveTabChange: (tab: AdminTab) => void;
  currentUser?: any;
}

export default function AdminDashboard({
  studios,
  bookings,
  printOrders,
  payments,
  users,
  categories,
  auditLogs,
  reviews = [],
  cms,
  faqs = [],
  faqSuggestions = [],
  onApproveFaqSuggestion,
  onApproveStudio,
  onRejectStudio,
  authToken,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onDeleteUser,
  onAddFaq,
  onDeleteFaq,
  onRefresh,
  activeTab,
  onActiveTabChange,
  currentUser
}: AdminDashboardProps) {

  const primarySection: AdminPrimarySection = React.useMemo(() => {
    if (activeTab === "studios" || activeTab === "pending" || activeTab === "onboard" || activeTab === "approved") return "studios";
    if (activeTab === "finance" || activeTab === "payments" || activeTab === "reviews") return "finance";
    if (activeTab === "management" || ["users", "categories", "cms", "pages", "theme", "modules", "audio", "audit", "account", "settings"].includes(activeTab as string)) return "management";
    return "studios";
  }, [activeTab]);

  const [studiosSubTab, setStudiosSubTab] = useState<AdminStudiosSubTab>(() => {
    if (activeTab === "onboard") return "onboard";
    if (activeTab === "approved") return "approved";
    return "pending";
  });

  const [financeSubTab, setFinanceSubTab] = useState<AdminFinanceSubTab>(() => {
    if (activeTab === "reviews") return "reviews";
    return "payments";
  });

  const [managementSubTab, setManagementSubTab] = useState<AdminManagementSubTab>(() => {
    if (["users", "categories", "cms", "pages", "theme", "modules", "audio", "audit", "account"].includes(activeTab as string)) {
      return activeTab as AdminManagementSubTab;
    }
    return "users";
  });

  useEffect(() => {
    if (activeTab === "onboard") setStudiosSubTab("onboard");
    else if (activeTab === "approved") setStudiosSubTab("approved");
    else if (activeTab === "pending" || activeTab === "studios") setStudiosSubTab("pending");
    
    if (activeTab === "reviews") setFinanceSubTab("reviews");
    else if (activeTab === "payments" || activeTab === "finance") setFinanceSubTab("payments");

    if (["users", "categories", "cms", "pages", "theme", "modules", "audio", "audit", "account"].includes(activeTab as string)) {
      setManagementSubTab(activeTab as AdminManagementSubTab);
    }
  }, [activeTab]);

  const [selectedDocPreview, setSelectedDocPreview] = useState<{ title: string; url: string } | null>(null);

  const openPaymentProof = async (payment: any) => {
    if (!payment.proofOfPayment) return;
    try {
      const response = await fetch(payment.proofOfPayment, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Unable to load payment proof.");
      }
      const blobUrl = URL.createObjectURL(await response.blob());
      setSelectedDocPreview({ title: `${payment.id} - Payment Proof`, url: blobUrl });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to load payment proof.");
    }
  };

  const openProtectedDocument = async (url: string, title: string) => {
    try {
      const response = await fetch(url, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Unable to load document.");
      }
      const blobUrl = URL.createObjectURL(await response.blob());
      setSelectedDocPreview({ title, url: blobUrl });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to load document.");
    }
  };

  // Generic User Creation State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [newRole, setNewRole] = useState<string>("CUSTOMER");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserContact, setNewUserContact] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserStudioId, setNewUserStudioId] = useState("");
  const [userCreateLoading, setUserCreateLoading] = useState(false);
  const [userCreateMsg, setUserCreateMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDescription, setNewCatDescription] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const loadAdminReviews = async () => {
    if (!authToken) return;
    setReviewsLoading(true);
    try {
      const response = await fetch("/api/admin/reviews", {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAdminReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if ((activeTab === "reviews" || (primarySection === "finance" && financeSubTab === "reviews")) && authToken) {
      loadAdminReviews();
    }
  }, [activeTab, primarySection, financeSubTab, authToken]);

  // System Settings (Theme & UI Config) State
  const [systemSettings, setSystemSettings] = useState({
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
    hiddenNavItems: [] as string[]
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  // SMTP Email Notifications Test State
  const [smtpStatus, setSmtpStatus] = useState<{ isConfigured: boolean; senderEmail: string; service: string } | null>(null);
  const [testEmailInput, setTestEmailInput] = useState("");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // LAN Wi-Fi Network Access State
  const [networkInfo, setNetworkInfo] = useState<{ localUrl: string; networkUrl: string; ipAddress: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Custom Pages Builder State
  const [customPages, setCustomPages] = useState<any[]>([]);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("General");
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [isPreviewingPage, setIsPreviewingPage] = useState(false);
  const [currentPageForm, setCurrentPageForm] = useState({
    id: "",
    createdAt: "",
    title: "",
    slug: "",
    isPublished: true,
    showInNavbar: true,
    blocks: [] as any[]
  });

  const handleFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    onAddFaq?.({ question: faqQuestion.trim(), answer: faqAnswer.trim(), category: faqCategory.trim() || "General" });
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqCategory("General");
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(currentPageForm.blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCurrentPageForm({ ...currentPageForm, blocks: items });
  };

  useEffect(() => {
    fetchSettingsAndPages();
  }, []);

  const fetchSettingsAndPages = async () => {
    try {
      const resSet = await fetch("/api/admin/settings", { headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined });
      const dSet = await resSet.json();
      if (dSet.success) setSystemSettings(dSet.settings);

      const resPages = await fetch("/api/custom-pages");
      const dPages = await resPages.json();
      if (dPages.success) setCustomPages(dPages.pages);

      const resSmtp = await fetch("/api/admin/smtp-status");
      const dSmtp = await resSmtp.json();
      if (dSmtp.success) {
        setSmtpStatus(dSmtp);
        if (dSmtp.senderEmail && dSmtp.senderEmail !== "Not configured") {
          setTestEmailInput(dSmtp.senderEmail);
        }
      }

      const resNet = await fetch("/api/system/network-info");
      const dNet = await resNet.json();
      if (dNet.success) setNetworkInfo(dNet);
    } catch (e) {
      console.error("Failed to load settings or pages", e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    setSettingsError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: JSON.stringify(systemSettings)
      });
      const d = await res.json();
      if (d.success) {
        setSystemSettings(d.settings);
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
        onRefresh();
      } else {
        setSettingsError(d.message || "Failed to save system settings.");
      }
    } catch {
      setSettingsError("Failed to save system settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSavePageForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = currentPageForm.id ? `/api/custom-pages/${currentPageForm.id}` : "/api/custom-pages";
      const method = currentPageForm.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentPageForm)
      });
      const d = await res.json();
      if (d.success) {
        setIsEditingPage(false);
        fetchSettingsAndPages();
        onRefresh();
      } else {
        alert(d.message || "Failed to save custom page.");
      }
    } catch {
      alert("Error saving custom page.");
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this custom page?")) return;
    try {
      const res = await fetch(`/api/custom-pages/${pageId}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        fetchSettingsAndPages();
        onRefresh();
      }
    } catch {
      alert("Failed to delete page.");
    }
  };

  const handleAddBlockToPage = (type: string) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      title: "New Block Title",
      content: "Enter block content or description here.",
      imageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&fit=crop",
      buttonText: type === "hero" || type === "cta" ? "Learn More" : undefined,
      buttonLink: type === "hero" || type === "cta" ? "directory" : undefined,
      items: type === "gallery" || type === "faq" || type === "pricing" ? [
        { title: "Item 1", description: "Description 1", price: "₱1,500", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&fit=crop" }
      ] : undefined
    };
    setCurrentPageForm({
      ...currentPageForm,
      blocks: [...currentPageForm.blocks, newBlock]
    });
  };

  const handleRemoveBlock = (blockId: string) => {
    setCurrentPageForm({
      ...currentPageForm,
      blocks: currentPageForm.blocks.filter((b: any) => b.id !== blockId)
    });
  };

  // CMS Editor State
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroBackground, setHeroBackground] = useState("");
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutDescription, setAboutDescription] = useState("");
  const [savingCms, setSavingCms] = useState(false);
  const [uploadingHeroBackground, setUploadingHeroBackground] = useState(false);
  const [cmsSuccess, setCmsSuccess] = useState(false);

  // Onboard Studio Owner State
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");

  const [studioName, setStudioName] = useState("");
  const [studioDescription, setStudioDescription] = useState("");
  const [studioAddress, setStudioAddress] = useState("");
  const [studioLocation, setStudioLocation] = useState("Ortigas Ave Ext (Valley Golf)");
  const [startingPrice, setStartingPrice] = useState("1200");
  const [businessHours, setBusinessHours] = useState("09:00 AM - 06:00 PM");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [latitude, setLatitude] = useState(14.5882);
  const [longitude, setLongitude] = useState(121.1278);
  const [businessPermit, setBusinessPermit] = useState("");
  const [validId, setValidId] = useState("");
  const [otherDocs, setOtherDocs] = useState("");

  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardError, setOnboardError] = useState("");
  const [onboardSuccess, setOnboardSuccess] = useState(false);

  // Map Refs for Picker Map
  const pickMapContainerRef = useRef<HTMLDivElement>(null);
  const pickMapRef = useRef<L.Map | null>(null);
  const pickMarkerRef = useRef<L.Marker | null>(null);

  const pendingStudios = studios.filter(s => !s.isApproved || s.status === "pending");
  const approvedStudios = studios.filter(s => s.isApproved || s.status === "approved");

  // Sync CMS values from prop
  useEffect(() => {
    if (cms) {
      setHeroTitle(cms.heroTitle || "Frame Your Story. <br /> Book Cainta Studios.");
      setHeroSubtitle(cms.heroSubtitle || "Discover accredited photography studios in Cainta, Rizal...");
      setHeroBackground(cms.heroBackground || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1800&fit=crop");
      setAboutTitle(cms.aboutTitle || "Pristine Studio Lighting & Retouching");
      setAboutDescription(cms.aboutDescription || "Experience the difference of calibrated Profoto strobes...");
    }
  }, [cms]);

  // Picker Map Initialization Effect
  useEffect(() => {
    if ((primarySection !== "studios" || studiosSubTab !== "onboard") && activeTab !== "onboard") return;
    if (!pickMapContainerRef.current) return;

    configureLeafletDefaultMarkerIcons();

    if (pickMapRef.current) {
      pickMapRef.current.remove();
      pickMapRef.current = null;
    }

    try {
      const map = L.map(pickMapContainerRef.current, {
        center: [latitude || 14.5882, longitude || 121.1278],
        zoom: 13.5,
        zoomControl: true,
        attributionControl: false
      });

      // Primary: CARTO Positron — free, no API key, CORS-friendly
      const cartoLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 20,
          minZoom: 10,
          attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>",
          crossOrigin: "anonymous"
        }
      );
      // Fallback: ESRI World Street Map
      const esriLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 20,
          minZoom: 10,
          attribution: "Tiles &copy; Esri",
          crossOrigin: "anonymous"
        }
      );
      cartoLayer.addTo(map);
      cartoLayer.on("tileerror", () => {
        if (map.hasLayer(cartoLayer)) map.removeLayer(cartoLayer);
        if (!map.hasLayer(esriLayer)) esriLayer.addTo(map);
      });
      const marker = L.marker([latitude || 14.5882, longitude || 121.1278], { draggable: true }).addTo(map);
      marker.bindTooltip("Drag me or click map to pick coordinates!", { permanent: true, direction: "top" });

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setLatitude(Number(pos.lat.toFixed(6)));
        setLongitude(Number(pos.lng.toFixed(6)));
      });

      map.on("click", (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        setLatitude(Number(e.latlng.lat.toFixed(6)));
        setLongitude(Number(e.latlng.lng.toFixed(6)));
      });

      pickMapRef.current = map;
      pickMarkerRef.current = marker;

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    } catch (err) {
      console.error("Map creation error:", err);
    }

    return () => {
      if (pickMapRef.current) {
        pickMapRef.current.remove();
        pickMapRef.current = null;
        pickMarkerRef.current = null;
      }
    };
  }, [primarySection, studiosSubTab, activeTab]);

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (editingCategoryId) {
      onUpdateCategory(editingCategoryId, newCatName.trim(), newCatDescription.trim());
    } else {
      onAddCategory(newCatName.trim(), newCatDescription.trim());
    }
    setNewCatName("");
    setNewCatDescription("");
    setEditingCategoryId(null);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategoryId(category.id);
    setNewCatName(category.name || "");
    setNewCatDescription(category.description || "");
  };

  const handleCMSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
    setCmsSuccess(false);

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroTitle,
          heroSubtitle,
          heroBackground,
          aboutTitle,
          aboutDescription
        })
      });
      const data = await res.json();
      if (data.success) {
        setCmsSuccess(true);
        setTimeout(() => setCmsSuccess(false), 4000);
        onRefresh();
      } else {
        alert("CMS update error: " + data.message);
      }
    } catch {
      alert("Failed to communicate with CMS api.");
    } finally {
      setSavingCms(false);
    }
  };

  const parseApiResponse = async (response: Response) => {
    const text = await response.text();
    if (!text) return { success: response.ok, message: response.statusText || "No response body." };
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Server returned an unexpected response. (${response.status})`);
    }
  };

  const handleHeroBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("The image must be 8 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setUploadingHeroBackground(true);
      try {
        const res = await fetch("/api/media", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
          },
          body: JSON.stringify({
            entityType: "cms",
            entityId: "heroBackground",
            purpose: "HERO_BACKGROUND",
            fileData: reader.result,
            originalName: file.name
          })
        });
        const data = await parseApiResponse(res);
        if (!res.ok || !data.success) {
          throw new Error(data.message || "The image upload failed.");
        }
        setHeroBackground(data.url);
      } catch (err: any) {
        alert(err?.message || "The image upload failed.");
      } finally {
        setUploadingHeroBackground(false);
      }
    };
    reader.onerror = () => alert("The image could not be read from your device.");
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "permit" | "validId" | "other") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "permit") {
        setBusinessPermit(reader.result as string);
      } else if (type === "validId") {
        setValidId(reader.result as string);
      } else {
        setOtherDocs(reader.result as string);
      }
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

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserCreateLoading(true);
    setUserCreateMsg(null);
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          fullName: newUserFullName,
          contactNumber: newUserContact,
          address: newUserAddress,
          role: newRole,
          studioId: newUserStudioId || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setUserCreateMsg({ text: data.message || "User account created successfully!", type: "success" });
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserFullName("");
        setNewUserContact("");
        setNewUserAddress("");
        onRefresh();
      } else {
        setUserCreateMsg({ text: data.message || "Failed to create user account.", type: "error" });
      }
    } catch {
      setUserCreateMsg({ text: "Failed to connect to backend server.", type: "error" });
    } finally {
      setUserCreateLoading(false);
    }
  };

  const handleUserStatusChange = async (userId: string, status: "approved" | "rejected" | "suspended") => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken || ""}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) onRefresh();
      else alert(data.message || "Failed to update user status.");
    } catch {
      alert("Failed to connect to the server.");
    }
  };

  const handleDeleteUserAccount = (user: any) => {
    if (!user || user.role === "SUPER_ADMIN") return;
    onDeleteUser?.(user.id);
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardLoading(true);
    setOnboardError("");
    setOnboardSuccess(false);

    if (selectedCategories.length === 0) {
      setOnboardError("Please select at least one photography special category.");
      setOnboardLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/register-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ownerEmail,
          password: ownerPassword,
          fullName: ownerName,
          contactNumber: ownerContact,
          userAddress: ownerAddress,
          studioName,
          description: studioDescription,
          categories: selectedCategories,
          startingPrice: Number(startingPrice),
          businessHours,
          address: studioAddress,
          location: studioLocation,
          latitude,
          longitude,
          businessPermit,
          validId,
          otherDocs
        })
      });
      const data = await res.json();
      if (data.success) {
        setOnboardSuccess(true);
        setOwnerName("");
        setOwnerEmail("");
        setOwnerPassword("");
        setOwnerContact("");
        setOwnerAddress("");
        setStudioName("");
        setStudioDescription("");
        setStudioAddress("");
        setSelectedCategories([]);
        setBusinessPermit("");
        setValidId("");
        setOtherDocs("");
        onRefresh();
      } else {
        setOnboardError(data.message || "Onboarding failed.");
      }
    } catch {
      setOnboardError("Failed to register studio. Connectivity issue.");
    } finally {
      setOnboardLoading(false);
    }
  };

  return (
    <div className="admin-portal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e5e1da] pb-6">
        <div>
          <span className="admin-eyebrow text-[10px] uppercase tracking-wider text-yellow-600 font-extrabold flex items-center gap-1.5">
            <span className="admin-status-dot" /> Platform operations
          </span>
          <h2 className="font-display text-3xl font-extrabold text-[#2c2a29] leading-tight mt-2">
            Admin control center
          </h2>
          <p className="admin-header-copy text-xs text-[#7c756d] mt-2">Keep the Cainta studio network healthy, verified, and ready for bookings.</p>
        </div>
        <div className="admin-header-actions flex items-center gap-3">
          <span className="admin-live-state inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All systems live</span>
          <button type="button" onClick={onRefresh} className="px-4 py-2 bg-[#2c2a29] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm">
            <RefreshCw size={14} /> Refresh data
          </button>
        </div>
      </div>

      <main className="min-w-0 space-y-8">
        {/* 2. OVERVIEW STATS GRID */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-xs">
            <span className="text-[9px] uppercase tracking-wider text-[#7c756d] font-bold">Pending Registrations</span>
            <h4 className="dashboard-stat-value text-2xl font-bold text-[#2c2a29] mt-1">{pendingStudios.length} business</h4>
          </div>
          <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-xs">
            <span className="text-[9px] uppercase tracking-wider text-[#7c756d] font-bold">Verified Studios</span>
            <h4 className="dashboard-stat-value text-2xl font-bold text-[#2c2a29] mt-1">{approvedStudios.length} listed</h4>
          </div>
          <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-xs">
            <span className="text-[9px] uppercase tracking-wider text-[#7c756d] font-bold">System Bookings</span>
            <h4 className="dashboard-stat-value text-2xl font-bold text-[#2c2a29] mt-1">{bookings.length} reservations</h4>
          </div>
          <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-xs">
            <span className="text-[9px] uppercase tracking-wider text-[#7c756d] font-bold">Total Platform Users</span>
            <h4 className="dashboard-stat-value text-2xl font-bold text-[#2c2a29] mt-1">{users.length} profiles</h4>
          </div>
          <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-xs">
            <span className="text-[9px] uppercase tracking-wider text-[#7c756d] font-bold">Verified Payments</span>
            <h4 className="dashboard-stat-value text-2xl font-bold text-emerald-700 mt-1">₱{(
              payments.filter(payment => payment.paymentStatus === "Paid" && payment.paymentType !== "PrintOrder")
                .reduce((sum, payment) => sum + Number(payment.amount || 0), 0) +
              printOrders.filter(order => order.paymentStatus === "Paid")
                .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
            ).toLocaleString("en-PH", { maximumFractionDigits: 2 })}</h4>
          </div>
        </div>

        {/* 3. WORKSPACE SECTION WORKFLOWS */}

        {/* ─── SECTION 1: STUDIOS & APPROVALS ─── */}
        {(primarySection === "studios") && (
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e1da] pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2">
                    <ShieldCheck size={12} /> Studios & Partner Network
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-[#2c2a29]">Studios & Approvals</h3>
                  <p className="text-xs text-[#7c756d] mt-1">Review pending studio registration applications, onboard verified partners directly, and browse the approved studio directory.</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {pendingStudios.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full">
                      <ShieldAlert size={12} /> {pendingStudios.length} pending
                    </span>
                  )}
                </div>
              </div>

              {/* Sub-Tab Navigation */}
              <div className="flex flex-wrap gap-2 pt-1 border-b border-[#e5e1da] pb-4">
                {[
                  { id: "pending" as AdminStudiosSubTab, label: "Pending Approvals", icon: ShieldAlert, badge: pendingStudios.length > 0 ? pendingStudios.length : null },
                  { id: "onboard" as AdminStudiosSubTab, label: "Onboard Studio", icon: Plus },
                  { id: "approved" as AdminStudiosSubTab, label: "Verified Studios", icon: ShieldCheck, badge: approvedStudios.length > 0 ? approvedStudios.length : null },
                ].map((subTab) => {
                  const Icon = subTab.icon;
                  const isSelected = studiosSubTab === subTab.id;
                  return (
                    <button
                      key={subTab.id}
                      type="button"
                      onClick={() => { setStudiosSubTab(subTab.id); onActiveTabChange(subTab.id); }}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#2c2a29] text-white shadow-md shadow-black/10 scale-[1.02]"
                          : "bg-[#faf9f6] text-[#7c756d] hover:bg-gray-100 hover:text-[#2c2a29] border border-[#e5e1da]"
                      }`}
                    >
                      <Icon size={14} className={isSelected ? "text-yellow-400" : "text-[#7c756d]"} />
                      <span>{subTab.label}</span>
                      {subTab.badge !== null && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isSelected ? "bg-yellow-400 text-black" : "bg-[#2c2a29] text-white"
                        }`}>
                          {subTab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── SUB-TAB: PENDING APPROVALS ── */}
              {studiosSubTab === "pending" && (
                <div className="space-y-4">
                  {pendingStudios.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#7c756d] flex flex-col items-center gap-3">
                      <ShieldCheck className="text-emerald-500" size={48} />
                      <span className="font-bold text-sm text-[#2c2a29]">No pending studio applications!</span>
                      <p className="text-[11px] max-w-sm text-gray-500">All registered photography studios have been processed and approved.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {pendingStudios.map((st) => (
                        <div key={st.id} className="p-5 border border-amber-200 rounded-2xl bg-amber-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">Pending Review</span>
                              <h4 className="font-display font-bold text-base text-[#2c2a29]">{st.name}</h4>
                            </div>
                            <p className="text-xs text-gray-600">Owner: <strong className="text-gray-800">{st.ownerName || st.contactInfo || "—"}</strong> · Email: <strong className="text-gray-800">{st.email}</strong></p>
                            <p className="text-xs text-gray-500">Location: {st.location || st.address}</p>
                            
                            {/* Compliance Docs */}
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              {st.businessPermit && (
                                <button
                                  type="button"
                                  onClick={() => openProtectedDocument(st.businessPermit, `${st.name} - Business Permit`)}
                                  className="text-[10px] font-bold px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-900 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                                >
                                  <FileText size={11} /> Business Permit
                                </button>
                              )}
                              {st.validId && (
                                <button
                                  type="button"
                                  onClick={() => openProtectedDocument(st.validId, `${st.name} - Valid ID`)}
                                  className="text-[10px] font-bold px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-900 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                                >
                                  <FileText size={11} /> Owner Valid ID
                                </button>
                              )}
                              {st.otherDocs && (
                                <button
                                  type="button"
                                  onClick={() => openProtectedDocument(st.otherDocs, `${st.name} - Supporting Documents`)}
                                  className="text-[10px] font-bold px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-900 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                                >
                                  <FileText size={11} /> Other Documents
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => onApproveStudio(st.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Check size={14} /> Approve Studio
                            </button>
                            <button
                              type="button"
                              onClick={() => onRejectStudio(st.id)}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── SUB-TAB: ONBOARD STUDIO ── */}
              {studiosSubTab === "onboard" && (
                <div className="space-y-4">
                  <div className="bg-[#faf9f6] rounded-2xl border border-[#e5e1da] p-5 space-y-5">
                    <div className="space-y-1">
                      <h4 className="font-display text-lg font-bold text-[#2c2a29]">Exclusively Onboard Verified Photography Studio & Owner Account</h4>
                      <p className="text-xs text-[#7c756d]">As super-administrator, directly create verified studio profiles, lock coordinates via the GIS map interface, and store compliance documents.</p>
                    </div>

                    {onboardSuccess && (
                      <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 font-semibold text-xs flex items-center gap-2.5">
                        <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold">Studio Owner Registered & Listed Successfully!</p>
                          <p className="text-[11px] text-green-700 font-medium">The account is active. The studio is instantly published and approved in the centralized database, ready to receive bookings and upload portfolios.</p>
                        </div>
                      </div>
                    )}

                    {onboardError && (
                      <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 font-bold text-xs flex items-center gap-2">
                        <ShieldAlert size={18} />
                        <span>{onboardError}</span>
                      </div>
                    )}

                    <form onSubmit={handleOnboardSubmit} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Owner Credentials & Studio Basics */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-display font-extrabold text-sm text-[#2c2a29] uppercase tracking-wider mb-3.5 pb-1 border-b border-gray-100">
                              1. Owner Personal & Login Credentials
                            </h4>
                            <div className="space-y-3 text-xs">
                              <div>
                                <label className="block font-bold text-gray-700 mb-1">Owner's Full Name</label>
                                <input
                                  type="text"
                                  required
                                  value={ownerName}
                                  onChange={e => setOwnerName(e.target.value)}
                                  placeholder="e.g. Stephen Reyes"
                                  className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block font-bold text-gray-700 mb-1">Owner Login Email</label>
                                  <input
                                    type="email"
                                    required
                                    value={ownerEmail}
                                    onChange={e => setOwnerEmail(e.target.value)}
                                    placeholder="stephen@studio.com"
                                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-gray-700 mb-1">Secure Password</label>
                                  <input
                                    type="password"
                                    required
                                    value={ownerPassword}
                                    onChange={e => setOwnerPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block font-bold text-gray-700 mb-1">Owner Contact Number</label>
                                  <input
                                    type="text"
                                    required
                                    value={ownerContact}
                                    onChange={e => setOwnerContact(e.target.value)}
                                    placeholder="0917-000-0000"
                                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-gray-700 mb-1">Personal Home Address</label>
                                  <input
                                    type="text"
                                    required
                                    value={ownerAddress}
                                    onChange={e => setOwnerAddress(e.target.value)}
                                    placeholder="Cainta, Rizal"
                                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-display font-extrabold text-sm text-[#2c2a29] uppercase tracking-wider mb-3.5 pb-1 border-b border-gray-100">
                              2. Photography Studio Commercial Profile
                            </h4>
                            <div className="space-y-3 text-xs">
                              <div>
                                <label className="block font-bold text-gray-700 mb-1">Studio Business Name</label>
                                <input
                                  type="text"
                                  required
                                  value={studioName}
                                  onChange={e => setStudioName(e.target.value)}
                                  placeholder="e.g. Luminary Vision Studio"
                                  className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-gray-700 mb-1">Studio Bio / Description</label>
                                <textarea
                                  rows={2}
                                  required
                                  value={studioDescription}
                                  onChange={e => setStudioDescription(e.target.value)}
                                  placeholder="High-end editorial, wedding, and graduation creative space in Cainta..."
                                  className="w-full bg-white border border-[#e5e1da] rounded-xl p-3 focus:outline-none focus:border-[#2c2a29] leading-relaxed"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block font-bold text-gray-700 mb-1">Studio Physical Address</label>
                                  <input
                                    type="text"
                                    required
                                    value={studioAddress}
                                    onChange={e => setStudioAddress(e.target.value)}
                                    placeholder="Unit 3B, Ortigas Ave Extension"
                                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-gray-700 mb-1">Area / Landmark</label>
                                  <select
                                    value={studioLocation}
                                    onChange={e => setStudioLocation(e.target.value)}
                                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                                  >
                                    <option value="Ortigas Ave Ext (Valley Golf)">Ortigas Ave Ext (Valley Golf)</option>
                                    <option value="Felix Ave (Rublou Marketplace)">Felix Ave (Rublou Marketplace)</option>
                                    <option value="Imelda Ave / Bypass Junction">Imelda Ave / Bypass Junction</option>
                                    <option value="Town Center (San Roque)">Town Center (San Roque)</option>
                                    <option value="Vista Verde Village">Vista Verde Village</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block font-bold text-gray-700 mb-1">Starting Price (PHP)</label>
                                  <input
                                    type="number"
                                    required
                                    value={startingPrice}
                                    onChange={e => setStartingPrice(e.target.value)}
                                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29] font-bold text-green-700"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-gray-700 mb-1">Business Hours</label>
                                  <input
                                    type="text"
                                    required
                                    value={businessHours}
                                    onChange={e => setBusinessHours(e.target.value)}
                                    placeholder="09:00 AM - 06:00 PM"
                                    className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block font-bold text-gray-700 mb-1.5">Acquisition Specializations (Choose 1 or more)</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {categories.map((cat) => {
                                    const checked = selectedCategories.includes(cat.name);
                                    return (
                                      <button
                                        type="button"
                                        key={cat.id}
                                        onClick={() => handleToggleCategory(cat.name)}
                                        className={`p-2 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                                          checked 
                                            ? "bg-[#2c2a29] text-white border-[#2c2a29]" 
                                            : "bg-white text-gray-600 border-[#e5e1da] hover:border-[#7c756d]"
                                        }`}
                                      >
                                        <span>{cat.name}</span>
                                        {checked && <CheckCircle size={12} className="text-yellow-400" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: GIS Location Marker & Compliance Docs */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-display font-extrabold text-sm text-[#2c2a29] uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                              <MapPin size={16} className="text-red-500" /> 3. GIS Coordinates Locator via Interactive Map
                            </h4>
                            <p className="text-[10px] text-[#7c756d] mb-3">Click on the map or drag the golden marker to align GPS coordinates for local search indexing.</p>
                            
                            <div className="relative border border-[#e5e1da] rounded-2xl overflow-hidden bg-gray-50">
                              <div ref={pickMapContainerRef} style={{ height: "290px" }} className="w-full z-0" />
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                              <div>
                                <label className="block font-bold text-gray-500 mb-0.5">Latitude (GPS N)</label>
                                <input
                                  type="number"
                                  step="any"
                                  required
                                  value={latitude}
                                  onChange={e => setLatitude(Number(e.target.value))}
                                  className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#2c2a29] font-mono text-[11px]"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-gray-500 mb-0.5">Longitude (GPS E)</label>
                                <input
                                  type="number"
                                  step="any"
                                  required
                                  value={longitude}
                                  onChange={e => setLongitude(Number(e.target.value))}
                                  className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#2c2a29] font-mono text-[11px]"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-display font-extrabold text-sm text-[#2c2a29] uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                              <FileUp size={16} className="text-yellow-600" /> 4. Compliance Documents & Verification
                            </h4>
                            
                            <div className="grid gap-3 text-xs">
                              <div className="p-3 bg-white border border-[#e5e1da] rounded-xl flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-gray-800">DTI / Mayor's Business Permit</p>
                                  <p className="text-[10px] text-gray-500">Government compliance certificate or Mayor's clearance</p>
                                </div>
                                <label className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold rounded-lg cursor-pointer text-xs flex items-center gap-1">
                                  <Upload size={12} /> {businessPermit ? "Change" : "Upload"}
                                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileChange(e, "permit")} className="hidden" />
                                </label>
                              </div>
                              {businessPermit && (
                                <div className="bg-green-50 p-2 rounded-xl border border-green-200 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-green-800 flex items-center gap-1">
                                    <FileCheck size={12} /> Business Permit Attached!
                                  </span>
                                  <button type="button" onClick={() => setBusinessPermit("")} className="text-red-500 hover:underline text-[9px] font-bold">Remove</button>
                                </div>
                              )}

                              <div className="p-3 bg-white border border-[#e5e1da] rounded-xl flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-gray-800">Owner Valid Government ID</p>
                                  <p className="text-[10px] text-gray-500">Passport, Driver's License, or UMID</p>
                                </div>
                                <label className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold rounded-lg cursor-pointer text-xs flex items-center gap-1">
                                  <Upload size={12} /> {validId ? "Change" : "Upload"}
                                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileChange(e, "validId")} className="hidden" />
                                </label>
                              </div>
                              {validId && (
                                <div className="bg-green-50 p-2 rounded-xl border border-green-200 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-green-800 flex items-center gap-1">
                                    <FileCheck size={12} /> Valid ID Attached!
                                  </span>
                                  <button type="button" onClick={() => setValidId("")} className="text-red-500 hover:underline text-[9px] font-bold">Remove</button>
                                </div>
                              )}

                              <div className="p-3 bg-white border border-[#e5e1da] rounded-xl flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-gray-800">Additional Studio Documents</p>
                                  <p className="text-[10px] text-gray-500">Lease agreement, BIR 2303, or studio photos</p>
                                </div>
                                <label className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold rounded-lg cursor-pointer text-xs flex items-center gap-1">
                                  <Upload size={12} /> {otherDocs ? "Change" : "Upload"}
                                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileChange(e, "other")} className="hidden" />
                                </label>
                              </div>
                              {otherDocs && (
                                <div className="bg-green-50 p-2 rounded-xl border border-green-200 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-green-800 flex items-center gap-1">
                                    <FileCheck size={12} /> Docs Attached!
                                  </span>
                                  <button type="button" onClick={() => setOtherDocs("")} className="text-red-500 hover:underline text-[9px] font-bold">Remove</button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-4">
                            <button
                              type="submit"
                              disabled={onboardLoading}
                              className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles size={16} />
                              {onboardLoading ? "Registering & Instantly Approving..." : "Complete verified onboarding & instant approval"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ── SUB-TAB: VERIFIED STUDIOS ── */}
              {studiosSubTab === "approved" && (
                <div className="space-y-4">
                  {approvedStudios.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#7c756d] flex flex-col items-center gap-3">
                      <ShieldCheck className="text-gray-300" size={44} />
                      <span className="font-bold">No verified studios yet. Approve pending applications first.</span>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {approvedStudios.map((st) => (
                        <div key={st.id} className="p-4 border border-[#e5e1da] rounded-2xl bg-[#faf9f6] space-y-2">
                          <div className="flex items-center gap-3">
                            {st.logo ? (
                              <img src={st.logo} alt={st.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-[#2c2a29] flex items-center justify-center text-white font-bold text-sm">
                                {st.name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-sm text-[#2c2a29]">{st.name}</p>
                              <p className="text-[10px] text-[#7c756d]">{st.location || st.address}</p>
                            </div>
                          </div>
                          <div className="text-[11px] text-gray-600 space-y-0.5">
                            <p>✉️ {st.email}</p>
                            <p>📞 {st.contactInfo || "—"}</p>
                          </div>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold border border-green-200">
                            ✓ Verified & Listed
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── SECTION 2: PAYMENTS & REVIEWS ─── */}
        {(primarySection === "finance") && (
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e1da] pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2">
                    <DollarSign size={12} /> Finance & Quality Control
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-[#2c2a29]">Payments & Reviews</h3>
                  <p className="text-xs text-[#7c756d] mt-1">Monitor GCash payment transactions across all studios, and moderate customer reviews to ensure quality standards.</p>
                </div>
              </div>

              {/* Sub-Tab Navigation */}
              <div className="flex flex-wrap gap-2 pt-1 border-b border-[#e5e1da] pb-4">
                {[
                  { id: "payments" as AdminFinanceSubTab, label: "Payment Ledger", icon: DollarSign },
                  { id: "reviews" as AdminFinanceSubTab, label: "Review Moderation", icon: Star },
                ].map((subTab) => {
                  const Icon = subTab.icon;
                  const isSelected = financeSubTab === subTab.id;
                  return (
                    <button
                      key={subTab.id}
                      type="button"
                      onClick={() => { setFinanceSubTab(subTab.id); onActiveTabChange(subTab.id); }}
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

              {/* PAYMENTS SUB-TAB */}
              {financeSubTab === "payments" && (
                <div className="space-y-6">
                  <div className="bg-[#faf9f6] rounded-2xl border border-[#e5e1da] p-4">
                    <h4 className="font-display text-base font-bold text-[#2c2a29]">Platform Payment Ledger</h4>
                    <p className="text-xs text-[#7c756d] mt-1">All transactions are grouped by studio. Studio owners can only access their own studio records.</p>
                  </div>
                  {studios.map(studio => {
                    const studioPayments = payments.filter(payment => payment.studioId === studio.id);
                    const totalPaid = studioPayments.filter(payment => payment.paymentStatus === "Paid" && payment.paymentType !== "PrintOrder").reduce((sum, payment) => sum + Number(payment.amount || 0), 0) +
                      printOrders.filter(order => order.studioId === studio.id && order.paymentStatus === "Paid").reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
                    return (
                      <div key={studio.id} className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div><h4 className="font-display font-bold text-[#2c2a29]">{studio.name}</h4><p className="text-[11px] text-[#7c756d]">{studioPayments.length} transaction(s)</p></div>
                          <div className="text-right"><span className="text-[10px] uppercase font-bold text-[#7c756d]">Recorded income</span><p className="text-xl font-black text-emerald-700">₱{totalPaid.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p></div>
                        </div>
                        {studioPayments.length > 0 ? (
                          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-[#e5e1da] text-[10px] uppercase text-[#7c756d]"><th className="py-2 pr-3">Payment</th><th className="py-2 pr-3">Customer</th><th className="py-2 pr-3">Amount</th><th className="py-2 pr-3">Status</th><th className="py-2">Proof</th></tr></thead><tbody>{studioPayments.map(payment => <tr key={payment.id} className="border-b border-[#f0ede8]"><td className="py-3 pr-3"><span className="font-bold">{payment.id}</span><span className="block text-[10px] text-[#7c756d]">{payment.paymentType} · {payment.paymentMethod}</span></td><td className="py-3 pr-3">{payment.customerId}</td><td className="py-3 pr-3 font-bold">₱{Number(payment.amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td><td className="py-3 pr-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${payment.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800" : payment.paymentStatus === "Failed" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{payment.paymentStatus}</span></td><td className="py-3">{payment.proofOfPayment ? <button type="button" onClick={() => openPaymentProof(payment)} className="text-blue-700 hover:underline cursor-pointer">View proof</button> : <span className="text-[#7c756d]">No screenshot</span>}<span className="block text-[10px] text-[#7c756d]">Ref: {payment.referenceNumber || "—"}</span></td></tr>)}</tbody></table></div>
                        ) : <p className="text-xs text-[#7c756d] py-4">No payment transactions recorded for this studio.</p>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* REVIEWS SUB-TAB */}
              {financeSubTab === "reviews" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-base font-bold text-[#2c2a29]">Customer Reviews Moderation</h4>
                      <p className="text-xs text-[#7c756d] mt-0.5">Review and moderate customer-submitted ratings for all studios.</p>
                    </div>
                    <button type="button" onClick={loadAdminReviews} className="flex items-center gap-1.5 text-[10px] font-bold text-[#7c756d] hover:text-[#2c2a29] cursor-pointer">
                      <RefreshCw size={12} /> Refresh
                    </button>
                  </div>
                  {reviewsLoading && <div className="text-xs text-center py-8 text-[#7c756d]">Loading reviews...</div>}
                  {adminReviews.length === 0 && !reviewsLoading && (
                    <div className="py-12 text-center text-xs text-[#7c756d] flex flex-col items-center gap-3">
                      <Star className="text-gray-300" size={44} />
                      <span className="font-bold">No reviews to moderate yet.</span>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    {adminReviews.map((rev) => {
                      const studio = studios.find(s => s.id === rev.studioId);
                      return (
                        <div key={rev.id} className="bg-white rounded-2xl border border-[#e5e1da] p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  rev.status === "approved" ? "bg-green-100 text-green-800 border-green-200" :
                                  rev.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" :
                                  "bg-amber-100 text-amber-800 border-amber-200"
                                }`}>{rev.status}</span>
                                <span className="text-[10px] text-[#7c756d] font-bold">{studio?.name || "Unknown Studio"}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {[1,2,3,4,5].map(star => <Star key={star} size={11} className={star <= rev.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"} />)}
                                <span className="text-[11px] font-bold text-[#2c2a29] ml-1">{rev.rating}/5</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{rev.comment}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{rev.customerName || "Anonymous"} · {new Date(rev.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-[#f0ede8]">
                            {rev.status !== "approved" && (
                              <button type="button" onClick={async () => {
                                const res = await fetch(`/api/admin/reviews/${rev.id}/approve`, { method: "POST", headers: { Authorization: `Bearer ${authToken}` } });
                                const d = await res.json();
                                if (d.success) setAdminReviews(prev => prev.map(r => r.id === rev.id ? d.review : r));
                              }} className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors flex items-center justify-center gap-1">
                                <Check size={11} /> Approve
                              </button>
                            )}
                            {rev.status !== "rejected" && (
                              <button type="button" onClick={async () => {
                                const res = await fetch(`/api/admin/reviews/${rev.id}/reject`, { method: "POST", headers: { Authorization: `Bearer ${authToken}` } });
                                const d = await res.json();
                                if (d.success) setAdminReviews(prev => prev.map(r => r.id === rev.id ? d.review : r));
                              }} className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors flex items-center justify-center gap-1">
                                <X size={11} /> Reject
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {adminReviews.length > 0 && (
                    <p className="text-[10px] text-[#7c756d] text-center border-t border-[#e5e1da] pt-4">
                      Total: {adminReviews.length} reviews · Pending: {adminReviews.filter(r => r.status === "pending").length} · Approved: {adminReviews.filter(r => r.status === "approved").length} · Rejected: {adminReviews.filter(r => r.status === "rejected").length}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── SECTION 3: SYSTEM MANAGEMENT & SETTINGS ─── */}
        {(primarySection === "management") && (
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-sm p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e1da] pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-[#fff1bd] text-[#8a5a00] border border-[#efd37a] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2">
                    <Settings size={12} /> Platform Configuration Center
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-[#2c2a29]">System Management & Settings</h3>
                  <p className="text-xs text-[#7c756d] mt-1">Configure platform users, categories, content, theme, features, audio, security logs, and admin account in one unified hub.</p>
                </div>
              </div>

              {/* Sub-Tab Navigation */}
              <div className="flex flex-wrap gap-2 pt-1 border-b border-[#e5e1da] pb-4">
                {[
                  { id: "users" as AdminManagementSubTab, label: "Users", icon: Users },
                  { id: "categories" as AdminManagementSubTab, label: "Categories", icon: Briefcase },
                  { id: "cms" as AdminManagementSubTab, label: "Content & FAQs", icon: FileText },
                  { id: "pages" as AdminManagementSubTab, label: "Page Builder", icon: Globe },
                  { id: "theme" as AdminManagementSubTab, label: "Theme & UI", icon: Sparkles },
                  { id: "modules" as AdminManagementSubTab, label: "Modules", icon: Settings },
                  { id: "audio" as AdminManagementSubTab, label: "Audio", icon: Volume2 },
                  { id: "audit" as AdminManagementSubTab, label: "Audit Log", icon: FileCheck },
                  { id: "account" as AdminManagementSubTab, label: "Admin Account", icon: ShieldCheck },
                ].map((subTab) => {
                  const Icon = subTab.icon;
                  const isSelected = managementSubTab === subTab.id;
                  return (
                    <button
                      key={subTab.id}
                      type="button"
                      onClick={() => { setManagementSubTab(subTab.id); onActiveTabChange(subTab.id); }}
                      className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#2c2a29] text-white shadow-md shadow-black/10 scale-[1.02]"
                          : "bg-[#faf9f6] text-[#7c756d] hover:bg-gray-100 hover:text-[#2c2a29] border border-[#e5e1da]"
                      }`}
                    >
                      <Icon size={13} className={isSelected ? "text-yellow-400" : "text-[#7c756d]"} />
                      <span>{subTab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 1. USERS SUB-TAB */}
              {managementSubTab === "users" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-display text-base font-bold text-[#2c2a29]">Centralized User Account Management</h4>
                      <p className="text-xs text-[#7c756d]">Manage all system users, inspect roles, and create new accounts.</p>
                    </div>
                    <button onClick={() => setShowAddUserModal(true)} className="py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                      <Plus size={16} /> Add New User
                    </button>
                  </div>
                  <div className="flex items-center gap-2 border-b border-[#e5e1da] pb-3 text-xs overflow-x-auto">
                    <span className="font-bold text-gray-500 mr-2">Filter Role:</span>
                    {["ALL", "CUSTOMER", "STUDIO_ADMIN", "STUDIO_STAFF", "SUPER_ADMIN"].map((r) => (
                      <button key={r} onClick={() => setUserRoleFilter(r)} className={`py-1 px-3 rounded-lg font-bold transition-all cursor-pointer ${userRoleFilter === r ? "bg-[#2c2a29] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {r === "ALL" ? "All Accounts" : r.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                  <div className="bg-[#faf9f6] border border-[#e5e1da] rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#2c2a29] text-white uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3">User ID</th><th className="p-3">Full Name</th><th className="p-3">Email Address</th><th className="p-3">Account Role</th><th className="p-3">Status</th><th className="p-3">Contact</th><th className="p-3">Documents</th><th className="p-3">Created</th><th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e1da]">
                          {users.filter(u => userRoleFilter === "ALL" || u.role === userRoleFilter).map((u) => (
                            <tr key={u.id} className="hover:bg-white transition-colors">
                              <td className="p-3 font-mono font-bold text-gray-600">{u.id}</td>
                              <td className="p-3 font-extrabold text-[#2c2a29]">{u.fullName || u.name}</td>
                              <td className="p-3 font-medium text-gray-800">{u.email}</td>
                              <td className="p-3">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${u.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-800 border border-purple-200" : u.role === "STUDIO_ADMIN" ? "bg-amber-100 text-amber-900 border border-amber-200" : u.role === "STUDIO_STAFF" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-green-100 text-green-800 border border-green-200"}`}>
                                  {u.role ? u.role.replace("_", " ") : "CUSTOMER"}
                                </span>
                              </td>
                              <td className="p-3">
                                {u.role === "STUDIO_ADMIN" ? (() => {
                                  const studio = studios.find(s => s.ownerId === u.id || s.id === u.studioId);
                                  const status = studio?.status || "pending";
                                  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${status === "approved" ? "bg-green-100 text-green-800 border border-green-200" : status === "rejected" ? "bg-red-100 text-red-800 border border-red-200" : status === "suspended" ? "bg-gray-200 text-gray-800 border border-gray-300" : "bg-yellow-100 text-yellow-800 border border-yellow-200"}`}>{status.replace("_", " ")}</span>;
                                })() : <span className="text-[10px] font-bold text-green-700">ACTIVE</span>}
                              </td>
                              <td className="p-3 text-gray-600">{u.contactNumber || u.contactInfo || "—"}</td>
                              <td className="p-3">
                                {u.role === "STUDIO_ADMIN" ? (() => {
                                  const studio = studios.find(s => s.ownerId === u.id || s.id === u.studioId);
                                  const documents = [{ label: "Permit", value: studio?.businessPermit, title: "Business Permit" }, { label: "Valid ID", value: studio?.validId, title: "Owner Valid Government ID" }, { label: "Other Docs", value: studio?.otherDocs, title: "Supporting Documents" }].filter(document => document.value);
                                  return documents.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 min-w-[190px]">
                                      {documents.map(document => (
                                        <button key={document.label} type="button" onClick={() => openProtectedDocument(document.value, `${studio?.name || u.fullName} - ${document.title}`)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-amber-200 text-amber-800 text-[9px] font-extrabold hover:bg-amber-50 cursor-pointer">
                                          <Eye size={11} /> {document.label}
                                        </button>
                                      ))}
                                    </div>
                                  ) : <span className="text-[10px] text-gray-400">No documents</span>;
                                })() : <span className="text-[10px] text-gray-400">Not applicable</span>}
                              </td>
                              <td className="p-3 text-gray-500 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1.5 min-w-[180px]">
                                  {u.role === "STUDIO_ADMIN" && (() => {
                                    const studio = studios.find(s => s.ownerId === u.id || s.id === u.studioId);
                                    const status = studio?.status || "pending";
                                    return <>
                                      {status !== "approved" && <button onClick={() => handleUserStatusChange(u.id, "approved")} className="px-2 py-1 rounded-lg bg-green-600 text-white text-[9px] font-bold uppercase cursor-pointer"><Check size={11} className="inline" /> Approve</button>}
                                      {status !== "rejected" && <button onClick={() => handleUserStatusChange(u.id, "rejected")} className="px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold uppercase cursor-pointer"><X size={11} className="inline" /> Reject</button>}
                                      {status !== "suspended" && status === "approved" && <button onClick={() => handleUserStatusChange(u.id, "suspended")} className="px-2 py-1 rounded-lg bg-gray-200 text-gray-800 text-[9px] font-bold uppercase cursor-pointer"><ShieldAlert size={11} className="inline" /> Suspend</button>}
                                    </>;
                                  })()}
                                  {u.role !== "SUPER_ADMIN" && (
                                    <button type="button" onClick={() => handleDeleteUserAccount(u)} className="px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold uppercase cursor-pointer">
                                      <Trash2 size={11} className="inline" /> Delete
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CATEGORIES SUB-TAB */}
              {managementSubTab === "categories" && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h4 className="font-display text-base font-bold text-[#2c2a29]">Photography Categories & Taxonomies</h4>
                    <p className="text-xs text-[#7c756d]">Manage the photography specialties and categories available for studios to list under.</p>
                  </div>
                  <form onSubmit={handleCategorySubmit} className="flex flex-col sm:flex-row gap-3 items-end bg-[#faf9f6] border border-[#e5e1da] rounded-2xl p-4">
                    <div className="flex-1 space-y-1">
                      <label className="font-bold text-xs text-[#2c2a29]">Category Name</label>
                      <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Portrait Photography" required className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#2c2a29]" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="font-bold text-xs text-[#2c2a29]">Description (optional)</label>
                      <input value={newCatDescription} onChange={e => setNewCatDescription(e.target.value)} placeholder="Brief description" className="w-full bg-white border border-[#e5e1da] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#2c2a29]" />
                    </div>
                    <button type="submit" className="py-2.5 px-5 bg-[#2c2a29] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap">
                      {editingCategoryId ? "Save Edit" : "Add Category"}
                    </button>
                    {editingCategoryId && <button type="button" onClick={() => { setEditingCategoryId(null); setNewCatName(""); setNewCatDescription(""); }} className="py-2.5 px-4 text-xs font-bold text-gray-500 border border-gray-200 rounded-xl cursor-pointer">Cancel</button>}
                  </form>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map(cat => (
                      <div key={cat.id} className="bg-[#faf9f6] border border-[#e5e1da] rounded-2xl p-4 flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm text-[#2c2a29]">{cat.name}</p>
                          {cat.description && <p className="text-[11px] text-[#7c756d] mt-0.5">{cat.description}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => handleEditCategory(cat)} className="text-amber-600 hover:text-amber-800 p-1 cursor-pointer" title="Edit">
                            <Edit size={13} />
                          </button>
                          <button onClick={() => onDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. CONTENT & FAQS SUB-TAB */}
              {managementSubTab === "cms" && (
                <div className="space-y-6">
                  {/* FAQs Section */}
                  <div className="bg-[#faf9f6] rounded-2xl border border-[#e5e1da] p-6 space-y-6">
                    <div className="space-y-1">
                      <h4 className="font-display text-base font-bold text-[#2c2a29]">Frequently Asked Questions</h4>
                      <p className="text-xs text-[#7c756d]">Manage the real questions shown on the public landing page and chatbot knowledge base.</p>
                    </div>
                    <form onSubmit={handleFaqSubmit} className="space-y-4 rounded-2xl border border-[#e5e1da] bg-white p-4 text-xs">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-[#2c2a29] block">Question</label>
                          <input value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} placeholder="How do I book a studio slot?" className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2c2a29]" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-[#2c2a29] block">Category</label>
                          <select value={faqCategory} onChange={e => setFaqCategory(e.target.value)} className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2c2a29]">
                            <option value="General">General</option>
                            <option value="Booking">Booking</option>
                            <option value="Payments">Payments</option>
                            <option value="Policies">Policies</option>
                            <option value="Services">Services</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-[#2c2a29] block">Answer</label>
                        <textarea value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)} rows={4} placeholder="Provide the real answer clients need to see." className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2c2a29]" />
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-[#2c2a29] text-white rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer">Save FAQ</button>
                      </div>
                    </form>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase font-black tracking-wider text-amber-800">Chatbot FAQ Suggestions</p>
                            <p className="text-xs text-[#7c756d]">Repeated customer questions flagged from the chatbot answers.</p>
                          </div>
                          <span className="rounded-full bg-white border border-amber-300 px-3 py-1 text-[10px] font-black text-amber-800">{faqSuggestions.length}</span>
                        </div>
                        {faqSuggestions.length === 0 ? (
                          <div className="mt-3 rounded-xl border border-dashed border-amber-300 bg-white px-3 py-3 text-[11px] text-[#7c756d]">No repeated chatbot question patterns found yet.</div>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {faqSuggestions.map((s) => (
                              <div key={s.id} className="rounded-xl border border-amber-200 bg-white p-3 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-[#7c756d]">{s.category || "Suggested"} · {s.frequency || 1}x</p>
                                    <h4 className="font-bold text-sm text-[#2c2a29]">{s.question}</h4>
                                  </div>
                                  <button type="button" onClick={() => onApproveFaqSuggestion?.(s.id)} className="rounded-lg bg-[#2c2a29] px-3 py-2 text-[10px] font-black uppercase text-white hover:bg-amber-700 cursor-pointer">Approve</button>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">{s.answer}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {faqs.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-[#e5e1da] bg-white p-6 text-center text-xs text-[#7c756d]">No FAQs added yet. Add your first real FAQ here.</div>
                        ) : (
                          faqs.map((faq) => (
                            <div key={faq.id} className="rounded-2xl border border-[#e5e1da] bg-white p-4 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-[#7c756d]">{faq.category || "General"}</p>
                                  <h4 className="font-bold text-sm text-[#2c2a29]">{faq.question}</h4>
                                </div>
                                <button type="button" onClick={() => onDeleteFaq?.(faq.id)} className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase cursor-pointer">Delete</button>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CMS Section */}
                  <div className="bg-[#faf9f6] rounded-2xl border border-[#e5e1da] p-6 space-y-6">
                    <div className="space-y-1">
                      <h4 className="font-display text-base font-bold text-[#2c2a29]">Content Management System</h4>
                      <p className="text-xs text-[#7c756d]">Update primary marketing messages, descriptions, call-to-actions, and background assets live without re-deploying code.</p>
                    </div>
                    {cmsSuccess && (
                      <div className="bg-green-50 text-green-800 p-3 rounded-xl border border-green-200 font-bold text-xs flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span>CMS settings updated successfully! Changes are active and visible in real-time.</span>
                      </div>
                    )}
                    <form onSubmit={handleCMSSubmit} className="space-y-6 max-w-4xl text-xs">
                      <div className="space-y-4">
                        <h5 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-200">
                          1. Landing Page Hero Section Content
                        </h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block font-bold text-[#2c2a29]">Hero Primary Headline Title</label>
                            <textarea
                              rows={2}
                              required
                              value={heroTitle}
                              onChange={e => setHeroTitle(e.target.value)}
                              placeholder="e.g. Frame Your Story. <br /> Book Cainta Studios."
                              className="w-full bg-white border border-[#e5e1da] rounded-xl p-3 focus:outline-none focus:border-[#2c2a29] font-mono"
                            />
                            <p className="text-[9px] text-gray-400">Supports normal HTML tags (e.g. &lt;br /&gt;) for layout highlights.</p>
                          </div>
                          <div className="space-y-1.5">
                            <label className="block font-bold text-[#2c2a29]">Hero Subtitle / Description Paragraph</label>
                            <textarea
                              rows={3}
                              required
                              value={heroSubtitle}
                              onChange={e => setHeroSubtitle(e.target.value)}
                              placeholder="Compare live availability across Cainta, Rizal..."
                              className="w-full bg-white border border-[#e5e1da] rounded-xl p-3 focus:outline-none focus:border-[#2c2a29] leading-relaxed"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-bold text-[#2c2a29]">Hero Ambient Background Image URL</label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              required
                              value={heroBackground}
                              onChange={e => setHeroBackground(e.target.value)}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="flex-1 bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                            />
                            <label
                              htmlFor="hero-background-upload"
                              className={`px-4 bg-[#2c2a29] hover:bg-black rounded-xl text-white font-bold border border-[#2c2a29] cursor-pointer flex items-center gap-1 ${uploadingHeroBackground ? "opacity-60 pointer-events-none" : ""}`}
                              title="Upload Image from Device"
                            >
                              <Upload size={13} /> {uploadingHeroBackground ? "Uploading..." : "Upload"}
                            </label>
                            <input
                              id="hero-background-upload"
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleHeroBackgroundUpload}
                              className="hidden"
                              disabled={uploadingHeroBackground}
                            />
                            <button
                              type="button"
                              onClick={() => window.open(heroBackground, "_blank")}
                              className="px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-bold border border-gray-200 cursor-pointer flex items-center gap-1"
                            >
                              <Eye size={13} /> Preview
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h5 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-200">
                          2. Signature Retouching / About Section Content
                        </h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block font-bold text-[#2c2a29]">About Block Section Title</label>
                            <input
                              type="text"
                              required
                              value={aboutTitle}
                              onChange={e => setAboutTitle(e.target.value)}
                              placeholder="Pristine Studio Lighting & Retouching"
                              className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29] font-bold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block font-bold text-[#2c2a29]">About Block Section Description</label>
                            <textarea
                              rows={2}
                              required
                              value={aboutDescription}
                              onChange={e => setAboutDescription(e.target.value)}
                              placeholder="Experience the difference of calibrated Profoto strobes..."
                              className="w-full bg-white border border-[#e5e1da] rounded-xl p-3 focus:outline-none focus:border-[#2c2a29] leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={savingCms}
                          className="px-6 py-3 bg-[#2c2a29] hover:bg-yellow-500 hover:text-black text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all flex items-center gap-2"
                        >
                          <Sparkles size={14} />
                          {savingCms ? "Updating System CMS..." : "Apply Live CMS Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* 4. PAGE BUILDER SUB-TAB */}
              {managementSubTab === "pages" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-base font-bold text-[#2c2a29]">Custom Page Builder</h4>
                      <p className="text-xs text-[#7c756d] mt-0.5">Create dynamic landing pages like workshops, about us, or announcements.</p>
                    </div>
                    {!isEditingPage && (
                      <button
                        onClick={() => {
                          setCurrentPageForm({
                            id: "",
                            createdAt: new Date().toISOString(),
                            title: "",
                            slug: "",
                            isPublished: true,
                            showInNavbar: true,
                            blocks: []
                          });
                          setIsEditingPage(true);
                        }}
                        className="py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus size={16} /> Create Page
                      </button>
                    )}
                  </div>

                  {isEditingPage ? (
                    <div className="bg-[#faf9f6] p-6 rounded-3xl border border-[#e5e1da] space-y-6 text-left">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                        <h5 className="font-display font-bold text-base text-[#2c2a29]">
                          {currentPageForm.id ? "Edit Custom Page" : "Create New Custom Page"}
                        </h5>
                        <button
                          onClick={() => setIsEditingPage(false)}
                          className="text-gray-400 hover:text-black font-bold text-xs cursor-pointer"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      <form onSubmit={handleSavePageForm} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="block font-bold text-[#2c2a29]">Page Title</label>
                            <input
                              type="text"
                              required
                              value={currentPageForm.title}
                              onChange={e => setCurrentPageForm({ ...currentPageForm, title: e.target.value, slug: currentPageForm.id ? currentPageForm.slug : e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                              placeholder="e.g. Photography Masterclass & Workshop"
                              className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#2c2a29]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block font-bold text-[#2c2a29]">URL Slug</label>
                            <input
                              type="text"
                              required
                              value={currentPageForm.slug}
                              onChange={e => setCurrentPageForm({ ...currentPageForm, slug: e.target.value })}
                              placeholder="photography-masterclass"
                              className="w-full bg-white border border-[#e5e1da] rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:border-[#2c2a29]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs font-bold text-[#2c2a29]">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentPageForm.isPublished}
                              onChange={e => setCurrentPageForm({ ...currentPageForm, isPublished: e.target.checked })}
                              className="rounded text-[#2c2a29] focus:ring-0 w-4 h-4"
                            />
                            Publish Page (Visible to Public)
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentPageForm.showInNavbar}
                              onChange={e => setCurrentPageForm({ ...currentPageForm, showInNavbar: e.target.checked })}
                              className="rounded text-[#2c2a29] focus:ring-0 w-4 h-4"
                            />
                            Show in Navbar / Menu
                          </label>
                        </div>

                        {/* Page Blocks Manager */}
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <h5 className="font-display font-bold text-sm text-[#2c2a29]">Page Design Blocks</h5>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setIsPreviewingPage(!isPreviewingPage)}
                                className={`px-3 py-1.5 border border-[#e5e1da] rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-2xs ${isPreviewingPage ? 'bg-yellow-500 text-black border-yellow-600' : 'bg-white text-[#2c2a29] hover:bg-gray-50'}`}
                              >
                                <Eye size={12} className="inline mr-1" />
                                {isPreviewingPage ? "Edit Blocks" : "Preview Page"}
                              </button>
                              {!isPreviewingPage && ["hero", "text", "gallery", "faq", "pricing", "cta"].map(type => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => handleAddBlockToPage(type)}
                                  className="px-3 py-1.5 bg-white hover:bg-gray-100 text-[#2c2a29] border border-[#e5e1da] rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-2xs"
                                >
                                  + Add {type}
                                </button>
                              ))}
                            </div>
                          </div>

                          {isPreviewingPage ? (
                            <div className="border-4 border-dashed border-gray-200 rounded-3xl overflow-hidden bg-white mt-4 relative">
                              <div className="absolute top-0 w-full bg-gray-100 text-center text-[10px] font-bold text-gray-500 py-1 uppercase tracking-widest z-10 border-b border-gray-200">Live Preview Mode</div>
                              <div className="pointer-events-none mt-6">
                                <CustomPageView page={{ ...currentPageForm, createdAt: currentPageForm.createdAt || new Date().toISOString() }} onNavigate={() => {}} />
                              </div>
                            </div>
                          ) : (
                            <DragDropContext onDragEnd={handleDragEnd}>
                              <Droppable droppableId="blocks-list">
                                {(provided) => (
                                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                    {currentPageForm.blocks.map((block: any, idx: number) => {
                                      const DraggableComp = Draggable as any;
                                      return (
                                        <DraggableComp key={block.id} draggableId={block.id} index={idx}>
                                          {(provided: any, snapshot: any) => (
                                            <div 
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`bg-white p-5 rounded-2xl border border-[#e5e1da] space-y-3 relative shadow-2xs transition-shadow ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-yellow-500 z-50' : ''}`}
                                            >
                                              <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                  <div 
                                                    {...provided.dragHandleProps} 
                                                    className="text-gray-400 hover:text-black cursor-grab active:cursor-grabbing p-1"
                                                    title="Drag to reorder"
                                                  >
                                                    <GripVertical size={16} />
                                                  </div>
                                                  <span className="text-[10px] uppercase font-black bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                                    Block {idx + 1}: {block.type}
                                                  </span>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => handleRemoveBlock(block.id)}
                                                  className="text-red-500 hover:text-red-700 cursor-pointer p-1 bg-red-50 rounded-lg transition-colors"
                                                  title="Delete block"
                                                >
                                                  <Trash2 size={15} />
                                                </button>
                                              </div>

                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pl-8">
                                                <input
                                                  type="text"
                                                  value={block.title || ""}
                                                  onChange={e => {
                                                    const updated = [...currentPageForm.blocks];
                                                    updated[idx].title = e.target.value;
                                                    setCurrentPageForm({ ...currentPageForm, blocks: updated });
                                                  }}
                                                  placeholder="Block Title"
                                                  className="bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600"
                                                />
                                                {block.type !== "faq" && block.type !== "pricing" && (
                                                  <input
                                                    type="url"
                                                    value={block.imageUrl || ""}
                                                    onChange={e => {
                                                      const updated = [...currentPageForm.blocks];
                                                      updated[idx].imageUrl = e.target.value;
                                                      setCurrentPageForm({ ...currentPageForm, blocks: updated });
                                                    }}
                                                    placeholder="Image URL"
                                                    className="bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600"
                                                  />
                                                )}
                                              </div>

                                              {block.type !== "faq" && block.type !== "pricing" && (
                                                <div className="pl-8">
                                                  <textarea
                                                    rows={2}
                                                    value={block.content || ""}
                                                    onChange={e => {
                                                      const updated = [...currentPageForm.blocks];
                                                      updated[idx].content = e.target.value;
                                                      setCurrentPageForm({ ...currentPageForm, blocks: updated });
                                                    }}
                                                    placeholder="Block Content / Description"
                                                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600"
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </DraggableComp>
                                      );
                                    })}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </DragDropContext>
                          )}
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setIsEditingPage(false)}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-[#2c2a29] hover:bg-yellow-500 hover:text-black text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all"
                          >
                            Save Custom Page
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customPages.length === 0 ? (
                        <div className="col-span-2 py-12 text-center text-xs text-[#7c756d] flex flex-col items-center gap-3">
                          <Globe className="text-gray-300" size={44} />
                          <span className="font-bold">No custom pages yet. Create your first page.</span>
                        </div>
                      ) : (
                        customPages.map(page => (
                          <div key={page.id} className="p-5 bg-[#faf9f6] border border-[#e5e1da] rounded-2xl flex justify-between items-start shadow-2xs">
                            <div className="space-y-1.5 text-left pr-3">
                              <div className="flex items-center gap-2">
                                <h5 className="font-display font-bold text-sm text-[#2c2a29]">{page.title}</h5>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${page.isPublished ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                                  {page.isPublished ? "Published" : "Draft"}
                                </span>
                              </div>
                              <p className="text-xs text-[#7c756d] font-mono">/page/{page.slug}</p>
                              <p className="text-[10px] text-gray-400">Blocks: {page.blocks?.length || 0} • Created: {new Date(page.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setCurrentPageForm(page);
                                  setIsEditingPage(true);
                                }}
                                className="p-2 bg-white border border-[#e5e1da] hover:bg-gray-50 rounded-xl text-gray-700 font-bold text-xs cursor-pointer shadow-2xs"
                                title="Edit Page"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePage(page.id)}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs cursor-pointer"
                                title="Delete Page"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 5. THEME & UI SUB-TAB */}
              {managementSubTab === "theme" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h4 className="font-display text-base font-bold text-[#2c2a29]">Theme & UI Branding</h4>
                    <p className="text-xs text-[#7c756d]">Customize platform colors, typography and header style. Changes apply instantly across all pages.</p>
                  </div>
                  {settingsSuccess && <div className="bg-green-50 text-green-800 p-3 rounded-xl border border-green-200 font-bold text-xs flex items-center gap-2"><CheckCircle size={16} className="text-green-600" /> Theme settings saved successfully!</div>}
                  {settingsError && <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-200 font-bold text-xs flex items-center gap-2"><ShieldAlert size={16} /> {settingsError}</div>}
                  
                  <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-bold text-[#2c2a29]">Primary Color</label>
                        <div className="flex items-center gap-2 border border-[#e5e1da] rounded-xl p-2 bg-[#faf9f6]">
                          <input type="color" value={systemSettings.primaryColor} onChange={e => setSystemSettings(prev => ({ ...prev, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                          <span className="font-mono text-[10px] text-[#7c756d]">{systemSettings.primaryColor}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-[#2c2a29]">Accent Color</label>
                        <div className="flex items-center gap-2 border border-[#e5e1da] rounded-xl p-2 bg-[#faf9f6]">
                          <input type="color" value={systemSettings.accentColor} onChange={e => setSystemSettings(prev => ({ ...prev, accentColor: e.target.value }))} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                          <span className="font-mono text-[10px] text-[#7c756d]">{systemSettings.accentColor}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-[#2c2a29]">Background Color</label>
                        <div className="flex items-center gap-2 border border-[#e5e1da] rounded-xl p-2 bg-[#faf9f6]">
                          <input type="color" value={systemSettings.backgroundColor} onChange={e => setSystemSettings(prev => ({ ...prev, backgroundColor: e.target.value }))} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                          <span className="font-mono text-[10px] text-[#7c756d]">{systemSettings.backgroundColor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-bold text-[#2c2a29]">Platform Font Family</label>
                        <select value={systemSettings.fontFamily} onChange={e => setSystemSettings(prev => ({ ...prev, fontFamily: e.target.value }))} className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3.5 py-2.5 focus:outline-none">
                          <option value="sans">Plus Jakarta Sans (Modern Editorial)</option>
                          <option value="serif">Playfair Display (Luxury & Classic)</option>
                          <option value="inter">Inter (Clean & Functional)</option>
                          <option value="outfit">Outfit (Creative Studio)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-[#2c2a29]">Navigation Header Style</label>
                        <select value={systemSettings.headerStyle} onChange={e => setSystemSettings(prev => ({ ...prev, headerStyle: e.target.value }))} className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3.5 py-2.5 focus:outline-none">
                          <option value="standard">Standard (Solid White)</option>
                          <option value="glass">Glassmorphism (Frosted)</option>
                          <option value="dark">Dark Mode Header</option>
                          <option value="colored">Branded Color Header</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" disabled={savingSettings} className="w-full py-3.5 bg-[#2c2a29] hover:bg-black text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer">
                      {savingSettings ? "Saving Theme…" : "Apply Theme Changes"}
                    </button>
                  </form>

                  {/* LAN Wi-Fi Network Access State Card */}
                  {networkInfo && (
                    <div className="bg-[#faf9f6] border border-[#e5e1da] rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-display font-bold text-sm text-[#2c2a29] flex items-center gap-2">
                          <Radio size={16} className="text-emerald-600" /> Local Wi-Fi Network Connectivity
                        </h5>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">Active Host</span>
                      </div>
                      <p className="text-xs text-[#7c756d]">Connect smartphones, tablets, or client devices on the same Wi-Fi network without cables.</p>
                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white border border-[#e5e1da] rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-gray-500">Local PC Access</span>
                          <p className="font-mono font-bold text-[#2c2a29]">{networkInfo.localUrl}</p>
                        </div>
                        <div className="p-3 bg-white border border-[#e5e1da] rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-gray-500">Network URL (Mobile)</span>
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-mono font-bold text-emerald-700">{networkInfo.networkUrl}</p>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(networkInfo.networkUrl);
                                setCopiedLink(true);
                                setTimeout(() => setCopiedLink(false), 2000);
                              }}
                              className="text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                            >
                              <Copy size={11} /> {copiedLink ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SMTP Status */}
                  {smtpStatus && (
                    <div className="bg-[#faf9f6] border border-[#e5e1da] rounded-2xl p-5 space-y-3 text-xs">
                      <h5 className="font-display font-bold text-sm text-[#2c2a29] flex items-center gap-2">
                        <Mail size={16} className="text-yellow-600" /> Email Notifications Configuration (SMTP)
                      </h5>
                      <p className="text-gray-600">Sender: <strong>{smtpStatus.senderEmail}</strong> · Service: <strong>{smtpStatus.service}</strong></p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={testEmailInput}
                          onChange={e => setTestEmailInput(e.target.value)}
                          placeholder="recipient@example.com"
                          className="flex-1 bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                        />
                        <button
                          type="button"
                          disabled={sendingTestEmail}
                          onClick={async () => {
                            setSendingTestEmail(true);
                            setTestEmailResult(null);
                            try {
                              const res = await fetch("/api/admin/test-email", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
                                body: JSON.stringify({ to: testEmailInput })
                              });
                              const d = await res.json();
                              setTestEmailResult({ success: d.success, message: d.message });
                            } catch {
                              setTestEmailResult({ success: false, message: "Failed to send test email." });
                            } finally {
                              setSendingTestEmail(false);
                            }
                          }}
                          className="px-4 py-2 bg-[#2c2a29] text-white rounded-xl font-bold cursor-pointer hover:bg-black"
                        >
                          {sendingTestEmail ? "Sending..." : "Send Test"}
                        </button>
                      </div>
                      {testEmailResult && (
                        <p className={`font-bold ${testEmailResult.success ? "text-green-700" : "text-red-700"}`}>
                          {testEmailResult.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 6. MODULES SUB-TAB */}
              {managementSubTab === "modules" && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h4 className="font-display text-base font-bold text-[#2c2a29]">Feature Modules & System Toggles</h4>
                    <p className="text-xs text-[#7c756d]">Enable or disable platform-wide features. Changes take effect immediately without code deployment.</p>
                  </div>
                  {settingsSuccess && <div className="bg-green-50 text-green-800 p-3 rounded-xl border border-green-200 font-bold text-xs flex items-center gap-2"><CheckCircle size={16} className="text-green-600" /> Module settings saved!</div>}
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    {[
                      { key: "isChatbotEnabled", label: "AI Studio Chatbot", desc: "Customer-facing intelligent FAQ chat assistant powered by the platform's knowledge base." },
                      { key: "isPrintStoreEnabled", label: "Print Store", desc: "Allow studios to list photo print products and accept print orders from customers." },
                      { key: "isBookingEnabled", label: "Live Booking System", desc: "Enable customers to make and confirm studio photo shoot reservations." },
                      { key: "isMapEnabled", label: "Interactive Studio Map", desc: "Display the Cainta studio network map on the landing discovery page." },
                      { key: "isSoundEnabled", label: "Sound Engine & Chimes", desc: "Platform-wide ambient sound effects and welcome audio on page load." },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between gap-4 bg-[#faf9f6] border border-[#e5e1da] rounded-2xl p-4">
                        <div>
                          <p className="font-bold text-sm text-[#2c2a29]">{label}</p>
                          <p className="text-[11px] text-[#7c756d] mt-0.5">{desc}</p>
                        </div>
                        <button type="button" onClick={() => setSystemSettings(prev => ({ ...prev, [key]: !(prev as any)[key] }))} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors ${(systemSettings as any)[key] ? "bg-green-500" : "bg-gray-200"}`}>
                          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform mt-1 ${(systemSettings as any)[key] ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                    ))}
                    <div className="bg-[#faf9f6] border border-[#e5e1da] rounded-2xl p-4 space-y-2">
                      <label className="font-bold text-sm text-[#2c2a29] block">Demo Reel Video URL</label>
                      <p className="text-[11px] text-[#7c756d]">YouTube or direct MP4 link for the landing page hero demo video.</p>
                      <input type="url" value={systemSettings.demoVideoUrl || ""} onChange={e => setSystemSettings(prev => ({ ...prev, demoVideoUrl: e.target.value }))} placeholder="https://youtube.com/..." className="w-full bg-white border border-[#e5e1da] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#2c2a29]" />
                    </div>
                    <button type="submit" disabled={savingSettings} className="w-full py-3.5 bg-[#2c2a29] hover:bg-black text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer">
                      {savingSettings ? "Saving…" : "Save Module Configuration"}
                    </button>
                  </form>
                </div>
              )}

              {/* 7. AUDIO SUB-TAB */}
              {managementSubTab === "audio" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h4 className="font-display text-base font-bold text-[#2c2a29]">System Sound Effects & Custom Ambient Audio</h4>
                    <p className="text-xs text-[#7c756d]">Manage platform chimes, button clicks, and custom background audio for visitors.</p>
                  </div>
                  {settingsSuccess && (
                    <div className="bg-green-50 text-green-800 p-3 rounded-xl border border-green-200 font-bold text-xs flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" /> Audio policy and sound settings saved successfully.
                    </div>
                  )}
                  <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
                    <CustomAudioPlayer
                      audioUrl={systemSettings.customAudioUrl}
                      enabled={systemSettings.customAudioEnabled}
                      onAudioChange={customAudioUrl => setSystemSettings({ ...systemSettings, customAudioUrl })}
                      onEnabledChange={customAudioEnabled => setSystemSettings({ ...systemSettings, customAudioEnabled })}
                    />
                    <button type="submit" disabled={savingSettings} className="w-full py-3.5 bg-[#2c2a29] hover:bg-black text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer">
                      {savingSettings ? "Saving Audio Settings..." : "Save Audio Configuration"}
                    </button>
                  </form>
                </div>
              )}

              {/* 8. AUDIT LOG SUB-TAB */}
              {managementSubTab === "audit" && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h4 className="font-display text-base font-bold text-[#2c2a29]">Platform Immutable Security Audit Trail</h4>
                    <p className="text-xs text-[#7c756d]">Real-time system transaction tracking logging business, booking, and administrative state modifications.</p>
                  </div>
                  <div className="bg-[#faf9f6] border border-[#e5e1da] rounded-2xl divide-y divide-[#e5e1da] max-h-[420px] overflow-y-auto shadow-inner">
                    {auditLogs.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#7c756d]">No transactions recorded yet.</div>
                    ) : (
                      auditLogs.slice().reverse().map((log) => (
                        <div key={log.id} className="p-4 flex justify-between items-center text-xs">
                          <div className="text-left space-y-1 pr-4">
                            <p className="font-bold text-[#2c2a29] leading-snug">{log.message}</p>
                            <div className="flex gap-4 text-[10px] text-gray-500">
                              <span>Log ID: <strong>{log.id}</strong></span>
                              <span>Actor: <strong>{log.actorEmail}</strong></span>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 9. ADMIN ACCOUNT SUB-TAB */}
              {managementSubTab === "account" && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h4 className="font-display text-base font-bold text-[#2c2a29]">Admin Account & Security</h4>
                    <p className="text-xs text-[#7c756d]">Update your super admin profile information and change your login password.</p>
                  </div>
                  <AccountSettings currentUser={currentUser} onUserUpdated={() => {}} />
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-2xl max-w-lg w-full p-6 space-y-5 text-left relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-[#2c2a29]">Create System User Account</h3>
                <p className="text-[11px] text-gray-500">Directly add Customer, Studio Staff, Studio Owner, or Super Admin accounts.</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {userCreateMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                userCreateMsg.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {userCreateMsg.type === "success" ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
                <span>{userCreateMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Account Role Type</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-[#2c2a29]"
                >
                  <option value="CUSTOMER">Customer / Client</option>
                  <option value="STUDIO_ADMIN">Studio Owner (Admin)</option>
                  <option value="STUDIO_STAFF">Studio Staff / Photographer</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                </select>
              </div>

              {(newRole === "STUDIO_ADMIN" || newRole === "STUDIO_STAFF") && (
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Assign to Photography Studio</label>
                  <select
                    value={newUserStudioId}
                    onChange={e => setNewUserStudioId(e.target.value)}
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-[#2c2a29]"
                  >
                    <option value="">-- Independent / None --</option>
                    {studios.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserFullName}
                    onChange={e => setNewUserFullName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    value={newUserContact}
                    onChange={e => setNewUserContact(e.target.value)}
                    placeholder="0917-000-0000"
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Login Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    placeholder="maria@example.com"
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Address / Location</label>
                <input
                  type="text"
                  value={newUserAddress}
                  onChange={e => setNewUserAddress(e.target.value)}
                  placeholder="Cainta, Rizal"
                  className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2c2a29]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={userCreateLoading}
                  className="px-5 py-2 bg-[#2c2a29] hover:bg-yellow-500 hover:text-black text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  {userCreateLoading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Full Preview Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-[#2c2a29] text-white">
              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                <FileText size={16} className="text-yellow-400" />
                {selectedDocPreview.title}
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={selectedDocPreview.url}
                  download="document"
                  className="text-xs bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded-lg font-bold transition-colors"
                >
                  Download File
                </a>
                <button
                  onClick={() => {
                    if (selectedDocPreview.url.startsWith("blob:")) URL.revokeObjectURL(selectedDocPreview.url);
                    setSelectedDocPreview(null);
                  }}
                  className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-gray-100">
              {selectedDocPreview.url.startsWith("data:image/") ? (
                <img
                  src={selectedDocPreview.url}
                  alt={selectedDocPreview.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg border border-gray-200"
                />
              ) : (
                <iframe
                  src={selectedDocPreview.url}
                  title={selectedDocPreview.title}
                  className="w-full h-[65vh] border-0 rounded-xl bg-white shadow-inner"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
