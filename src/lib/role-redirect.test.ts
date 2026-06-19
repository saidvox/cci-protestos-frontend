import { describe, expect, it } from "vitest"
import { getHomeRoute, isDebtor, isAnalyst, isErpUser } from "@/lib/role-redirect"

describe("getHomeRoute", () => {
  it("returns /usuario/dashboard for USER_DEBTOR", () => {
    expect(getHomeRoute(["USER_DEBTOR"])).toBe("/usuario/dashboard")
  })
  it("returns /analista/dashboard for BANK_ANALYST", () => {
    expect(getHomeRoute(["BANK_ANALYST"])).toBe("/analista/dashboard")
  })
  it("returns /erp/dashboard for CCI_ADMIN", () => {
    expect(getHomeRoute(["CCI_ADMIN"])).toBe("/erp/dashboard")
  })
  it("returns /erp/dashboard for CCI_STAFF", () => {
    expect(getHomeRoute(["CCI_STAFF"])).toBe("/erp/dashboard")
  })
  it("returns /login when no roles", () => {
    expect(getHomeRoute([])).toBe("/login")
  })
})

describe("role helpers", () => {
  it("isDebtor", () => {
    expect(isDebtor(["USER_DEBTOR"])).toBe(true)
    expect(isDebtor(["CCI_ADMIN"])).toBe(false)
  })
  it("isAnalyst", () => {
    expect(isAnalyst(["BANK_ANALYST"])).toBe(true)
    expect(isAnalyst(["USER_DEBTOR"])).toBe(false)
  })
  it("isErpUser", () => {
    expect(isErpUser(["CCI_ADMIN"])).toBe(true)
    expect(isErpUser(["CCI_STAFF"])).toBe(true)
    expect(isErpUser(["BANK_ANALYST"])).toBe(false)
  })
})
