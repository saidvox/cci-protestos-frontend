import type { AuthSession, LoginCredentials, Role } from "@/shared/types/domain"

export const PUBLIC_LOGIN_ROLES: readonly Role[] = ["USER_DEBTOR", "BANK_ANALYST"]
export const ERP_LOGIN_ROLES: readonly Role[] = ["CCI_ADMIN", "CCI_STAFF"]

export const DEMO_PUBLIC_ACCOUNTS = {
  debtor: { email: "deudor@demo.local", password: "password" },
  analyst: { email: "analista@demo.local", password: "password" },
} satisfies Record<string, LoginCredentials>

export const DEMO_ERP_ACCOUNTS = {
  admin: { email: "admin@demo.local", password: "password" },
  staff: { email: "staff@demo.local", password: "password" },
} satisfies Record<string, LoginCredentials>

export function sessionHasAnyRole(session: AuthSession, allowedRoles: readonly Role[]) {
  return session.user.roles.some((role) => allowedRoles.includes(role))
}
