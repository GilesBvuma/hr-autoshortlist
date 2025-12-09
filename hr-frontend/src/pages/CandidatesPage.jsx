import { useEffect, useState } from "react";
import api from "../lib/axios";
import AdminNavbar from "../components/AdminNavbar";

function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const res = await api.get("/candidates");
        setCandidates(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load candidates.");
      }
    };

    loadCandidates();
  }, []);

  return (
    <div>
      <AdminNavbar /> {/* NEW NAVBAR */}

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Candidates</h2>

        {error && <p className="text-red-500">{error}</p>}

        <ul>
          {candidates.map((c) => (
            <li key={c.id} className="mb-2 p-2 border rounded">
              <strong>{c.name}</strong> — {c.position}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CandidatesPage;

