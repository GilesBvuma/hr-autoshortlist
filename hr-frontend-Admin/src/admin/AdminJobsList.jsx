import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import { Link } from "react-router-dom";


function AdminJobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

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

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      await adminApi.put(`/api/jobs/${jobId}/toggle-status`);
      
      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, active: !currentStatus } : job
      ));
      
      alert(`Job ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      console.error("Toggle status failed:", err);
      alert("Failed to toggle job status");
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const getJobTypeBadge = (type) => {
    const badges = {
      PERMANENT: "bg-blue-100 text-blue-800",
      INTERNSHIP: "bg-purple-100 text-purple-800",
      GRADUATE_TRAINEE: "bg-green-100 text-green-800",
    };
    const labels = {
      PERMANENT: "Permanent",
      INTERNSHIP: "Internship",
      GRADUATE_TRAINEE: "Graduate",
    };
    return { class: badges[type] || badges.PERMANENT, label: labels[type] || type };
  };

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-20 bg-slate-200 rounded"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 bg-slate-200 rounded w-32"></div>
        <div className="h-10 bg-slate-200 rounded w-32"></div>
      </div>
    </div>
  );

  return (
  
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Jobs</h1>
          <p className="text-slate-600 mt-1">View and manage all job postings</p>
        </div>
        <Link
          to="/admin/jobs/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 hover:scale-102"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Job
        </Link>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-slate-500 text-lg">No jobs created yet. Create your first job!</p>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => {
          const typeBadge = getJobTypeBadge(job.jobType);
          
          return (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeBadge.class}`}>
                      {typeBadge.label}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      job.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {job.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{job.department}</p>
                </div>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-slate-500">Experience</p>
                  <p className="font-semibold text-slate-900">{job.yearsExperiance} years</p>
                </div>
                <div>
                  <p className="text-slate-500">Openings</p>
                  <p className="font-semibold text-slate-900">{job.numberOfOpenings}</p>
                </div>
                <div>
                  <p className="text-slate-500">Applicants</p>
                  <p className="font-semibold text-slate-900">{job.applicantCount || 0}</p>
                </div>
                <div>
                  <p className="text-slate-500">Views</p>
                  <p className="font-semibold text-slate-900">{job.viewCount || 0}</p>
                </div>
              </div>

              {/* Deadline */}
              {job.applicationDeadline && (
                <div className="mb-4 flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-600">
                    Deadline: <span className="font-semibold">{formatDate(job.applicationDeadline)}</span>
                  </span>
                </div>
              )}

              <p className="text-slate-700 mb-4">{job.shortDescription}</p>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/admin/jobs/${job.id}/applicants`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 hover:scale-102"
                >
                  View Applicants ({job.applicantCount || 0})
                </Link>
                
                <button
                  onClick={() => toggleJobStatus(job.id, job.active)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-102 ${
                    job.active 
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" 
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {job.active ? "Deactivate" : "Activate"}
                </button>
                
                <button
                  onClick={() => deleteJob(job.id)}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-all duration-200 hover:scale-102"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  
  );
}

export default AdminJobsList;

