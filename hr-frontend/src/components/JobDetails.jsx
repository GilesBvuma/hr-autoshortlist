// PATH: src/Components/JobDetails.jsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../lib/axios";

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    axios.get(`/jobs/${id}`)
      .then(res => setJob(res.data))
      .catch(err => console.error("Error fetching job", err));
  }, [id]);

  if (!job) return <p>Loading...</p>;

  return (
    <div className="p-5">
      <h2 className="text-3xl font-bold">{job.title}</h2>
      <p className="mt-3">{job.description}</p>

      <h3 className="text-xl font-semibold mt-5">Required Skills</h3>
      <ul className="list-disc pl-6">
        {job.skills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>

      <Link
        to={`/apply/${job.id}`}
        className="mt-6 inline-block bg-green-600 text-white px-4 py-2 rounded"
      >
        Apply Now
      </Link>
    </div>
  );
}

export default JobDetails;
