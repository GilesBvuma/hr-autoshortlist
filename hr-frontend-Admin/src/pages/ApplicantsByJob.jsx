import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";

export default function ApplicantsByJob() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✨ NEW: Configurable number of candidates to shortlist (default: 100)
  // Previously hardcoded to 3, now admin can enter any number
  const [topN, setTopN] = useState(100);

  // ✨ NEW: Toggle to show/hide all candidate scores
  const [showAllScores, setShowAllScores] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await adminApi.get(`/applications/byJob/${jobId}`);
        setApplications(res.data);
      } catch (err) {
        console.error("Failed to load applications", err);
      }
    };

    fetchApps();
  }, [jobId]);

  const handleShortlist = async () => {
    setLoading(true);
    try {
      // ✨ CHANGED: Now uses dynamic topN from state instead of hardcoded ?topN=3
      const res = await adminApi.post(
        `/applications/ai/shortlist/${jobId}?topN=${topN}`
      );
      setShortlist(res.data);

      // ✨ NEW: Automatically show scores after shortlisting
      setShowAllScores(true);
    } catch (err) {
      console.error("Shortlist failed", err);
      alert("Failed to shortlist candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✨ NEW: Merge application data with shortlist scores
  // This combines the original application with scoring results
  const getApplicationWithScore = (app) => {
    const shortlistItem = shortlist.find((s) => s.id === app.id);
    return {
      ...app,
      score: shortlistItem?.computedScore || null,
      isShortlisted: shortlistItem?.shortlisted || false,
      reason: shortlistItem?.reason || null,
    };
  };

  // ✨ NEW: Sort applications by score after shortlisting
  // Highest scores appear first
  const sortedApplications = shortlist.length > 0
    ? applications
      .map(getApplicationWithScore)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
    : applications;

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">
        Candidates for Job #{jobId}
      </h2>

      {/* ✨ NEW: Control panel for shortlisting configuration */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4 items-center flex-wrap">

          {/* ✨ NEW: Input field for configurable shortlist number */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Number of candidates to shortlist:
            </label>
            <input
              type="number"
              value={topN}
              onChange={(e) => setTopN(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max={applications.length}
              className="border border-gray-300 px-3 py-2 rounded w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 100"
            />
          </div>

          {/* ✨ CHANGED: Button text now dynamic based on topN value */}
          <button
            onClick={handleShortlist}
            disabled={loading || applications.length === 0}
            className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Shortlisting..." : `Shortlist Top ${topN}`}
          </button>

          {/* ✨ NEW: Checkbox to toggle score visibility */}
          {shortlist.length > 0 && (
            <label className="mt-6 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllScores}
                onChange={(e) => setShowAllScores(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">
                Show all scores
              </span>
            </label>
          )}
        </div>

        {/* ✨ NEW: Display total applications count */}
        {applications.length > 0 && (
          <p className="text-sm text-gray-600 mt-3">
            Total applications: {applications.length}
          </p>
        )}

        {/* ✨ NEW: Success message after shortlisting */}
        {shortlist.length > 0 && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm font-semibold text-green-800">
              ✓ Shortlisting complete! Top {topN} candidates highlighted below.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sortedApplications.map((app) => {
          const appWithScore = getApplicationWithScore(app);
          const showScore = showAllScores && appWithScore.score !== null;

          return (
            <div
              key={app.id}
              className={`border p-4 rounded shadow transition-all ${appWithScore.isShortlisted
                ? "border-green-500 bg-green-50"
                : "bg-white"
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {app.fullname}
                    </h3>
                    {appWithScore.isShortlisted && (
                      <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        ✓ SHORTLISTED
                      </span>
                    )}
                    {showScore && (
                      <span className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full font-semibold">
                        Score: {appWithScore.score.toFixed(1)}/100
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Email: {app.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {app.phone}
                  </p>

                  <div className="mt-3">
                    <h4 className="font-semibold text-sm">Skills</h4>
                    <p className="text-sm">{app.skills}</p>
                  </div>

                  {showScore && appWithScore.reason && (
                    <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">Scoring Details:</span>{" "}
                        {appWithScore.reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 ml-4">
                  {app.cvDownloadUrl && (
                    <a href={app.cvDownloadUrl} target="_blank" rel="noreferrer">
                      View CV
                    </a>
                  )}

                  {app.letterDownloadUrl && (
                    <a
                      href={
                        (adminApi.defaults.baseURL ||
                          "http://localhost:8080") +
                        app.letterDownloadUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                      View Letter
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {applications.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No applications received for this job yet.
          </div>
        )}
      </div>
    </div>
  );
}
