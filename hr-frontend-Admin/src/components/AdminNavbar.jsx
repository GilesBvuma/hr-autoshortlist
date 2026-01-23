import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="font-bold text-xl">HR Admin Panel</h1>

      <ul className="flex gap-6">
        <li>
          <Link className="hover:text-blue-400" to="/admin/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link className="hover:text-blue-400" to="/admin/jobs/create">Create Job</Link>
        </li>
        <li>
          <Link className="hover:text-blue-400" to="/admin/jobs" >Jobs List</Link>
        </li>
        <li>
          <Link className="hover:text-blue-400" to="/admin/interviews">Interviews</Link>
        </li>
      </ul>
      {/* CHANGED: Fixed token key from "token" to "adminToken" */}
      <div>
        <button onClick={handleLogout}
          className="bg-red-600 px-3 py-1 rounded">Logout</button>
      </div>
    </nav>
  );
}

