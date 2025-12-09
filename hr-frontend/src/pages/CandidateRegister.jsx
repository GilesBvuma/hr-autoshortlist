import { useState } from "react";
import axiosCandidate from "../lib/axiosCandidate";
import { useNavigate } from "react-router-dom";

function CandidateRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axiosCandidate.post("/candidate/register", {
        email,
        password,
      });
      alert("Registered successfully");
      navigate("/candidate/login");
    } catch (err) {
      alert("Registration failed",err);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl mb-3">Candidate Registration</h1>
      <form onSubmit={submitHandler} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input className="border p-2 w-full" type="password" placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-green-600 text-white p-2 rounded" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}

export default CandidateRegister;
