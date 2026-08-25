import React, { useState, useEffect } from "react";
import { Camera, Calendar, LogIn, LogOut, Shield, Briefcase, User, Bell, Printer, Heart, Menu, X, Home, Compass, Volume2, VolumeX, Sparkles, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserRole } from "../db/types.ts";
import { SoundEngine } from "../utils/soundEffects.ts";

interface NavbarProps {
  currentUser: any | null;
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
  favoritesCount: number;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  systemSettings?: any;
  customPages?: any[];
}

export default function Navbar({
  currentUser,
  onNavigate,
  currentPage,
  onLogout,
  favoritesCount,
  unreadNotifications,
  onOpenNotifications,
  systemSettings,
  customPages = []
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(true);

  useEffect(() => {
    setSoundActive(SoundEngine.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const newState = SoundEngine.toggleSound();
    setSoundActive(newState);
    if (newState) {
      SoundEngine.playWelcomeAudio(true);
    }
  };

  const handleNav = (page: string) => {
    SoundEngine.playPop();
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5e1da] shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Platform Name */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNav("landing")}>
              <motion.div 
                whileHover={{ scale: 1.08, rotate: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#2c2a29] text-yellow-400 p-2 rounded-xl flex items-center justify-center shadow-md border border-white/10 group-hover:bg-yellow-500 group-hover:text-black transition-colors"
              >
                <Camera size={20} className="stroke-[2.2]" />
              </motion.div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#2c2a29] block leading-tight">
                    Cainta Photo MIS
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-yellow-500/20 text-yellow-800 border border-yellow-500/30">
                    2026
                  </span>
                </div>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-[#7c756d] font-semibold leading-none">
                  Rizal Creative Studio Hub
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => handleNav("landing")}
                className={`text-sm font-semibold transition-all cursor-pointer py-1 px-2.5 rounded-lg ${
                  currentPage === "landing" 
                    ? "text-[#2c2a29] bg-[#faf9f6] font-bold shadow-xs border border-[#e5e1da]" 
                    : "text-[#7c756d] hover:text-[#2c2a29] hover:bg-gray-50"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNav("directory")}
                className={`text-sm font-semibold transition-all cursor-pointer py-1 px-2.5 rounded-lg ${
                  currentPage === "directory" 
                    ? "text-[#2c2a29] bg-[#faf9f6] font-bold shadow-xs border border-[#e5e1da]" 
                    : "text-[#7c756d] hover:text-[#2c2a29] hover:bg-gray-50"
                }`}
              >
                Explore Studios
              </button>

              {/* Dynamic Custom Pages rendered in Navbar */}
              {customPages
                .filter((p: any) => p.isPublished && p.showInNavbar)
                .map((page: any) => (
                  <button
                    key={page.id}
                    onClick={() => handleNav(`custom-page-${page.slug}`)}
                    className={`text-sm font-semibold transition-all cursor-pointer py-1 px-2.5 rounded-lg ${
                      currentPage === `custom-page-${page.slug}` 
                        ? "text-[#2c2a29] bg-[#faf9f6] font-bold shadow-xs border border-[#e5e1da]" 
                        : "text-[#7c756d] hover:text-[#2c2a29] hover:bg-gray-50"
                    }`}
                  >
                    {page.title}
                  </button>
                ))}

              {currentUser && currentUser.role === UserRole.CUSTOMER && (
                <>
                  <button
                    onClick={() => handleNav("customer-dashboard")}
                    className={`text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
                      currentPage === "customer-dashboard" 
                        ? "text-[#2c2a29] bg-[#faf9f6] font-bold shadow-xs border border-[#e5e1da]" 
                        : "text-[#7c756d] hover:text-[#2c2a29] hover:bg-gray-50"
                    }`}
                  >
                    <Calendar size={15} className="text-yellow-600" /> My Bookings
                  </button>
                  <button
                    onClick={() => handleNav("customer-dashboard-prints")}
                    className={`text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
                      currentPage === "customer-dashboard-prints" 
                        ? "text-[#2c2a29] bg-[#faf9f6] font-bold shadow-xs border border-[#e5e1da]" 
                        : "text-[#7c756d] hover:text-[#2c2a29] hover:bg-gray-50"
                    }`}
                  >
                    <Printer size={15} className="text-yellow-600" /> Print Orders
                  </button>
                </>
              )}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Sound FX Audio Toggle Button */}
              <button
                type="button"
                onClick={handleToggleSound}
                className={`p-2 min-h-[40px] min-w-[40px] rounded-full transition-all cursor-pointer flex items-center justify-center border ${
                  soundActive 
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200 shadow-xs hover:bg-yellow-100" 
                    : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"
                }`}
                title={soundActive ? "Studio Audio FX: On (Click to Mute)" : "Studio Audio FX: Muted (Click to Enable)"}
              >
                {soundActive ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>

              {currentUser ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Favorites Shortcut (Customers) */}
                  {currentUser.role === UserRole.CUSTOMER && (
                    <button 
                      onClick={() => handleNav("customer-dashboard")}
                      className="p-2 min-h-[40px] min-w-[40px] rounded-full hover:bg-[#faf9f6] text-[#7c756d] hover:text-red-500 relative transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-[#e5e1da]"
                      title="Saved Studios"
                    >
                      <Heart size={18} className={favoritesCount > 0 ? "fill-red-500 text-red-500" : ""} />
                      {favoritesCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black shadow">
                          {favoritesCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Notifications Bell */}
                  <button 
                    onClick={() => {
                      SoundEngine.playPop();
                      onOpenNotifications();
                    }}
                    className="p-2 min-h-[40px] min-w-[40px] rounded-full hover:bg-[#faf9f6] text-[#7c756d] hover:text-[#2c2a29] relative transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-[#e5e1da]"
                    title="Notifications"
                  >
                    <Bell size={18} />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-0 right-0 bg-[#d97706] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black shadow animate-pulse">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Role badges and Direct Action buttons */}
                  {currentUser.role === UserRole.SUPER_ADMIN && (
                    <button
                      onClick={() => handleNav("admin-dashboard")}
                      className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe] rounded-full font-bold hover:bg-[#dbeafe] transition-colors cursor-pointer shadow-xs"
                    >
                      <Shield size={14} /> Super Admin
                    </button>
                  )}

                  {currentUser.role === UserRole.STUDIO_ADMIN && (
                    <button
                      onClick={() => handleNav("studio-dashboard")}
                      className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] rounded-full font-bold hover:bg-[#fee2e2] transition-colors cursor-pointer shadow-xs"
                    >
                      <Briefcase size={14} /> Studio Portal
                    </button>
                  )}

                  {/* User avatar display */}
                  <button
                    onClick={() => handleNav("account-settings")}
                    className="p-2 min-h-[40px] min-w-[40px] rounded-full hover:bg-[#faf9f6] text-[#7c756d] hover:text-[#2c2a29] transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-[#e5e1da]"
                    title="Account settings"
                  >
                    <Settings size={18} />
                  </button>
                  <div className="flex items-center gap-2 pl-1">
                    <div className="w-8 h-8 rounded-full bg-[#2c2a29] text-yellow-400 border border-[#2c2a29] flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {currentUser.fullName.charAt(0)}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-bold text-[#2c2a29] leading-tight">{currentUser.fullName}</p>
                      <p className="text-[10px] text-[#7c756d] leading-none capitalize font-medium">{currentUser.role.replace("_", " ").toLowerCase()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      SoundEngine.playPop();
                      onLogout();
                    }}
                    className="p-2 min-h-[40px] text-[#7c756d] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer hidden md:block"
                    title="Sign Out"
                  >
                    <LogOut size={17} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNav("login")}
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-2 bg-[#2c2a29] hover:bg-[#4a4644] text-[#faf9f6] rounded-full shadow-md transition-all cursor-pointer min-h-[40px]"
                  >
                    <LogIn size={15} className="text-yellow-400" /> Sign In
                  </button>
                </div>
              )}

              {/* Mobile Hamburger Drawer Button */}
              <button
                onClick={() => {
                  SoundEngine.playPop();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className="md:hidden p-2 min-h-[40px] min-w-[40px] rounded-xl text-[#2c2a29] hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-[#e5e1da] px-4 pt-2 pb-4 space-y-3 text-left shadow-xl overflow-hidden"
            >
              <div className="space-y-1">
                <button
                  onClick={() => handleNav("landing")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                    currentPage === "landing" ? "bg-[#2c2a29] text-white" : "text-[#2c2a29] hover:bg-gray-50"
                  }`}
                >
                  <Home size={16} /> Home
                </button>
                <button
                  onClick={() => handleNav("directory")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                    currentPage === "directory" ? "bg-[#2c2a29] text-white" : "text-[#2c2a29] hover:bg-gray-50"
                  }`}
                >
                  <Compass size={16} /> Explore Studios
                </button>

                {currentUser && currentUser.role === UserRole.CUSTOMER && (
                  <>
                    <button
                      onClick={() => handleNav("customer-dashboard")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                        currentPage === "customer-dashboard" ? "bg-[#2c2a29] text-white" : "text-[#2c2a29] hover:bg-gray-50"
                      }`}
                    >
                      <Calendar size={16} /> My Bookings
                    </button>
                    <button
                      onClick={() => handleNav("customer-dashboard-prints")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                        currentPage === "customer-dashboard-prints" ? "bg-[#2c2a29] text-white" : "text-[#2c2a29] hover:bg-gray-50"
                      }`}
                    >
                      <Printer size={16} /> Print Orders
                    </button>
                  </>
                )}

                {currentUser && (currentUser.role === UserRole.STUDIO_ADMIN || currentUser.role === UserRole.STUDIO_STAFF) && (
                  <button
                    onClick={() => handleNav("studio-dashboard")}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                      currentPage === "studio-dashboard" ? "bg-red-700 text-white" : "text-red-700 hover:bg-red-50"
                    }`}
                  >
                    <Briefcase size={16} /> {currentUser.role === UserRole.STUDIO_STAFF ? "Staff Operations" : "Studio Admin Dashboard"}
                  </button>
                )}

                {currentUser && currentUser.role === UserRole.SUPER_ADMIN && (
                  <button
                    onClick={() => handleNav("admin-dashboard")}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                      currentPage === "admin-dashboard" ? "bg-blue-700 text-white" : "text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    <Shield size={16} /> Super Admin Dashboard
                  </button>
                )}

                {currentUser && (
                  <button
                    onClick={() => handleNav("account-settings")}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                      currentPage === "account-settings" ? "bg-yellow-500 text-black" : "text-[#2c2a29] hover:bg-yellow-50"
                    }`}
                  >
                    <Settings size={16} /> My Account & Password
                  </button>
                )}
              </div>

              {currentUser && (
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2c2a29] text-yellow-400 font-bold text-xs flex items-center justify-center">
                      {currentUser.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2c2a29]">{currentUser.fullName}</p>
                      <p className="text-[10px] text-[#7c756d] capitalize">{currentUser.role.replace("_", " ").toLowerCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      SoundEngine.playPop();
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modern Mobile App Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e5e1da] md:hidden px-2 py-1.5 shadow-lg flex items-center justify-around text-[10px] font-bold text-[#7c756d]">
        <button
          onClick={() => handleNav("landing")}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg cursor-pointer ${
            currentPage === "landing" ? "text-[#2c2a29] font-black" : "hover:text-[#2c2a29]"
          }`}
        >
          <Home size={18} />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNav("directory")}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg cursor-pointer ${
            currentPage === "directory" ? "text-[#2c2a29] font-black" : "hover:text-[#2c2a29]"
          }`}
        >
          <Compass size={18} />
          <span>Explore</span>
        </button>

        {currentUser ? (
          currentUser.role === UserRole.CUSTOMER ? (
            <button
              onClick={() => handleNav("customer-dashboard")}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-lg cursor-pointer ${
                currentPage === "customer-dashboard" || currentPage === "customer-dashboard-prints"
                  ? "text-[#2c2a29] font-black"
                  : "hover:text-[#2c2a29]"
              }`}
            >
              <Calendar size={18} />
              <span>Bookings</span>
            </button>
          ) : currentUser.role === UserRole.STUDIO_ADMIN || currentUser.role === UserRole.STUDIO_STAFF ? (
            <button
              onClick={() => handleNav("studio-dashboard")}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-lg cursor-pointer ${
                currentPage === "studio-dashboard" ? "text-red-700 font-black" : "hover:text-red-700"
              }`}
            >
              <Briefcase size={18} />
              <span>Studio</span>
            </button>
          ) : (
            <button
              onClick={() => handleNav("admin-dashboard")}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-lg cursor-pointer ${
                currentPage === "admin-dashboard" ? "text-blue-700 font-black" : "hover:text-blue-700"
              }`}
            >
              <Shield size={18} />
              <span>Admin</span>
            </button>
          )
        ) : (
          <button
            onClick={() => handleNav("login")}
            className="flex flex-col items-center gap-0.5 p-1 rounded-lg hover:text-[#2c2a29] cursor-pointer"
          >
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
        )}

        <button
          onClick={() => {
            SoundEngine.playPop();
            onOpenNotifications();
          }}
          className="flex flex-col items-center gap-0.5 p-1 rounded-lg relative cursor-pointer"
        >
          <Bell size={18} />
          <span>Alerts</span>
          {unreadNotifications > 0 && (
            <span className="absolute top-0 right-2 bg-[#d97706] text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-black">
              {unreadNotifications}
            </span>
          )}
        </button>
      </nav>
    </>
  );
}
