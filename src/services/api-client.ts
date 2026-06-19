import axios from "axios"
import { handleUnauthorizedResponse } from "@/lib/session-lifecycle"
export const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api", timeout: 15_000, withCredentials: true, xsrfCookieName: "XSRF-TOKEN", xsrfHeaderName: "X-XSRF-TOKEN" })
apiClient.interceptors.response.use((response) => response, (error: unknown) => { if (axios.isAxiosError(error)) handleUnauthorizedResponse(error.response?.status); return Promise.reject(error) })
