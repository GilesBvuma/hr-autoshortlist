import { useState } from "react";
import adminApi from "../api/adminApi";
import AdminNavbar from "../components/AdminNavbar";

export default function CreateJob() {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [yearsExperiance, setYearsExperiance] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title,
      department,
      yearsExperiance: Number(yearsExperiance),
      shortDescription,
      description,
      skills: skills.split(",").map((s) => s.trim()),
    };

    console.log("📤 Sending job creation request:", payload);

    try {
      // FIXED: Changed from /jobs/create to /api/jobs/create
      const response = await adminApi.post("/api/jobs/create", payload);
      console.log("✅ Job created successfully:", response.data);
      
      alert("Job created successfully!");
      
      // Clear form
      setTitle("");
      setDepartment("");
      setYearsExperiance("");
      setShortDescription("");
      setDescription("");
      setSkills("");
      
      // Redirect to jobs list
      setTimeout(() => {
        window.location.href = "/admin/jobs";
      }, 1000);
    } catch (err) {
      console.error("❌ Create job failed:", err);
      console.error("Error response:", err.response?.data);
      
      const errorMessage = err.response?.data || err.message || "Failed to create job";
      setError(errorMessage);
      alert("Failed to create job: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-b from-white via-blue-100 to-blue-500">
    <AdminNavbar />

    {/* Center wrapper */}
    <div className="flex justify-center px-4 pt-20 pb-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
        
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Create New Job
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Job Title *</label>
            <input
              className="w-full rounded-lg bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Senior Software Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department *</label>
            <input
              className="w-full rounded-lg bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Years Experience Required *
            </label>
            <input
              type="number"
              className="w-full rounded-lg bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 3"
              value={yearsExperiance}
              onChange={(e) => setYearsExperiance(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Short Description *
            </label>
            <input
              className="w-full rounded-lg bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief one-line description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Full Job Description *
            </label>
            <textarea
              rows="5"
              className="w-full rounded-xl bg-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed job description, responsibilities, requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Required Skills (comma separated) *
            </label>
            <input
              className="w-full rounded-lg bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Java, Spring Boot, React, PostgreSQL"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Creating Job..." : "Create Job"}
          </button>
        </form>
      </div>
    </div>
  </div>
);
}