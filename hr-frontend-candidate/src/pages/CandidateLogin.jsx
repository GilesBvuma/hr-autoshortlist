import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function CandidateLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const handleRequestOTP = async () => {
    if (!forgotEmail) return setForgotError("Email is required");
    setForgotLoading(true);
    setForgotError("");
    try {
      await axios.post("/auth/forgot-password", { email: forgotEmail });
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!forgotOtp) return setForgotError("OTP is required");
    setForgotLoading(true);
    setForgotError("");
    try {
      await axios.post("/auth/verify-otp", { email: forgotEmail, otp: forgotOtp });
      setForgotStep(3);
    } catch (err) {
      setForgotError("Invalid or expired OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPass) return setForgotError("New password is required");
    setForgotLoading(true);
    setForgotError("");
    try {
      await axios.post("/auth/reset-password", {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: newPass
      });
      alert("Password reset successfully! You can now login.");
      setShowForgot(false);
      setForgotStep(1);
      setForgotEmail("");
      setForgotOtp("");
      setNewPass("");
    } catch (err) {
      setForgotError(err.response?.data || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/jobs";

  const handleLogin = async () => {
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      console.log("🔵 Attempting login for:", normalizedEmail);
      // 1. Firebase Login (Email/Password)
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("../firebase");

      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      console.log("✅ Firebase login successful");

      // 2. Store Token temporarily
      localStorage.setItem("candidateToken", token);

      // 3. Sync with Backend to get local ID and full profile
      console.log("🔵 Syncing with backend profile...");
      const res = await axios.get("/auth/candidates/me");
      const localUser = res.data;
      console.log("✅ Backend sync successful:", localUser);

      // 4. Update local auth store with full profile
      login({
        user: localUser,
        token: token,
        type: 'candidate'
      });

      navigate(returnUrl);
    } catch (err) {
      console.error("❌ Firebase login (or sync) failed:", err);

      // FALLBACK: Backend Login (for local DB users / reset passwords)
      console.log("🔵 Attempting backend fallback login...");
      try {
        const res = await axios.post("/auth/CandidateLogin", {
          email: normalizedEmail,
          password: password
        });

        const { token } = res.data;
        console.log("✅ Backend login successful");

        localStorage.setItem("candidateToken", token);

        // Fetch profile
        const profileRes = await axios.get("/auth/candidates/me");
        const localUser = profileRes.data;

        login({
          user: localUser,
          token: token,
          type: 'candidate'
        });

        navigate(returnUrl);
        return; // Success!

      } catch (backendErr) {
        console.error("❌ Backend login failed:", backendErr);
        let msg = "Invalid email or password";
        if (err.code === 'auth/invalid-email') {
          msg = "Invalid email format";
        } else if (err.code === 'auth/network-request-failed') {
          msg = "Network error. Please check your connection.";
        }
        setError(msg);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const { auth } = await import("../firebase");

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      localStorage.setItem("candidateToken", token);

      // Sync with Backend
      const res = await axios.get("/auth/candidates/me");
      const localUser = res.data;

      login({
        user: localUser,
        token: token,
        type: 'candidate'
      });

      navigate(returnUrl);
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google Sign-In failed.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b1220]">
      {/* CARD */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl bg-[#0f172a]">

        {/* LEFT: IMAGE / VISUAL */}
        <div className="hidden md:block relative">
          {/* DESKTOP ONLY TEXT */}
          <div className="absolute top-10 left-10 z-10 text-left text-white">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back<span className="text-sky-400">.</span>
            </h2>

            <p className="text-sm text-slate-300">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate(`/auth/CandidateRegister?returnUrl=${encodeURIComponent(returnUrl)}`)}
                className="text-sky-400 hover:underline cursor-pointer"
              >
                Create one
              </span>
            </p>
          </div>

          <img
            src="/Desktop - 7.jpg"
            alt="Login visual"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/20" />
        </div>

        {/* RIGHT: FORM */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-[#0f172a] text-white">
          {/* LOGO */}
          <div className="mb-8 flex flex-col items-center md:items-start">
            <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 mb-6 group transition-all duration-500 hover:border-sky-400/50">
              <img
                src="/LOGO.png"
                alt="Logo"
                className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.3)] group-hover:scale-105 transition-transform"
              />
            </div>
          </div>

          {/* MOBILE ONLY TEXT */}
          <div className="block md:hidden mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back<span className="text-sky-400">.</span>
            </h2>

            <p className="text-sm text-slate-400">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/auth/CandidateRegister")}
                className="text-sky-400 hover:underline cursor-pointer"
              >
                Create one
              </span>
            </p>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-400">{error}</p>
          )}

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1e293b] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#1e293b] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-400 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>

            <div className="text-right">
              <span
                onClick={() => setShowForgot(true)}
                className="text-sm text-sky-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </span>
            </div>

            <button
              onClick={handleLogin}
              className="w-full mt-4 bg-sky-400 hover:bg-sky-500 text-slate-900 py-3 rounded-lg font-semibold transition"
            >
              Login
            </button>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="px-4 text-sm text-slate-400 uppercase">Or continue with</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 py-3 rounded-lg font-semibold transition border border-slate-200"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl w-[400px] p-8 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Reset Password</h2>
              <button onClick={() => setShowForgot(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>

            {forgotStep === 1 && (
              <div>
                <p className="text-sm text-slate-400 mb-4">Enter your email to receive a 6-digit OTP code.</p>
                <input
                  type="email"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f172a] text-white mb-4 focus:ring-2 focus:ring-sky-400 outline-none"
                />
                <button
                  onClick={handleRequestOTP}
                  disabled={forgotLoading}
                  className="w-full py-3 bg-sky-400 text-slate-900 rounded-xl font-semibold hover:bg-sky-500 disabled:bg-slate-600"
                >
                  {forgotLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div>
                <p className="text-sm text-slate-400 mb-4">Enter the 6-digit code sent to <strong>{forgotEmail}</strong></p>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f172a] text-sky-400 mb-4 focus:ring-2 focus:ring-sky-400 outline-none text-center text-2xl tracking-[0.5em] font-bold"
                />
                <button
                  onClick={handleVerifyOTP}
                  disabled={forgotLoading}
                  className="w-full py-3 bg-sky-400 text-slate-900 rounded-xl font-semibold hover:bg-sky-500 disabled:bg-slate-600"
                >
                  {forgotLoading ? "Verifying..." : "Verify OTP"}
                </button>
                <button onClick={() => setForgotStep(1)} className="w-full mt-3 text-sm text-sky-400 hover:underline">Back</button>
              </div>
            )}

            {forgotStep === 3 && (
              <div>
                <p className="text-sm text-slate-400 mb-4">OTP Verified! Enter your new password below.</p>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0f172a] text-white mb-4 focus:ring-2 focus:ring-sky-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-[30%] -translate-y-1/2 text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={forgotLoading}
                  className="w-full py-3 bg-sky-400 text-slate-900 rounded-xl font-semibold hover:bg-sky-500 disabled:bg-slate-600"
                >
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            )}

            {forgotError && <p className="mt-4 text-xs text-red-400 text-center bg-red-400/10 p-2 rounded-lg">{forgotError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}





