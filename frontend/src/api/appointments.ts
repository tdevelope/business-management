import httpClient from "./httpClient"
import type { Appointment, AppointmentSuggestion, CreateAppointmentDto, CheckAvailabilityDto } from "@/types"

export const appointmentsApi = {
  checkAvailability: async (data: CheckAvailabilityDto): Promise<AppointmentSuggestion[]> => {
    const response = await httpClient.post<AppointmentSuggestion[]>("/appointments/checkAvailability", data)
    return response.data
  },

  getSuggestions: async (data: {
    serviceId: string
    date: string
    preferredTime: string
  }): Promise<AppointmentSuggestion[]> => {
    const response = await httpClient.post<AppointmentSuggestion[]>(
      "/appointments/getSuggestions",
      data
    )
    return response.data
  },

  create: async (data: CreateAppointmentDto): Promise<Appointment> => {
    const response = await httpClient.post<Appointment>("/appointments", data)
    return response.data
  },
  
  getAll: async (): Promise<Appointment[]> => {
    const response = await httpClient.get<Appointment[]>("/appointments");
    return response.data;
  },

  getForDate: async (date: string): Promise<Appointment[]> => {
    const response = await httpClient.get<Appointment[]>(`/appointments/date?date=${date}`)
    return response.data
  },

  update: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    const response = await httpClient.put<Appointment>(`/appointments/${id}`, data)
    return response.data
  },

  getMy: async (): Promise<Appointment[]> => {
    const response = await httpClient.get<Appointment[]>("/appointments/my")
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/appointments/${id}`)
  },
}
