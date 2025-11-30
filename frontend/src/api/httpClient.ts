import axios from "axios"
import { API_BASE_URL } from "@/lib/env"

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
httpClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return structured error
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message))
    }
    if (error.message) {
      return Promise.reject(error)
    }
    return Promise.reject(new Error("Something went wrong, please try again."))
  },
)

export default httpClient
