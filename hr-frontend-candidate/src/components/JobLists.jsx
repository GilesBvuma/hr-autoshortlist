import { useEffect, useState } from "react";
import candidateApi from "../lib/axios";
import { Link } from "react-router-dom";
import CandidateSidebar from "../components/CandidateSidebar";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, PERMANENT, INTERNSHIP, GRADUATE_TRAINEE

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await candidateApi.get("/jobs/active");
        console.log("Jobs fetched:", res.data);
        setJobs(res.data);
        setError("");
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const getJobTypeBadge = (type) => {
    const badges = {
      PERMANENT: { class: "bg-sky-100 text-sky-800", label: "Permanent" },
      INTERNSHIP: { class: "bg-indigo-100 text-indigo-800", label: "Internship" },
      GRADUATE_TRAINEE: { class: "bg-emerald-100 text-emerald-800", label: "Graduate Program" },
    };
    return badges[type] || badges.PERMANENT;
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    return {
      formatted: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      daysLeft,
      isExpired: daysLeft < 0,
      isUrgent: daysLeft <= 7 && daysLeft >= 0,
    };
  };

  const filteredJobs = filter === "ALL"
    ? jobs
    : jobs.filter(job => job.jobType === filter);

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-slate-200 rounded w-20"></div>
        <div className="h-6 bg-slate-200 rounded w-24"></div>
      </div>
      <div className="h-10 bg-slate-200 rounded w-32"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <CandidateSidebar />

      <div className="flex-1 w-full lg:ml-64 px-4 sm:px-6 pt-24 lg:pt-12 pb-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">
            Available Positions
          </h2>
          <p className="text-slate-600">
            Explore opportunities and find your perfect role
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["ALL", "PERMANENT", "INTERNSHIP", "GRADUATE_TRAINEE"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${filter === type
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
            >
              {type === "ALL" ? "All Jobs" :
                type === "PERMANENT" ? "Permanent" :
                  type === "INTERNSHIP" ? "Internships" : "Graduate Programs"}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16 bg-white rounded-2xl border border-red-200">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredJobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-600 text-lg">
              {filter === "ALL" ? "No openings available at the moment." : `No ${filter.toLowerCase().replace('_', ' ')} positions available.`}
            </p>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const typeBadge = getJobTypeBadge(job.jobType);
            const deadline = formatDeadline(job.applicationDeadline);

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 hover:scale-102 flex flex-col"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900 flex-1">
                      {job.title}
                    </h3>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeBadge.class}`}>
                      {typeBadge.label}
                    </span>
                    {job.numberOfOpenings > 1 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                        {job.numberOfOpenings} Openings
                      </span>
                    )}
                  </div>

                  {/* Department */}
                  {job.department && (
                    <p className="text-sm text-slate-600 mb-1">
                      📍 {job.department}
                    </p>
                  )}

                  {/* Experience */}
                  {job.yearsExperiance !== null && (
                    <p className="text-sm text-slate-600">
                      💼 {job.yearsExperiance === 0 ? "Entry Level" : `${job.yearsExperiance}+ years experience`}
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-slate-700 text-sm mb-4 flex-1">
                  {job.shortDescription}
                </p>

                {/* Deadline Warning */}
                {deadline && !deadline.isExpired && (
                  <div className={`mb-4 p-3 rounded-lg ${deadline.isUrgent
                      ? "bg-red-50 border border-red-200"
                      : "bg-blue-50 border border-blue-200"
                    }`}>
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 ${deadline.isUrgent ? "text-red-600" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className={`text-xs font-semibold ${deadline.isUrgent ? "text-red-700" : "text-blue-700"}`}>
                        {deadline.isUrgent
                          ? `⚠️ ${deadline.daysLeft} day${deadline.daysLeft !== 1 ? 's' : ''} left!`
                          : `Closes ${deadline.formatted}`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {deadline && deadline.isExpired && (
                  <div className="mb-4 p-3 rounded-lg bg-gray-100 border border-gray-300">
                    <p className="text-xs font-semibold text-gray-600">
                      ❌ Applications closed
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <Link
                  to={`/jobs/${job.id}`}
                  className={`inline-block text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${deadline && deadline.isExpired
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-102"
                    }`}
                  onClick={(e) => {
                    if (deadline && deadline.isExpired) {
                      e.preventDefault();
                    }
                  }}
                >
                  {deadline && deadline.isExpired ? "Applications Closed" : "View Details & Apply"}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Results Count */}
        {!loading && !error && filteredJobs.length > 0 && (
          <div className="mt-8 text-center text-slate-600">
            Showing {filteredJobs.length} {filteredJobs.length === 1 ? "position" : "positions"}
            {filter !== "ALL" && ` in ${filter.replace('_', ' ').toLowerCase()}`}
          </div>
        )}
      </div>
    </div>
  );
}
