import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreateJob from "./admin/CreateJob";
import AdminDashboard from "./admin/AdminDashboard";
import CandidatesPage from "./pages/CandidatesPage";
import CandidatesByJob from "./pages/CandidatesByJob";
import CandidateLogin from "./pages/CandidateLogin";
import CandidateRegister from "./pages/CandidateRegister";
import { useCandidateAuthStore } from "./stores/useCandidateAuthStore";
import AdminJobsList from "./admin/AdminJobsList";
import ChooseJob from "./admin/ChooseJob";
import ApplicantsByJobAdmin from "./admin/ApplicantsByJobAdmin";

import { useAuthStore } from "./stores/useAuthStore";

import JobList from "./components/JobLists";      // You said the file is JobLists.jsx
import JobDetails from "./components/JobDetails"; // JobDetails.jsx
import ApplyJob from "./components/ApplyJob";     // ApplyJob.jsx

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const candidateIsAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/apply/:id" element={<ApplyJob />} />
        <Route path="/candidates/job/:jobId" element={<CandidatesByJob />} />
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/candidate/register" element={<CandidateRegister />} />
        <Route path="/admin/home" element={<CandidatesPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/jobs/create" element={<CreateJob />} />
        <Route path="/admin/jobs" element={<AdminJobsList />} />
        <Route path="/admin/jobs/choose" element={<ChooseJob />} />
        <Route path="/admin/jobs/:jobId/applicants" element={<ApplicantsByJobAdmin />} />


        {/* Protected */}
        <Route
          path="/candidates"
          element={
            isAuthenticated ? <CandidatesPage /> : <Navigate to="/login" />
          }
        />
        <Route 
          path="/apply/:id" 
          element={
            candidateIsAuthenticated ? <ApplyJob /> : <Navigate to="/candidate/login" />
        }
        />
        <Route 
          path="/apply/:id" 
          element={
            useCandidateAuthStore.getState().isCandidateAuthenticated
          ? <ApplyJob />
          : <Navigate to="/candidate/login" />
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
