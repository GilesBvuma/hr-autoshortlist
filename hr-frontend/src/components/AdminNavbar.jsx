import { Link } from "react-router-dom";

export default function AdminNavbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="font-bold text-xl">HR Admin Panel</h1>

      <ul className="flex gap-6">
        <li>
          <Link className="hover:text-blue-400" to="/admin/home">Home</Link>
        </li>
        <li>
          <Link className="hover:text-blue-400" to="/admin/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link className="hover:text-blue-400" to="/admin/jobs/create">Create Job</Link>
        </li>
        <li>
            <Link to="/admin/jobs" className="hover:text-blue-400">Jobs List</Link>
        </li>
        <li>
            <Link to="/admin/jobs/choose" className="hover:text-blue-400">Applicants</Link>
        </li>
      </ul>
    </nav>
  );
}
