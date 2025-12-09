import { useState } from "react";
import axiosCandidate from "../lib/axiosCandidate";
import { useCandidateAuthStore } from "../stores/useCandidateAuthStore";
import { useNavigate } from "react-router-dom";

function CandidateLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useCandidateAuthStore((s) => s.login);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosCandidate.post("/candidate/login", {
        email,
        password,
      });
      login(res.data.token);

      navigate("/jobs"); // redirect to job listings
    } catch (err) {
      alert("Login failed",err);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl mb-3">Candidate Login</h1>
      <form onSubmit={submitHandler} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input className="border p-2 w-full" type="password" placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white p-2 rounded" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default CandidateLogin;
