import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Check, Lock, Search } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
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
          <div key={m.monthNumber} className={`glass rounded-2xl overflow-hidden transition-colors ${open ? 'border-primary/30' : ''}`}>
            <button
              onClick={() => toggleMonth(m.monthNumber)}
              className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-secondary/40 transition group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm transition-all ${
                  open
                    ? 'bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-glow-sm'
                    : 'bg-primary/10 text-primary border border-primary/25'
                }`}>
                  {m.monthNumber}
                </div>
                <div>
                  <span className="font-display font-bold text-sm text-foreground">Month {m.monthNumber}</span>
                  <p className="text-muted-foreground text-xs mt-0.5">{m.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {m.weeks.length} weeks
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180 text-primary' : ''}`} />
              </div>
            </button>

            {open && (
              <div className="px-5 pb-4 pt-1 space-y-1 bg-secondary/40 border-t border-border/60">
                {m.weeks.map((w) => {
                  const weekOpen = expandedWeeks.has(w.weekNumber)
                  return (
                    <div key={w.weekNumber}>
                      <button
                        onClick={() => toggleWeek(w.weekNumber)}
                        className="w-full text-left flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-secondary/40 transition group"
                      >
                        <span className={`text-sm font-semibold transition ${weekOpen ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                          Week {w.weekNumber}: {w.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{w.classes.length} classes</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ${weekOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {weekOpen && (
                        <div className="ml-3 mt-1 space-y-1.5 border-l-2 border-primary/30 pl-4 mb-2 py-1">
                          {w.classes.map((c) => (
                            <div key={c.globalClassNumber} className="flex items-start gap-2.5 py-1 group/class">
                              <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded flex-shrink-0 font-bold border border-primary/25">
                                #{c.globalClassNumber}
                              </span>
                              <span className="text-xs text-muted-foreground leading-snug group-hover/class:text-foreground transition">
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
        <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center animate-float">
          <Search className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">Course not found</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/courses">
            <ArrowLeft /> Back to all courses
          </Link>
        </Button>
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
      <div className="absolute -top-16 left-0 w-[400px] h-[400px] bg-primary/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Button asChild variant="outline" size="sm" className="mb-8">
          <Link to="/courses">
            <ArrowLeft /> All Courses
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 reveal">
            <div className="inline-flex items-center gap-2 chip mb-4">
              <span className="live-dot" />
              {course.durationMonths} months · {totalClasses} live classes
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">{course.title}</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed text-sm md:text-base max-w-2xl">{course.description}</p>

            {curriculum && curriculum.months.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-foreground">Curriculum</h2>
                  <span className="text-xs text-muted-foreground font-medium">
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
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Course Fee</span>
                {discount.percentage > 0 && (
                  <Badge variant="success" className="px-2 py-0.5 text-[10px]">
                    Early Bird {discount.percentage}% OFF
                  </Badge>
                )}
              </div>

              {discount.percentage > 0 ? (
                <div className="flex items-baseline gap-2.5 mb-1">
                  <p className="font-display text-4xl font-bold text-gradient-orange">₹{currentDiscounted}</p>
                  <p className="text-muted-foreground/70 line-through text-base">₹{course.priceInr}</p>
                </div>
              ) : (
                <p className="font-display text-4xl font-bold text-gradient-orange mb-1">₹{course.priceInr}</p>
              )}

              <p className="text-muted-foreground text-sm mb-1 font-medium">{course.durationMonths} months · one-time fee</p>
              {totalClasses > 0 && <p className="text-muted-foreground/70 text-sm mb-5 font-medium">{totalClasses} live classes</p>}

              {course.prerequisiteCourseTitle ? (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 mb-4">
                  <p className="text-amber-400 text-sm font-semibold flex items-start gap-2">
                    <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Unlocks after completing <span className="font-bold">{course.prerequisiteCourseTitle}</span>
                    </span>
                  </p>
                </div>
              ) : (
                <Button asChild className="w-full mb-5" size="lg">
                  <Link to={`/enroll?course=${course.slug}`}>Enroll Now — ₹{currentDiscounted}</Link>
                </Button>
              )}

              <div className="pt-5 border-t border-border/60">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Included</p>
                <div className="space-y-2.5">
                  {[
                    'Live sessions with instructors',
                    'Practice questions per class',
                    'Weekly assessments',
                    'Recording access',
                    'WhatsApp doubt support',
                    'Direct mentorship from Flipkart SDEs',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-foreground/80 font-medium">
                      <span className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
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
