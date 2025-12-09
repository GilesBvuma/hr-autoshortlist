import { create } from "zustand";

export const useCandidateAuthStore = create((set) => ({
  isCandidateAuthenticated: false,
  token: null,

  login: (token) =>
    set({ isCandidateAuthenticated: true, token }),

  logout: () =>
    set({ isCandidateAuthenticated: false, token: null }),
}));
