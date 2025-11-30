"use client"

import { useAuthStore } from "@/store/authStore"
import { authApi } from "@/api/auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function useAuth() {
  const { user, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore()
  const router = useRouter()
  const { toast } = useToast()

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      console.log("LOGIN RESPONSE:", response);
      setAuth(response.user, response.token)
      toast({
        title: "Success",
        description: "Logged in successfully!",
      })

      // Redirect based on role
      if (response.user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/customer")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const register = async (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
  }) => {
    try {
      const response = await authApi.register(data)
      setAuth(response.user, response.token)
      toast({
        title: "Success",
        description: "Account created successfully!",
      })
      router.push("/customer")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = () => {
    storeLogout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })
    router.push("/")
  }

  return {
    user,
    isAuthenticated,
    role: user?.role,
    login,
    register,
    logout,
  }
}
