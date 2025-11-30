"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((state) => state.restoreSession)

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  return <>{children}</>
}
