import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      if (typeof error.response.data === "string") {
        return error.response.data
      }
      if (typeof error.response.data === "object") {
        const data = error.response.data as { message?: string; error?: string }
        return data.message || data.error || defaultMessage
      }
    }
    if (error.message) {
      return error.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return defaultMessage
}
