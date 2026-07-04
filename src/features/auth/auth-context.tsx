import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { appService } from "@/shared/services/service-factory"
import { onSessionInvalidated, scheduleSessionExpiry } from "@/shared/lib/session-lifecycle"
import type { AuthSession, LoginCredentials } from "@/shared/types/domain"

interface AuthContextValue {
  session: AuthSession | null
  loading: boolean
  isAuthenticated: boolean
  authenticate: (credentials: LoginCredentials) => Promise<AuthSession>
  acceptSession: (session: AuthSession) => void
  login: (credentials: LoginCredentials) => Promise<AuthSession>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function initSession() {
      try {
        const activeSession = await appService.getSession()
        if (active) {
          setSession(activeSession)
        }
      } catch {
        // No active HttpOnly cookie is a valid guest state.
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    initSession()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => onSessionInvalidated(() => setSession(null)), [])
  useEffect(() => session ? scheduleSessionExpiry(session.expiresAt) : undefined, [session])

  const authenticate = useCallback((credentials: LoginCredentials) => {
    return appService.login(credentials)
  }, [])

  const acceptSession = useCallback((nextSession: AuthSession) => {
    setSession(nextSession)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const nextSession = await appService.login(credentials)
    setSession(nextSession)
    return nextSession
  }, [])

  const logout = useCallback(async () => {
    try {
      await appService.logout()
    } finally {
      setSession(null)
    }
  }, [])

  const value = useMemo(() => ({
    session,
    loading,
    isAuthenticated: Boolean(session),
    authenticate,
    acceptSession,
    login,
    logout,
  }), [acceptSession, authenticate, loading, login, logout, session])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const value = use(AuthContext)
  if (!value) throw new Error("useAuth debe utilizarse dentro de AuthProvider.")
  return value
}
