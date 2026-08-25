import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  ShieldAlert, ShieldCheck, Check, X, FileText, Plus, 
  Trash2, Users, Briefcase, Calendar, Star, Sparkles,
  MapPin, Upload, FileUp, Eye, Globe, Settings, FileCheck, CheckCircle, GripVertical
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CustomPageView from "../components/CustomPageView.tsx";
import { CustomAudioPlayer } from "../components/CustomAudioPlayer.tsx";
import { UserRole } from "../db/types.ts";

interface AdminDashboardProps {
  studios: any[];
  bookings: any[];
  users: any[];
  categories: any[];
  auditLogs: any[];
  reviews?: any[];
  cms?: { [key: string]: string };
  onApproveStudio: (studioId: string) => void;
  onRejectStudio: (studioId: string) => void;
  authToken?: string;
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onRefresh: () => void;
}

export default function AdminDashboard({
  studios,
  bookings,
  users,
  categories,
  auditLogs,
  reviews = [],
  cms,
  onApproveStudio,
  onRejectStudio,
  authToken,
  onAddCategory,
  onDeleteCategory,
  onRefresh
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "onboard" | "users" | "cms" | "theme" | "audio" | "modules" | "pages" | "categories" | "reviews" | "audit">("pending");
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ title: string; url: string } | null>(null);

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
  const [reviewActionMsg, setReviewActionMsg] = useState("");
  const [newCatName, setNewCatName] = useState("");

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
    hiddenNavItems: [] as string[]
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

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
      }
    } catch (err) {
      alert("Failed to save system settings.");
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
    } catch (err) {
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
    } catch (err) {
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
    if (activeTab !== "onboard" || !pickMapContainerRef.current) return;

    // Reset previous instance if any
    if (pickMapRef.current) {
      pickMapRef.current.remove();
      pickMapRef.current = null;
    }

    try {
      const map = L.map(pickMapContainerRef.current, {
        center: [14.5882, 121.1278], // Default Valley Golf center
        zoom: 13.5,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd"
      }).addTo(map);

      // Create a marker that can be clicked/dragged
      const marker = L.marker([14.5882, 121.1278], { draggable: true }).addTo(map);
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

      // Force a map resize check to render correctly in tabs
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
  }, [activeTab]);

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName);
    setNewCatName("");
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
    } catch (err) {
      alert("Failed to communicate with CMS api.");
    } finally {
      setSavingCms(false);
    }
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
        // Reset form fields
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
    } catch (err) {
      setOnboardError("Failed to register studio. Connectivity issue.");
    } finally {
      setOnboardLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e5e1da] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-yellow-600 font-extrabold flex items-center gap-1.5">
            <Settings size={12} className="animate-spin" /> Platform Master Control
          </span>
          <h2 className="font-display text-3xl font-extrabold text-[#2c2a29] leading-tight">
            Super Admin MIS Console
          </h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-8 items-start">
        <aside className="lg:sticky lg:top-6 space-y-4">
          <div className="bg-[#2c2a29] text-[#faf9f6] rounded-2xl p-4 shadow-sm">
            <p className="text-[9px] uppercase tracking-[0.18em] text-yellow-400 font-extrabold">Workspace</p>
            <p className="text-sm font-bold mt-1">Platform control</p>
            <p className="text-[10px] text-[#c8c0b7] mt-1 leading-relaxed">Manage the studio network, users, content, and system policies.</p>
          </div>

          <nav className="bg-white border border-[#e5e1da] rounded-2xl p-2 shadow-sm flex lg:block gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "pending", label: "Pending Approvals", badge: pendingStudios.length, icon: ShieldCheck },
              { id: "onboard", label: "Onboard Studio", badge: 0, icon: Briefcase },
              { id: "users", label: "User Management", badge: users.length, icon: Users },
              { id: "cms", label: "Content Management", badge: 0, icon: FileText },
              { id: "theme", label: "Theme & UI", badge: 0, icon: Settings },
              { id: "audio", label: "System Audio", badge: 0, icon: Sparkles },
              { id: "modules", label: "Modules & Toggles", badge: 0, icon: ShieldAlert },
              { id: "pages", label: "Page Builder", badge: customPages.length, icon: FileCheck },
              { id: "categories", label: "Categories", badge: categories.length, icon: Briefcase },
              { id: "reviews", label: "Reviews", badge: adminReviews.filter(r => r.status === "pending").length, icon: Star },
              { id: "audit", label: "Audit Logs", badge: auditLogs.length, icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`shrink-0 lg:w-full py-3 px-3 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-2 text-left ${
                    activeTab === tab.id
                      ? "bg-yellow-50 text-[#2c2a29] shadow-sm border border-yellow-200"
                      : "text-[#7c756d] hover:bg-[#faf9f6]"
                  }`}
                >
                  <Icon size={15} className={activeTab === tab.id ? "text-yellow-700" : "text-[#a39b92]"} />
                  <span className="lg:flex-1 whitespace-nowrap">{tab.label}</span>
                  {tab.badge > 0 && <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">{tab.badge}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 space-y-8">
          {/* 2. OVERVIEW STATS GRID */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-xs">
          <span className="text-[9px] uppercase tracking-wider text-[#7c756d] font-bold">Pending Registrations</span>
          <h4 className="font-display text-2xl font-black text-[#2c2a29] mt-1">{pendingStudios.length} business</h4>
        </div>
        <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-xs">
          <span className="text-[9px] uppercase tracking-wider text-[#7c756d] font-bold">Verified Studios</span>
          <h4 className="font-display text-2xl font-black text-[#2c2a29] mt-1">{approvedStudios.length} listed</h4>
        </div>
        <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-xs">
          <span className="text-[9px] uppercase tracking-wider text-[#7c756d] font-bold">System Bookings</span>
          <h4 className="font-display text-2xl font-black text-[#2c2a29] mt-1">{bookings.length} reservations</h4>
        </div>
        <div className="bg-white border border-[#e5e1da] p-5 rounded-2xl shadow-xs">
          <span className="text-[9px] uppercase tracking-wider text-[#7c756d] font-bold">Total Platform Users</span>
          <h4 className="font-display text-2xl font-black text-[#2c2a29] mt-1">{users.length} profiles</h4>
        </div>
          </div>

          {/* 3. WORKSPACE TAB WORKFLOWS */}

      {/* Tab A: Pending Approvals */}
      {activeTab === "pending" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 space-y-6">
          <h3 className="font-display text-lg font-bold text-[#2c2a29]">Verify & Approve Newly Registered Photography Businesses</h3>

          {pendingStudios.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7c756d] flex flex-col items-center gap-3">
              <ShieldCheck className="text-green-600 animate-pulse" size={44} />
              <span className="font-bold">All photography business registrations are verified and active!</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {pendingStudios.map((st) => (
                <div key={st.id} className="p-6 border border-[#e5e1da] rounded-2xl bg-[#faf9f6] flex flex-col justify-between space-y-5 shadow-xs">
                  <div className="text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                        Cainta Business License Pending
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {st.id}</span>
                    </div>
                    <h4 className="font-display font-extrabold text-base text-[#2c2a29]">{st.name}</h4>
                    <p className="text-xs text-[#7c756d] leading-relaxed line-clamp-3">{st.description}</p>
                    
                    <div className="bg-white p-3 rounded-xl border border-gray-100 text-xs space-y-1 font-semibold text-gray-600">
                      <p>👤 Contact Person: <span className="text-black font-bold">{st.fullName || "Studio Manager"}</span></p>
                      <p>✉️ Studio Email: <span className="text-black font-bold">{st.email}</span></p>
                      <p>📞 Contact Info: <span className="text-black font-bold">{st.contactInfo || "+63 900 000 0000"}</span></p>
                      <p>📍 Location Area: <span className="text-black font-bold">{st.location}</span></p>
                      <p>🏠 Street Address: <span className="text-black font-bold">{st.address}</span></p>
                    </div>

                    {/* Permits & Documents Validation Area */}
                    {(st.businessPermit || st.validId || st.otherDocs) ? (
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#2c2a29] block">Uploaded Validation Documents</span>
                        <div className="grid grid-cols-3 gap-2">
                          {st.businessPermit && (
                            <div className="border border-gray-200 rounded-xl bg-white p-2 text-center flex flex-col items-center justify-between min-h-[110px]">
                              {st.businessPermit.startsWith("data:image/") ? (
                                <img
                                  src={st.businessPermit}
                                  alt="Permit"
                                  className="w-full h-14 object-cover rounded-md mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedDocPreview({ title: `${st.name} - Business Permit`, url: st.businessPermit! })}
                                />
                              ) : (
                                <FileText size={24} className="text-yellow-600 my-1.5" />
                              )}
                              <span className="text-[9px] font-bold text-gray-700 truncate block w-full">Business Permit</span>
                              <div className="flex gap-1 justify-center w-full mt-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedDocPreview({ title: `${st.name} - Business Permit`, url: st.businessPermit! })}
                                  className="text-[9px] text-amber-700 font-extrabold hover:underline flex items-center gap-0.5"
                                >
                                  <Eye size={10} /> View
                                </button>
                                <a href={st.businessPermit} download={`${st.name}_business_permit`} className="text-[9px] text-blue-600 font-extrabold hover:underline">
                                  Save
                                </a>
                              </div>
                            </div>
                          )}

                          {st.validId && (
                            <div className="border border-gray-200 rounded-xl bg-white p-2 text-center flex flex-col items-center justify-between min-h-[110px]">
                              {st.validId.startsWith("data:image/") ? (
                                <img
                                  src={st.validId}
                                  alt="Owner Valid ID"
                                  className="w-full h-14 object-cover rounded-md mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedDocPreview({ title: `${st.name} - Owner Valid Government ID`, url: st.validId! })}
                                />
                              ) : (
                                <FileText size={24} className="text-amber-600 my-1.5" />
                              )}
                              <span className="text-[9px] font-bold text-gray-700 truncate block w-full">Owner Valid ID</span>
                              <div className="flex gap-1 justify-center w-full mt-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedDocPreview({ title: `${st.name} - Owner Valid Government ID`, url: st.validId! })}
                                  className="text-[9px] text-amber-700 font-extrabold hover:underline flex items-center gap-0.5"
                                >
                                  <Eye size={10} /> View
                                </button>
                                <a href={st.validId} download={`${st.name}_owner_valid_id`} className="text-[9px] text-blue-600 font-extrabold hover:underline">
                                  Save
                                </a>
                              </div>
                            </div>
                          )}

                          {st.otherDocs && (
                            <div className="border border-gray-200 rounded-xl bg-white p-2 text-center flex flex-col items-center justify-between min-h-[110px]">
                              {st.otherDocs.startsWith("data:image/") ? (
                                <img
                                  src={st.otherDocs}
                                  alt="Other docs"
                                  className="w-full h-14 object-cover rounded-md mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedDocPreview({ title: `${st.name} - Supporting Documents`, url: st.otherDocs! })}
                                />
                              ) : (
                                <FileText size={24} className="text-blue-600 my-1.5" />
                              )}
                              <span className="text-[9px] font-bold text-gray-700 truncate block w-full">Validation Docs</span>
                              <div className="flex gap-1 justify-center w-full mt-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedDocPreview({ title: `${st.name} - Supporting Documents`, url: st.otherDocs! })}
                                  className="text-[9px] text-amber-700 font-extrabold hover:underline flex items-center gap-0.5"
                                >
                                  <Eye size={10} /> View
                                </button>
                                <a href={st.otherDocs} download={`${st.name}_supporting_documents`} className="text-[9px] text-blue-600 font-extrabold hover:underline">
                                  Save
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 text-amber-800 p-2.5 rounded-xl border border-amber-200 text-[10px] font-bold flex items-center gap-1.5">
                        <ShieldAlert size={14} />
                        <span>No uploaded permit documents provided. Ready for physical/manual validation check.</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-[#e5e1da]">
                    <button
                      onClick={() => onApproveStudio(st.id)}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <Check size={14} /> Approve & List Business
                    </button>
                    <button
                      onClick={() => onRejectStudio(st.id)}
                      className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <X size={14} /> Reject Application
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab B: Onboard Studio Owner (Exclusively by Admin) */}
      {activeTab === "onboard" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-[#2c2a29]">Exclusively Onboard Verified Photography Studio & Owner Account</h3>
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
                        className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Email Address (Username)</label>
                        <input
                          type="email"
                          required
                          value={ownerEmail}
                          onChange={e => setOwnerEmail(e.target.value)}
                          placeholder="e.g. stephen@gmail.com"
                          className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Password</label>
                        <input
                          type="password"
                          required
                          value={ownerPassword}
                          onChange={e => setOwnerPassword(e.target.value)}
                          placeholder="Create secure password"
                          className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Contact Number</label>
                        <input
                          type="text"
                          required
                          value={ownerContact}
                          onChange={e => setOwnerContact(e.target.value)}
                          placeholder="+63 900 000 0000"
                          className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
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
                          className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-extrabold text-sm text-[#2c2a29] uppercase tracking-wider mb-3.5 pb-1 border-b border-gray-100">
                    2. Business Profile Details
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Photography Studio Name</label>
                      <input
                        type="text"
                        required
                        value={studioName}
                        onChange={e => setStudioName(e.target.value)}
                        placeholder="e.g. Aperture Point Cainta"
                        className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29] font-bold text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Studio Core Specialization & Offerings</label>
                      <textarea
                        required
                        rows={2}
                        value={studioDescription}
                        onChange={e => setStudioDescription(e.target.value)}
                        placeholder="Detail studio history, equipment, strobes, backdrops, raw files policy..."
                        className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl p-3 focus:outline-none focus:border-[#2c2a29]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block font-bold text-gray-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          value={studioAddress}
                          onChange={e => setStudioAddress(e.target.value)}
                          placeholder="e.g. Unit 4, Felix Ave Junction, Cainta"
                          className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Cainta Corridor Area</label>
                        <select
                          value={studioLocation}
                          onChange={e => setStudioLocation(e.target.value)}
                          className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2c2a29] font-bold"
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
                          className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29] font-bold text-green-700"
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
                          className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                        />
                      </div>
                    </div>

                    {/* Checkboxes for Categories specializations */}
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
                  
                  {/* Map picker canvas */}
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
                        className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#2c2a29] font-mono text-[11px]"
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
                        className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#2c2a29] font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-extrabold text-sm text-[#2c2a29] uppercase tracking-wider mb-3.5 pb-1 border-b border-gray-100">
                    4. Validation Documents & Compliance Permits
                  </h4>
                  
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    {/* Permit Upload */}
                    <div className="space-y-2">
                      <label className="block font-bold text-gray-700">DTI / Mayor's Business Permit</label>
                      <div className="border-2 border-dashed border-[#e5e1da] rounded-2xl bg-[#faf9f6] p-3 text-center hover:border-[#7c756d] transition-all relative">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={e => handleFileChange(e, "permit")}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="space-y-1">
                          <Upload size={18} className="mx-auto text-gray-400" />
                          <p className="text-[10px] font-bold text-gray-700">Click to upload permit</p>
                        </div>
                      </div>
                      {businessPermit && (
                        <div className="bg-green-50 p-2 rounded-xl border border-green-200 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-green-800 flex items-center gap-1">
                            <FileCheck size={12} /> Permit Attached!
                          </span>
                          <button type="button" onClick={() => setBusinessPermit("")} className="text-red-500 hover:underline text-[9px] font-bold">Remove</button>
                        </div>
                      )}
                    </div>

                    {/* Valid Owner ID Upload */}
                    <div className="space-y-2">
                      <label className="block font-bold text-gray-700">Owner Valid Government ID</label>
                      <div className="border-2 border-dashed border-[#e5e1da] rounded-2xl bg-[#faf9f6] p-3 text-center hover:border-[#7c756d] transition-all relative">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={e => handleFileChange(e, "validId")}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="space-y-1">
                          <Upload size={18} className="mx-auto text-gray-400" />
                          <p className="text-[10px] font-bold text-gray-700">Click to upload Valid ID</p>
                        </div>
                      </div>
                      {validId && (
                        <div className="bg-green-50 p-2 rounded-xl border border-green-200 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-green-800 flex items-center gap-1">
                            <FileCheck size={12} /> Valid ID Attached!
                          </span>
                          <button type="button" onClick={() => setValidId("")} className="text-red-500 hover:underline text-[9px] font-bold">Remove</button>
                        </div>
                      )}
                    </div>

                    {/* Other Docs Upload */}
                    <div className="space-y-2">
                      <label className="block font-bold text-gray-700">Additional Validation Docs</label>
                      <div className="border-2 border-dashed border-[#e5e1da] rounded-2xl bg-[#faf9f6] p-3 text-center hover:border-[#7c756d] transition-all relative">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={e => handleFileChange(e, "other")}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="space-y-1">
                          <Upload size={18} className="mx-auto text-gray-400" />
                          <p className="text-[10px] font-bold text-gray-700">Click to upload supporting docs</p>
                        </div>
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
                </div>

                <div className="pt-6">
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
      )}

      {/* Tab: User Management & Add User (Exclusively by Admin / Superadmin) */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <h3 className="font-display text-lg font-bold text-[#2c2a29]">Centralized User Account Management</h3>
              <p className="text-xs text-[#7c756d]">Manage all system users, inspect roles, and create new Customer, Studio Owner, Studio Staff, or Super Admin accounts.</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} /> Add New User
            </button>
          </div>

          {/* User Filter Controls */}
          <div className="flex items-center gap-2 border-b border-[#e5e1da] pb-3 text-xs overflow-x-auto">
            <span className="font-bold text-gray-500 mr-2">Filter Role:</span>
            {["ALL", "CUSTOMER", "STUDIO_ADMIN", "STUDIO_STAFF", "SUPER_ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setUserRoleFilter(r)}
                className={`py-1 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                  userRoleFilter === r
                    ? "bg-[#2c2a29] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {r === "ALL" ? "All Accounts" : r.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Users List Grid / Table */}
          <div className="bg-[#faf9f6] border border-[#e5e1da] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#2c2a29] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Account Role</th>
                    <th className="p-3">Registration Status</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Created Date</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e1da]">
                  {users
                    .filter(u => userRoleFilter === "ALL" || u.role === userRoleFilter)
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-white transition-colors">
                        <td className="p-3 font-mono font-bold text-gray-600">{u.id}</td>
                        <td className="p-3 font-extrabold text-[#2c2a29]">{u.fullName || u.name}</td>
                        <td className="p-3 font-medium text-gray-800">{u.email}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === "SUPER_ADMIN"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : u.role === "STUDIO_ADMIN"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : u.role === "STUDIO_STAFF"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-green-100 text-green-800 border border-green-200"
                          }`}>
                            {u.role ? u.role.replace("_", " ") : "CUSTOMER"}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.role === "STUDIO_ADMIN" ? (() => {
                            const studio = studios.find(s => s.ownerId === u.id || s.id === u.studioId);
                            const status = studio?.status || "pending";
                            return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              status === "approved" ? "bg-green-100 text-green-800 border border-green-200" :
                              status === "rejected" ? "bg-red-100 text-red-800 border border-red-200" :
                              status === "suspended" ? "bg-gray-200 text-gray-800 border border-gray-300" :
                              "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            }`}>{status.replace("_", " ")}</span>;
                          })() : <span className="text-[10px] font-bold text-green-700">ACTIVE</span>}
                        </td>
                        <td className="p-3 text-gray-600">{u.contactNumber || u.contactInfo || "—"}</td>
                        <td className="p-3 text-gray-500 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          {u.role === "STUDIO_ADMIN" && (() => {
                            const studio = studios.find(s => s.ownerId === u.id || s.id === u.studioId);
                            const status = studio?.status || "pending";
                            return <div className="flex flex-wrap gap-1.5 min-w-[180px]">
                              {status !== "approved" && <button onClick={() => handleUserStatusChange(u.id, "approved")} className="px-2 py-1 rounded-lg bg-green-600 text-white text-[9px] font-bold uppercase cursor-pointer"><Check size={11} className="inline" /> Approve</button>}
                              {status !== "rejected" && <button onClick={() => handleUserStatusChange(u.id, "rejected")} className="px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold uppercase cursor-pointer"><X size={11} className="inline" /> Reject</button>}
                              {status !== "suspended" && status === "approved" && <button onClick={() => handleUserStatusChange(u.id, "suspended")} className="px-2 py-1 rounded-lg bg-gray-200 text-gray-800 text-[9px] font-bold uppercase cursor-pointer"><ShieldAlert size={11} className="inline" /> Suspend</button>}
                            </div>;
                          })()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab C: Content Management (System texts & images) */}
      {activeTab === "cms" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-[#2c2a29]">Content Management System</h3>
            <p className="text-xs text-[#7c756d]">Update primary marketing messages, descriptions, call-to-actions, and background assets live without re-deploying code.</p>
          </div>

          {cmsSuccess && (
            <div className="bg-green-50 text-green-800 p-3 rounded-xl border border-green-200 font-bold text-xs flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>CMS settings updated successfully! Changes are active and visible in real-time.</span>
            </div>
          )}

          <form onSubmit={handleCMSSubmit} className="space-y-6 max-w-4xl">
            
            <div className="space-y-4">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
                1. Landing Page Cinematic Hero Section Content
              </h4>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#2c2a29]">Hero Primary Headline Title</label>
                  <textarea
                    rows={2}
                    required
                    value={heroTitle}
                    onChange={e => setHeroTitle(e.target.value)}
                    placeholder="e.g. Frame Your Story. <br /> Book Cainta Studios."
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl p-3 focus:outline-none focus:border-[#2c2a29] font-mono"
                  />
                  <p className="text-[9px] text-gray-400">Supports normal HTML tags (e.g. <code>&lt;br /&gt;</code>, <code>&lt;span class='text-yellow-400'&gt;...&lt;/span&gt;</code>) for layout highlights.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-[#2c2a29]">Hero Subtitle / Description Paragraph</label>
                  <textarea
                    rows={3}
                    required
                    value={heroSubtitle}
                    onChange={e => setHeroSubtitle(e.target.value)}
                    placeholder="Compare live availability across Cainta, Rizal..."
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl p-3 focus:outline-none focus:border-[#2c2a29] leading-relaxed"
                  />
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <label className="block font-bold text-[#2c2a29]">Hero Ambient Background Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={heroBackground}
                    onChange={e => setHeroBackground(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                  />
                  <button
                    type="button"
                    onClick={() => window.open(heroBackground, "_blank")}
                    className="px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-bold border border-gray-200 cursor-pointer flex items-center gap-1"
                    title="Preview Image in New Tab"
                  >
                    <Eye size={13} /> Preview
                  </button>
                </div>
                <p className="text-[9px] text-gray-400">High-resolution banner background image. Supports landscape Unsplash photography links.</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
                2. Signature Retouching / About Section Content
              </h4>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#2c2a29]">About Block Section Title</label>
                  <input
                    type="text"
                    required
                    value={aboutTitle}
                    onChange={e => setAboutTitle(e.target.value)}
                    placeholder="Pristine Studio Lighting & Retouching"
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#2c2a29] font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-[#2c2a29]">About Block Section Description Caption</label>
                  <textarea
                    rows={2}
                    required
                    value={aboutDescription}
                    onChange={e => setAboutDescription(e.target.value)}
                    placeholder="Experience the difference of calibrated Profoto strobes..."
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl p-3 focus:outline-none focus:border-[#2c2a29] leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#e5e1da] flex justify-end">
              <button
                type="submit"
                disabled={savingCms}
                className="px-6 py-3 bg-[#2c2a29] hover:bg-[#4a4644] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                {savingCms ? "Updating System Content..." : "Save System Content Settings"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Tab: Theme & UI Styling Control */}
      {activeTab === "theme" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-[#2c2a29]">UI Theme & Color Palettes</h3>
            <p className="text-xs text-[#7c756d]">Customize primary brand colors, accent tones, background canvas, typography, and layout style.</p>
          </div>

          {settingsSuccess && (
            <div className="bg-green-50 text-green-800 p-3 rounded-xl border border-green-200 font-bold text-xs flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>Theme & UI settings successfully updated!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-[#2c2a29]">Primary Brand Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={systemSettings.primaryColor}
                    onChange={e => setSystemSettings({ ...systemSettings, primaryColor: e.target.value })}
                    className="w-12 h-10 rounded-xl border border-[#e5e1da] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={systemSettings.primaryColor}
                    onChange={e => setSystemSettings({ ...systemSettings, primaryColor: e.target.value })}
                    className="flex-1 bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-[#2c2a29]">Accent Highlight Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={systemSettings.accentColor}
                    onChange={e => setSystemSettings({ ...systemSettings, accentColor: e.target.value })}
                    className="w-12 h-10 rounded-xl border border-[#e5e1da] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={systemSettings.accentColor}
                    onChange={e => setSystemSettings({ ...systemSettings, accentColor: e.target.value })}
                    className="flex-1 bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-[#2c2a29]">Background Canvas Tone</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={systemSettings.backgroundColor}
                    onChange={e => setSystemSettings({ ...systemSettings, backgroundColor: e.target.value })}
                    className="w-12 h-10 rounded-xl border border-[#e5e1da] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={systemSettings.backgroundColor}
                    onChange={e => setSystemSettings({ ...systemSettings, backgroundColor: e.target.value })}
                    className="flex-1 bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <label className="block font-bold text-[#2c2a29]">Typography Font Family</label>
                <select
                  value={systemSettings.fontFamily}
                  onChange={e => setSystemSettings({ ...systemSettings, fontFamily: e.target.value })}
                  className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#2c2a29]"
                >
                  <option value="sans">Modern Sans (Plus Jakarta Sans / Inter)</option>
                  <option value="serif">Editorial Serif (Playfair / Display)</option>
                  <option value="mono">Clean Monospace (JetBrains)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-[#2c2a29]">Header Navigation Layout Style</label>
                <select
                  value={systemSettings.headerStyle}
                  onChange={e => setSystemSettings({ ...systemSettings, headerStyle: e.target.value })}
                  className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#2c2a29]"
                >
                  <option value="standard">Standard Sticky Navbar with Backdrop Blur</option>
                  <option value="minimal">Minimal Clean Bar</option>
                  <option value="centered">Centered Brand Display</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-[#e5e1da] flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 bg-[#2c2a29] hover:bg-[#4a4644] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {savingSettings ? "Saving Theme..." : "Save Theme & UI Settings"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Super Admin System Audio Control */}
      {activeTab === "audio" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-yellow-700 font-extrabold">Super Admin Only</span>
            <h3 className="font-display text-lg font-bold text-[#2c2a29]">System Audio Control</h3>
            <p className="text-xs text-[#7c756d]">Upload and approve the background sound used across the entire Cainta Photography Studio MIS.</p>
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
            <div className="pt-4 border-t border-[#e5e1da] flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 bg-[#2c2a29] hover:bg-[#4a4644] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                {savingSettings ? "Saving Audio Settings..." : "Save System Audio Settings"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Modules & Feature Toggles */}
      {activeTab === "modules" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-[#2c2a29]">Modules & Feature Toggles</h3>
            <p className="text-xs text-[#7c756d]">Enable or disable specific system modules, chatbot assistants, printing storefronts, booking widgets, and navigation items.</p>
          </div>

          {settingsSuccess && (
            <div className="bg-green-50 text-green-800 p-3 rounded-xl border border-green-200 font-bold text-xs flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>Module configurations updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
            <div className="space-y-4">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
                Core System Module Switches
              </h4>

              <div className="space-y-3 text-xs font-semibold">
                {[
                  { key: "isChatbotEnabled", label: "Gemini AI Studio Assistant Chatbot", desc: "Floating AI assistant widget answering pricing & booking questions." },
                  { key: "isPrintStoreEnabled", label: "Gallery-Grade Wall Print Order Storefront", desc: "Physical print order wizard for canvas, acrylic, and wood prints." },
                  { key: "isBookingEnabled", label: "Live Calendar Booking Wizard", desc: "Interactive appointment scheduling with downpayment proof uploads." },
                  { key: "isMapEnabled", label: "Interactive Cainta Studio Map & GPS Finder", desc: "Leaflet map displaying studio locations across Valley Golf & Cainta." },
                  { key: "isSoundEnabled", label: "Studio Ambient Audio & Shutter Sound FX", desc: "Acoustic camera shutter sound feedback on button clicks." }
                ].map((mod) => (
                  <div key={mod.key} className="flex items-center justify-between p-4 bg-[#faf9f6] border border-[#e5e1da] rounded-2xl">
                    <div className="space-y-0.5 text-left pr-4">
                      <p className="font-bold text-[#2c2a29]">{mod.label}</p>
                      <p className="text-[11px] text-[#7c756d] font-normal">{mod.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(systemSettings as any)[mod.key]}
                        onChange={e => setSystemSettings({ ...systemSettings, [mod.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2c2a29]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#e5e1da] flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 bg-[#2c2a29] hover:bg-[#4a4644] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {savingSettings ? "Updating Modules..." : "Save Module Toggles"}
              </button>
            </div>
          </form>

          {/* Real-time SMTP Email Dispatch & Diagnostics Panel */}
          <div className="mt-8 pt-6 border-t border-[#e5e1da] space-y-4 text-left max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500">
                  Real-time SMTP Email Delivery System
                </h4>
                <p className="text-[11px] text-[#7c756d] mt-0.5">
                  Sends automated transaction receipts, booking updates, studio registrations, and payment notifications.
                </p>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                smtpStatus?.isConfigured ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
              }`}>
                <span className={`w-2 h-2 rounded-full ${smtpStatus?.isConfigured ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}></span>
                {smtpStatus?.isConfigured ? "SMTP Connected" : "Not Configured"}
              </span>
            </div>

            <div className="bg-[#faf9f6] border border-[#e5e1da] rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e5e1da]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7c756d] block">Sender Email Address</span>
                  <span className="font-bold text-[#2c2a29] font-mono">{smtpStatus?.senderEmail || "danielpadilla140600@gmail.com"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7c756d] block">Transport Engine</span>
                  <span className="font-bold text-[#2c2a29]">{smtpStatus?.service || "Gmail App Password (SMTP)"}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-bold text-[#2c2a29] block">
                  Send Test Notification Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailInput}
                    onChange={e => setTestEmailInput(e.target.value)}
                    placeholder="Enter recipient email address..."
                    className="flex-1 bg-white border border-[#e5e1da] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2c2a29]"
                  />
                  <button
                    type="button"
                    disabled={sendingTestEmail || !testEmailInput}
                    onClick={async () => {
                      setSendingTestEmail(true);
                      setTestEmailResult(null);
                      try {
                        const res = await fetch("/api/admin/send-test-email", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ toEmail: testEmailInput })
                        });
                        const data = await res.json();
                        setTestEmailResult({ success: data.success, message: data.message });
                      } catch (err: any) {
                        setTestEmailResult({ success: false, message: err?.message || "Failed to contact server." });
                      } finally {
                        setSendingTestEmail(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#2c2a29] hover:bg-[#44403c] text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer whitespace-nowrap"
                  >
                    {sendingTestEmail ? "Sending..." : "Send Test Email"}
                  </button>
                </div>

                {testEmailResult && (
                  <div className={`p-3 rounded-xl border text-xs font-bold ${
                    testEmailResult.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                  }`}>
                    {testEmailResult.success ? "✅ " : "❌ "}
                    {testEmailResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Wi-Fi & LAN Cross-Device Testing Access Card */}
          <div className="mt-8 pt-6 border-t border-[#e5e1da] space-y-4 text-left max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500">
                  Wi-Fi & LAN Cross-Device Testing
                </h4>
                <p className="text-[11px] text-[#7c756d] mt-0.5">
                  Open the MIS on smartphones, tablets, or other laptops connected to the same Wi-Fi network.
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-blue-100 text-blue-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                LAN Active
              </span>
            </div>

            <div className="bg-[#faf9f6] border border-[#e5e1da] rounded-2xl p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-[#e5e1da]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7c756d] block">This Computer (Localhost)</span>
                  <a href={networkInfo?.localUrl || "http://localhost:3000"} target="_blank" rel="noreferrer" className="font-bold text-[#2c2a29] hover:underline font-mono">
                    {networkInfo?.localUrl || "http://localhost:3000"}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7c756d] block">Mobile / Wi-Fi Network URL</span>
                  <span className="font-bold text-blue-700 font-mono">
                    {networkInfo?.networkUrl || `http://192.168.254.102:3000`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                <p className="text-[11px] text-[#7c756d]">
                  Type <strong className="text-[#2c2a29]">{networkInfo?.networkUrl || `http://192.168.254.102:3000`}</strong> in the browser of your phone or tablet.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const url = networkInfo?.networkUrl || `http://192.168.254.102:3000`;
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className="px-3 py-1.5 bg-[#2c2a29] text-white text-[11px] font-bold rounded-lg uppercase tracking-wider hover:bg-[#44403c] transition-all cursor-pointer whitespace-nowrap"
                >
                  {copiedLink ? "✓ Copied Link!" : "Copy Wi-Fi URL"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Page Builder & Custom Pages */}
      {activeTab === "pages" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="space-y-1 text-left">
              <h3 className="font-display text-lg font-bold text-[#2c2a29]">Built-in Visual Page Builder</h3>
              <p className="text-xs text-[#7c756d]">Create, edit, publish, unpublish, and design custom pages directly from the admin panel without modifying code.</p>
            </div>
            <button
              onClick={() => {
                setCurrentPageForm({
                  id: "",
                  createdAt: new Date().toISOString(),
                  title: "",
                  slug: "",
                  isPublished: true,
                  showInNavbar: true,
                  blocks: [
                    { id: `b-${Date.now()}`, type: "hero", title: "Welcome to our Custom Page", content: "Add your descriptive content here.", imageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&fit=crop", buttonText: "Explore Now", buttonLink: "directory" }
                  ]
                });
                setIsEditingPage(true);
              }}
              className="px-4 py-2.5 bg-[#2c2a29] hover:bg-yellow-500 hover:text-black text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} /> Create Custom Page
            </button>
          </div>

          {/* If Editing/Creating Page Form */}
          {isEditingPage ? (
            <div className="bg-[#faf9f6] p-6 rounded-3xl border border-[#e5e1da] space-y-6 text-left">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <h4 className="font-display font-bold text-base text-[#2c2a29]">
                  {currentPageForm.id ? "Edit Custom Page" : "Create New Custom Page"}
                </h4>
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
                        {isPreviewingPage ? <Eye size={12} className="inline mr-1" /> : <Eye size={12} className="inline mr-1" />}
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
              {customPages.map(page => (
                <div key={page.id} className="p-5 bg-[#faf9f6] border border-[#e5e1da] rounded-2xl flex justify-between items-start shadow-2xs">
                  <div className="space-y-1.5 text-left pr-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-[#2c2a29]">{page.title}</h4>
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab D: Categories Manager */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 space-y-6">
          <h3 className="font-display text-lg font-bold text-[#2c2a29]">Manage Platform Photography special Categories</h3>

          <form onSubmit={handleCategorySubmit} className="flex gap-3 max-w-sm">
            <input
              type="text"
              required
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="e.g. Pet milestone portraiture..."
              className="flex-1 bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#2c2a29]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#2c2a29] text-white text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={14} /> Add Category
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3 bg-[#faf9f6] border border-[#e5e1da] rounded-xl flex justify-between items-center text-xs font-semibold text-[#2c2a29] shadow-2xs">
                <span>{cat.name}</span>
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Reviews Moderation */}
      {activeTab === "reviews" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-[#2c2a29]">Customer Reviews Moderation</h3>
              <p className="text-xs text-[#7c756d]">Approve or reject customer-submitted reviews before they appear publicly on studio profiles.</p>
            </div>
            <button
              onClick={() => {
                setReviewsLoading(true);
                fetch("/api/admin/reviews")
                  .then(r => r.json())
                  .then(d => { if (d.success) setAdminReviews(d.reviews); })
                  .finally(() => setReviewsLoading(false));
              }}
              className="text-xs bg-[#2c2a29] text-white px-3 py-2 rounded-xl font-bold hover:bg-[#44403c] transition-colors cursor-pointer"
            >↻ Refresh</button>
          </div>

          {reviewActionMsg && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl px-4 py-2">{reviewActionMsg}</div>
          )}

          {/* Load on tab open */}
          {adminReviews.length === 0 && !reviewsLoading && (
            <div className="py-6 text-center">
              <button
                onClick={() => {
                  setReviewsLoading(true);
                  fetch("/api/admin/reviews")
                    .then(r => r.json())
                    .then(d => { if (d.success) setAdminReviews(d.reviews); })
                    .finally(() => setReviewsLoading(false));
                }}
                className="text-xs text-[#7c756d] underline cursor-pointer"
              >Load all reviews</button>
            </div>
          )}

          {reviewsLoading && <div className="py-8 text-center text-xs text-[#7c756d] animate-pulse">Loading reviews…</div>}

          <div className="space-y-3">
            {adminReviews.map((rev) => {
              const studio = studios.find(s => s.id === rev.studioId);
              return (
                <div key={rev.id} className="border border-[#e5e1da] rounded-2xl p-4 space-y-3 bg-[#faf9f6]">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#2c2a29]">{rev.customerName}</span>
                        <span className="text-[10px] text-[#7c756d]">
                          {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)} ({rev.rating}/5)
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          rev.status === "approved" ? "bg-green-100 text-green-800" :
                          rev.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-amber-100 text-amber-800"
                        }`}>{rev.status}</span>
                      </div>
                      <p className="text-xs text-[#2c2a29] leading-relaxed">"{rev.comment}"</p>
                      <div className="flex gap-3 text-[10px] text-[#7c756d]">
                        <span>Studio: <strong>{studio?.name || rev.studioId}</strong></span>
                        <span>Booking: <strong>{rev.bookingId}</strong></span>
                        <span>{new Date(rev.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </div>
                      {rev.reply && (
                        <div className="mt-1 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-[10px] text-blue-800">
                          <span className="font-bold">Studio Reply:</span> {rev.reply}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1.5 min-w-fit">
                      {rev.status !== "approved" && (
                        <button
                          onClick={() => {
                            fetch(`/api/admin/reviews/${rev.id}/approve`, { method: "PUT" })
                              .then(r => r.json())
                              .then(d => {
                                if (d.success) {
                                  setAdminReviews(prev => prev.map(r => r.id === rev.id ? d.review : r));
                                  setReviewActionMsg(`✅ Review by ${rev.customerName} approved.`);
                                  setTimeout(() => setReviewActionMsg(""), 3000);
                                  onRefresh();
                                }
                              });
                          }}
                          className="text-[10px] bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-700 transition-colors cursor-pointer"
                        >✓ Approve</button>
                      )}
                      {rev.status !== "rejected" && (
                        <button
                          onClick={() => {
                            fetch(`/api/admin/reviews/${rev.id}/reject`, { method: "PUT" })
                              .then(r => r.json())
                              .then(d => {
                                if (d.success) {
                                  setAdminReviews(prev => prev.map(r => r.id === rev.id ? d.review : r));
                                  setReviewActionMsg(`🚫 Review by ${rev.customerName} rejected.`);
                                  setTimeout(() => setReviewActionMsg(""), 3000);
                                  onRefresh();
                                }
                              });
                          }}
                          className="text-[10px] bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition-colors cursor-pointer"
                        >✗ Reject</button>
                      )}
                      <button
                        onClick={() => {
                          if (!confirm("Permanently delete this review? This cannot be undone.")) return;
                          fetch(`/api/admin/reviews/${rev.id}`, { method: "DELETE" })
                            .then(r => r.json())
                            .then(d => {
                              if (d.success) {
                                setAdminReviews(prev => prev.filter(r => r.id !== rev.id));
                                setReviewActionMsg(`🗑 Review deleted.`);
                                setTimeout(() => setReviewActionMsg(""), 3000);
                                onRefresh();
                              }
                            });
                        }}
                        className="text-[10px] bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-300 transition-colors cursor-pointer"
                      >Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {adminReviews.length > 0 && (
            <div className="text-[10px] text-[#7c756d] text-center pt-2">
              Total: {adminReviews.length} reviews · Pending: {adminReviews.filter(r => r.status === "pending").length} · Approved: {adminReviews.filter(r => r.status === "approved").length} · Rejected: {adminReviews.filter(r => r.status === "rejected").length}
            </div>
          )}
        </div>
      )}

      {/* Tab E: Platform Audit Log Ledger */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-3xl border border-[#e5e1da] shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-[#2c2a29]">Platform Immutable Security Audit Trail</h3>
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
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
                  className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2.5 font-bold text-gray-800 focus:outline-none focus:border-[#2c2a29]"
                >
                  <option value="CUSTOMER">Customer Account</option>
                  <option value="STUDIO_ADMIN">Studio Owner / Admin</option>
                  <option value="STUDIO_STAFF">Studio Staff Member</option>
                  <option value="SUPER_ADMIN">System Super Admin</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserFullName}
                  onChange={e => setNewUserFullName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    placeholder="maria@gmail.com"
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    placeholder="Secure password"
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    value={newUserContact}
                    onChange={e => setNewUserContact(e.target.value)}
                    placeholder="+63 900 000 0000"
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Home Address</label>
                  <input
                    type="text"
                    value={newUserAddress}
                    onChange={e => setNewUserAddress(e.target.value)}
                    placeholder="Cainta, Rizal"
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>
              </div>

              {newRole === "STUDIO_STAFF" && (
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Assigned Studio</label>
                  <select
                    value={newUserStudioId}
                    onChange={e => setNewUserStudioId(e.target.value)}
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2c2a29]"
                  >
                    <option value="">Select Studio...</option>
                    {studios.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userCreateLoading}
                  className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-extrabold shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} />
                  {userCreateLoading ? "Creating..." : "Create User Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </main>
      </div>

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
                  onClick={() => setSelectedDocPreview(null)}
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
