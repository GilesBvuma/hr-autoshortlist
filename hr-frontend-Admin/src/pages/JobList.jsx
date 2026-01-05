// PATH: src/pages/JobList.jsx

import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import { Link } from "react-router-dom";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
      // If you want applicants to see only active jobs you can call /jobs/active instead
      const res = await adminApi.get("/jobs");
      // If backend returns DTO wrapped differently, adjust here
      setJobs(res.data || []);
    } catch (err) {
      console.error("Failed to load jobs", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Available Jobs</h2>

        {loading && <p>Loading jobs…</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && jobs.length === 0 && <p>No jobs available.</p>}

        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id} className="border p-4 rounded shadow">
              <h3 className="text-xl font-bold">{job.title}</h3>
              {job.department && <div className="text-sm text-gray-600">{job.department}</div>}
              <p className="mt-2">{job.shortDescription}</p>

              <div className="flex gap-3 mt-3">
                <Link
                  to={`/jobs/${job.id}`}
                  className="bg-blue-500 text-white px-3 py-2 rounded"
                >
                  View Details
                </Link>

                {/* Admin-only link to view applicants for this job */}
                <Link
                  to={`/admin/jobs/${job.id}/applicants`}
                  className="bg-gray-700 text-white px-3 py-2 rounded"
                >
                  View Applicants
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

