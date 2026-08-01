import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourses, CourseSummary } from '../api/client'
import { getActiveDiscount, calculateDiscountedPrice } from '../api/discount'

const stepColors = [
  { border: 'border-orange-500/20', accent: 'text-orange-400', hoverAccent: 'group-hover:text-orange-300', badge: 'bg-orange-500/10 text-orange-300 border border-orange-500/25', num: '#f97316', grad: 'from-orange-500 to-amber-400' },
  { border: 'border-indigo-500/20', accent: 'text-indigo-400', hoverAccent: 'group-hover:text-indigo-300', badge: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/25', num: '#818cf8', grad: 'from-indigo-500 to-blue-400' },
  { border: 'border-sky-500/20', accent: 'text-sky-400', hoverAccent: 'group-hover:text-sky-300', badge: 'bg-sky-500/10 text-sky-300 border border-sky-500/25', num: '#38bdf8', grad: 'from-sky-500 to-cyan-400' },
]

export default function Courses() {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const discount = getActiveDiscount()

  useEffect(() => {
    getCourses().then(setCourses)
  }, [])

  return (
    <div className="relative">
      <div className="absolute -top-20 right-0 w-[420px] h-[420px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -top-10 -left-24 w-[380px] h-[380px] bg-orange-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-12 reveal">
          <span className="eyebrow justify-center mb-3">Three Stages</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">All Courses</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Sequential courses designed as checkpoints. Each one builds on the last.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {courses.map((course, i) => {
            const color = stepColors[i] || stepColors[0]
            const currentDiscounted = calculateDiscountedPrice(course.priceInr, discount.percentage)
            return (
              <div key={course.id} className="gradient-card group overflow-hidden flex flex-col reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className={`h-1 w-full bg-gradient-to-r ${color.grad} opacity-70`} />

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${color.badge} uppercase tracking-wider`}>
                      Step 0{i + 1}
                    </span>
                    {course.prerequisiteCourseTitle && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-lg">
                        🔒 Gated
                      </span>
                    )}
                  </div>

                  <h2 className={`font-display text-xl font-bold text-white mb-2 ${color.hoverAccent} transition`}>{course.title}</h2>

                  <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                    {discount.percentage > 0 ? (
                      <>
                        <span className={`text-2xl font-black ${color.accent}`}>₹{currentDiscounted}</span>
                        <span className="text-slate-500 line-through text-sm">₹{course.priceInr}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">
                          {discount.percentage}% OFF
                        </span>
                      </>
                    ) : (
                      <span className={`text-2xl font-black ${color.accent}`}>₹{course.priceInr}</span>
                    )}
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 text-xs font-medium">{course.durationMonths} months</span>
                    {course.totalClasses > 0 && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400 text-xs font-medium">{course.totalClasses} classes</span>
                      </>
                    )}
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed mb-5 line-clamp-3 flex-1">{course.description}</p>

                  {course.prerequisiteCourseTitle ? (
                    <div>
                      <p className="text-amber-500/90 text-xs font-semibold mb-3">
                        Unlocks after completing {course.prerequisiteCourseTitle}
                      </p>
                      <Link
                        to={`/courses/${course.slug}`}
                        className="inline-flex w-full justify-center items-center gap-1.5 btn-ghost !py-3 !text-sm"
                      >
                        View curriculum
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link to={`/enroll?course=${course.slug}`} className="btn-primary flex-1 !py-3 !text-sm">
                        Enroll Now
                      </Link>
                      <Link
                        to={`/courses/${course.slug}`}
                        className="inline-flex items-center justify-center px-4 py-3 btn-ghost !text-sm"
                      >
                        Details
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-slate-500 text-xs mt-10 italic flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Each stage is a checkpoint, not a package deal — progress only if the prior stage is cleared.
        </p>
      </div>
    </div>
  )
}
