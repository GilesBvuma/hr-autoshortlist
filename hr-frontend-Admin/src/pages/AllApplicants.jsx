import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";
import { Link } from "react-router-dom";

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
    <div>
      <AdminNavbar />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">All Candidates</h1>
          <p className="text-gray-600">
            Total Applications: <span className="font-semibold text-blue-600">{applications.length}</span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredApps.length} result(s)
            </p>
          )}
        </div>

        {loading && <p>Loading applications...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && applications.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No applications received yet.</p>
            <p className="text-gray-400 text-sm mt-2">Applications will appear here once candidates apply to jobs.</p>
          </div>
        )}

        {!loading && filteredApps.length === 0 && searchTerm && (
          <p className="text-gray-500 text-center py-10">No results found for "{searchTerm}"</p>
        )}

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div key={app.id} className="bg-white border rounded-lg shadow p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{app.fullname}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Job ID: {app.jobId}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p>📧 {app.email}</p>
                    <p>📱 {app.phone}</p>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">Skills:</h4>
                    <p className="text-sm text-gray-600">{app.skills}</p>
                  </div>

                  <div className="flex gap-3">
                    {app.cvDownloadUrl && (
                      <a
                        href={(adminApi.defaults.baseURL || "http://localhost:8080") + app.cvDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 underline hover:text-blue-800"
                      >
                        📄 Download CV
                      </a>
                    )}
                    {app.letterDownloadUrl && (
                      <a
                        href={(adminApi.defaults.baseURL || "http://localhost:8080") + app.letterDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 underline hover:text-blue-800"
                      >
                        📝 Download Letter
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    to={`/admin/jobs/${app.jobId}/applicants`}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 text-center"
                  >
                    View Job
                  </Link>
                  <button
                    onClick={() => deleteApplication(app.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}