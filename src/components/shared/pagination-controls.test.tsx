import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { PaginationControls } from "@/components/shared/pagination-controls"
describe("PaginationControls", () => {
  it("moves through server page indexes and respects boundaries", async () => {
    const onPageChange = vi.fn(); render(<PaginationControls page={{ page: 1, totalPages: 3, totalElements: 21 }} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Anterior" })); expect(onPageChange).toHaveBeenCalledWith(0)
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" })); expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
