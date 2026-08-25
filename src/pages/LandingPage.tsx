import React, { useState } from "react";
import { Camera, Search, ArrowRight, Star, Heart, CheckCircle2, ChevronRight, HelpCircle, Map, MapPin, Sparkles, Sliders, Calendar, ShieldCheck, Flame, Award, Clock, Check, Layers, Image as ImageIcon, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Interactive3DTiltCard, MagnetButton, ScrollReveal, StudioPriceEstimator } from "../components/MotionCard.tsx";
import { SoundEngine } from "../utils/soundEffects.ts";
import { SystemCalendar } from "../components/SystemCalendar.tsx";

interface LandingPageProps {
  studios: any[];
  categories: any[];
  onNavigate: (page: string, params?: any) => void;
  favorites: any[];
  onToggleFavorite: (studioId: string) => void;
  cms?: { [key: string]: string };
  bookings?: any[];
  onRequestBookingDate?: (dateStr: string, studioId?: string) => void;
}

export default function LandingPage({
  studios,
  categories,
  onNavigate,
  favorites,
  onToggleFavorite,
  cms,
  bookings = [],
  onRequestBookingDate
}: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedHeroTab, setSelectedHeroTab] = useState(0);
  const [selectedStudioFilter, setSelectedStudioFilter] = useState<string>("ALL");

  const getCmsValue = (key: string, fallback: string) => {
    return cms && cms[key] ? cms[key] : fallback;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    SoundEngine.playPop();
    onNavigate("directory", { search: searchQuery });
  };

  const handleCategoryClick = (catName: string) => {
    SoundEngine.playPop();
    onNavigate("directory", { category: catName });
  };

  // Map actual studios from props only — no hardcoded fallback data
  const heroShowcases = studios.map((s) => ({
    id: s.id,
    concept: s.categories?.[0] || "Portraiture & Events",
    studioName: s.name,
    location: s.location || "Cainta, Rizal",
    price: `₱${s.startingPrice?.toLocaleString() || '1,000'}`,
    rating: s.rating ? s.rating.toFixed(1) : "—",
    reviews: s.reviewCount ? String(s.reviewCount) : "0",
    image: s.coverImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&fit=crop",
    badge: s.isApproved ? "Verified Studio" : "Pending Verification",
    highlights: s.categories || ["Professional Lighting", "Online Booking", "Fast Proofing"]
  }));

  const activeShowcase = heroShowcases[selectedHeroTab] || heroShowcases[0];
  const dynamicStats = [
    { label: "Studio Listings", value: String(studios.length) },
    { label: "Categories", value: String(categories.length) },
    { label: "Bookings", value: String(bookings.length) },
    { label: "Status", value: studios.length ? "Live" : "Empty" }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-24 md:pb-16 bg-[#fcfbf9] text-[#1c1917]">
      {/* 1. EDITORIAL LIGHT LUXURY HERO SECTION (WITHOUT RIGHT PREVIEW CARD) */}
      <section className="relative min-h-[580px] bg-[#f5f2ed] text-[#1c1917] flex items-center justify-center overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-b border-[#e5e0d8]">
        {/* Subtle Ambient Warm Glow */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_30%,rgba(217,119,6,0.1)_0%,transparent_60%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 w-full space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-xs border border-[#e5e0d8] text-xs text-[#2c2a29] font-semibold mx-auto"
          >
            <Sparkles size={14} className="text-amber-600" />
            <span>CAINTA'S PREMIER PHOTO STUDIO PLATFORM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-gray-400 font-normal">Verified Studio MIS</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-[#1c1917]"
          >
            <span dangerouslySetInnerHTML={{ __html: getCmsValue("heroTitle", "Capture Moments. <br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700'>Cherish Forever.</span>") }} />
          </motion.h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            {getCmsValue("heroSubtitle", "Discover and book top-rated photography studios in Cainta. From portraits to events, we help you capture your best moments.")}
          </p>

          {/* CTA Buttons: Book a Studio & Watch Video */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                SoundEngine.playPop();
                onNavigate("directory");
              }}
              className="px-8 py-4 bg-gradient-to-r from-[#1c1917] to-[#3a3532] hover:bg-black text-white text-xs sm:text-sm font-black rounded-full shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:scale-95"
            >
              <Calendar size={16} className="text-amber-400" /> Book a Studio
            </button>
            <button
              type="button"
              onClick={() => {
                SoundEngine.playPop();
                alert("Playing Cainta Photography Studio Video Showcase...");
              }}
              className="px-7 py-4 bg-white hover:bg-gray-50 text-[#1c1917] text-xs sm:text-sm font-bold rounded-full shadow-xs border border-[#e5e0d8] transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                ▶
              </div>
              Watch Video
            </button>
          </div>

          {/* High Precision Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex bg-white rounded-2xl sm:rounded-full p-2.5 shadow-xl items-center border border-[#e5e0d8] focus-within:ring-2 focus-within:ring-amber-500 transition-all">
            <div className="flex-1 flex items-center pl-3">
              <Search size={18} className="text-gray-400 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search 'Lumina', 'Graduation', 'Self-shoot', 'Family'..."
                className="w-full text-[#1c1917] text-xs sm:text-sm bg-transparent border-0 focus:outline-none placeholder-gray-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-600 text-white hover:bg-amber-700 px-7 py-3 rounded-xl sm:rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              Find Studios <ArrowRight size={14} />
            </button>
          </form>

          {/* Platform Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[#e5e0d8] max-w-3xl mx-auto">
            {dynamicStats.map((stat) => (
              <div key={stat.label}>
                <span className="block font-display text-2xl sm:text-3xl font-black text-amber-700">{stat.value}</span>
                <span className="text-xs text-gray-500 leading-tight block">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. PHOTOGRAPHY CATEGORIES */}
      <ScrollReveal direction="up" delay={0.1}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-2">
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#7c756d]">Studio Offerings</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c2a29]">Explore Specialized Categories</h2>
            <div className="h-0.5 w-12 bg-yellow-500 mx-auto" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {categories.map((cat) => (
              <Interactive3DTiltCard
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className="p-4 bg-white border border-[#e5e1da] rounded-2xl cursor-pointer text-center flex flex-col items-center justify-center min-h-[125px] w-full hover:border-yellow-500/50 group transition-all shadow-sm"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#faf9f6] border border-[#e5e1da] text-[#2c2a29] flex items-center justify-center mb-2.5 group-hover:bg-[#2c2a29] group-hover:text-yellow-400 group-hover:rotate-6 transition-all shadow-sm">
                  <Camera size={18} />
                </div>
                <h4 className="font-bold text-xs text-[#2c2a29] leading-snug group-hover:text-yellow-700 transition-colors">
                  {cat.name}
                </h4>
                <span className="text-[10px] text-gray-400 mt-1 font-medium">Accredited Studios</span>
              </Interactive3DTiltCard>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* LIVE AVAILABILITY & BOOKING CALENDAR SECTION */}
      <ScrollReveal direction="up" delay={0.12}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-left space-y-2">
              <span className="text-[10px] tracking-wider uppercase font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                <Calendar size={12} /> Real-Time Schedule & Availability
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c2a29]">
                Studio Availability & Booked Dates Calendar
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                Check booked days and available time slots across Cainta partner studios in real-time. Select any date on the calendar to view active photoshoot schedules.
              </p>
            </div>

            {/* Studio Filter Dropdown for Calendar */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#e5e1da] shadow-xs">
              <span className="text-xs font-bold text-gray-500 pl-2">Studio:</span>
              <select
                value={selectedStudioFilter}
                onChange={(e) => setSelectedStudioFilter(e.target.value)}
                className="bg-[#faf9f6] text-[#2c2a29] text-xs font-bold px-3 py-2 rounded-xl border border-[#e5e1da] focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">All Cainta Studios (Master Schedule)</option>
                {studios.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.location || 'Cainta'})</option>
                ))}
              </select>
            </div>
          </div>

          <SystemCalendar
            bookings={bookings && selectedStudioFilter !== "ALL" ? bookings.filter(b => b.studioId === selectedStudioFilter) : bookings}
            userRole="CUSTOMER"
            onSelectBooking={(b) => {
              SoundEngine.playPop();
            }}
            onRequestBookingDate={(dateStr) => {
              SoundEngine.playPop();
              if (onRequestBookingDate) onRequestBookingDate(dateStr, selectedStudioFilter);
            }}
          />
        </section>
      </ScrollReveal>

      {/* 3. REVISED STUDIO STANDARDS & SERVICE GUARANTEES (CLEAN & PROFESSIONAL) */}
      <ScrollReveal direction="up" delay={0.15}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#faf9f6] rounded-3xl p-6 sm:p-10 border border-[#e5e1da] shadow-sm space-y-8 text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e1da] pb-6">
              <div className="space-y-2">
                <span className="text-[10px] tracking-wider uppercase font-bold text-yellow-700 bg-yellow-100/70 px-3 py-1 rounded-full border border-yellow-200 inline-block">
                  Verified Quality Assurance
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c2a29]">
                  Why Book Through Cainta Photography Studio MIS
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                  Every partner studio in Cainta is rigorously audited for lighting equipment, calibrated color profiles, hygiene standards, and punctual photo delivery.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { SoundEngine.playPop(); onNavigate("directory"); }}
                className="px-5 py-2.5 bg-[#2c2a29] hover:bg-[#4a4644] text-[#faf9f6] text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
              >
                Browse All Studios <ArrowRight size={14} className="text-yellow-400" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-[#e5e1da] space-y-3 shadow-sm hover:border-yellow-500/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 text-yellow-800 flex items-center justify-center font-bold">
                  <Calendar size={20} />
                </div>
                <h4 className="font-bold text-sm text-[#2c2a29]">Real-Time Schedule Lock</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Synchronized database schedules guarantee your reserved date and time slot without double bookings or waiting lines.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e5e1da] space-y-3 shadow-sm hover:border-yellow-500/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-800 flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="font-bold text-sm text-[#2c2a29]">Accredited Creative Setups</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Equipped with professional studio strobes, sanitized graduation togas, multiple seamless backdrops, and dedicated HMUA powder rooms.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e5e1da] space-y-3 shadow-sm hover:border-yellow-500/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-800 flex items-center justify-center font-bold">
                  <Zap size={20} />
                </div>
                <h4 className="font-bold text-sm text-[#2c2a29]">Fast High-Res Delivery</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Access watermarked drafts, review master retouches, and download full-resolution ZIP archives directly in your dashboard in 48 hours.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e5e1da] space-y-3 shadow-sm hover:border-yellow-500/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-800 flex items-center justify-center font-bold">
                  <ImageIcon size={20} />
                </div>
                <h4 className="font-bold text-sm text-[#2c2a29]">Artisan Wood & Canvas Prints</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Order archival 8x10, 11x14, or 16x20 wood canvas frames crafted by local Rizal artisans, delivered straight to your home.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 4. FEATURED STUDIOS WITH REAL-TIME RATINGS & 3D TILT */}
      <ScrollReveal direction="up" delay={0.2}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="text-left space-y-1">
              <span className="text-[10px] tracking-wider uppercase font-bold text-[#7c756d]">Verified Local Studios</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c2a29]">Spotlight Studios in Cainta, Rizal</h2>
            </div>
            <button 
              onClick={() => { SoundEngine.playPop(); onNavigate("directory"); }}
              className="text-xs font-bold text-[#2c2a29] flex items-center gap-1 hover:text-yellow-700 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Explore Full Studio Directory <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {studios.slice(0, 3).map((st) => {
              const isFav = favorites.some(f => f.studioId === st.id);
              return (
                <Interactive3DTiltCard
                  key={st.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#e5e1da] flex flex-col h-full w-full shadow-md hover:shadow-xl transition-shadow"
                >
                  {/* Studio Cover & Ribbon */}
                  <div className="h-48 relative bg-gray-100 overflow-hidden group">
                    <img
                      src={st.coverImage}
                      alt={st.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        SoundEngine.playPop();
                        onToggleFavorite(st.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-gray-500 hover:text-red-500 transition-colors shadow-sm cursor-pointer z-30"
                    >
                      <Heart size={16} className={isFav ? "fill-red-500 text-red-500" : ""} />
                    </button>

                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="bg-[#2c2a29]/90 backdrop-blur-sm text-yellow-400 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-black flex items-center gap-1 border border-white/10">
                        <MapPin size={11} />
                        Cainta, Rizal
                      </span>
                      {st.isApproved && (
                        <span className="bg-emerald-600 text-white text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1 shadow">
                          <ShieldCheck size={11} /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Studio Details */}
                  <div className="p-5 text-left flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 font-bold flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                          <Star size={13} className="fill-yellow-500 text-yellow-500" />
                          {st.rating} ({st.reviewCount} reviews)
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {st.category || "Portraiture"}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-[#2c2a29] text-lg leading-tight">{st.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{st.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#e5e1da] flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Starting at</span>
                        <span className="text-base font-black text-[#2c2a29] font-display">₱{st.startingPrice?.toLocaleString()}</span>
                      </div>
                      <MagnetButton
                        sound="pop"
                        onClick={() => onNavigate("profile", { id: st.id })}
                        className="px-4 py-2 bg-[#2c2a29] hover:bg-[#4a4644] text-[#faf9f6] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        View Studio
                      </MagnetButton>
                    </div>
                  </div>
                </Interactive3DTiltCard>
              );
            })}
          </div>
        </section>
      </ScrollReveal>

      {/* 5. INTERACTIVE LIVE STUDIO COST CALCULATOR */}
      <ScrollReveal direction="up" delay={0.15}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StudioPriceEstimator
            onBookNow={(summary) => {
              onNavigate("directory");
            }}
          />
        </section>
      </ScrollReveal>

      {/* 6. HOW THE PLATFORM WORKS */}
      <ScrollReveal direction="up" delay={0.15}>
        <section className="bg-white border-y border-[#e5e1da] py-16 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-12">
            <div className="space-y-2">
              <span className="text-[10px] tracking-wider uppercase font-bold text-[#7c756d]">Academic & Commercial Workflow</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c2a29]">Seamless 3-Step Booking Journey</h2>
              <div className="h-0.5 w-12 bg-yellow-500 mx-auto" />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3 p-6 bg-[#faf9f6] rounded-2xl border border-[#e5e1da] shadow-sm text-left">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-700 flex items-center justify-center font-display text-lg font-black">
                  1
                </div>
                <h4 className="font-bold text-sm text-[#2c2a29]">Discover & Compare Studios</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Filter packages, add-ons (HMUA, Toga, USB Raw), review sample albums, and check live calendar dates in Cainta.
                </p>
              </div>

              <div className="space-y-3 p-6 bg-[#faf9f6] rounded-2xl border border-[#e5e1da] shadow-sm text-left">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-700 flex items-center justify-center font-display text-lg font-black">
                  2
                </div>
                <h4 className="font-bold text-sm text-[#2c2a29]">Book Slot & Pay Downpayment</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Select your date/time slot, upload GCash or Maya payment receipt, and receive an instant PDF booking confirmation pass.
                </p>
              </div>

              <div className="space-y-3 p-6 bg-[#faf9f6] rounded-2xl border border-[#e5e1da] shadow-sm text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-display text-lg font-black">
                  3
                </div>
                <h4 className="font-bold text-sm text-[#2c2a29]">Download & Order Custom Prints</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Access client-proofed high-res photos, select favorites, and configure custom 8x10 or 16x20 wood canvas wall frames.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 7. VERIFIED REVIEWS */}
      <ScrollReveal direction="up" delay={0.1}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#7c756d]">Verified Clients</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c2a29]">Loved by Students & Families in Rizal</h2>
          </div>

          <div className="grid md:grid-cols-1 gap-6">
            {bookings.length > 0 || studios.length > 0 ? (
              <div className="rounded-2xl border border-[#e5e1da] bg-white p-8 text-center text-sm text-[#2c2a29] shadow-sm">
                Reviews will appear here once clients submit verified feedback for approved studios.
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#e5e1da] bg-[#faf9f6] p-8 text-center text-sm text-gray-500">
                No verified client reviews yet. This section will populate after real bookings and reviews are recorded.
              </div>
            )}
          </div>
        </section>
      </ScrollReveal>

      {/* 8. FAQ INTERACTIVE ACCORDION */}
      <ScrollReveal direction="up" delay={0.1}>
        <section className="max-w-4xl mx-auto px-4 text-left space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#7c756d]">Questions & Policies</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c2a29]">Frequently Asked Questions</h2>
          </div>

          <div className="bg-white border border-[#e5e1da] rounded-2xl divide-y divide-[#e5e1da] shadow-sm overflow-hidden">
            {[
              {
                q: "How does the system prevent double bookings for the same studio slot?",
                a: "Our system synchronizes real-time calendar reservations directly with the studio's schedule. As soon as a client confirms a date and time slot with their downpayment, that slot is instantly marked booked and locked in our database."
              },
              {
                q: "What payment methods are supported for booking downpayments?",
                a: "We support GCash, Maya (PayMaya), direct Bank Transfer (BDO / BPI / UnionBank), and In-Studio Cash. Uploading your transaction reference or receipt automatically updates your booking status."
              },
              {
                q: "How soon are final retouched digital photos released?",
                a: "Standard turnaround time is 2 to 4 business days. Studios upload your proofing gallery directly to your Customer Dashboard where you can download full-resolution ZIP archives or order custom framed prints."
              },
              {
                q: "Can I customize print sizes and frames for my graduation portraits?",
                a: "Yes! Use our interactive Print Order Wizard to choose between 8x10, 11x14, 16x20, and 24x36 sizes with Natural Oak, Obsidian Charcoal, Brushed Gold, or Frameless Canvas finishes."
              }
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => {
                      SoundEngine.playPop();
                      setActiveFaq(isOpen ? null : idx);
                    }}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#2c2a29] hover:bg-[#faf9f6] cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle size={16} className="text-yellow-600 flex-shrink-0" />
                      {faq.q}
                    </span>
                    <span className="text-lg font-mono text-gray-400">{isOpen ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 pt-1 text-xs text-gray-500 leading-relaxed border-t border-[#faf9f6]">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </ScrollReveal>

      {/* FOOTER */}
      <footer className="border-t border-[#e5e1da] pt-12 text-[#7c756d] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8 text-left">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-yellow-600" />
              <span className="font-display text-base font-bold text-[#2c2a29]">Cainta Photo MIS</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Academic & Commercial Management Information System designed for professional studio discovery, scheduling calendars, printing sales ledger reports, and AI Chatbot assistance in Cainta, Rizal.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-[#2c2a29] mb-3">Photography Services</h5>
            <ul className="space-y-2 text-[11px]">
              <li>Graduation & Toga Portraits</li>
              <li>Wedding & Pre-Debut Shoots</li>
              <li>Self-Shoot Creative Booths</li>
              <li>Commercial & Product Catalog</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-[#2c2a29] mb-3">System Assurance</h5>
            <ul className="space-y-2 text-[11px]">
              <li>No Double Booking Guarantee</li>
              <li>Studio Accreditation Verification</li>
              <li>Instant GCash/Maya Proofing</li>
              <li>Full Audit Log Ledger</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-[#2c2a29] mb-3">Technology Stack</h5>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Full-Stack Express.js, React 18, Vite, Framer Motion, Web Audio API Sound Synthesizer, and Google Gemini Studio AI.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#e5e1da] mt-12 py-6 text-center text-[10px] text-gray-400">
          &copy; 2026 Cainta Photography Studio MIS. Developed in Rizal, Philippines. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
