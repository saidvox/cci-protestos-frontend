import { describe, expect, it } from "vitest"
import { canAccess, navigationForRoles } from "@/lib/access-control"

describe("access control", () => {
  it("allows unrestricted entries to every authenticated role", () => {
    expect(canAccess(["USER_DEBTOR"], undefined)).toBe(true)
  })

  it("requires at least one matching role", () => {
    expect(canAccess(["BANK_ANALYST"], ["CCI_ADMIN", "BANK_ANALYST"])).toBe(true)
    expect(canAccess(["USER_DEBTOR"], ["CCI_ADMIN", "BANK_ANALYST"])).toBe(false)
  })

  it("filters navigation according to role", () => {
    const paths = navigationForRoles(["USER_DEBTOR"]).map((item) => item.path)
    expect(paths).toContain("/usuario/solicitudes")
    expect(paths).not.toContain("/erp/solicitudes")
    expect(paths).not.toContain("/erp/auditoria")
  })
})
