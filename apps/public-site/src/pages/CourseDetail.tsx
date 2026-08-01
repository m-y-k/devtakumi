import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCourse, getCurriculum, CourseSummary, Curriculum, MonthItem } from '../api/client'
import { getActiveDiscount, calculateDiscountedPrice } from '../api/discount'

function CurriculumTree({ months }: { months: MonthItem[] }) {
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([1]))
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set())

  const toggleMonth = (n: number) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  const toggleWeek = (n: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {months.map((m) => {
        const open = expandedMonths.has(m.monthNumber)
        return (
          <div key={m.monthNumber} className={`glass rounded-2xl overflow-hidden transition-colors ${open ? 'border-orange-500/25' : ''}`}>
            <button
              onClick={() => toggleMonth(m.monthNumber)}
              className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-white/[0.03] transition group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm transition-all ${
                  open
                    ? 'bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-glow-sm'
                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/25'
                }`}>
                  {m.monthNumber}
                </div>
                <div>
                  <span className={`font-display font-bold text-sm transition ${open ? 'text-white' : 'text-white'}`}>
                    Month {m.monthNumber}
                  </span>
                  <p className="text-slate-400 text-xs mt-0.5">{m.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {m.weeks.length} weeks
                </span>
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-180 text-orange-400' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {open && (
              <div className="px-5 pb-4 pt-1 space-y-1 bg-black/20 border-t border-white/5">
                {m.weeks.map((w) => {
                  const weekOpen = expandedWeeks.has(w.weekNumber)
                  return (
                    <div key={w.weekNumber}>
                      <button
                        onClick={() => toggleWeek(w.weekNumber)}
                        className="w-full text-left flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.04] transition group"
                      >
                        <span className={`text-sm font-semibold transition ${weekOpen ? 'text-orange-300' : 'text-slate-300 group-hover:text-white'}`}>
                          Week {w.weekNumber}: {w.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{w.classes.length} classes</span>
                          <svg
                            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${weekOpen ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {weekOpen && (
                        <div className="ml-3 mt-1 space-y-1.5 border-l-2 border-orange-500/30 pl-4 mb-2 py-1">
                          {w.classes.map((c) => (
                            <div key={c.globalClassNumber} className="flex items-start gap-2.5 py-1 group/class">
                              <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded flex-shrink-0 font-bold border border-orange-500/25">
                                #{c.globalClassNumber}
                              </span>
                              <span className="text-xs text-slate-400 leading-snug group-hover/class:text-slate-300 transition">
                                {c.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [course, setCourse] = useState<CourseSummary | null>(null)
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null)
  const discount = getActiveDiscount()

  useEffect(() => {
    if (!slug) return
    Promise.all([getCourse(slug), getCurriculum(slug)])
      .then(([c, cur]) => {
        setCourse(c)
        setCurriculum(cur)
      })
      .catch(() => {})
  }, [slug])

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl animate-float">
          🔎
        </div>
        <p className="text-slate-400 font-medium">Course not found</p>
        <Link to="/courses" className="btn-ghost !text-sm">
          ← Back to all courses
        </Link>
      </div>
    )
  }

  const totalClasses =
    curriculum?.months.reduce(
      (sum, m) => sum + m.weeks.reduce((ws, w) => ws + w.classes.length, 0),
      0,
    ) || course.totalClasses

  const currentDiscounted = calculateDiscountedPrice(course.priceInr, discount.percentage)

  return (
    <div className="relative">
      <div className="absolute -top-16 left-0 w-[400px] h-[400px] bg-orange-500/[0.08] blur-[130px] rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/courses" className="inline-flex items-center gap-2 btn-ghost !py-2 !px-4 !text-xs mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Courses
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 reveal">
            <div className="inline-flex items-center gap-2 chip mb-4">
              <span className="live-dot" />
              {course.durationMonths} months · {totalClasses} live classes
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">{course.title}</h1>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base max-w-2xl">{course.description}</p>

            {curriculum && curriculum.months.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-white">Curriculum</h2>
                  <span className="text-xs text-slate-500 font-medium">
                    {totalClasses} classes across {curriculum.months.length} months
                  </span>
                </div>
                <CurriculumTree months={curriculum.months} />
              </div>
            )}
          </div>

          <div className="reveal [transition-delay:120ms]">
            <div className="glass-strong rounded-3xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Course Fee</span>
                {discount.percentage > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25 text-[10px] font-bold">
                    Early Bird {discount.percentage}% OFF
                  </span>
                )}
              </div>

              {discount.percentage > 0 ? (
                <div className="flex items-baseline gap-2.5 mb-1">
                  <p className="font-display text-4xl font-bold text-gradient-orange">₹{currentDiscounted}</p>
                  <p className="text-slate-500 line-through text-base">₹{course.priceInr}</p>
                </div>
              ) : (
                <p className="font-display text-4xl font-bold text-gradient-orange mb-1">₹{course.priceInr}</p>
              )}

              <p className="text-slate-400 text-sm mb-1 font-medium">{course.durationMonths} months · one-time fee</p>
              {totalClasses > 0 && <p className="text-slate-500 text-sm mb-5 font-medium">{totalClasses} live classes</p>}

              {course.prerequisiteCourseTitle ? (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 mb-4">
                  <p className="text-amber-400 text-sm font-semibold flex items-start gap-2">
                    <span>🔒</span>
                    <span>
                      Unlocks after completing{' '}
                      <span className="font-bold">{course.prerequisiteCourseTitle}</span>
                    </span>
                  </p>
                </div>
              ) : (
                <Link
                  to={`/enroll?course=${course.slug}`}
                  className="btn-primary w-full !py-3.5 mb-5"
                >
                  Enroll Now — ₹{currentDiscounted}
                </Link>
              )}

              <div className="pt-5 border-t border-white/5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Included</p>
                <div className="space-y-2.5">
                  {[
                    'Live sessions with instructors',
                    'Practice questions per class',
                    'Weekly assessments',
                    'Recording access',
                    'WhatsApp doubt support',
                    'Direct mentorship from Flipkart SDEs',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
                      <span className="w-5 h-5 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
