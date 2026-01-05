import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import candidateApi from "../lib/axios";
import CandidateNavbar from "../components/CandidateNavbar";

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        // Increment view count when candidate views details
        const res = await candidateApi.get(`/jobs/${id}?incrementView=true`);
        console.log("Job details:", res.data);
        setJob(res.data);
        setError("");
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const getJobTypeBadge = (type) => {
    const badges = {
      PERMANENT: { class: "bg-blue-100 text-blue-800", label: "Permanent/Full-Time" },
      INTERNSHIP: { class: "bg-purple-100 text-purple-800", label: "Internship" },
      GRADUATE_TRAINEE: { class: "bg-green-100 text-green-800", label: "Graduate Traineeship" },
    };
    return badges[type] || badges.PERMANENT;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    return {
      formatted: formatDate(dateString),
      daysLeft,
      isExpired: daysLeft < 0,
      isUrgent: daysLeft <= 7 && daysLeft >= 0,
    };
  };

  if (loading) {
    return (
      <div>
        <CandidateNavbar />
        <div className="p-5 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return (
    <div>
      <CandidateNavbar />
      <div className="p-5 max-w-4xl mx-auto text-center">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );

  if (!job) return (
    <div>
      <CandidateNavbar />
      <div className="p-5 max-w-4xl mx-auto text-center">
        <p>Job not found.</p>
      </div>
    </div>
  );

  const typeBadge = getJobTypeBadge(job.jobType);
  const deadline = formatDeadline(job.applicationDeadline);
  const postedDate = formatDate(job.createdAt);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100">
      <CandidateNavbar />
      
      <div className="px-6 pt-24 pb-10 max-w-5xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/jobs" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </Link>

        {/* Job Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-8">
            <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                {typeBadge.label}
              </span>
              {job.department && (
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  📍 {job.department}
                </span>
              )}
              {job.numberOfOpenings > 1 && (
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {job.numberOfOpenings} Openings
                </span>
              )}
            </div>

            {postedDate && (
              <p className="text-white/80 text-sm">
                Posted on {postedDate}
              </p>
            )}
          </div>

          {/* Deadline Banner */}
          {deadline && !deadline.isExpired && (
            <div className={`p-4 ${deadline.isUrgent ? "bg-red-50 border-b-2 border-red-300" : "bg-blue-50 border-b-2 border-blue-300"}`}>
              <div className="flex items-center justify-center gap-3">
                <svg className={`w-5 h-5 ${deadline.isUrgent ? "text-red-600" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`font-bold ${deadline.isUrgent ? "text-red-700" : "text-blue-700"}`}>
                  {deadline.isUrgent 
                    ? `⚠️ Applications close in ${deadline.daysLeft} day${deadline.daysLeft !== 1 ? 's' : ''}!`
                    : `Application Deadline: ${deadline.formatted}`
                  }
                </p>
              </div>
            </div>
          )}

          {deadline && deadline.isExpired && (
            <div className="p-4 bg-gray-100 border-b-2 border-gray-300">
              <p className="text-center font-bold text-gray-700">
                ❌ Applications for this position have closed
              </p>
            </div>
          )}

          {/* Content Section */}
          <div className="p-8">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Experience Level</p>
                <p className="text-lg font-bold text-slate-900">
                  {job.yearsExperiance === 0 ? "Entry Level" : `${job.yearsExperiance}+ years`}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Number of Openings</p>
                <p className="text-lg font-bold text-slate-900">{job.numberOfOpenings}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Job Type</p>
                <p className="text-lg font-bold text-slate-900">{typeBadge.label}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Job Description</h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Button */}
            {deadline && deadline.isExpired ? (
              <div className="bg-gray-100 border border-gray-300 rounded-xl p-6 text-center">
                <p className="text-gray-600 font-semibold mb-2">Applications Closed</p>
                <p className="text-sm text-gray-500">This position is no longer accepting applications.</p>
              </div>
            ) : (
              <Link
                to={`/apply/${job.id}`}
                className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center px-8 py-4 rounded-xl text-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 hover:scale-102 shadow-lg"
              >
                Apply for this Position
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;