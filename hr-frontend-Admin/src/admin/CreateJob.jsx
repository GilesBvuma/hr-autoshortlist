import { useState } from "react";
import adminApi from "../api/adminApi";
import { useNavigate } from "react-router-dom";


export default function CreateJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [yearsExperiance, setYearsExperiance] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [requiredQualifications, setRequiredQualifications] = useState("");

  // NEW FIELDS
  const [jobType, setJobType] = useState("PERMANENT");
  const [numberOfOpenings, setNumberOfOpenings] = useState("1");
  const [applicationDeadline, setApplicationDeadline] = useState("");

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
      requiredQualifications,
      jobType,
      numberOfOpenings: Number(numberOfOpenings),
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
    };

    console.log("📤 Sending job creation request:", payload);

    try {
      const response = await adminApi.post("/api/jobs/create", payload);
      console.log("✅ Job created successfully:", response.data);

      alert("Job created successfully!");

      // Redirect to jobs list
      navigate("/admin/jobs");
    } catch (err) {
      console.error("❌ Create job failed:", err);
      console.error("Error response:", err.response?.data);

      const errorMessage = err.response?.data || err.message || "Failed to create job";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (


    <div className="p-8 max-w-4xl ">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create New Job</h1>
        <p className="text-slate-600 mt-1">Fill in the details to post a new position</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={submitHandler} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">

        {/* Job Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Job Title *
          </label>
          <input
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g. Senior Software Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Department and Job Type (Side by Side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Department *
            </label>
            <input
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g. Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Job Type *
            </label>
            <select
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              required
            >
              <option value="PERMANENT">Permanent/Full-Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="GRADUATE_TRAINEE">Graduate Traineeship</option>
            </select>
          </div>
        </div>

        {/* Years Experience and Number of Openings (Side by Side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Years Experience Required *
            </label>
            <input
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g. 3"
              type="number"
              value={yearsExperiance}
              onChange={(e) => setYearsExperiance(e.target.value)}
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Number of Openings *
            </label>
            <input
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g. 2"
              type="number"
              value={numberOfOpenings}
              onChange={(e) => setNumberOfOpenings(e.target.value)}
              required
              min="1"
            />
          </div>
        </div>

        {/* Application Deadline */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Application Deadline (Optional)
          </label>
          <input
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            type="datetime-local"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
          />
          <p className="text-sm text-slate-500 mt-1">
            Leave empty for no deadline
          </p>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Short Description *
          </label>
          <input
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Brief one-line description for job listings"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
          />
        </div>

        {/* Full Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Full Job Description *
          </label>
          <textarea
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Detailed job description, responsibilities, requirements..."
            rows="6"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Required Skills (comma separated) *
          </label>
          <input
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g. Java, Spring Boot, React, PostgreSQL"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            required
          />
          <p className="text-sm text-slate-500 mt-1">
            Separate each skill with a comma
          </p>
        </div>

        {/* Required Qualifications */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Required Qualifications / Certifications *
          </label>
          <textarea
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g. Degree in HR, IPMZ Diploma, MBA..."
            rows="4"
            value={requiredQualifications}
            onChange={(e) => setRequiredQualifications(e.target.value)}
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition-all duration-200 hover:scale-102 disabled:hover:scale-100"
          >
            {loading ? "Creating Job..." : "Create Job"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/jobs")}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all duration-200 hover:scale-102"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

  );
}