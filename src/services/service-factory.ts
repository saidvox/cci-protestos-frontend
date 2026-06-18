import { apiService } from "@/services/api-service"
import type { AppService } from "@/services/contracts"
import { mockService } from "@/services/mock-service"

export type ServiceMode = "mock" | "api"

export function getServiceMode(value: string | undefined): ServiceMode {
  return value === undefined || value.toLowerCase() === "true" ? "mock" : "api"
}

export function createService(mode: ServiceMode): AppService {
  return mode === "mock" ? mockService : apiService
}

export const appService = createService(getServiceMode(import.meta.env.VITE_USE_MOCKS))
