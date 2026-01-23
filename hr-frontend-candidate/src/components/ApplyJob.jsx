import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import candidateApi from "../lib/axios";
import CandidateSidebar from "./CandidateSidebar";
import { useAuthStore } from "../stores/useAuthStore";

export default function ApplyJob() {
  const { id } = useParams(); // job id
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const candidateUserId = user?.id;

  // 🛡️ AUTH GUARD: If not logged in, redirect to login
  useEffect(() => {
    const token = localStorage.getItem("candidateToken");
    if (!token || !isAuthenticated) {
      navigate(`/auth/CandidateLogin?returnUrl=/apply/${id}`);
    }
  }, [isAuthenticated, navigate, id]);

  const [skills, setSkills] = useState("");
  const [candidateQualifications, setCandidateQualifications] = useState("");
  const [cv, setCv] = useState(null);
  const [letter, setLetter] = useState(null);
  const [certifications, setCertifications] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);

  // Fetch job details to show info and check deadline
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await candidateApi.get(`/jobs/${id}`);
        setJob(res.data);

        // Check if deadline has passed
        if (res.data.applicationDeadline) {
          const deadline = new Date(res.data.applicationDeadline);
          const now = new Date();
          if (deadline < now) {
            setError("Applications for this position have closed.");
          }
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details.");
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();
  }, [id]);

  const submitHandler = async (e) => {
    e.preventDefault();

    // Check deadline again before submitting
    if (job?.applicationDeadline) {
      const deadline = new Date(job.applicationDeadline);
      const now = new Date();
      if (deadline < now) {
        setError("Applications for this position have closed.");
        return;
      }
    }

    setLoading(true);
    setError("");

    const form = new FormData();
    form.append("jobId", id);
    form.append("candidateUserId", candidateUserId);
    form.append("skills", skills);
    form.append("candidateQualifications", candidateQualifications);
    if (cv) form.append("cv", cv);
    if (letter) form.append("letter", letter);
    if (certifications) form.append("certifications", certifications);

    console.log("📤 Submitting application for job:", id);

    try {
      const response = await candidateApi.post("/applications", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ Application submitted:", response.data);

      alert("🎉 Application submitted successfully!");
      navigate("/jobs");
    } catch (err) {
      console.error("❌ Apply failed:", err);
      const errorMsg = err.response?.data || "Failed to submit application";
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    return {
      formatted: date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      daysLeft,
      isExpired: daysLeft < 0,
      isUrgent: daysLeft <= 7 && daysLeft >= 0,
    };
  };

  if (loadingJob) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
        <CandidateSidebar />
        <div className="flex-1 lg:ml-64 p-6 pt-24 lg:pt-12 max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const deadline = job?.applicationDeadline ? formatDeadline(job.applicationDeadline) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <CandidateSidebar />

      <div className="flex-1 lg:ml-64 max-w-3xl mx-auto px-4 sm:px-6 pt-24 lg:pt-12 pb-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Job Info Header */}
          {job && (
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
              <h2 className="text-3xl font-bold mb-2">{job.title}</h2>
              {job.department && (
                <p className="text-white/90">{job.department}</p>
              )}
            </div>
          )}

          {/* Deadline Warning */}
          {deadline && !deadline.isExpired && (
            <div className={`p-4 ${deadline.isUrgent ? "bg-red-50 border-b-2 border-red-300" : "bg-blue-50 border-b-2 border-blue-300"}`}>
              <div className="flex items-center justify-center gap-3">
                <svg className={`w-5 h-5 ${deadline.isUrgent ? "text-red-600" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`font-bold ${deadline.isUrgent ? "text-red-700" : "text-blue-700"}`}>
                  {deadline.isUrgent
                    ? `⚠️ Deadline: ${deadline.daysLeft} day${deadline.daysLeft !== 1 ? 's' : ''} remaining!`
                    : `Application Deadline: ${deadline.formatted}`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Application Closed Message */}
            {deadline && deadline.isExpired ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Applications Closed</h3>
                <p className="text-gray-600">The deadline for this position has passed.</p>
                <button
                  onClick={() => navigate("/jobs")}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
                >
                  Browse Other Opportunities
                </button>
              </div>
            ) : (
              <form onSubmit={submitHandler} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Make sure all information is accurate before submitting. You cannot edit your application after submission.
                  </p>
                </div>

                {/* Skills Summary */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Skills Summary *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    rows="5"
                    placeholder="Describe your relevant skills and experience. Example:&#10;• 5+ years of Java development&#10;• Expert in Spring Boot and microservices&#10;• Experience with AWS and Docker&#10;• Strong problem-solving skills"
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Highlight skills relevant to this position
                  </p>
                </div>

                {/* Candidate Qualifications */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Qualifications & Certifications
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={candidateQualifications}
                    onChange={(e) => setCandidateQualifications(e.target.value)}
                    rows="3"
                    placeholder="List your specific qualifications (e.g. MBA, IPMZ Diploma)..."
                  />
                </div>

                {/* Certifications Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload Merged Certifications (PDF)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setCertifications(e.target.files[0])}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {certifications && (
                      <p className="text-sm text-green-600 mt-2">✓ {certifications.name}</p>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Please merge all certificates into a single PDF
                  </p>
                </div>

                {/* CV Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload CV (PDF) *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setCv(e.target.files[0])}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {cv && (
                      <p className="text-sm text-green-600 mt-2">✓ {cv.name}</p>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    PDF format only, maximum 5MB
                  </p>
                </div>

                {/* Cover Letter Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload Cover Letter (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setLetter(e.target.files[0])}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {letter && (
                      <p className="text-sm text-green-600 mt-2">✓ {letter.name}</p>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Any document format, maximum 5MB
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 hover:scale-102 disabled:hover:scale-100 shadow-lg"
                    type="submit"
                    disabled={loading || !cv}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                  {!cv && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      Please upload your CV to submit
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

