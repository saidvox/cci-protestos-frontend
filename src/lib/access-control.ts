import type { NavigationItem } from "@/config/navigation"
import { debtorNavigation, analystNavigation, erpNavigation } from "@/config/navigation"
import type { Role } from "@/types/domain"

export function canAccess(userRoles: readonly Role[], requiredRoles?: readonly Role[]) {
  if (!requiredRoles?.length) return true
  return requiredRoles.some((role) => userRoles.includes(role))
}

export function navigationForRoles(roles: readonly Role[]): NavigationItem[] {
  if (roles.includes("USER_DEBTOR")) return [...debtorNavigation]
  if (roles.includes("BANK_ANALYST")) return [...analystNavigation]
  if (roles.includes("CCI_ADMIN") || roles.includes("CCI_STAFF")) return [...erpNavigation]
  return []
}
