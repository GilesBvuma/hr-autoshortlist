import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminApi from "../api/adminApi";

export default function ApplicantsByJobAdmin() {
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]); // Original applications list
  const [shortlist, setShortlist] = useState([]);   // ✨ NEW: Stores detailed scoring results
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // ✨ NEW: Configurable number of candidates to shortlist (default: 100)
  const [topN, setTopN] = useState(100);

  // ✨ NEW: Toggle to show/hide all candidate scores
  const [showAllScores, setShowAllScores] = useState(false);

  // ✨ NEW: Search term for filtering applicants
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("📥 Loading data for job:", jobId);

        // Fetch job details
        const jobRes = await adminApi.get(`/api/jobs/${jobId}`);
        setJobTitle(jobRes.data.title);
        console.log("✅ Job loaded:", jobRes.data.title);

        // Fetch applications
        const candRes = await adminApi.get(`/api/applications/byJob/${jobId}`);
        console.log("✅ Applications loaded:", candRes.data);
        setCandidates(candRes.data);
      } catch (err) {
        console.error("❌ Error loading applicants:", err);
      }
    };

    loadData();
  }, [jobId]);


  // ✨ NEW: Handlers shortlisting with dynamic topN
  const handleShortlist = async () => {
    setLoading(true);
    try {
      // Use dynamic topN from state
      const res = await adminApi.post(`/api/applications/ai/shortlist/${jobId}?topN=${topN}`);
      console.log("Shortlist:", res.data);
      setShortlist(res.data);
      setShowAllScores(true); // Automatically show scores
      alert(`Shortlisting complete! Top ${topN} candidates selected.`);
    } catch (err) {
      console.error("Error retrieving shortlist:", err);
      alert("Failed to shortlist candidates.");
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (applicationId) => {
    if (!window.confirm("Delete this application?")) return;

    try {
      await adminApi.delete(`/api/applications/${applicationId}`);
      setCandidates((prev) =>
        prev.filter((a) => a.id !== applicationId)
      );
      alert("Application deleted successfully");
    } catch (err) {
      console.error("Failed to delete application", err);
      alert("Failed to delete application");
    }
  };

  // ✨ NEW: Merge application data with shortlist scores
  const getApplicationWithScore = (app) => {
    const shortlistItem = shortlist.find((s) => s.applicationId === app.id);
    return {
      ...app,
      score: shortlistItem?.computedScore || null,
      isShortlisted: shortlistItem?.shortlisted || false,
      reason: shortlistItem?.reason || null,
    };
  };

  // ✨ NEW: Sort and then Filter applications by search term
  const sortedCandidates = shortlist.length > 0
    ? candidates
      .map(getApplicationWithScore)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
    : candidates;

  const filteredCandidates = sortedCandidates.filter(c => {
    const search = searchTerm.toLowerCase();
    return (
      c.fullname?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      (c.phone && c.phone.includes(search)) ||
      (c.skills && c.skills.toLowerCase().includes(search))
    );
  });

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

          {/* Action bar and Shortlist Controls */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-wrap items-end gap-4">

              {/* ✨ NEW: Input for Top N */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  Candidates to Shortlist:
                </label>
                <input
                  type="number"
                  value={topN}
                  onChange={(e) => setTopN(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={candidates.length}
                  className="border border-gray-300 bg-gray-50 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32"
                />
              </div>

              {/* ✨ CHANGED: Button calls handleShortlist */}
              <button
                onClick={handleShortlist}
                disabled={loading || candidates.length === 0}
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl
                            shadow-md transition-all duration-300
                            hover:bg-emerald-700 hover:scale-105
                            active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed h-10"
              >
                {loading ? "Processing..." : `Shortlist Top ${topN}`}
              </button>

              {/* ✨ NEW: Checkbox */}
              {shortlist.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer ml-4 mb-2">
                  <input
                    type="checkbox"
                    checked={showAllScores}
                    onChange={(e) => setShowAllScores(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-700 font-medium select-none">Show all scores</span>
                </label>
              )}

              {/* ✨ NEW: Search Bar */}
              <div className="flex-1 min-w-[250px]">
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, email, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {shortlist.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 font-medium">
                ✓ Shortlisting complete! Candidates have been ranked by score.
              </div>
            )}
          </div>

          {/* Empty state */}
          {candidates.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-gray-600">
              No applicants yet.
            </div>
          ) : (
            <ul className="space-y-6">
              {/* ✨ CHANGED: map over filteredCandidates */}
              {filteredCandidates.map((c) => {
                const cWithScore = getApplicationWithScore(c); // Ensure we have score info
                const showScore = showAllScores && cWithScore.score !== null;

                return (
                  <li
                    key={c.id}
                    className={`rounded-3xl shadow-xl p-8 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
                      ${cWithScore.isShortlisted
                        ? "bg-green-50 border-2 border-green-400"
                        : "bg-white"}`}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">

                      {/* Candidate info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-gray-800">
                            {c.fullname}
                          </h2>

                          {/* ✨ NEW: Badges */}
                          {cWithScore.isShortlisted && (
                            <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                              ✓ SHORTLISTED
                            </span>
                          )}

                          {showScore && (
                            <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                              {cWithScore.score.toFixed(1)}/100
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600">📧 {c.email}</p>
                        <p className="text-sm text-gray-600">📞 {c.phone}</p>

                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-700 uppercase text-xs tracking-wider">Skills</h4>
                          <p className="text-gray-800 mt-1">{c.skills || "No skills listed"}</p>
                        </div>

                        {/* ✨ NEW: Detailed Scoring Reason */}
                        {showScore && cWithScore.reason && (
                          <div className="mt-4 p-4 bg-white/80 rounded-xl border border-indigo-100 shadow-sm">
                            <h4 className="font-semibold text-indigo-800 text-xs uppercase tracking-wider mb-2">AI Analysis</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {cWithScore.reason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 min-w-[160px]">
                        {c.cvDownloadUrl && (
                          <a
                            href={`${adminApi.defaults.baseURL?.replace("/api", "") || "http://localhost:8080"}${c.cvDownloadUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-center bg-blue-600 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:bg-blue-700 hover:scale-105 shadow-md font-medium"
                          >
                            Download CV
                          </a>
                        )}

                        {c.letterDownloadUrl && (
                          <a
                            href={`${adminApi.defaults.baseURL?.replace("/api", "") || "http://localhost:8080"}${c.letterDownloadUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-center bg-indigo-600 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:bg-indigo-700 hover:scale-105 shadow-md font-medium"
                          >
                            Download Letter
                          </a>
                        )}

                        <button
                          onClick={async () => {
                            try {
                              const res = await adminApi.patch(`/api/applications/${c.id}/toggle-shortlist`);
                              // Update local state
                              const isShortlisted = res.data;

                              // Update candidates list or separate shortlist state
                              // Since we derive 'isShortlisted' from the 'shortlist' array, we need to update that.
                              setShortlist(prev => {
                                const exists = prev.find(s => s.applicationId === c.id);
                                if (exists) {
                                  // Update existing
                                  return prev.map(s => s.applicationId === c.id ? { ...s, shortlisted: isShortlisted } : s);
                                } else {
                                  // Add new entry
                                  return [...prev, { applicationId: c.id, shortlisted: isShortlisted, computedScore: 0, reason: "Manually added" }];
                                }
                              });

                            } catch (err) {
                              console.error("Failed to toggle shortlist", err);
                              alert("Failed to update status");
                            }
                          }}
                          className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium border ${cWithScore.isShortlisted
                            ? "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                        >
                          {cWithScore.isShortlisted ? "★ Unshortlist" : "☆ Add to Shortlist"}
                        </button>

                        <button
                          onClick={() => deleteApplication(c.id)}
                          className="bg-red-500/10 text-red-600 border border-red-200 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-red-600 hover:text-white hover:scale-105 active:scale-95 font-medium"
                        >
                          Delete
                        </button>
                      </div>

                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
