import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";

export default function ApplicantsByJob() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const res = await adminApi.post(
        `/applications/ai/shortlist/${jobId}?topN=3`
      );
      setShortlist(res.data);
    } catch (err) {
      console.error("Shortlist failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">
      

      <h2 className="text-2xl font-bold mb-4">
        Candidates for Job #{jobId}
      </h2>

      <button
        onClick={handleShortlist}
        disabled={loading}
        className="mb-4 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
      >
        {loading ? "Shortlisting..." : "AI Shortlist Top 3"}
      </button>

      <div className="space-y-4">
        {applications.map((app) => {
          const shortlistItem = shortlist.find(
            (s) => s.id === app.id
          );
          const isShortlisted = shortlistItem?.shortlisted || false;

          return (
            <div key={app.id} className="border p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">
                  {app.fullname}
                </h3>

                <div className="flex gap-3">
                  {app.cvDownloadUrl && (
                    <a
                      href={
                        (adminApi.defaults.baseURL ||
                          "http://localhost:8080") +
                        app.cvDownloadUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 underline"
                    >
                      Download CV
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
                      className="text-sm text-blue-600 underline"
                    >
                      Download Letter
                    </a>
                  )}
                </div>
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

              {isShortlisted && (
                <div className="mt-3 bg-green-100 border border-green-600 p-2 rounded">
                  <p className="text-green-800 font-semibold">
                    ✓ SHORTLISTED
                  </p>
                  {shortlistItem?.reason && (
                    <p className="text-xs text-green-700 mt-1">
                      {shortlistItem.reason}
                    </p>
                  )}
                  <p className="text-sm font-bold mt-1">
                    Score: {shortlistItem.computedScore}/100
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

