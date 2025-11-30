import { create } from "zustand"
import type { User } from "@/types"
import { authApi } from "@/api/auth"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
    set({ user: null, token: null, isAuthenticated: false })
  },

  restoreSession: async () => {
    if (typeof window === "undefined") {
      set({ isLoading: false })
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      set({ isLoading: false })
      return
    }

    try {
      const user = await authApi.getMe()
      set({ user, token, isAuthenticated: true, isLoading: false })
    } catch (error) {
      localStorage.removeItem("token")
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
