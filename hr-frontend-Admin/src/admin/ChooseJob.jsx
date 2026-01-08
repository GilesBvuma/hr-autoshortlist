import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";
import { Link } from "react-router-dom";


function ChooseJob() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get("/api/jobs/shortlist-stats")
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load stats", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading shortlists...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Shortlisted Candidates</h1>
        <p className="text-slate-600 mt-1">Select a job to review finalized shortlists</p>
      </div>

      {stats.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 text-lg">No shortlists generated yet.</p>
          <p className="text-slate-400 text-sm mt-2">Go to a job's applicant list and click "Shortlist Top N"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Link
              key={stat.jobId}
              to={`/admin/jobs/${stat.jobId}/shortlist-review`} // New page
              className="block bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{stat.title}</h3>
                    <p className="text-sm text-slate-500">{stat.department}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    {stat.shortlistedCount} Candidates
                  </span>
                </div>

                <div className="flex items-center text-blue-600 text-sm font-medium mt-4">
                  Review Candidates
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChooseJob;

