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
    <div>
      <CandidateNavbar />
      <div className="p-5">
        <h2 className="text-3xl font-bold mb-4">Available Positions</h2>
        
        {loading && <p>Loading jobs...</p>}
        
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && !error && jobs.length === 0 && (
          <p>No openings available at the moment.</p>
        )}
        
        <ul className="space-y-4">
          {jobs.map(job => (
            <li key={job.id} className="border p-4 rounded shadow">
              <h3 className="text-xl font-bold">{job.title}</h3>
              {job.department && (
                <p className="text-sm text-gray-600">Department: {job.department}</p>
              )}
              {job.yearsExperiance && (
                <p className="text-sm text-gray-600">Experience: {job.yearsExperiance} years</p>
              )}
              <p className="mt-2">{job.shortDescription}</p>
              <Link 
                to={`/jobs/${job.id}`} 
                className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Details
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
