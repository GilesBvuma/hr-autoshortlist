import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

export default function AllApplicants() {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        console.log("📥 Fetching all applications");
        
        const res = await adminApi.get("/api/applications/all");
        console.log("✅ Applications fetched:", res.data);
        
        setApplications(res.data);
        setFilteredApps(res.data);
        setError("");
      } catch (err) {
        console.error("❌ Failed to load applications:", err);
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredApps(applications);
    } else {
      const filtered = applications.filter(app =>
        app.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.skills?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApps(filtered);
    }
  }, [searchTerm, applications]);

  const deleteApplication = async (id) => {
    if (!window.confirm("Delete this application?")) return;

    try {
      await adminApi.delete(`/api/applications/${id}`);
      setApplications(applications.filter(app => app.id !== id));
      alert("Application deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete application");
    }
  };

  return (
  <>
   

    {/* Page background */}
    <div className=" min-h-screen w-full bg-gradient-to-b from-slate-50 via-blue-100 to-blue-300 animate-fadeIn">

     {/* Header */}
    <div className="p-8 mb-8">
      <h1 className="text-3xl font-bold text-slate-900">All Candidates</h1>
      <p className="text-slate-600 mt-1">
        Review applications from all job postings
      </p>
    </div>
     {/* Stats Cards */}
    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Total Applications</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {loading ? (
                <span className="inline-block w-16 h-8 bg-slate-200 animate-pulse rounded"></span>
              ) : (
                applications.length
              )}
            </p>
          </div>
          <div className="p-4 bg-purple-100 rounded-full">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Search Results</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {loading ? (
                <span className="inline-block w-16 h-8 bg-slate-200 animate-pulse rounded"></span>
              ) : (
                filteredApps.length
              )}
            </p>
          </div>
          <div className="p-4 bg-blue-100 rounded-full">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Unique Jobs</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {loading ? (
                <span className="inline-block w-16 h-8 bg-slate-200 animate-pulse rounded"></span>
              ) : (
                new Set(applications.map(a => a.jobId)).size
              )}
            </p>
          </div>
          <div className="p-4 bg-green-100 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

      {/* Content */}
      <div className="w-full px-10 py-8">

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Search by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 rounded-2xl shadow-md border
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       transition-all duration-300"
          />

          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredApps.length} result(s)
            </p>
          )}
        </div>

        {loading && (
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
            Loading applications...
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 rounded-3xl shadow p-6">
            {error}
          </div>
        )}

        {!loading && applications.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-gray-600">
            No applications received yet.
          </div>
        )}

        {!loading && filteredApps.length === 0 && searchTerm && (
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-gray-600">
            No results found for "{searchTerm}"
          </div>
        )}

        {/* Applications */}
        <ul className="space-y-8">
          {filteredApps.map((app) => (
            <li
              key={app.id}
              className="bg-white rounded-3xl shadow-xl p-8
                         transform transition-all duration-300
                         hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-6">

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {app.fullname}
                    </h2>
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      Job #{app.jobId}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">📧 {app.email}</p>
                  <p className="text-sm text-gray-600">📞 {app.phone}</p>

                  <p className="mt-4 text-gray-700">
                    <span className="font-semibold">Skills:</span> {app.skills}
                  </p>

                  <div className="flex gap-4 mt-4">
                    {app.cvDownloadUrl && (
                      <a
                        href={(adminApi.defaults.baseURL || "http://localhost:8080") + app.cvDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl
                                   transition-all duration-300
                                   hover:bg-blue-700 hover:scale-105"
                      >
                        Download CV
                      </a>
                    )}

                    {app.letterDownloadUrl && (
                      <a
                        href={(adminApi.defaults.baseURL || "http://localhost:8080") + app.letterDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl
                                   transition-all duration-300
                                   hover:bg-indigo-700 hover:scale-105"
                      >
                        Download Letter
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 min-w-[160px]">
                  <Link
                    to={`/admin/jobs/${app.jobId}/applicants`}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-center
                               transition-all duration-300
                               hover:bg-emerald-700 hover:scale-105"
                  >
                    View Job
                  </Link>

                  <button
                    onClick={() => deleteApplication(app.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl
                               transition-all duration-300
                               hover:bg-red-700 hover:scale-105"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </>
);

}