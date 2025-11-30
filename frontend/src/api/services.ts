import httpClient from "./httpClient"
import type { Service } from "@/types"

export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const response = await httpClient.get<Service[]>("/services")
    return response.data
  },

  create: async (data: Partial<Service>): Promise<Service> => {
    const response = await httpClient.post<Service>("/services", data)
    return response.data
  },

  update: async (id: string, data: Partial<Service>): Promise<Service> => {
    const response = await httpClient.put<Service>(`/services/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/services/${id}`)
  },
}
