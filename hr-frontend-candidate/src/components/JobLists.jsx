// hr-frontend-candidate/src/components/JobLists.jsx
import { useEffect, useState } from "react";
import candidateApi from "../lib/axios";
import { Link } from "react-router-dom";
import CandidateNavbar from "../components/CandidateNavbar";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
  <>
  <div className="min-h-screen bg-gradient-to-b from-white via-blue-100 to-blue-500">
    <CandidateNavbar />

    <div className="px-6 pt-16 pb-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8">
        Available Positions
      </h2>

      {loading && <p className="text-gray-600">Loading jobs...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <p className="text-gray-600">
          No openings available at the moment.
        </p>
      )}

      <ul className="space-y-8">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="bg-white rounded-3xl shadow-lg px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            {/* Job Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">
                {job.title}
              </h3>

              {job.department && (
                <p className="text-sm text-gray-600">
                  Department: {job.department}
                </p>
              )}

              {job.yearsExperiance && (
                <p className="text-sm text-gray-600">
                  Experience: {job.yearsExperiance} years
                </p>
              )}

              <p className="mt-3 text-gray-700">
                {job.shortDescription}
              </p>
            </div>

            {/* Action */}
            <div className="mt-4 md:mt-0">
              <Link
                to={`/jobs/${job.id}`}
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                View Details
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
  </>
);

}
