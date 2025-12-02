export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "admin" | "customer" | "staff"
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Service {
  id: string
  name: string
  description?: string
  duration: number // in minutes
  price: number
  isActive?: boolean
}

export interface AppointmentSuggestion {
  start: string
  end: string
  confidence?: string
}

export interface Appointment {
  id: string
  serviceId: string
  userId: string
  startTime: string
  endTime: string
  status: "scheduled" | "done" | "cancelled"
  service?: Service
  user?: User
}

export interface CreateAppointmentDto {
  serviceId: Number
  date: string
  startTime: string
}

export interface CheckAvailabilityDto {
  serviceId: string
  date: string
  preferredTime: string
}
