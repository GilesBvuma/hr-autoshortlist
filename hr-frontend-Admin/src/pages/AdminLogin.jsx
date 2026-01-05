import { useState } from "react";
import adminApi from "../api/adminApi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // NOW VALID
    setError("");
    setLoading(true);

    try {
      const res = await adminApi.post("/auth/login", { username, password });
      login(res.data); // DO NOT CHANGE
      navigate("/admin/dashboard",{replace: true});
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
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

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full mb-6 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-lg font-medium transition 
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            {loading ? "Logging in..." : "Login"}
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
    </div>
  );
}

