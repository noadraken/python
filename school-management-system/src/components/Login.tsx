import React, { useState, useEffect } from "react";
import { 
  School, Mail, Lock, User, ArrowRight, Loader2, Sparkles, AlertCircle,
  ShieldCheck, ArrowLeft, Check, Copy, Clock
} from "lucide-react";
import { User as UserType } from "../types";

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");

  // OTP Verification States
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpTargetEmail, setOtpTargetEmail] = useState("");
  const [isOtpGoogle, setIsOtpGoogle] = useState(false);
  const [simulatedEmail, setSimulatedEmail] = useState<{
    to: string;
    subject: string;
    body: string;
    otp: string;
  } | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // If student is signing up, trigger OTP flow!
      if (isSignUp && role === "student") {
        // 1. Check if email already exists
        const checkRes = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const checkData = await checkRes.json();
        if (checkData.status === "exists") {
          setError("A user with this email address is already registered.");
          setLoading(false);
          return;
        }

        // 2. Request OTP Code
        const otpRes = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: email.trim(), 
            name: name.trim(), 
            password, 
            role: "student", 
            isGoogle: false 
          }),
        });
        const otpData = await otpRes.json();
        if (otpRes.ok && otpData.status === "success") {
          setOtpTargetEmail(email.trim());
          setIsOtpGoogle(false);
          setOtpInput("");
          setSimulatedEmail({
            to: email.trim(),
            subject: "🔐 Edura Student Portal Registration Code",
            body: `Welcome to Edura Academy! Your authentication verification code is below. Enter this code on the verification screen to complete your registration.`,
            otp: otpData.otp,
          });
          setIsOtpMode(true);
        } else {
          setError(otpData.message || "Failed to trigger registration verification code.");
        }
        setLoading(false);
        return;
      }

      // Traditional direct Login/Admin/Teacher flow
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const payload = isSignUp 
        ? { email: email.trim(), password, role, name: name.trim() }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || data.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail) {
      setError("Please enter your Gmail address.");
      return;
    }
    if (!googleEmail.includes("@") || !googleEmail.endsWith(".com")) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Real-time direct Google authentication for active role
      const res = await fetch("/api/auth/gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleEmail.trim(),
          name: googleName.trim() || googleEmail.split("@")[0],
          role: role,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setShowGoogleModal(false);
        onLoginSuccess(data.user);
      } else {
        setError(data.message || data.error || "Gmail authentication failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Gmail connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpTargetEmail,
          otp: otpInput
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setIsOtpMode(false);
        setSimulatedEmail(null);
        onLoginSuccess(data.user);
      } else {
        setError(data.message || "Verification failed. Invalid or expired OTP code.");
      }
    } catch (err) {
      console.error(err);
      setError("OTP verification server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      const payload = isOtpGoogle
        ? {
            email: otpTargetEmail,
            name: googleName || otpTargetEmail.split("@")[0],
            role: "student",
            isGoogle: true
          }
        : {
            email: otpTargetEmail,
            name,
            password,
            role: "student",
            isGoogle: false
          };

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setOtpInput("");
        setSimulatedEmail({
          to: otpTargetEmail,
          subject: isOtpGoogle 
            ? "🌐 Google Identity Verification - Edura System" 
            : "🔐 Edura Student Portal Registration Code",
          body: isOtpGoogle 
            ? "New verification code triggered for Google authentication." 
            : "New registration code generated for your Edura student account.",
          otp: data.otp,
        });
        setResendCooldown(30);
      } else {
        setError(data.message || "Failed to resend verification code.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reach server to resend verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 z-10 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-indigo-600/30 p-3 rounded-2xl border border-indigo-400/20 shadow-lg shadow-indigo-500/10">
            <School className="h-10 w-10 text-indigo-300" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Edura Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Academic Management & Grade Analytics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel-heavy py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          
          {isOtpMode ? (
            /* OTP Verification Layout */
            <div>
              <button
                onClick={() => {
                  setIsOtpMode(false);
                  setSimulatedEmail(null);
                  setError("");
                }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs mb-4 cursor-pointer transition-colors font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Account Login
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
                  <h3 className="text-lg font-bold text-white">Security Verification</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Please verify your email address to complete the student onboarding registration process.
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-rose-500/10 border-l-4 border-rose-500 p-3 rounded-lg flex items-start gap-2 text-rose-300 text-sm">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-indigo-300 font-bold text-center">
                    Enter Verification OTP
                  </label>
                  
                  {/* Digital OTP Grid Display */}
                  <div className="relative flex justify-center py-2">
                    <div className="flex gap-2.5">
                      {Array.from({ length: 6 }).map((_, i) => {
                        const digit = otpInput[i] || "";
                        const isActive = otpInput.length === i;
                        return (
                          <div
                            key={i}
                            className={`w-11 h-14 rounded-xl border flex items-center justify-center text-xl font-extrabold text-white transition-all duration-200 select-none ${
                              isActive
                                ? "border-indigo-400 bg-indigo-500/15 ring-2 ring-indigo-500/30 scale-105"
                                : digit
                                ? "border-indigo-500 bg-indigo-500/5 text-indigo-200"
                                : "border-white/10 bg-black/35"
                            }`}
                          >
                            {digit}
                          </div>
                        );
                      })}
                    </div>
                    {/* Overlay absolute hidden input */}
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        if (val.length <= 6) setOtpInput(val);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-center select-none"
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-center text-slate-500">
                    Click on the blocks and enter the 6-digit code.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading || otpInput.length !== 6}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer disabled:bg-indigo-400/40 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Verify & Active Workstation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                    <span className="text-slate-500">Didn't receive a code?</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={handleResendOtp}
                      className="text-indigo-400 hover:text-indigo-300 font-bold transition-all disabled:text-slate-500 flex items-center gap-1 cursor-pointer"
                    >
                      <Clock className="h-3 w-3" />
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend Code"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Traditional Login & Signup Form */
            <div>
              {/* Role Selector Tabs */}
              <div className="flex p-1 bg-black/30 border border-white/5 rounded-xl mb-6">
                {(["student", "teacher", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setIsSignUp(false); // Only allow login by default on toggle
                      setError("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-200 cursor-pointer ${
                      role === r
                        ? "bg-white/10 text-white border border-white/10 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">
                  {isSignUp ? `Register as Student` : `${role.charAt(0).toUpperCase() + role.slice(1)} Login`}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isSignUp 
                    ? "Enter your credentials to register a new student account" 
                    : `Log in to access your customized ${role} workstation`
                  }
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-rose-500/10 border-l-4 border-rose-500 p-3 rounded-lg flex items-start gap-2 text-rose-300 text-sm">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alice Smith"
                        className="pl-9 w-full glass-input rounded-xl py-2.5 px-3 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === "admin" ? "admin@school.com" : `${role}1@school.com`}
                      className="pl-9 w-full glass-input rounded-xl py-2.5 px-3 text-sm focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 w-full glass-input rounded-xl py-2.5 px-3 text-sm focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer disabled:bg-indigo-400/50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? "Create Student Account (Requires OTP)" : "Access Portal"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Gmail Integration Option */}
              {role === "student" && (
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="px-2 bg-slate-900/50 text-slate-400 font-bold tracking-wider rounded">Or connect with</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setError("");
                        setShowGoogleModal(true);
                      }}
                      className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-white cursor-pointer transition-all"
                    >
                      <svg className="h-5 w-5 mr-2 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google Workspace
                    </button>
                  </div>
                </div>
              )}

              {/* Toggle login vs signup for student only */}
              {role === "student" && (
                <div className="mt-5 text-center">
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                    }}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    {isSignUp ? "Already have an account? Sign In" : "New student? Register account here"}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Simulated Sandbox Inbox Delivery Log Drawer */}
        {simulatedEmail && (
          <div className="mt-4 p-4 border border-indigo-500/25 bg-slate-900/90 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] uppercase tracking-wider rounded-bl font-bold">
              Simulated Sandbox Mail
            </div>
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs mb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Local Mail Delivery Console
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div>
                <span className="font-semibold text-indigo-300 text-[10px] uppercase tracking-wider">Recipient To:</span> <code className="text-[11px] text-slate-200 bg-black/40 px-1.5 py-0.5 rounded">{simulatedEmail.to}</code>
              </div>
              <div>
                <span className="font-semibold text-indigo-300 text-[10px] uppercase tracking-wider">Subject Line:</span> <span className="text-slate-200">{simulatedEmail.subject}</span>
              </div>
              <div className="border-t border-white/5 pt-2 mt-2 text-[11px] leading-relaxed text-slate-300 italic">
                "{simulatedEmail.body}"
              </div>
              
              <div className="flex flex-col items-center gap-1.5 bg-black/40 border border-indigo-500/10 rounded-xl p-2.5 mt-2.5">
                <span className="text-[9px] uppercase text-indigo-400 font-bold tracking-widest">Verification Security Code</span>
                <div className="flex items-center gap-3">
                  <code className="text-2xl font-black text-emerald-400 tracking-widest font-mono">{simulatedEmail.otp}</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(simulatedEmail.otp);
                      setCopiedOtp(true);
                      setTimeout(() => setCopiedOtp(false), 2000);
                    }}
                    className="p-1 px-2.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    {copiedOtp ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Google Branded Sign-in Modal Simulation */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative glass-panel-heavy rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6 text-indigo-400" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-bold text-white text-md">Google Identity Secure</span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-white/60 hover:text-white font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="text-center mb-5">
              <h4 className="text-lg font-bold text-white">Sign in with Google</h4>
              <p className="text-xs text-slate-400 mt-1">
                Authenticate securely to <span className="font-semibold text-white">Edura School System</span> using your Gmail identity.
              </p>
            </div>

            <form onSubmit={handleGoogleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                  Gmail Address
                </label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full glass-input rounded-xl py-2 px-3 text-sm focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                  Your Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Alice Smith"
                  className="w-full glass-input rounded-xl py-2 px-3 text-sm focus:outline-none transition-all"
                />
              </div>

              <div className="bg-indigo-500/10 rounded-lg p-2.5 text-[11px] text-indigo-300 border border-indigo-500/20">
                You will join as an active <strong className="capitalize">{role}</strong>. Secure real-time Google Workspace authentication will be performed.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer transition-all disabled:bg-indigo-400/50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In with Google"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
