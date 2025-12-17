import httpClient from "./httpClient"
import type { User } from "@/types"

interface CreateUserData extends Partial<User> {
  password?: string
}

export const usersApi = {
  getAllCustomers: async (): Promise<User[]> => {
    const response = await httpClient.get<User[]>("/users?role=customer")
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await httpClient.get<User>("/users/me")
    return response.data
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await httpClient.post<User>("/users", data)
    return response.data
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await httpClient.patch<User>(`/users/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/users/${id}`)
  },
}
