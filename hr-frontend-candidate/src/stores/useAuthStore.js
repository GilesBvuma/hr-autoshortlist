import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // Check for either admin or candidate token initially
  isAuthenticated: !!localStorage.getItem("adminToken") || !!localStorage.getItem("candidateToken"),
  user: JSON.parse(localStorage.getItem("userData")) || null,
  token: localStorage.getItem("adminToken") || localStorage.getItem("candidateToken") || null,

  login: (data) => {
    // data should be { user, token, type: 'admin' | 'candidate' }
    const tokenKey = data.type === 'admin' ? "adminToken" : "candidateToken";
    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem("userData", JSON.stringify(data.user));

    set({
      isAuthenticated: true,
      user: data.user,
      token: data.token
    });
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("candidateToken");
    localStorage.removeItem("userData");
    set({
      isAuthenticated: false,
      user: null,
      token: null
    });
  },
}));
