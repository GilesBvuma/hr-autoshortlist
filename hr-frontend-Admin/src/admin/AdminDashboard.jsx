import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    inactiveJobs: 0,
    totalViews: 0,
    jobTypeBreakdown: {},
  });
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 useEffect(() => {
  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log("📥 Fetching dashboard statistics...");
      
      // Fetch all jobs
      const jobsRes = await adminApi.get("/api/jobs");
      console.log("✅ Jobs fetched:", jobsRes.data);
      
      const jobs = jobsRes.data;
      
      // Calculate job statistics
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(job => job.active === true).length;
      const inactiveJobs = jobs.filter(job => job.active === false).length;
      const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);
      
      // Calculate job type breakdown
      const jobTypeBreakdown = jobs.reduce((acc, job) => {
        const type = job.jobType || "PERMANENT";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      console.log("📊 Calculated stats:", {
        totalJobs,
        activeJobs,
        inactiveJobs,
        totalViews,
        jobTypeBreakdown
      });

      setStats({
        totalJobs,
        activeJobs,
        inactiveJobs,
        totalViews,
        jobTypeBreakdown,
      });

      // Fetch applicant count
      const applicantsRes = await adminApi.get("/api/applications/all");
      console.log("✅ Applicants:", applicantsRes.data.length);
      setTotalApplicants(applicantsRes.data.length);
      
      setError("");
    } catch (err) {
      console.error("❌ Failed to fetch statistics:", err);
      console.error("Error details:", err.response?.data);
      setError("Failed to load statistics. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  fetchStats();

  }, []);

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link
      to={link}
      className={`bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all duration-200 hover:scale-102`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? (
              <span className="inline-block w-16 h-8 bg-slate-200 animate-pulse rounded"></span>
            ) : (
              value
            )}
          </p>
        </div>
        <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Welcome back! Here's what's happening with your recruitment.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          color="text-blue-600"
          link="/admin/jobs"
          icon={
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          color="text-green-600"
          link="/admin/jobs"
          icon={
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Total Applicants"
          value={totalApplicants}
          color="text-purple-600"
          link="/admin/applicants"
          icon={
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <StatCard
          title="Total Views"
          value={stats.totalViews}
          color="text-orange-600"
          link="/admin/jobs"
          icon={
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
      </div>

      {/* Job Type Breakdown */}
      {stats.jobTypeBreakdown && Object.keys(stats.jobTypeBreakdown).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Job Type Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.jobTypeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">
                  {type === "INTERNSHIP" ? "Internships" : type === "GRADUATE_TRAINEE" ? "Graduate Traineeships" : "Permanent"}
                </span>
                <span className="text-2xl font-bold text-blue-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/jobs/create"
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-102 group"
          >
            <div className="p-3 bg-blue-600 rounded-lg mr-4 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Create New Job</p>
              <p className="text-sm text-slate-600">Post a new position</p>
            </div>
          </Link>

          <Link
            to="/admin/applicants"
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all duration-200 hover:scale-102 group"
          >
            <div className="p-3 bg-purple-600 rounded-lg mr-4 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900">View All Applicants</p>
              <p className="text-sm text-slate-600">Review candidates</p>
            </div>
          </Link>

          <Link
            to="/admin/jobs/choose"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-102 group"
          >
            <div className="p-3 bg-green-600 rounded-lg mr-4 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900">AI Shortlist</p>
              <p className="text-sm text-slate-600">Smart candidate ranking</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}