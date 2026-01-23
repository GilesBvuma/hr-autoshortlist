import { useState, useEffect } from "react";
import adminApi from "../api/adminApi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      await adminApi.post("/api/auth/forgot-password", { email: forgotEmail });
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
      await adminApi.post("/api/auth/verify-otp", { email: forgotEmail, otp: forgotOtp });
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
      await adminApi.post("/api/auth/reset-password", {
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedUsername = username.trim();
    const isEmail = normalizedUsername.includes("@");

    try {
      if (isEmail) {
        console.log("🔵 Attempting Firebase login for email:", normalizedUsername);
        // Firebase Login
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        const { auth } = await import("../firebase");

        const userCredential = await signInWithEmailAndPassword(auth, normalizedUsername, password);
        const user = userCredential.user;
        const token = await user.getIdToken();

        // Store token for adminApi
        localStorage.setItem("adminToken", token);

        // 🔍 VERIFY ADMIN ROLE
        console.log("🔍 Verifying admin role...");
        const profileRes = await adminApi.get("/api/auth/me");
        if (!profileRes.data.isAdmin) {
          localStorage.removeItem("adminToken");
          const { signOut } = await import("firebase/auth");
          await signOut(auth);
          throw new Error("Unauthorized: Admin access required. Please use an admin account.");
        }

        // Update Store
        login({
          user: { username: user.email, email: user.email },
          token: token,
          type: 'admin'
        });

        console.log("Login successful, admin verified");
        navigate("/admin/dashboard", { replace: true });
        return; // Done
      } else {
        console.log("🔵 Skipping Firebase for non-email username:", normalizedUsername);
        throw new Error("UseBackendFallback");
      }
    } catch (err) {
      if (err.message !== "UseBackendFallback") {
        console.error("Firebase/Auth error:", err);
        // If it's our explicit unauthorized error, show it
        if (err.message.includes("Unauthorized")) {
          setError(err.message);
          setLoading(false);
          return;
        }
      }

      // FALLBACK: Backend Login (for local DB users / non-email usernames)
      console.log("🔵 Attempting backend fallback login...");
      try {
        const res = await adminApi.post('/api/auth/login', {
          usernameOrEmail: normalizedUsername,
          password: password
        });

        const { token } = res.data;
        console.log("✅ Backend login successful");

        localStorage.setItem("adminToken", token);

        // 🔍 VERIFY ADMIN ROLE (Backend users are usually admins, but good to check)
        const profileRes = await adminApi.get("/api/auth/me");
        if (!profileRes.data.isAdmin) {
          localStorage.removeItem("adminToken");
          setError("Unauthorized: Admin access required.");
          setLoading(false);
          return;
        }

        login({
          user: { username: username, email: username },
          token: token,
          type: 'admin'
        });

        navigate("/admin/dashboard", { replace: true });
        return; // Success!

      } catch (backendErr) {
        console.error("❌ Backend login failed:", backendErr);
        setError("Invalid username or password");
      }
    } finally {
      if (!error) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-400">

      {/* LOGO */}
      <div className="mb-6 text-center">
        <img
          src="/tano-logo.png"
          alt="TANO Digital Solutions"
          className="mx-auto w-40 mb-2"
        />
      </div>

      {/* LOGIN CARD */}
      <div className="bg-white rounded-2xl shadow-xl w-[380px] p-8">
        <h2 className="text-xl font-semibold text-center text-blue-700 mb-6">
          Recruiter Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username/email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full mb-2 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[43%] -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>

          <div className="text-right mb-6">
            <span
              onClick={() => setShowForgot(true)}
              className="text-sm text-blue-600 hover:underline cursor-pointer font-medium"
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-lg font-medium transition mb-4
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400">Or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                const { signInWithPopup, GoogleAuthProvider, signOut } = await import("firebase/auth");
                const { auth } = await import("../firebase");
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                const token = await user.getIdToken();

                localStorage.setItem("adminToken", token);

                // 🔍 VERIFY ADMIN ROLE
                console.log("🔍 Verifying admin role...");
                const profileRes = await adminApi.get("/api/auth/me");
                if (!profileRes.data.isAdmin) {
                  localStorage.removeItem("adminToken");
                  await signOut(auth);
                  throw new Error("Unauthorized: Admin access required.");
                }

                login({
                  user: { username: user.displayName || user.email, email: user.email },
                  token: token,
                  type: 'admin'
                });
                console.log("Login successful, admin verified");
                navigate("/admin/dashboard", { replace: true });
              } catch (err) {
                console.error("Google Sign-in failed", err);
                setError(err.message.includes("Unauthorized") ? err.message : "Google Sign-in failed: " + err.message);
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full py-3 rounded-xl text-lg font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 transition"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </form>

        {/* REGISTER LINK */}
        <p className="text-center text-sm mt-5">
          If you don’t have an account.{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Register here
          </span>
        </p>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[400px] p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Reset Password</h2>
              <button onClick={() => setShowForgot(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            {forgotStep === 1 && (
              <div>
                <p className="text-sm text-slate-600 mb-4">Enter your email to receive a 6-digit OTP code.</p>
                <input
                  type="email"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleRequestOTP}
                  disabled={forgotLoading}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {forgotLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div>
                <p className="text-sm text-slate-600 mb-4">Enter the 6-digit code sent to <strong>{forgotEmail}</strong></p>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="6-digit OTP"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 mb-4 focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-[0.5em] font-bold"
                />
                <button
                  onClick={handleVerifyOTP}
                  disabled={forgotLoading}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {forgotLoading ? "Verifying..." : "Verify OTP"}
                </button>
                <button onClick={() => setForgotStep(1)} className="w-full mt-2 text-sm text-blue-600">Back</button>
              </div>
            )}

            {forgotStep === 3 && (
              <div>
                <p className="text-sm text-slate-600 mb-4">OTP Verified! Enter your new password below.</p>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-[32%] -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
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
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            )}

            {forgotError && <p className="mt-4 text-xs text-red-500 text-center">{forgotError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

