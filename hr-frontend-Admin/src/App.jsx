import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import RegisterPage from "./pages/RegisterPage";

import AdminDashboard from "./admin/AdminDashboard";
import CreateJob from "./admin/CreateJob";
import AdminJobsList from "./admin/AdminJobsList";
import ChooseJob from "./admin/ChooseJob";
import ShortlistReview from "./admin/ShortlistReview";
import ApplicantsByJobAdmin from "./admin/ApplicantsByJobAdmin";
import CandidatesPage from "./pages/CandidatesPage";
import AllApplicants from "./pages/AllApplicants";
import InterviewsPage from "./admin/InterviewsPage";

import JobList from "./pages/JobList";
import ApplicantsByJob from "./pages/ApplicantsByJob";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="jobs" element={<AdminJobsList />} />
          <Route path="jobs/create" element={<CreateJob />} />
          <Route path="jobs/choose" element={<ChooseJob />} />
          <Route path="jobs/:jobId/shortlist-review" element={<ShortlistReview />} />
          <Route path="jobs/:jobId/applicants" element={<ApplicantsByJobAdmin />} />
          <Route path="applicants" element={<AllApplicants />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="interviews" element={<InterviewsPage />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* LEGACY / PUBLIC */}
        <Route path="/jobs" element={<JobList />} />
        <Route
          path="/admin/jobs/:jobId/applicants-old"
          element={<ApplicantsByJob />}
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;

