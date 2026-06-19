import { apiService } from "@/services/api-service"
import { mockService } from "@/services/mock-service"

export function getServiceMode(value: string | undefined): "mock" | "api" {
  return value?.toLowerCase() === "false" ? "api" : "mock"
}

export const appService = getServiceMode(import.meta.env.VITE_USE_MOCKS) === "mock" ? mockService : apiService
