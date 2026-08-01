import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, X, Clock, Mail, MessageCircle, Sun, Moon } from 'lucide-react'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Enroll from './pages/Enroll'
import About from './pages/About'
import { DevtakumiLogo } from './components/Logo'
import { Button } from './components/ui/button'
import { PUBLIC_SETTINGS } from './data/settings'
import { getActiveDiscount } from './api/discount'

function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    document.documentElement.classList.contains('light') ? 'light' : 'dark',
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('light', theme === 'light')
    localStorage.setItem('devtakumi-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f4f6fb' : '#070b13')
  }, [theme])

  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
}

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Courses', end: false },
  { to: '/about', label: 'About', end: false },
]

function AnnouncementBar() {
  const discount = getActiveDiscount()
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#022c22] via-emerald-600 to-[#022c22]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-50%,rgba(16,185,129,0.35),transparent_60%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2.5 h-10 text-[11px] sm:text-xs font-bold text-emerald-50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
          </span>
          <span className="hidden sm:inline truncate min-w-0">
            {discount.percentage > 0
              ? `Early Bird ${discount.percentage}% OFF is live — now enrolling`
              : 'Now enrolling · Next batch commencing soon'}
          </span>
          <span className="sm:hidden truncate min-w-0">
            {discount.percentage > 0 ? `Early Bird ${discount.percentage}% OFF live` : 'Now enrolling'}
          </span>
          <NavLink
            to="/enroll"
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-400 text-emerald-950 font-black hover:bg-emerald-300 hover:scale-105 active:scale-100 transition shadow-[0_0_18px_-4px_rgba(52,211,153,0.8)]"
          >
            Claim now
            <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>
      </div>
    </div>
  )
}

function Header({ theme, onToggleTheme }: { theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" aria-label="devtakumi home" className="flex items-center shrink-0">
              <DevtakumiLogo size="md" withWordmark />
            </NavLink>

            <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/60 bg-secondary/40 p-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-medium transition ${
                      isActive
                        ? 'bg-primary/15 text-primary shadow-[0_0_20px_-6px_rgba(249,115,22,0.5)]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                onClick={onToggleTheme}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-secondary/40 text-muted-foreground hover:text-foreground transition"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <Button asChild size="sm" className="hidden md:inline-flex">
                <NavLink to="/enroll">
                  Enroll Now
                  <ArrowRight className="w-4 h-4" />
                </NavLink>
              </Button>

              <button
                type="button"
                aria-label="Toggle navigation"
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-secondary/40 text-muted-foreground hover:text-foreground transition"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl px-4 pb-4 pt-2 space-y-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Button asChild className="w-full mt-2">
              <NavLink to="/enroll">Enroll Now</NavLink>
            </Button>
          </div>
        )}
      </header>
    </>
  )
}

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-secondary/30 text-muted-foreground">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[280px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <NavLink to="/" className="inline-block mb-4">
              <DevtakumiLogo size="md" withWordmark />
            </NavLink>
            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm">
              Taught by Flipkart SDEs. One comprehensive roadmap from your first array to full production systems.
            </p>
            <div className="inline-flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <span className="live-dot" />
              <span className="font-semibold text-muted-foreground">{PUBLIC_SETTINGS.batchSchedule}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">Explore</p>
            <div className="space-y-2.5 text-sm">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className="block text-muted-foreground hover:text-primary transition"
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/enroll" className="block text-primary hover:text-orange-300 font-semibold transition">
                Enroll →
              </NavLink>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">Contact</p>
            <div className="space-y-2.5 text-sm">
              <a
                href={`mailto:${PUBLIC_SETTINGS.contactEmail}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition"
              >
                <Mail className="w-4 h-4" />
                {PUBLIC_SETTINGS.contactEmail}
              </a>
              <a
                href={`https://wa.me/${PUBLIC_SETTINGS.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp {PUBLIC_SETTINGS.whatsappDisplay}
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/70">
          <p>© 2026 devtakumi. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {PUBLIC_SETTINGS.classCount} live classes · 3 sequential stages · Small batches
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const location = useLocation()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest('.gradient-card') as HTMLElement | null
      if (!card) return
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`)
      card.style.setProperty('--my', `${e.clientY - rect.top}px`)
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' },
    )

    const observeReveals = () => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => io.observe(el))
    }

    // Catch elements rendered asynchronously (e.g. courses loaded after mount)
    const mo = new MutationObserver(observeReveals)
    mo.observe(document.body, { childList: true, subtree: true })

    observeReveals()
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col site-bg text-foreground">
      <Header theme={theme} onToggleTheme={toggle} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/enroll" element={<Enroll />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
