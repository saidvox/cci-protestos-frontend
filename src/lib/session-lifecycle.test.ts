import { beforeEach, describe, expect, it, vi } from "vitest"
import { readSession, writeSession } from "@/lib/auth-storage"
import { handleUnauthorizedResponse, onSessionInvalidated, scheduleSessionExpiry } from "@/lib/session-lifecycle"

const session = {
  token: "token",
  expiresAt: "2099-01-01T00:00:00Z",
  user: { id: 1, name: "Ana", email: "ana@demo.local", roles: ["ADMIN"] as const },
}

describe("session lifecycle", () => {
  beforeEach(() => { sessionStorage.clear(); vi.useRealTimers() })

  it("invalidates the session when its expiration time is reached", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    writeSession({ ...session, expiresAt: "2026-01-01T00:00:05Z" })
    const listener = vi.fn()
    const unsubscribe = onSessionInvalidated(listener)
    const cancel = scheduleSessionExpiry("2026-01-01T00:00:05Z")

    vi.advanceTimersByTime(5_000)

    expect(readSession()).toBeNull()
    expect(listener).toHaveBeenCalledOnce()
    cancel()
    unsubscribe()
  })

  it("clears storage and emits invalidation only for 401 responses", () => {
    writeSession(session)
    const listener = vi.fn()
    const unsubscribe = onSessionInvalidated(listener)

    expect(handleUnauthorizedResponse(403)).toBe(false)
    expect(readSession()).not.toBeNull()
    expect(handleUnauthorizedResponse(401)).toBe(true)
    expect(readSession()).toBeNull()
    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
  })
})
