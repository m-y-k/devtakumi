import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../api/auth'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f1f5f9' }}>
      {/* Left branding panel */}
      <div style={{
        width: '44%',
        background: '#111827',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 64px',
        position: 'relative',
        overflow: 'hidden',
      }} className="hidden lg:flex">
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '-10%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-10%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(79,70,229,0.10) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
            }}>
              <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 800, fontSize: 16 }}>&gt;_</span>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>dev</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f97316', lineHeight: 1 }}>takumi</div>
            </div>
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Learn to code.<br />
            <span style={{ color: '#f97316' }}>Build careers.</span>
          </h1>
          <p style={{ fontSize: 16, color: '#9ca3af', lineHeight: 1.6, marginBottom: 48, maxWidth: 360 }}>
            Live classes, practice problems, and mentorship — all in one place.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '⚡', title: 'Live Classes', desc: 'Real-time sessions with your instructor' },
              { icon: '🧩', title: 'Practice Questions', desc: '5–8 curated problems per class' },
              { icon: '🎬', title: 'Recording Access', desc: 'Rewatch classes anytime you need' },
              { icon: '📝', title: 'Class Notes', desc: 'Structured markdown notes per session' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'rgba(249,115,22,0.12)',
                  border: '1px solid rgba(249,115,22,0.20)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12.5, color: '#6b7280' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }} className="lg:hidden">
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 800, fontSize: 14 }}>&gt;_</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>
              dev<span style={{ color: '#f97316' }}>takumi</span>
            </span>
          </div>

          {/* Card */}
          <div style={{
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 20,
            padding: '40px 40px 36px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.3px' }}>
              Welcome back 👋
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
              Sign in to access your student portal
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  Email address
                </label>
                <input
                  required
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    required
                    type={showPass ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    style={{ paddingRight: 52 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, color: '#6b7280',
                    }}
                  >
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  background: '#fee2e2', border: '1px solid #fca5a5',
                  borderRadius: 10, padding: '10px 14px',
                  fontSize: 13, color: '#dc2626', fontWeight: 500,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                id="login-btn"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15, borderRadius: 12, marginTop: 4 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg style={{ width: 16, height: 16, animation: 'spin 0.7s linear infinite' }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 12.5, marginTop: 24 }}>
              Don't have an account?{' '}
              <a href="http://localhost:5173/enroll" target="_blank" rel="noopener noreferrer"
                style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>
                Request enrollment →
              </a>
            </p>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 20 }}>
            devtakumi · Taught by SDEs @ Flipkart
          </p>
        </div>
      </div>
    </div>
  )
}
