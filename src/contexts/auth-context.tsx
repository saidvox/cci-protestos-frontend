import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { clearSession, readSession, writeSession } from "@/lib/auth-storage"
import { appService } from "@/services/service-factory"
import { onSessionInvalidated, scheduleSessionExpiry } from "@/lib/session-lifecycle"
import type { AuthSession, LoginCredentials } from "@/types/domain"

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession())

  useEffect(() => onSessionInvalidated(() => setSession(null)), [])

  useEffect(() => {
    if (!session) return
    return scheduleSessionExpiry(session.expiresAt)
  }, [session])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const next = await appService.login(credentials)
    writeSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(() => ({ session, isAuthenticated: Boolean(session), login, logout }), [login, logout, session])
  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const value = use(AuthContext)
  if (!value) throw new Error("useAuth debe utilizarse dentro de AuthProvider.")
  return value
}
