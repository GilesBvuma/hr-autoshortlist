import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";
import { Link } from "react-router-dom";

export default function AdminJobsList() {
  const [jobs, setJobs] = useState([]);

  // CHANGED: Fixed API path - removed duplicate "/api" since baseURL already has it
  const loadJobs = async () => {
    try {
      const res = await adminApi.get("/jobs");// removed the ("/api/job")
      setJobs(res.data);
    } catch (err) {
      console.error("Error loading jobs", err);
      setJobs([]);
    }
  };

  useEffect(() => {
    const fetchData = async () =>{
        await loadJobs();
    };

    fetchData();
    
  }, []);

  // CHANGED: Fixed API path - removed duplicate "/api"
  const deleteJob = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await adminApi.delete(`/jobs/${id}`);
      loadJobs(); // refresh list
    } catch (err) {
      console.error("Error deleting job", err);
    }
  };
return (
    <div>
      <AdminNavbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">All Job Posts</h1>
        {jobs.length === 0 && <p>No jobs created yet.</p>}
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-bold">{job.title}</h2>
              <p className="text-gray-700">{job.shortDescription}</p>
              <div className="flex gap-4 mt-4">
                <Link to={`/admin/jobs/${job.id}/applicants`} className="bg-blue-600 text-white px-3 py-2 rounded">View Applicants</Link>
                <button onClick={() => deleteJob(job.id)} className="bg-red-600 text-white px-3 py-2 rounded">Delete Job</button>
              </div>
            </li>
            ))}
        </ul>
      </div>
    </div>
  );
}