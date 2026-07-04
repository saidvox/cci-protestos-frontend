import { describe, expect, it } from "vitest"
import { getServiceMode } from "@/shared/services/service-factory"

describe("service factory", () => {
  it("uses API by default and keeps mock mode only as an explicit opt-in label", () => {
    expect(getServiceMode("true")).toBe("mock")
    expect(getServiceMode("TRUE")).toBe("mock")
    expect(getServiceMode("false")).toBe("api")
    expect(getServiceMode(undefined)).toBe("api")
  })
})
