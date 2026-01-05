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
    try {
      const res = await axios.post("/auth/CandidateLogin", {
        email,
        password,
      });

      login(res.data); // DO NOT TOUCH
      navigate("/jobs");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
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
        <div className="p-10 text-white">
          {/* LOGO */}
          <div className="mb-10">
            <img
              src="/LOGO.png"
              alt="Logo"
              className="h-20 w-auto object-contain"
            />
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
          </div>
        </div>
      </div>
    </div>
  );
}





