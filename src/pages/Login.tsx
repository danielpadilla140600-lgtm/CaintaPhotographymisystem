import React, { useState } from "react";
import { LogIn, Key, Mail, ShieldAlert, Sparkles, User, Camera, Shield, Briefcase, Upload, FileCheck, FileText, CheckCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserRole } from "../db/types.ts";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  onNavigate: (page: string) => void;
}

export default function Login({ onLoginSuccess, onNavigate }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  
  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register form
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regFullName, setRegFullName] = useState("");
  const [regContact, setRegContact] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regRole, setRegRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [regStudioName, setRegStudioName] = useState("");
  const [regBusinessPermit, setRegBusinessPermit] = useState("");
  const [regValidId, setRegValidId] = useState("");
  const [regOtherDocs, setRegOtherDocs] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "permit" | "validId" | "other") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === "permit") setRegBusinessPermit(base64);
      else if (type === "validId") setRegValidId(base64);
      else setRegOtherDocs(base64);
    };
    reader.readAsDataURL(file);
  };

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (data.success) {
        setForgotMsg({ text: data.message || "Password reset link sent to your email.", type: "success" });
      } else {
        setForgotMsg({ text: data.message || "Failed to send reset link.", type: "error" });
      }
    } catch {
      setForgotMsg({ text: "Failed to connect to authentication server.", type: "error" });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || "Invalid credentials.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (regRole === UserRole.STUDIO_ADMIN) {
      if (!regBusinessPermit || !regValidId) {
        setErrorMsg("Studio Owner registration requires uploading both a DTI/Business Permit and a Valid Government ID.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          fullName: regFullName,
          contactNumber: regContact,
          address: regAddress,
          role: regRole,
          studioName: regRole === UserRole.STUDIO_ADMIN ? regStudioName : undefined,
          businessPermit: regRole === UserRole.STUDIO_ADMIN ? regBusinessPermit : undefined,
          validId: regRole === UserRole.STUDIO_ADMIN ? regValidId : undefined,
          otherDocs: regRole === UserRole.STUDIO_ADMIN ? regOtherDocs : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.user) onLoginSuccess(data.user);
        else setErrorMsg(data.message || "Registration submitted for Admin approval.");
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl overflow-hidden border border-[#e5e1da] shadow-2xl grid md:grid-cols-12 min-h-[500px]">
        {/* Left Side: Creative Brand Intro */}
        <div className="md:col-span-5 bg-[#2c2a29] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&fit=crop')] bg-cover bg-center" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              <Camera size={14} className="text-yellow-500" />
              <span className="text-[10px] tracking-wider uppercase font-bold">Rizal Studio Network</span>
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight">Capture & Book Timeless Moments</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Cainta's centralized Management Information System connects photographers, creators, and customers with persistent schedules, quick downpayments, print configurations, and instant AI guidance.
            </p>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 text-xs text-gray-400">
            <span className="block font-semibold text-white">Centralized Studio Platform:</span>
            <p className="mt-1 text-gray-400 leading-relaxed">
              Sign in with your registered customer, studio admin, or super admin credentials to access your dashboard.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Card (Login or Register) */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!isRegister ? (
              // LOGIN FORM
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-left space-y-1">
                  <h3 className="font-display text-2xl font-bold text-[#2c2a29]">Welcome Back</h3>
                  <p className="text-xs text-[#7c756d]">Manage photography bookings, print sales, and studio reviews.</p>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                    <ShieldAlert size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#2c2a29]">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-[#7c756d]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. your-email@example.com"
                        className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2c2a29]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-[#2c2a29]">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setForgotMsg(null);
                          setShowForgotModal(true);
                        }}
                        className="text-[11px] text-[#7c756d] hover:text-[#2c2a29] font-medium hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Key size={16} className="absolute left-3.5 top-3.5 text-[#7c756d]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-[#2c2a29]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(value => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        title={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c756d] hover:text-[#2c2a29] cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#2c2a29] hover:bg-[#4a4644] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn size={16} />
                    {loading ? "Signing In..." : "Sign In to Account"}
                  </button>
                </form>

                <div className="text-xs text-gray-500 pt-4 border-t border-gray-100 flex justify-between">
                  <span>Don't have an account?</span>
                  <button onClick={() => setIsRegister(true)} className="text-[#2c2a29] font-bold hover:underline cursor-pointer">
                    Register Studio or Customer
                  </button>
                </div>
              </motion.div>
            ) : (
              // REGISTER FORM
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-left space-y-1">
                  <h3 className="font-display text-2xl font-bold text-[#2c2a29]">Create Account</h3>
                  <p className="text-xs text-[#7c756d]">Register as a customer or list your photography business in Cainta.</p>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                    <ShieldAlert size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4 text-left max-h-[400px] overflow-y-auto pr-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#2c2a29]">Register Role Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole(UserRole.CUSTOMER)}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          regRole === UserRole.CUSTOMER 
                            ? "border-[#2c2a29] bg-[#2c2a29] text-[#faf9f6]" 
                            : "border-[#e5e1da] bg-white text-[#2c2a29] hover:border-[#7c756d]"
                        }`}
                      >
                        <User size={13} /> Customer Account
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole(UserRole.STUDIO_ADMIN)}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          regRole === UserRole.STUDIO_ADMIN 
                            ? "border-[#2c2a29] bg-[#2c2a29] text-[#faf9f6]" 
                            : "border-[#e5e1da] bg-white text-[#2c2a29] hover:border-[#7c756d]"
                        }`}
                      >
                        <Briefcase size={13} /> Studio Owner / Admin
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#2c2a29]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="e.g. Steve Dela Cruz"
                      className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>

                  {regRole === UserRole.STUDIO_ADMIN && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-red-700">Photography Studio Name</label>
                      <input
                        type="text"
                        required
                        value={regStudioName}
                        onChange={e => setRegStudioName(e.target.value)}
                        placeholder="e.g. Rizal Milestone Studios"
                        className="w-full bg-[#faf9f6] border-2 border-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2c2a29]"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#2c2a29]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="e.g. steve@gmail.com"
                      className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2c2a29]"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-xs font-semibold text-[#2c2a29]">Password</label>
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 pr-11 py-2.5 text-sm focus:outline-none focus:border-[#2c2a29]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(value => !value)}
                      aria-label={showRegPassword ? "Hide registration password" : "Show registration password"}
                      title={showRegPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c756d] hover:text-[#2c2a29] cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#2c2a29]">Contact Number</label>
                      <input
                        type="text"
                        value={regContact}
                        onChange={e => setRegContact(e.target.value)}
                        placeholder="+63 900 000 0000"
                        className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2c2a29]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#2c2a29]">Home Address</label>
                      <input
                        type="text"
                        value={regAddress}
                        onChange={e => setRegAddress(e.target.value)}
                        placeholder="Cainta, Rizal"
                        className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2c2a29]"
                      />
                    </div>
                  </div>

                  {regRole === UserRole.STUDIO_ADMIN && (
                    <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <Shield className="text-amber-600" size={14} />
                          Studio Compliance & Verification Documents
                        </h4>
                        <p className="text-[11px] text-amber-800 leading-snug">
                          Uploading business permits and owner valid IDs ensures platform security and faster admin verification.
                        </p>
                      </div>

                      {/* 1. DTI / Business Permit Upload */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-800 flex items-center justify-between">
                          <span>1. DTI / Mayor's Business Permit <span className="text-red-600">* Required</span></span>
                        </label>
                        <div className="border border-dashed border-amber-300 rounded-xl bg-white p-3 text-center hover:border-amber-500 transition-all relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={e => handleRegFileChange(e, "permit")}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="flex items-center justify-center gap-2">
                            <Upload size={16} className="text-amber-600" />
                            <span className="text-xs font-bold text-gray-700">
                              {regBusinessPermit ? "Change Business Permit" : "Click / Drag to upload Business Permit"}
                            </span>
                          </div>
                        </div>
                        {regBusinessPermit && (
                          <div className="bg-green-50 p-2 rounded-lg border border-green-200 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-green-800 flex items-center gap-1">
                              <FileCheck size={12} /> Business Permit Attached
                            </span>
                            <button type="button" onClick={() => setRegBusinessPermit("")} className="text-red-500 hover:underline text-[10px] font-bold">Remove</button>
                          </div>
                        )}
                      </div>

                      {/* 2. Valid Owner Government ID Upload */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-800 flex items-center justify-between">
                          <span>2. Owner Valid Government ID <span className="text-red-600">* Required</span></span>
                        </label>
                        <p className="text-[10px] text-gray-500">Driver's License, Passport, UMID, PhilHealth, SSS ID</p>
                        <div className="border border-dashed border-amber-300 rounded-xl bg-white p-3 text-center hover:border-amber-500 transition-all relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={e => handleRegFileChange(e, "validId")}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="flex items-center justify-center gap-2">
                            <Upload size={16} className="text-amber-600" />
                            <span className="text-xs font-bold text-gray-700">
                              {regValidId ? "Change Owner Valid ID" : "Click / Drag to upload Valid Government ID"}
                            </span>
                          </div>
                        </div>
                        {regValidId && (
                          <div className="bg-green-50 p-2 rounded-lg border border-green-200 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-green-800 flex items-center gap-1">
                              <FileCheck size={12} /> Valid Government ID Attached
                            </span>
                            <button type="button" onClick={() => setRegValidId("")} className="text-red-500 hover:underline text-[10px] font-bold">Remove</button>
                          </div>
                        )}
                      </div>

                      {/* 3. Additional Business Documents (Optional) */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-800">
                          3. Other Validation Documents <span className="text-gray-500 font-normal">(Optional - BIR, Barangay Clearance, Lease)</span>
                        </label>
                        <div className="border border-dashed border-amber-300 rounded-xl bg-white p-3 text-center hover:border-amber-500 transition-all relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={e => handleRegFileChange(e, "other")}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="flex items-center justify-center gap-2">
                            <Upload size={16} className="text-amber-600" />
                            <span className="text-xs font-bold text-gray-700">
                              {regOtherDocs ? "Change Additional Docs" : "Upload BIR, Lease Contract, or Barangay Permit"}
                            </span>
                          </div>
                        </div>
                        {regOtherDocs && (
                          <div className="bg-green-50 p-2 rounded-lg border border-green-200 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-green-800 flex items-center gap-1">
                              <FileCheck size={12} /> Additional Docs Attached
                            </span>
                            <button type="button" onClick={() => setRegOtherDocs("")} className="text-red-500 hover:underline text-[10px] font-bold">Remove</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <Sparkles size={16} />
                    {loading ? "Creating..." : "Create Account & Sign In"}
                  </button>
                </form>

                <div className="text-xs text-gray-500 pt-4 border-t border-gray-100 flex justify-between">
                  <span>Already have an account?</span>
                  <button onClick={() => setIsRegister(false)} className="text-[#2c2a29] font-bold hover:underline cursor-pointer">
                    Sign In instead
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5e1da] text-left space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-display font-bold text-lg text-[#2c2a29]">Reset Password</h4>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#7c756d] leading-relaxed">
                Enter your account email address. We'll send you a secure link to reset your password and recover your account.
              </p>

              {forgotMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  forgotMsg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {forgotMsg.text}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#2c2a29]">Account Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="e.g. your-email@example.com"
                    className="w-full bg-[#faf9f6] border border-[#e5e1da] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2c2a29]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 bg-[#2c2a29] hover:bg-[#4a4644] text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
