import { useState } from "react";
import adminApi from "../api/adminApi";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await adminApi.post("/auth/register", { username, password });
      setMessage("Registered successfully!");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("Registration failed.",err);
    }
  };

  return (
    <div className="p-6">
      <div className="p-6 bg-white shadow-lg rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">HR Registration</h2>

      <form onSubmit={handleRegister} className="flex flex-col gap-3 w-80">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-green-600 text-white p-2 rounded">
          Register
        </button>
      </form>

      </div>
      
      {message && <p className="mt-3 text-blue-600">{message}</p>}
    </div>
  );
}

export default RegisterPage;

