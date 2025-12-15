// Centralized environment variable access
export const API_BASE_URL =
  typeof window !== "undefined"
    ? (window as any).__NEXT_PUBLIC_API_URL__ || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL
