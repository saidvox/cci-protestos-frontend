import type { Role } from "@/types/domain"

const HOME_ROUTES: Record<Role, string> = {
  USER_DEBTOR: "/usuario/dashboard",
  BANK_ANALYST: "/analista/dashboard",
  CCI_ADMIN: "/erp/dashboard",
  CCI_STAFF: "/erp/dashboard",
}

export function getHomeRoute(roles: readonly Role[]): string {
  for (const role of roles) {
    const route = HOME_ROUTES[role]
    if (route) return route
  }
  return "/login"
}

export function isDebtor(roles: readonly Role[]) {
  return roles.includes("USER_DEBTOR")
}

export function isAnalyst(roles: readonly Role[]) {
  return roles.includes("BANK_ANALYST")
}

export function isErpUser(roles: readonly Role[]) {
  return roles.some((r) => r === "CCI_ADMIN" || r === "CCI_STAFF")
}
