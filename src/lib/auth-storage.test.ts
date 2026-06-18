import { beforeEach, describe, expect, it } from "vitest"
import { clearSession, readSession, writeSession } from "@/lib/auth-storage"

const session = {
  token: "demo-token",
  expiresAt: "2099-01-01T00:00:00Z",
  user: {
    id: 1,
    name: "Ana Torres",
    email: "admin@demo.local",
    roles: ["ADMIN"] as const,
  },
}

describe("auth storage", () => {
  beforeEach(() => sessionStorage.clear())

  it("persists and reads a valid session", () => {
    writeSession(session)
    expect(readSession()).toEqual(session)
  })

  it("removes invalid persisted data", () => {
    sessionStorage.setItem("cci.auth", "{not-json")
    expect(readSession()).toBeNull()
    expect(sessionStorage.getItem("cci.auth")).toBeNull()
  })

  it("clears the session", () => {
    writeSession(session)
    clearSession()
    expect(readSession()).toBeNull()
  })

  it("discards an expired session", () => {
    writeSession({ ...session, expiresAt: "2000-01-01T00:00:00Z" })
    expect(readSession()).toBeNull()
  })
})
