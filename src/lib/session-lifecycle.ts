import { clearSession } from "@/lib/auth-storage"

const SESSION_INVALIDATED_EVENT = "cci:session-invalidated"
const MAX_TIMEOUT = 2_147_483_647

export function invalidateSession() {
  clearSession()
  window.dispatchEvent(new CustomEvent(SESSION_INVALIDATED_EVENT))
}

export function onSessionInvalidated(listener: () => void) {
  window.addEventListener(SESSION_INVALIDATED_EVENT, listener)
  return () => window.removeEventListener(SESSION_INVALIDATED_EVENT, listener)
}

export function scheduleSessionExpiry(expiresAt: string) {
  let timer: ReturnType<typeof setTimeout> | undefined

  const arm = () => {
    const remaining = Date.parse(expiresAt) - Date.now()
    if (!Number.isFinite(remaining) || remaining <= 0) {
      invalidateSession()
      return
    }
    timer = setTimeout(arm, Math.min(remaining, MAX_TIMEOUT))
  }

  arm()
  return () => {
    if (timer) clearTimeout(timer)
  }
}

export function handleUnauthorizedResponse(status: number | undefined) {
  if (status !== 401) return false
  invalidateSession()
  return true
}
