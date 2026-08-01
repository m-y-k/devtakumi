import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'STUDENT' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('accessToken')
    const storedUser = sessionStorage.getItem('user')
    if (stored && storedUser) {
      setAccessToken(stored)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(err.message || 'Login failed')
    }
    const data = await res.json()
    setAccessToken(data.accessToken)
    setUser(data.user)
    sessionStorage.setItem('accessToken', data.accessToken)
    sessionStorage.setItem('user', JSON.stringify(data.user))
  }

  const logout = () => {
    setAccessToken(null)
    setUser(null)
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = sessionStorage.getItem('accessToken')
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const res = await fetch(url, { ...options, headers, credentials: 'include' })
  if (res.status === 401) {
    const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    if (refreshRes.ok) {
      const data = await refreshRes.json()
      sessionStorage.setItem('accessToken', data.accessToken)
      headers.set('Authorization', `Bearer ${data.accessToken}`)
      return fetch(url, { ...options, headers, credentials: 'include' })
    }
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('user')
    window.location.href = '/login'
  }
  return res
}
