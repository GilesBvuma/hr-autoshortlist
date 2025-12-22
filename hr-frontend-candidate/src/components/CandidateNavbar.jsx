// hr-frontend-candidate/src/components/CandidateNavbar.jsx
import { Link } from "react-router-dom";

export default function CandidateNavbar() {
  return (
    <nav className="bg-blue-600 text-white px-4 py-3 flex gap-6">
      <Link to="/jobs">Jobs</Link>
      <Link to="/candidate/login">Login</Link>
    </nav>
  );
}
