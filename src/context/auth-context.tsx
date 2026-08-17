/**
 * Session state for the console.
 *
 * On mount this calls GET /api/auth/me, which xsl-backend answers using
 * whatever `authenticateUser` (app.ts-level middleware, runs on every
 * request) already attached to req.user from the `shaka_session` cookie —
 * see xsl-backend/src/server/middleware/auth.middleware.ts. That means
 * there's nothing to "restore" here beyond asking the backend who the
 * cookie belongs to; the source of truth is always the server.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from '../lib/api'
import type { SafeUser } from '../lib/types'

interface AuthContextValue {
  user: SafeUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<SafeUser>
  signup: (input: {
    email: string
    password: string
    name?: string
    company?: string
  }) => Promise<SafeUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  setUser: (u: SafeUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{ user: SafeUser | null }>('/api/auth/me')
      setUser(data.user)
    } catch (err) {
      // /api/auth/me never itself 401s (see auth.routes.ts — it just returns
      // { user: null }), so a thrown error here means the backend is
      // unreachable, not that the visitor is logged out.
      if (!(err instanceof ApiError)) console.error('[auth] could not reach backend:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ user: SafeUser }>('/api/auth/login', { email, password })
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(
    async (input: { email: string; password: string; name?: string; company?: string }) => {
      const data = await api.post<{ user: SafeUser }>('/api/auth/signup', input)
      setUser(data.user)
      return data.user
    },
    []
  )

  const logout = useCallback(async () => {
    await api.post('/api/auth/logout')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
