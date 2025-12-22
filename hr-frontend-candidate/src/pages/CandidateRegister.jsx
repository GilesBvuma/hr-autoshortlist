import { useState } from "react";
import axios from "../lib/axios";
import { useNavigate } from "react-router-dom";

export default function CandidateRegister() {
  const navigate = useNavigate();
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

    // Basic validation
    if (!fullName || !email || !phone || !password) {
      setMessage("All fields are required");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/auth/CandidateRegister", {
        fullName,
        email,
        phone,
        password
      });

      console.log("Registration response:", response.data);
      setMessage("Registered successfully!");
      setIsError(false);

      setTimeout(() => navigate("/auth/CandidateLogin"), 1500);
    } catch (err) {
      console.error("Registration error:", err);
      
      // Better error handling
      const errorMessage = err.response?.data || err.message || "Registration failed";
      setMessage(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-lg rounded-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Candidate Registration</h2>

        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <input
            className="border p-2 rounded"
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            className="border p-2 rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="border p-2 rounded"
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <input
            className="border p-2 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button 
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        {message && (
          <p className={`mt-3 text-center ${isError ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/auth/CandidateLogin")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}



