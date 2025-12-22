import { create } from "zustand";

// CHANGED: Fixed token key to match adminApi interceptor - uses "adminToken" not "token"
export const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem("adminToken"),

  login: (token) => {
    localStorage.setItem("adminToken", token);
    set({ isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    set({ isAuthenticated: false });
  },
}));
