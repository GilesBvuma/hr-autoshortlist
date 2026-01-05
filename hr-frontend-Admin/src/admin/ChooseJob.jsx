import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";
import { Link } from "react-router-dom";


function ChooseJob() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    adminApi.get("/jobs").then((res) => setJobs(res.data));
  }, []);

  return (
    <div>
      

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Select Job to View Applicants</h1>

        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id} className="p-4 border rounded shadow flex justify-between">
              <span>{job.title}</span>

              <Link
                to={`/admin/jobs/${job.id}/applicants`}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                View Applicants
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ChooseJob;

