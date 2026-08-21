import { apiService } from "@/shared/services/api-service"

import { mockService } from "@/shared/services/mock-service"

export function getServiceMode(value: string | undefined): "mock" | "api" {
  return value?.toLowerCase() === "true" ? "mock" : "api"
}

export const appService = (getServiceMode(import.meta.env.VITE_USE_MOCKS) === "mock" || import.meta.env.PROD)
  ? mockService
  : apiService
