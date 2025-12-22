import { useState } from "react";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";

export default function CreateJob() {
  const [title, setTitle] = useState("");
  const [department , setDepartment] = useState("");
  const [yearsExperiance , setYearsExperiance] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      department,
      yearsExperiance :Number(yearsExperiance),
      shortDescription,
      description,
      skills: skills.split(",").map((s) => s.trim()),
    };
    // CHANGED: Fixed API path - added leading "/" for proper URL resolution
    try {
      await adminApi.post("/jobs/create", payload); // matches backend endpoint
      alert("Job created successfully");
      // optionally redirect to job list:
      window.location.href = "/admin/jobs";
    } catch (err) {
      console.error("Create job failed", err);
      alert("Failed to create job");
    }

  };
  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <AdminNavbar />

      <div className="p-6 max-w-2xl mx-auto bg-white border rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Create New Job</h2>

        <form onSubmit={submitHandler} className="space-y-4">
          <input
            className="border p-2 w-full"
            placeholder="Job Title"
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="border p-2 w-full"
            placeholder="Department"
            onChange={(e) => setDepartment(e.target.value)}
          />

          <input
            className="border p-2 w-full"
            placeholder = "Years Experience"
            type="number"
            onChange={(e) => setYearsExperiance(e.target.value)}
          />

          <input
            className="border p-2 w-full"
            placeholder="Short Description"
            onChange={(e) => setShortDescription(e.target.value)}
          />

          <textarea
            className="border p-2 w-full"
            placeholder="Full Job Description"
            rows="5"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <input
            className="border p-2 w-full"
            placeholder="Required Skills (comma separated)"
            onChange={(e) => setSkills(e.target.value)}
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Job
          </button>
        </form>
      </div>
    </div>
  );
}


