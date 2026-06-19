import { beforeEach, describe, expect, it, vi } from "vitest"
import { handleUnauthorizedResponse, onSessionInvalidated, scheduleSessionExpiry } from "@/lib/session-lifecycle"

describe("session lifecycle", () => {
  beforeEach(() => vi.useRealTimers())
  it("emits invalidation when expiration is reached", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-01-01T00:00:00Z")); const listener = vi.fn(); const unsubscribe = onSessionInvalidated(listener); const cancel = scheduleSessionExpiry("2026-01-01T00:00:05Z")
    vi.advanceTimersByTime(5_000); expect(listener).toHaveBeenCalledOnce(); cancel(); unsubscribe()
  })
  it("emits invalidation only for 401 responses", () => {
    const listener = vi.fn(); const unsubscribe = onSessionInvalidated(listener); expect(handleUnauthorizedResponse(403)).toBe(false); expect(handleUnauthorizedResponse(401)).toBe(true); expect(listener).toHaveBeenCalledOnce(); unsubscribe()
  })
})
