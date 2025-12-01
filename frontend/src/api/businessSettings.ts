// src/api/businessSettings.ts
import httpClient from "./httpClient"

export type BusinessSettings = {
  id: number
  workingDays: number[]
  openingHours: {
    openTime: string
    closeTime: string
  }
  maxAdvanceBookingDays: number
}

export type UpdateBusinessSettingsDto = {
  workingDays: number[]
  openingHours: {
    openTime: string
    closeTime: string
  }
  maxAdvanceBookingDays: number
}

export const businessSettingsApi = {
  get: async (): Promise<BusinessSettings> => {
    const res = await httpClient.get<BusinessSettings>("/business-settings")
    return res.data
  },

  update: async (data: UpdateBusinessSettingsDto): Promise<BusinessSettings> => {
    const res = await httpClient.put<BusinessSettings>("/business-settings", data)
    return res.data
  },
}
