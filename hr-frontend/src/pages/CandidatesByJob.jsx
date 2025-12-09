import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../lib/axios"; // your axios base config in src/lib/axios.js

function CandidatesByJob() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await axios.get(`/applications/byJob/${jobId}`);
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
      // calls backend placeholder; adjust path if you used a different route
      const res = await axios.post(`/applications/ai/shortlist/${jobId}?topN=3`);
      setShortlist(res.data); // array of application IDs
    } catch (err) {
      console.error("Shortlist failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Candidates for Job #{jobId}</h2>

      <button
        onClick={handleShortlist}
        disabled={loading}
        className="mb-4 bg-indigo-600 text-white px-3 py-2 rounded"
      >
        {loading ? "Shortlisting..." : "Shortlist top 3"}
      </button>

      <div className="space-y-4">
        {applications.map(app => (
          <div key={app.id} className="border p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{app.fullname}</h3>
              <div>
                {app.cvDownloadUrl && (
                  <a
                    href={ (axios.defaults.baseURL || "") + app.cvDownloadUrl }
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm mr-3 underline"
                  >
                    Download CV
                  </a>
                )}
                {app.letterDownloadUrl && (
                  <a
                    href={ (axios.defaults.baseURL || "") + app.letterDownloadUrl }
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline"
                  >
                    Download Letter
                  </a>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600">Email: {app.email}</p>
            <p className="text-sm text-gray-600">Phone: {app.phone}</p>
            <p className="mt-2">{app.skillsSummary}</p>

            {shortlist.includes(app.id) && (
              <div className="mt-3 text-green-600 font-semibold">SHORTLISTED</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CandidatesByJob;
