import axios from "axios"
import { readSession } from "@/lib/auth-storage"
import { handleUnauthorizedResponse } from "@/lib/session-lifecycle"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = readSession()?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) handleUnauthorizedResponse(error.response?.status)
    return Promise.reject(error)
  }
)
