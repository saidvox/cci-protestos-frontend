import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { appService } from "@/services/service-factory"
import { onSessionInvalidated, scheduleSessionExpiry } from "@/lib/session-lifecycle"
import type { AuthSession, LoginCredentials } from "@/types/domain"

interface AuthContextValue {
  session: AuthSession | null
  loading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
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
        // Safe to ignore if there is no active session
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

  const login = useCallback(async (credentials: LoginCredentials) => {
    setSession(await appService.login(credentials))
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
    login,
    logout
  }), [login, logout, session, loading])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const value = use(AuthContext)
  if (!value) throw new Error("useAuth debe utilizarse dentro de AuthProvider.")
  return value
}
