import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        // This endpoint needs to exist in your backend
        const res = await adminApi.get("/api/candidates");
        setCandidates(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load candidates. Endpoint may not exist.");
      }
    };

    loadCandidates();
  }, []);

  return (
    <div>
      

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">All Registered Candidates</h2>

        {error && <p className="text-red-500">{error}</p>}

        {candidates.length === 0 ? (
          <p>No candidates registered yet.</p>
        ) : (
          <ul className="space-y-2">
            {candidates.map((c) => (
              <li key={c.id} className="mb-2 p-3 border rounded">
                <strong>{c.fullName}</strong>
                <p className="text-sm text-gray-600">Email: {c.email}</p>
                <p className="text-sm text-gray-600">Phone: {c.phone}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CandidatesPage;
