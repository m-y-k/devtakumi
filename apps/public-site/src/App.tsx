import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Enroll from './pages/Enroll'
import About from './pages/About'
import { DevtakumiLogo } from './components/Logo'
import { PUBLIC_SETTINGS } from './data/settings'
import { getActiveDiscount } from './api/discount'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Courses', end: false },
  { to: '/about', label: 'About', end: false },
]

function AnnouncementBar() {
  const discount = getActiveDiscount()
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#7c2d12] via-orange-600 to-[#7c2d12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2.5 h-9 text-[11px] sm:text-xs font-semibold text-orange-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-200" />
          </span>
          <span className="hidden sm:inline truncate">
            {discount.percentage > 0
              ? `Early Bird ${discount.percentage}% OFF is live — now enrolling`
              : 'Now enrolling · Next batch commencing soon'}
          </span>
          <span className="sm:hidden truncate">
            {discount.percentage > 0 ? `Early Bird ${discount.percentage}% OFF live` : 'Now enrolling'}
          </span>
          <NavLink
            to="/enroll"
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/15 hover:bg-white/25 transition text-orange-50"
          >
            Claim now
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NavLink>
        </div>
      </div>
    </div>
  )
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05070d]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" aria-label="Devtakumi home" className="flex items-center shrink-0">
              <DevtakumiLogo size="md" withWordmark />
            </NavLink>

            <nav className="hidden md:flex items-center gap-1 rounded-full bg-white/[0.03] border border-white/5 p-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-medium transition ${
                      isActive
                        ? 'bg-orange-500/15 text-orange-300 shadow-[0_0_20px_-6px_rgba(249,115,22,0.5)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <NavLink to="/enroll" className="btn-primary hidden md:inline-flex !py-2.5 !px-5 !text-sm">
                Enroll Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </NavLink>

              <button
                type="button"
                aria-label="Toggle navigation"
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition"
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#070b13]/95 backdrop-blur-xl px-4 pb-4 pt-2 space-y-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive ? 'bg-orange-500/15 text-orange-300' : 'text-slate-300 hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/enroll" className="btn-primary w-full mt-2">
              Enroll Now
            </NavLink>
          </div>
        )}
      </header>
    </>
  )
}

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#04060b] text-slate-400 border-t border-white/5">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[280px] bg-orange-500/[0.06] blur-[120px] rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <NavLink to="/" className="inline-block mb-4">
              <DevtakumiLogo size="md" withWordmark />
            </NavLink>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Taught by Flipkart SDEs. One comprehensive roadmap from your first array to full production systems.
            </p>
            <div className="inline-flex items-center gap-2 mt-4 text-xs text-slate-500">
              <span className="live-dot" />
              <span className="font-semibold text-slate-400">{PUBLIC_SETTINGS.batchSchedule}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Explore</p>
            <div className="space-y-2.5 text-sm">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className="block text-slate-400 hover:text-orange-400 transition"
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/enroll" className="block text-orange-400 hover:text-orange-300 font-semibold transition">
                Enroll →
              </NavLink>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Contact</p>
            <div className="space-y-2.5 text-sm">
              <a href={`mailto:${PUBLIC_SETTINGS.contactEmail}`} className="block text-slate-400 hover:text-orange-400 transition">
                {PUBLIC_SETTINGS.contactEmail}
              </a>
              <a
                href={`https://wa.me/${PUBLIC_SETTINGS.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-green-400 hover:text-green-300 transition"
              >
                WhatsApp {PUBLIC_SETTINGS.whatsappDisplay}
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© 2026 Devtakumi. All rights reserved.</p>
          <p>{PUBLIC_SETTINGS.classCount} live classes · 3 sequential stages · Small batches</p>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const location = useLocation()

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
    <div className="min-h-screen flex flex-col site-bg text-slate-100">
      <Header />
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
