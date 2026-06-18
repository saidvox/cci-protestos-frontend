import { describe, expect, it } from "vitest"
import { getServiceMode } from "@/services/service-factory"

describe("service factory", () => {
  it("uses mocks by default and API for an explicit false value", () => {
    expect(getServiceMode("true")).toBe("mock")
    expect(getServiceMode("TRUE")).toBe("mock")
    expect(getServiceMode("false")).toBe("api")
    expect(getServiceMode(undefined)).toBe("mock")
  })
})
