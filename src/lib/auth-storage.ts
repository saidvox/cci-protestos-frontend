import type { AuthSession } from "@/types/domain"

const SESSION_KEY = "cci.auth"

function isSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<AuthSession>
  return (
    typeof candidate.token === "string" &&
    typeof candidate.expiresAt === "string" &&
    typeof candidate.user?.email === "string" &&
    Array.isArray(candidate.user.roles)
  )
}

export function readSession(): AuthSession | null {
  const persisted = sessionStorage.getItem(SESSION_KEY)
  if (!persisted) return null
  try {
    const parsed: unknown = JSON.parse(persisted)
    if (isSession(parsed) && Date.parse(parsed.expiresAt) > Date.now()) return parsed
  } catch {
    // Invalid browser state is discarded below.
  }
  sessionStorage.removeItem(SESSION_KEY)
  return null
}

export function writeSession(session: AuthSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}
