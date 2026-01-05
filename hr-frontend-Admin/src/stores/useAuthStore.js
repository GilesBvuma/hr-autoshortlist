import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (data) =>
    set({
      user: data.user ?? null,
      token: data.token ?? null,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    }),
}));


