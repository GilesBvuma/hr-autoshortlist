import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./admin/AdminDashboard";
import CreateJob from "./admin/CreateJob";
import AdminJobsList from "./admin/AdminJobsList";
import ChooseJob from "./admin/ChooseJob";
import ApplicantsByJobAdmin from "./admin/ApplicantsByJobAdmin";
import CandidatesPage from "./pages/CandidatesPage";
// ADDED: Missing imports for JobList and ApplicantsByJob components
import JobList from "./pages/JobList";
import ApplicantsByJob from "./pages/ApplicantsByJob";

import { useAuthStore } from "./stores/useAuthStore";
import AllApplicants from "./pages/AllApplicants";

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <BrowserRouter>

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/admin/dashboard"
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin/jobs"
          element={isAuthenticated ? <AdminJobsList /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin/jobs/create"
          element={isAuthenticated ? <CreateJob /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin/jobs/choose"
          element={isAuthenticated ? <ChooseJob /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin/jobs/:jobId/applicants"
          element={isAuthenticated ? <ApplicantsByJobAdmin /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin/candidates"
          element={isAuthenticated ? <CandidatesPage /> : <Navigate to="/login" />}
        />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/admin/jobs/:jobId/applicants" element={<ApplicantsByJob />} />

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/login" />} />
        <Route
        path="/admin/applicants"
        element={isAuthenticated ? <AllApplicants /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

