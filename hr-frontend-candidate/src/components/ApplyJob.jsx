import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import candidateApi from "../lib/axios";
import CandidateNavbar from "../components/CandidateNavbar";

export default function ApplyJob() {
  const { id } = useParams(); // job id
  const navigate = useNavigate();

  const [candidateUserId, setCandidateUserId] = useState("1"); // TODO: Get from auth
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
      await candidateApi.post("/applications", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Application submitted successfully!");
      navigate("/jobs");
    } catch (err) {
      const errorMessage =
        err.response?.data || "Failed to submit application";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CandidateNavbar />

      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Apply for Job</h1>
        <p className="text-gray-600 mb-6">
          Complete the form below to submit your application.
        </p>

        <div className="bg-white border rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-5">
            {/* Candidate ID */}
            <div>
              <label className="block mb-1 font-semibold">
                Candidate User ID (Temporary)
              </label>
              <input
                className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                value={candidateUserId}
                onChange={(e) => setCandidateUserId(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be automatically linked after authentication is added.
              </p>
            </div>

            {/* Skills */}
            <div>
              <label className="block mb-1 font-semibold">
                Skills Summary *
              </label>
              <textarea
                className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Java, React, Spring Boot, 3+ years experience"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                rows="4"
                required
              />
            </div>

            {/* CV */}
            <div>
              <label className="block mb-1 font-semibold">
                Upload CV (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setCv(e.target.files[0])}
                className="border p-2 w-full rounded"
              />
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block mb-1 font-semibold">
                Upload Cover Letter
              </label>
              <input
                type="file"
                onChange={(e) => setLetter(e.target.files[0])}
                className="border p-2 w-full rounded"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? "Submitting Application..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

