import { useState } from "react";
import axios from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function CandidateLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
      try {
        const res = await axios.get("/auth/candidates/me");
        const localUser = res.data;
        console.log("✅ Backend sync successful:", localUser);

        // 4. Update local auth store with full profile
        login({
          user: localUser,
          token: token,
          type: 'candidate'
        });

        navigate("/jobs");
      } catch (syncErr) {
        console.error("❌ Backend sync failed:", syncErr);
        setError("Login succeeded but profile sync failed. Please try again. " + (syncErr.response?.data || ""));
      }
    } catch (err) {
      console.error("❌ Firebase login failed:", err);
      let msg = "Invalid email or password";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "Invalid email or password";
      } else if (err.code === 'auth/invalid-email') {
        msg = "Invalid email format";
      } else if (err.code === 'auth/network-request-failed') {
        msg = "Network error. Please check your connection.";
      } else {
        msg = err.message || "An unexpected error occurred during login.";
      }
      setError(msg);
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

      navigate("/jobs");
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
                onClick={() => navigate("/auth/CandidateRegister")}
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

            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1e293b] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

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
    </div>
  );
}





