import httpClient from "./httpClient"
import type { WaitlistEntry } from "@/types"

export const waitlistApi = {
  getMyEntries: async (): Promise<WaitlistEntry[]> => {
    const response = await httpClient.get<WaitlistEntry[]>("/waitlist/my-waitlist")
    return response.data
  },

  getAll: async (): Promise<WaitlistEntry[]> => {
    const response = await httpClient.get<WaitlistEntry[]>("/waitlist")
    return response.data
  },

  getById: async (id: number): Promise<WaitlistEntry> => {
    const response = await httpClient.get<WaitlistEntry>(`/waitlist/${id}`)
    return response.data
  },

  create: async (data: Partial<WaitlistEntry>): Promise<WaitlistEntry> => {
    const response = await httpClient.post<WaitlistEntry>("/waitlist", data)
    return response.data
  },

  update: async (id: number, data: Partial<WaitlistEntry>): Promise<WaitlistEntry> => {
    const response = await httpClient.post<WaitlistEntry>(`/waitlist/update/${id}`, data)
    return response.data
  },

  updateMy: async (id: number, data: Partial<WaitlistEntry>): Promise<WaitlistEntry> => {
    const response = await httpClient.post<WaitlistEntry>(`/waitlist/update-my/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await httpClient.delete(`/waitlist/${id}`)
  },
}
