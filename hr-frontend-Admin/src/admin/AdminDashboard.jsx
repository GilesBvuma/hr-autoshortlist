import AdminNavbar from "../components/AdminNavbar";

export default function AdminDashboard() {
  return (
    <div>
      {/* ADMIN NAVBAR */}
      <AdminNavbar />

      {/* PAGE CONTENT */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

        <p className="text-gray-700">
          Welcome to the HR Admin Dashboard. Use the navigation above to manage jobs
          and view candidates who have applied.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Create New Job</h2>
            <p>Add a new job posting for applicants to see and apply to.</p>
          </div>

          <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-2">View Candidates</h2>
            <p>Review all applicants who have applied for job postings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


