// hr-frontend-candidate/src/components/JobDetails.jsx
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
        const res = await candidateApi.get(`/jobs/${id}`);
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

  if (loading) return <p className="p-5">Loading...</p>;
  if (error) return <p className="p-5 text-red-500">{error}</p>;
  if (!job) return <p className="p-5">Job not found.</p>;

  return (
  <div className="min-h-screen bg-gradient-to-b from-white via-blue-100 to-blue-500">
    <CandidateNavbar />

    <div className="px-6 pt-16 pb-10 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">
          {job.title}
        </h2>

        {job.department && (
          <p className="text-gray-600 mt-1">
            Department: {job.department}
          </p>
        )}

        {job.yearsExperiance && (
          <p className="text-gray-600">
            Required Experience: {job.yearsExperiance} years
          </p>
        )}

        {/* Description */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Job Description
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Required Skills
            </h3>

            <div className="flex flex-wrap gap-3">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <div className="mt-8">
          <Link
            to={`/apply/${job.id}`}
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  </div>
);

}

export default JobDetails;