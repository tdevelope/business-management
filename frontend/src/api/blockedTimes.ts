import httpClient from "./httpClient"

export type BlockedTime = {
  id: number
  startTime: string
  endTime: string
  reason?: string
}

export const blockedTimesApi = {
  getAll: async (): Promise<BlockedTime[]> => {
    const res = await httpClient.get("/business-settings/blocked-times")
    return res.data
  },

  create: async (data: Omit<BlockedTime, "id">) => {
    const res = await httpClient.post("/business-settings/blocked-times", data)
    return res.data
  },

  update: async (id: number, data: Partial<Omit<BlockedTime, "id">>) => {
    const res = await httpClient.put(`/business-settings/blocked-times/${id}`, data)
    return res.data
  },

  remove: async (id: number) => {
    await httpClient.delete(`/business-settings/blocked-times/${id}`)
  },
}
