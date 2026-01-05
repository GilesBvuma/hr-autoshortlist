import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminApi from "../api/adminApi";

export default function ApplicantsByJobAdmin() {
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const loadData = async () => {
    try {
      console.log("📥 Loading data for job:", jobId);
      
      // Fetch job details
      const jobRes = await adminApi.get(`/api/jobs/${jobId}`);
      setJobTitle(jobRes.data.title);
      console.log("✅ Job loaded:", jobRes.data.title);

      // FIXED: Use the correct endpoint
      const candRes = await adminApi.get(`/api/applications/byJob/${jobId}`);
      console.log("✅ Applications loaded:", candRes.data);
      setCandidates(candRes.data);
    } catch (err) {
      console.error("❌ Error loading applicants:", err);
      console.error("Error details:", err.response?.data);
    }
  };

  loadData();
}, [jobId]);


  const retrieveShortlist = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/jobs/${jobId}/shortlist`);
      console.log("Shortlist:", res.data);
      alert("Shortlist retrieved. Check console for results.");
    } catch (err) {
      console.error("Error retrieving shortlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (applicationId) => {
    if (!window.confirm("Delete this application?")) return;

    try {
      await adminApi.delete(`/applications/${applicationId}`);
      setCandidates((prev) =>
        prev.filter((a) => a.id !== applicationId)
      );
      alert("Application deleted successfully");
    } catch (err) {
      console.error("Failed to delete application", err);
      alert("Failed to delete application");
    }
  };

  return (
  <>
    

    {/* Page background */}
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-blue-100 to-blue-300 animate-fadeIn">

      {/* Header */}
      <div className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-10 shadow-xl">
        <h1 className="text-3xl font-bold">
          Applicants for: {jobTitle || `Job #${jobId}`}
        </h1>
        <p className="text-sm opacity-90 mt-1">
          Manage and review submitted applications
        </p>
      </div>

      {/* Content */}
      <div className="w-full px-10 py-8">

        {/* Action bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={retrieveShortlist}
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl
                       shadow-md transition-all duration-300
                       hover:bg-emerald-700 hover:scale-105
                       active:scale-95 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Retrieve Shortlist"}
          </button>
        </div>

        {/* Empty state */}
        {candidates.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-gray-600">
            No applicants yet.
          </div>
        ) : (
          <ul className="space-y-8">
            {candidates.map((c) => (
              <li
                key={c.id}
                className="bg-white rounded-3xl shadow-xl p-8
                           transform transition-all duration-300
                           hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">

                  {/* Candidate info */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {c.fullname}
                    </h2>

                    <p className="text-sm text-gray-600 mt-1">
                      📧 {c.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      📞 {c.phone}
                    </p>

                    <p className="mt-4 text-gray-700">
                      {c.skills}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 min-w-[160px]">

                    {c.cvDownloadUrl && (
                      <a
                        href={`${adminApi.defaults.baseURL?.replace(
                          "/api",
                          ""
                        ) || "http://localhost:8080"}${c.cvDownloadUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-center bg-blue-600 text-white px-4 py-2 rounded-xl
                                   transition-all duration-300
                                   hover:bg-blue-700 hover:scale-105"
                      >
                        Download CV
                      </a>
                    )}

                    {c.letterDownloadUrl && (
                      <a
                        href={`${adminApi.defaults.baseURL?.replace(
                          "/api",
                          ""
                        ) || "http://localhost:8080"}${c.letterDownloadUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-center bg-indigo-600 text-white px-4 py-2 rounded-xl
                                   transition-all duration-300
                                   hover:bg-indigo-700 hover:scale-105"
                      >
                        Download Letter
                      </a>
                    )}

                    <button
                      onClick={() => deleteApplication(c.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-xl
                                 transition-all duration-300
                                 hover:bg-red-700 hover:scale-105
                                 active:scale-95"
                    >
                      Delete
                    </button>
                  </div>

                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </>
);

}



