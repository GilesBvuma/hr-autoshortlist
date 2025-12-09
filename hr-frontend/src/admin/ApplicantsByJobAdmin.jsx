import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios";
import AdminNavbar from "../components/AdminNavbar";

function ApplicantsByJobAdmin() {
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const jobRes = await api.get(`/jobs/${jobId}`);
        setJobTitle(jobRes.data.title);

        const candRes = await api.get(`/jobs/${jobId}/candidates`);
        setCandidates(candRes.data);
      } catch (err) {
        console.error("Error loading applicants", err);
      }
    };

    loadData();
  }, [jobId]);

  const retrieveShortlist = async () => {
    try {
      const res = await api.get(`/jobs/${jobId}/shortlist`);
      alert("Shortlist retrieved. Check console for results.");
      console.log("Shortlist:", res.data);
    } catch (err) {
      console.error("Error retrieving shortlist:", err);
    }
  };

  return (
    <div>
      <AdminNavbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">
          Applicants for: {jobTitle}
        </h1>

        <button
          onClick={retrieveShortlist}
          className="bg-green-600 text-white px-4 py-2 rounded mb-4"
        >
          Retrieve Shortlist
        </button>

        {candidates.length === 0 ? (
          <p>No applicants yet.</p>
        ) : (
          <ul className="space-y-3">
            {candidates.map((c) => (
              <li key={c.id} className="border p-3 rounded">
                <strong>{c.name}</strong> — {c.email}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ApplicantsByJobAdmin;
