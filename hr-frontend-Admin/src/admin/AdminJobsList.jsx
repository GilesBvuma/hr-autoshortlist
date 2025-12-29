import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";
import { Link } from "react-router-dom";

function AdminJobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        console.log("📥 Fetching jobs from /api/jobs");
        
        const res = await adminApi.get("/api/jobs");
        console.log("✅ Jobs fetched:", res.data);
        
        setJobs(res.data);
        setError("");
      } catch (err) {
        console.error("❌ Failed to load jobs:", err);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job?")) return;

    try {
      await adminApi.delete(`/api/jobs/${id}`);
      setJobs(jobs.filter((j) => j.id !== id));
      alert("Job deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete job");
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-b from-white via-blue-100 to-blue-500">
    <AdminNavbar />

    <div className="px-6 pt-16 pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          Manage Jobs
        </h2>

        <Link
          to="/admin/jobs/create"
          className="bg-green-500 text-white px-6 py-2 rounded-xl shadow hover:bg-green-600 transition"
        >
          Create New Job
        </Link>
      </div>

      {loading && <p className="text-gray-600">Loading jobs...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && jobs.length === 0 && (
        <p className="text-gray-500">
          No jobs created yet. Create your first job!
        </p>
      )}

      {/* Job cards */}
      <ul className="space-y-8">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="bg-white rounded-3xl shadow-lg px-8 py-6 flex justify-between items-center"
          >
            {/* Left info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {job.title}
              </h3>

              <p className="text-sm text-gray-600 mt-1">
                Experience : {job.yearsExperiance}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                Short Description : {job.shortDescription}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Link
                to={`/admin/jobs/${job.id}/applicants`}
                className="bg-blue-500 text-white px-5 py-2 rounded-xl hover:bg-blue-600 transition"
              >
                View Applicants
              </Link>

              <button
                onClick={() => deleteJob(job.id)}
                className="bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

}

export default AdminJobsList;

