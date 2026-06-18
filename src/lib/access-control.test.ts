import { describe, expect, it } from "vitest"
import { canAccess, visibleNavigation } from "@/lib/access-control"

describe("access control", () => {
  it("allows unrestricted entries to every authenticated role", () => {
    expect(canAccess(["ENTIDAD"], undefined)).toBe(true)
  })

  it("requires at least one matching role", () => {
    expect(canAccess(["ANALISTA"], ["ADMIN", "ANALISTA"])).toBe(true)
    expect(canAccess(["ENTIDAD"], ["ADMIN", "ANALISTA"])).toBe(false)
  })

  it("filters navigation according to role", () => {
    const paths = visibleNavigation(["ENTIDAD"]).map((item) => item.path)
    expect(paths).toContain("/solicitudes/nueva")
    expect(paths).not.toContain("/auditoria")
  })
})
