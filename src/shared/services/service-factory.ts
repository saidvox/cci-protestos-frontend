import { apiService } from "@/shared/services/api-service"

export function getServiceMode(value: string | undefined): "mock" | "api" {
  return value?.toLowerCase() === "true" ? "mock" : "api"
}

export const appService = apiService
