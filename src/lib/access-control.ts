import { navigationItems, type NavigationItem } from "@/config/navigation"
import type { Role } from "@/types/domain"

export function canAccess(userRoles: readonly Role[], requiredRoles?: readonly Role[]) {
  if (!requiredRoles?.length) return true
  return requiredRoles.some((role) => userRoles.includes(role))
}

export function visibleNavigation(userRoles: readonly Role[]): NavigationItem[] {
  return navigationItems.filter((item) => canAccess(userRoles, item.roles))
}
