import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

if (!API_BASE_URL) {
  console.error('❌ NEXT_PUBLIC_API_URL is not defined!')
}

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

if (typeof window !== 'undefined') {
  console.log('🔥 Client-side API_BASE_URL:', API_BASE_URL)
}
