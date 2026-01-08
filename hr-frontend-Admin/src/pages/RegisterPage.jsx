import { useState } from "react";
import adminApi from "../api/adminApi";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password validation
  const validatePassword = (pass) => {
    const minLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
    };
  };

  const passwordCheck = validatePassword(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordCheck.isValid) {
      setError("Password does not meet security requirements");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // 1. Create User in Firebase
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { auth } = await import("../firebase");

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name
      await updateProfile(userCredential.user, { displayName: username });

      // 2. Create User in Backend (Sync)
      // Note: We don't strictly need to do this manually because the backend Login filter 
      // will auto-create it on first login. But doing it here ensures consistency 
      // and checks for username uniqueness in Postgres immediately.
      await adminApi.post("/api/auth/register", { username, email, password });

      setMessage("✓ Registration successful! Redirecting to login...");
      setError("");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      // Firebase errors often have code like 'auth/email-already-in-use'
      let msg = "Registration failed.";
      if (err.code === 'auth/email-already-in-use') {
        msg = "Email is already registered in Firebase.";
      } else if (err.response?.data) {
        msg = err.response.data;
      }
      setError(msg);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white via-blue-100 to-blue-500">
      <div className="w-full max-w-8xl bg-white rounded-0xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT IMAGE PANEL */}
        <div
          className="hidden md:flex items-center justify-center relative bg-blue-700 text-white"
          style={{
            backgroundImage: "url('Desktop - 5.jpg')", // 👈 replace later
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >


          {/* Text */}
          <div className="relative z-10 p-10">
            <h2 className="text-4xl font-bold mb-4">
              Create your account
            </h2>
            <p className="text-lg text-blue-100">
              Manage jobs, review candidates, and streamline hiring with ease.
            </p>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="p-10">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              HR Registration
            </h2>
            <p className="text-gray-600 mt-1">
              Create your admin account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Username *
              </label>
              <input
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email *
              </label>
              <input
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password *
              </label>
              <input
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {password && (
                <div className="mt-3 bg-gray-50 p-3 rounded-xl text-xs space-y-1">
                  <p className="font-semibold text-gray-700">Password requirements:</p>
                  <p className={passwordCheck.minLength ? "text-green-600" : "text-gray-500"}>• 8+ characters</p>
                  <p className={passwordCheck.hasUpperCase ? "text-green-600" : "text-gray-500"}>• Uppercase letter</p>
                  <p className={passwordCheck.hasLowerCase ? "text-green-600" : "text-gray-500"}>• Lowercase letter</p>
                  <p className={passwordCheck.hasNumber ? "text-green-600" : "text-gray-500"}>• Number</p>
                  <p className={passwordCheck.hasSpecialChar ? "text-green-600" : "text-gray-500"}>• Special character</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && (
                <p className={`text-sm mt-1 ${password === confirmPassword ? "text-green-600" : "text-red-600"}`}>
                  {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !passwordCheck.isValid || password !== confirmPassword}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );

}

export default RegisterPage;

