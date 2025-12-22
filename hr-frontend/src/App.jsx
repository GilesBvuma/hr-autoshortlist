import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Candidates from "./Components/candidates";
import Login from "./pages/Login";
import Register from "./pages/Register";



function App() {
  // Track authentication state
  const [setIsAuthenticated] = useState(
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

        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
    </Router>
      </div>
    </BrowserRouter>
  );
  

}

export default App;

