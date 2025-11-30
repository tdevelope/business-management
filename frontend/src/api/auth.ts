import httpClient from "./httpClient"
import type { AuthResponse, User } from "@/types"

export const authApi = {
  register: async (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
  }): Promise<AuthResponse> => {
    const response = await httpClient.post<AuthResponse>("/auth/register", data)
    return response.data
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await httpClient.post<AuthResponse>("/auth/login", data)
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await httpClient.get<User>("/auth/me")
    return response.data
  },
}
