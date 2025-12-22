import { useState } from "react";
import { useParams } from "react-router-dom";
import candidateApi from "../lib/axios";
import CandidateNavbar from "../components/CandidateNavbar";

export default function ApplyJob() {
  const { id } = useParams(); // job id
  const [candidateUserId, setCandidateUserId] = useState("1"); // TODO: Get from auth context
  const [skills, setSkills] = useState("");
  const [cv, setCv] = useState(null);
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData();
    form.append("jobId", id);
    form.append("candidateUserId", candidateUserId);
    form.append("skills", skills);
    if (cv) form.append("cv", cv);
    if (letter) form.append("letter", letter);

    try {
      // CHANGED: Removed /api prefix since it's already in baseURL
      const response = await candidateApi.post("/applications", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Application submitted:", response.data);
      alert("Application submitted successfully!");
      window.location.href = "/jobs";
    } catch (err) {
      console.error("Apply failed:", err);
      const errorMsg = err.response?.data || "Failed to submit application";
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CandidateNavbar />
      
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Apply for Job #{id}</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={submitHandler} className="space-y-4">
          
          <div>
            <label className="block mb-1 font-semibold">Candidate User ID (Temporary)</label>
            <input 
              type="number" 
              className="border p-2 w-full rounded"
              value={candidateUserId}
              onChange={(e) => setCandidateUserId(e.target.value)} 
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Note: This will be replaced with automatic user detection after login
            </p>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Skills Summary *</label>
            <textarea
              className="border p-2 w-full rounded"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows="4"
              placeholder="e.g., Java, Spring Boot, React, 5 years experience..."
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Upload CV (PDF)</label>
            <input 
              type="file"
              accept=".pdf"
              onChange={(e) => setCv(e.target.files[0])}
              className="border p-2 w-full rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Upload Cover Letter</label>
            <input 
              type="file"
              onChange={(e) => setLetter(e.target.files[0])}
              className="border p-2 w-full rounded"
            />
          </div>

          <button 
            className="bg-green-600 text-white px-6 py-3 rounded w-full hover:bg-green-700 disabled:bg-gray-400"
            type="submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

