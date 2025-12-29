import { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import adminApi from "../api/adminApi";

export default function AdminDashboard() {
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.get("/api/applications/all");
        setTotalApplicants(res.data.length);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-100 to-blue-500">
      <AdminNavbar />

      <div className="px-6 pt-16 pb-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Admin Dashboard
        </h1>

        <p className="text-gray-700 mb-10">
          Welcome to the HR Admin Dashboard. Use the options below to manage jobs
          and review candidates.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Job */}
          <a
            href="/admin/jobs/create"
            className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-xl transition cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Create New Job
            </h2>
            <p className="text-gray-600">
              Add a new job posting for applicants to view and apply to.
            </p>
          </a>

          {/* View Candidates */}
          <a
            href="/admin/applicants"
            className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-xl transition cursor-pointer relative"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              View All Candidates
            </h2>
            <p className="text-gray-600 mb-3">
              View and manage all candidates who applied across all jobs.
            </p>
            
            {/* Applicant Count Badge */}
            {!loading && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                {totalApplicants}
              </div>
            )}
          </a>
        </div>
      </div>
    </div>
  );
}


