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
    <div>
      <CandidateNavbar />
      <div className="p-5 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold">{job.title}</h2>
        
        {job.department && (
          <p className="text-lg text-gray-600 mt-2">Department: {job.department}</p>
        )}
        
        {job.yearsExperiance && (
          <p className="text-lg text-gray-600">Required Experience: {job.yearsExperiance} years</p>
        )}
        
        <div className="mt-5">
          <h3 className="text-xl font-semibold mb-2">Job Description</h3>
          <p className="whitespace-pre-wrap">{job.description}</p>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="mt-5">
            <h3 className="text-xl font-semibold mb-2">Required Skills</h3>
            <ul className="list-disc pl-6">
              {job.skills.map((skill, index) => (
                <li key={index} className="mb-1">{skill}</li>
              ))}
            </ul>
          </div>
        )}

        <Link 
          to={`/apply/${job.id}`} 
          className="mt-6 inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
        >
          Apply Now
        </Link>
      </div>
    </div>
  );
}

export default JobDetails;