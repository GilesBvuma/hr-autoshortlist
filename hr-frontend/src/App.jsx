import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Candidates from "./Components/candidates";
import Login from "./Components/Login";
import Register from "./Components/Register";



function App() {
  // Track authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );


  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <div>
        <h1>HR Auto Shortlist</h1>

        <button 
          onClick={logout} 
          className="bg-red-500 text-white px-3 py-2 rounded mb-3"
        >
          Logout
        </button>

        <Routes>

          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />


          {/* Protected Route */}
          <Route 
            path="/candidates"
            element={
              isAuthenticated ? <Candidates /> : <Navigate to="/login" />
            }
          />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
  

}

export default App;

