import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Lock, Info } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { getCourses, CourseSummary } from '../api/client'
import { getActiveDiscount, calculateDiscountedPrice } from '../api/discount'

const stepColors = [
  { accent: 'text-orange-400', hoverAccent: 'group-hover:text-orange-300', badge: 'bg-primary/10 text-orange-300', grad: 'from-orange-500 to-amber-400' },
  { accent: 'text-indigo-400', hoverAccent: 'group-hover:text-indigo-300', badge: 'bg-indigo-500/10 text-indigo-300', grad: 'from-indigo-500 to-blue-400' },
  { accent: 'text-sky-400', hoverAccent: 'group-hover:text-sky-300', badge: 'bg-sky-500/10 text-sky-300', grad: 'from-sky-500 to-cyan-400' },
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
      <div className="absolute -top-10 -left-24 w-[380px] h-[380px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-12 reveal">
          <span className="eyebrow justify-center mb-3">Three Stages</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">All Courses</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
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
                    <Badge variant="muted" className={`${color.badge} uppercase tracking-wider`}>
                      Step 0{i + 1}
                    </Badge>
                    {course.prerequisiteCourseTitle && (
                      <Badge variant="amber">
                        <Lock className="w-3 h-3" /> Gated
                      </Badge>
                    )}
                  </div>

                  <h2 className={`font-display text-xl font-bold text-foreground mb-2 ${color.hoverAccent} transition`}>{course.title}</h2>

                  <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                    {discount.percentage > 0 ? (
                      <>
                        <span className={`text-2xl font-black ${color.accent}`}>₹{currentDiscounted}</span>
                        <span className="text-muted-foreground/70 line-through text-sm">₹{course.priceInr}</span>
                        <Badge variant="success" className="px-1.5 py-0.5 text-[10px]">
                          {discount.percentage}% OFF
                        </Badge>
                      </>
                    ) : (
                      <span className={`text-2xl font-black ${color.accent}`}>₹{course.priceInr}</span>
                    )}
                    <span className="text-muted-foreground/50">·</span>
                    <span className="text-muted-foreground text-xs font-medium">{course.durationMonths} months</span>
                    {course.totalClasses > 0 && (
                      <>
                        <span className="text-muted-foreground/50">·</span>
                        <span className="text-muted-foreground text-xs font-medium">{course.totalClasses} classes</span>
                      </>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3 flex-1">{course.description}</p>

                  {course.prerequisiteCourseTitle ? (
                    <div>
                      <p className="text-amber-500/90 text-xs font-semibold mb-3">
                        Unlocks after completing {course.prerequisiteCourseTitle}
                      </p>
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/courses/${course.slug}`}>
                          View curriculum
                          <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to={`/enroll?course=${course.slug}`}>Enroll Now</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link to={`/courses/${course.slug}`}>Details</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-muted-foreground/70 text-xs mt-10 italic flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Each stage is a checkpoint, not a package deal — progress only if the prior stage is cleared.
        </p>
      </div>
    </div>
  )
}
