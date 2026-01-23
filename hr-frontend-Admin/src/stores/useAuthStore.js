import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: localStorage.getItem("adminToken") || null,
      isAuthenticated: !!localStorage.getItem("adminToken"),

      login: (data) => {
        const token = data.token;
        if (token) {
          localStorage.setItem("adminToken", token);
        }
        set({
          user: data.user ?? null,
          token: token ?? null,
          isAuthenticated: true,
        });
      },

      fetchProfile: async () => {
        const { default: adminApi } = await import("../api/adminApi");
        try {
          const res = await adminApi.get("/api/auth/me");
          set({ user: res.data, isAuthenticated: true });
        } catch (err) {
          console.error("Profile fetch failed:", err);
          localStorage.removeItem("adminToken");
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      logout: () => {
        localStorage.removeItem("adminToken");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "admin-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);


