import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CandidateLogin from "./pages/CandidateLogin";
import CandidateRegister from "./pages/CandidateRegister";
import JobsList from "./components/JobLists";
import JobDetails from "./components/JobDetails";
import ApplyJob from "./components/ApplyJob";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/jobs" />} />

        {/* PUBLIC JOB ROUTES */}
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/apply/:id" element={<ApplyJob />} />

        {/* AUTH ROUTES */}
        <Route path="/auth/CandidateLogin" element={<CandidateLogin />} />
        <Route path="/auth/CandidateRegister" element={<CandidateRegister />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

