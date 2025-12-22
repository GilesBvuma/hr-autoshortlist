import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";

export default function ApplicantsByJobAdmin() {
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const jobRes = await adminApi.get(`/jobs/${jobId}`);
        setJobTitle(jobRes.data.title);

        const candRes = await adminApi.get(`/jobs/${jobId}/candidates`);
        setCandidates(candRes.data);
      } catch (err) {
        console.error("Error loading applicants", err);
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
    <div>
      <AdminNavbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">
          Applicants for: {jobTitle || `Job #${jobId}`}
        </h1>

        <button
          onClick={retrieveShortlist}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "Retrieve Shortlist"}
        </button>

        {candidates.length === 0 ? (
          <p>No applicants yet.</p>
        ) : (
          <ul className="space-y-3">
            {candidates.map((c) => (
              <li key={c.id} className="border p-3 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-lg">{c.fullname}</strong>
                    <p className="text-sm text-gray-600">
                      Email: {c.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {c.phone}
                    </p>
                    <p className="mt-2 text-sm">{c.skills}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {c.cvDownloadUrl && (
                      <a
                        href={`${adminApi.defaults.baseURL?.replace(
                          "/api",
                          ""
                        ) || "http://localhost:8080"}${c.cvDownloadUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 underline"
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
                        className="text-sm text-blue-600 underline"
                      >
                        Download Letter
                      </a>
                    )}

                    <button
                      onClick={() => deleteApplication(c.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
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
  );
}



