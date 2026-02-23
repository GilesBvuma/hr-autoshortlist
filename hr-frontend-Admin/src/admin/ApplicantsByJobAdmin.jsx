import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminApi from "../api/adminApi";

/**
 * ApplicantsByJobAdmin
 * Shows all applicants for a job, with AI-powered shortlisting via Gemini.
 * Scores are blended: 65% Gemini AI + 35% rule-based CV parsing.
 */
export default function ApplicantsByJobAdmin() {
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [topN, setTopN] = useState(10);
  const [showAllScores, setShowAllScores] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // AI analysis panel: which card is expanded
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const jobRes = await adminApi.get(`/api/jobs/${jobId}`);
        setJobTitle(jobRes.data.title);
        const candRes = await adminApi.get(`/api/applications/byJob/${jobId}`);
        setCandidates(candRes.data);
      } catch (err) {
        console.error("❌ Error loading applicants:", err);
      }
    };
    loadData();
  }, [jobId]);

  const handleShortlist = async () => {
    setLoading(true);
    setShortlist([]); // Clear previous results
    try {
      const res = await adminApi.post(
        `/api/applications/ai/shortlist/${jobId}?topN=${topN}`
      );
      setShortlist(res.data);
      setShowAllScores(true);
      alert(`✅ AI shortlisting complete! Top ${topN} candidates selected.`);
    } catch (err) {
      console.error("Error retrieving shortlist:", err);
      alert("❌ Failed to shortlist candidates. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (applicationId) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await adminApi.delete(`/api/applications/${applicationId}`);
      setCandidates((prev) => prev.filter((a) => a.id !== applicationId));
    } catch (err) {
      console.error("Failed to delete application", err);
      alert("Failed to delete application");
    }
  };

  const getApplicationWithScore = (app) => {
    const shortlistItem = shortlist.find((s) => s.applicationId === app.id);
    return {
      ...app,
      score: shortlistItem?.computedScore ?? null,
      isShortlisted: shortlistItem?.shortlisted ?? false,
      reason: shortlistItem?.reason ?? null,
    };
  };

  const getScoreColor = (score) => {
    if (score === null) return "bg-gray-100 text-gray-600";
    if (score >= 80) return "bg-emerald-600 text-white";
    if (score >= 60) return "bg-blue-600 text-white";
    if (score >= 40) return "bg-amber-500 text-white";
    return "bg-red-500 text-white";
  };

  const getScoreBar = (score) => {
    if (score === null) return null;
    const pct = Math.round(score);
    const color =
      pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
    return (
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  const sortedCandidates =
    shortlist.length > 0
      ? candidates.map(getApplicationWithScore).sort((a, b) => (b.score || 0) - (a.score || 0))
      : candidates;

  const filteredCandidates = sortedCandidates.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.fullname?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.skills?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-blue-50 to-blue-200 animate-fadeIn">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-indigo-700 to-blue-600 text-white px-10 py-8 shadow-xl">
        <h1 className="text-3xl font-bold">
          Applicants — {jobTitle || `Job #${jobId}`}
        </h1>
        <p className="text-sm opacity-80 mt-1">
          AI-powered ranking · Gemini 1.5 Flash · {candidates.length} applicants
        </p>
      </div>

      <div className="w-full px-10 py-8">
        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-end gap-4">
            {/* Top N input */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Candidates to Shortlist
              </label>
              <input
                type="number"
                value={topN}
                onChange={(e) => setTopN(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={candidates.length}
                className="border border-gray-300 bg-gray-50 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-28 text-center font-semibold"
              />
            </div>

            {/* Shortlist button */}
            <button
              onClick={handleShortlist}
              disabled={loading || candidates.length === 0}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl shadow
                         hover:bg-emerald-700 hover:scale-105 active:scale-95
                         disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  AI is analysing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Shortlist Top {topN}
                </>
              )}
            </button>

            {/* Show all scores toggle */}
            {shortlist.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={showAllScores}
                  onChange={(e) => setShowAllScores(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm text-gray-700 font-medium select-none">Show all scores</span>
              </label>
            )}

            {/* Search */}
            <div className="flex-1 min-w-[260px] relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name, email or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-4 py-2 border border-gray-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Post-shortlist banner */}
          {shortlist.length > 0 && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
              <svg className="h-5 w-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Gemini AI has ranked all candidates. Scores combine AI analysis (65%) + CV parsing (35%).
            </div>
          )}
        </div>

        {/* Applicant cards */}
        {candidates.length === 0 ? (
          <div className="bg-white rounded-3xl shadow p-12 text-center text-gray-500">
            No applicants yet for this job.
          </div>
        ) : (
          <ul className="space-y-5">
            {filteredCandidates.map((c) => {
              const cw = getApplicationWithScore(c);
              const showScore = showAllScores && cw.score !== null;
              const rank = shortlist.length > 0
                ? sortedCandidates.findIndex((x) => x.id === c.id) + 1
                : null;

              return (
                <li
                  key={c.id}
                  className={`rounded-2xl shadow-lg p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl
                    ${cw.isShortlisted ? "bg-emerald-50 border-2 border-emerald-400" : "bg-white border border-gray-100"}`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">
                    {/* Left: candidate info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Rank badge */}
                        {rank && (
                          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                            #{rank}
                          </span>
                        )}

                        <h2 className="text-lg font-bold text-gray-900">{c.fullname}</h2>

                        {cw.isShortlisted && (
                          <span className="bg-emerald-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                            ✓ SHORTLISTED
                          </span>
                        )}

                        {showScore && (
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getScoreColor(cw.score)}`}>
                            {cw.score.toFixed(1)}/100
                          </span>
                        )}
                      </div>

                      {/* Score bar */}
                      {showScore && getScoreBar(cw.score)}

                      <p className="text-sm text-gray-500 mt-2">📧 {c.email}</p>
                      <p className="text-sm text-gray-500">📞 {c.phone}</p>

                      <div className="mt-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills</span>
                        <p className="text-gray-800 mt-0.5 text-sm">{c.skills || "Not provided"}</p>
                      </div>

                      {/* AI Analysis expandable */}
                      {showScore && cw.reason && (
                        <div className="mt-4">
                          <button
                            onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <svg className={`h-3.5 w-3.5 transition-transform ${expandedId === c.id ? "rotate-90" : ""}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {expandedId === c.id ? "Hide" : "View"} AI Analysis
                          </button>

                          {expandedId === c.id && (
                            <div className="mt-2 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
                                Gemini AI Analysis
                              </p>
                              <p className="text-sm text-gray-700 leading-relaxed">{cw.reason}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: actions */}
                    <div className="flex flex-col gap-2.5 min-w-[150px]">
                      {c.cvDownloadUrl && (
                        <a
                          href={`${adminApi.defaults.baseURL?.replace("/api", "") || "http://localhost:8080"}${c.cvDownloadUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-center bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 hover:scale-105 transition-all shadow-sm font-medium text-sm"
                        >
                          📄 Download CV
                        </a>
                      )}

                      {c.letterDownloadUrl && (
                        <a
                          href={`${adminApi.defaults.baseURL?.replace("/api", "") || "http://localhost:8080"}${c.letterDownloadUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-center bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 hover:scale-105 transition-all shadow-sm font-medium text-sm"
                        >
                          📋 Download Letter
                        </a>
                      )}

                      {/* Manual shortlist toggle */}
                      <button
                        onClick={async () => {
                          try {
                            const res = await adminApi.patch(`/api/applications/${c.id}/toggle-shortlist`);
                            const isShortlisted = res.data;
                            setShortlist((prev) => {
                              const exists = prev.find((s) => s.applicationId === c.id);
                              if (exists) {
                                return prev.map((s) =>
                                  s.applicationId === c.id ? { ...s, shortlisted: isShortlisted } : s
                                );
                              }
                              return [...prev, { applicationId: c.id, shortlisted: isShortlisted, computedScore: 0, reason: "Manually added" }];
                            });
                          } catch (err) {
                            console.error("Failed to toggle shortlist", err);
                            alert("Failed to update status");
                          }
                        }}
                        className={`px-4 py-2 rounded-xl transition-all font-medium text-sm border
                          ${cw.isShortlisted
                            ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                      >
                        {cw.isShortlisted ? "★ Unshortlist" : "☆ Add to Shortlist"}
                      </button>

                      <button
                        onClick={() => deleteApplication(c.id)}
                        className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white hover:scale-105 active:scale-95 transition-all font-medium text-sm"
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
  );
}