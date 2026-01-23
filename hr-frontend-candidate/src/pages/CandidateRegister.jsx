import { useState } from "react";
import axios from "../lib/axios";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CandidateRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/jobs";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);

    if (!fullName || !email || !phone || !password) {
      setMessage("All fields are required");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("🔵 Registering in Firebase:", normalizedEmail);

      // 1. Create User in Firebase
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { auth } = await import("../firebase");

      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      // Update display name
      await updateProfile(userCredential.user, { displayName: fullName });
      console.log("✅ Firebase registration successful");

      // 2. Create User in Backend (Sync)
      console.log("🔵 Syncing registration with backend...");
      const res = await axios.post("/auth/CandidateRegister", {
        fullName,
        email: normalizedEmail,
        phone,
        password,
      });

      const registeredUser = res.data;
      console.log("✅ Backend sync successful:", registeredUser);

      // 3. Optional: Auto-login or just prepare for redirect
      // For now, we'll let existing logic handle the redirect to login
      // but we could also populate the store here.

      setMessage("Registered successfully! Redirecting to login...");
      setIsError(false);

      setTimeout(() => navigate(`/auth/CandidateLogin?returnUrl=${encodeURIComponent(returnUrl)}`), 1500);
    } catch (err) {
      console.error("Registration error:", err);
      let msg = "Registration failed";
      if (err.code === 'auth/email-already-in-use') {
        msg = "Email is already registered in Firebase.";
      } else if (err.response?.data) {
        msg = err.response.data;
      }
      setMessage(msg);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a]">
      {/* CARD */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl bg-[#111827]">

        {/* LEFT: FORM */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-[#111827] text-white">
          {/* LOGO SPACE */}
          <div className="mb-8 flex flex-col items-center md:items-start">
            <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 mb-6 group transition-all duration-500 hover:border-blue-500/50">
              <img
                src="/LOGO.png"
                alt="Logo"
                className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform"
              />
            </div>
          </div>

          {/* MOBILE ONLY: Heading & Login link */}
          <div className="block md:hidden">
            <h2 className="text-3xl font-bold mb-2">
              Create new account<span className="text-blue-500">.</span>
            </h2>

            <p className="text-sm text-slate-400 mb-8">
              Already a member?{" "}
              <span
                onClick={() => navigate(`/auth/CandidateLogin?returnUrl=${encodeURIComponent(returnUrl)}`)}
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Log in
              </span>
            </p>
          </div>


          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1f2937] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1f2937] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1f2937] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1f2937] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              disabled={isLoading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-slate-500"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-sm ${isError ? "text-red-400" : "text-green-400"
                }`}
            >
              {message}
            </p>
          )}
        </div>

        {/* RIGHT: IMAGE / VISUAL */}
        <div className="hidden md:block relative">
          <img
            src="/Desktop - 6.jpg" // optional background image
            alt="Register"
            className="absolute inset-0 w-full h-full object-cover opacity-40"

          />
          {/* DESKTOP ONLY: Heading on image */}
          <div className="absolute top-10 right-10 z-10 hidden md:block text-right text-white">
            <h2 className="text-3xl font-bold mb-2">
              Create new account<span className="text-blue-400">.</span>
            </h2>

            <p className="text-sm text-slate-300">
              Already a member?{" "}
              <span
                onClick={() => navigate("/auth/CandidateLogin")}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Log in
              </span>
            </p>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/20" />
        </div>
      </div>
    </div>
  );
}




