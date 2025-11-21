import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-200">
      <h1 className="text-xl font-bold">HR Auto Shortlist</h1>

      <div className="flex gap-4">
        {isAuthenticated && (
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
