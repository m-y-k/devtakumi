import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Zap,
  MessageCircle,
  Puzzle,
  Hammer,
  Target,
  Users,
  Lock,
  Check,
  Flame,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { getActiveDiscount, calculateDiscountedPrice, getTimeRemaining, TimeLeft, DiscountInfo } from '../api/discount'
import { PUBLIC_SETTINGS } from '../data/settings'

const stages = [
  {
    step: '01',
    badge: 'Mandatory',
    title: 'DSA Foundations',
    duration: '4 months · 80 classes',
    basePrice: 999,
    desc: 'Master data structures, algorithms, and problem-solving from absolute basics. The mandatory first step.',
    classes: 80,
    accent: 'from-orange-500 to-amber-400',
    text: 'text-orange-400',
  },
  {
    step: '02',
    badge: 'Gated',
    title: 'Backend Engineering',
    duration: '6 months · +40 classes',
    basePrice: 1499,
    desc: 'Advanced Java, SQL, Spring Boot — build production-grade REST APIs and systems.',
    classes: 40,
    accent: 'from-indigo-500 to-blue-400',
    text: 'text-indigo-400',
  },
  {
    step: '03',
    badge: 'Gated',
    title: 'Full-Stack Development',
    duration: '8 months · +40 classes',
    basePrice: 1999,
    desc: 'HTML, CSS, JavaScript, React — deploy complete full-stack applications end-to-end.',
    classes: 40,
    accent: 'from-sky-500 to-cyan-400',
    text: 'text-sky-400',
  },
]

const features = [
  { icon: Zap, title: 'Live Interactive Sessions', desc: 'Real-time classes with the instructors, not pre-recorded videos.', tint: 'from-orange-500/20 to-amber-500/10 text-orange-400' },
  { icon: MessageCircle, title: 'WhatsApp Doubt Group', desc: 'Get your doubts resolved quickly via a dedicated support channel.', tint: 'from-green-500/20 to-emerald-500/10 text-green-400' },
  { icon: Puzzle, title: 'Curated Practice Questions', desc: '5–8 tailored coding problems per class to reinforce every concept.', tint: 'from-indigo-500/20 to-blue-500/10 text-indigo-400' },
  { icon: Hammer, title: 'Hands-On Projects', desc: 'Build real projects at every stage of the curriculum.', tint: 'from-sky-500/20 to-cyan-500/10 text-sky-400' },
  { icon: Target, title: 'Direct Mentorship', desc: 'Your instructors are working SDEs at Flipkart — not full-time teachers.', tint: 'from-rose-500/20 to-pink-500/10 text-rose-400' },
  { icon: Users, title: 'Small Batches', desc: 'Limited seats ensure you get personal attention, not just a seat number.', tint: 'from-violet-500/20 to-purple-500/10 text-violet-400' },
]

const howItWorks = [
  { step: '1', title: 'Enroll in DSA', desc: 'Pay via UPI and submit your enrollment request online.' },
  { step: '2', title: 'Join live classes', desc: PUBLIC_SETTINGS.batchSchedule },
  { step: '3', title: 'Practice daily', desc: 'Solve curated problems after every session in our coding portal.' },
  { step: '4', title: 'Clear assessments', desc: 'Unlock Backend and Full-Stack only after clearing stage gates.' },
]

const topics = [
  'Arrays', 'Hashing', 'Two Pointers', 'Recursion', 'Trees', 'Graphs', 'Dynamic Programming', 'SQL',
  'Java', 'Spring Boot', 'REST APIs', 'System Design', 'React', 'HTML & CSS', 'Git', 'Testing',
]

function CountdownCard({ timeLeft, discount }: { timeLeft: TimeLeft; discount: DiscountInfo }) {
  const formatMilestoneDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="accent" className="uppercase tracking-wider">
            {discount.percentage > 0 ? (
              <>
                <Flame className="w-3.5 h-3.5" /> {discount.percentage}% Early Bird
              </>
            ) : (
              '⚡ Batch Commencing'
            )}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-medium">Ends {formatMilestoneDate(discount.expiresAt)}</span>
        </div>

        <h3 className="font-display text-base font-bold text-foreground mb-1">
          {discount.percentage > 0
            ? `${discount.percentage}% off if you enroll before the deadline`
            : 'Seats fill fast — next batch launches soon'}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {discount.percentage > 0 ? 'Discount drops at the next milestone. Enroll today.' : 'Enrollment closes once the batch fills up.'}
        </p>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 font-mono">
          {[
            { v: timeLeft.days, l: 'Days' },
            { v: String(timeLeft.hours).padStart(2, '0'), l: 'Hrs' },
            { v: String(timeLeft.minutes).padStart(2, '0'), l: 'Min' },
            { v: String(timeLeft.seconds).padStart(2, '0'), l: 'Sec' },
          ].map((t, idx) => (
            <div key={t.l} className="flex flex-col items-center bg-secondary/60 border border-border rounded-xl px-1 py-2 shadow-inner min-w-0">
              <span className="text-lg sm:text-xl font-bold text-gradient-orange leading-none tabular-nums">{t.v}</span>
              <span className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">{t.l}</span>
              {idx < 3 && <span className="sr-only">:</span>}
            </div>
          ))}
        </div>

        <Button asChild className="w-full mt-4">
          <Link to="/enroll">
            Reserve My Seat
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function Home() {
  const [discount, setDiscount] = useState<DiscountInfo>(getActiveDiscount())
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeRemaining(discount.expiresAt))

  useEffect(() => {
    const timer = setInterval(() => {
      const currentDiscount = getActiveDiscount()
      setDiscount(currentDiscount)
      setTimeLeft(getTimeRemaining(currentDiscount.expiresAt))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const dsaDiscounted = calculateDiscountedPrice(stages[0].basePrice, discount.percentage)

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden pt-14 lg:pt-20 pb-16">
        <div className="absolute inset-0 bg-grid opacity-70 pointer-events-none" />
        <div className="absolute -top-32 -left-24 w-[480px] h-[480px] bg-primary/15 blur-[130px] rounded-full animate-aurora pointer-events-none" />
        <div className="absolute top-20 right-0 w-[420px] h-[420px] bg-cyan-500/12 blur-[130px] rounded-full animate-aurora [animation-delay:2s] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] bg-violet-600/12 blur-[130px] rounded-full animate-aurora [animation-delay:4s] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left */}
            <div className="reveal">
              <div className="inline-flex items-center gap-2 chip mb-6">
                <span className="live-dot" />
                <span className="text-primary font-semibold">Taught by Flipkart SDEs · Now enrolling</span>
              </div>

              <h1 className="font-display text-[2.6rem] md:text-6xl lg:text-[4.2rem] font-bold leading-[1.04] tracking-tight text-foreground mb-6">
                One mentor team.
                <span className="block text-gradient-orange mt-1">One robust roadmap.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 light:text-slate-600 mb-3 font-medium">
                From your first array to a full production stack.
              </p>
              <p className="text-muted-foreground mb-8 text-sm md:text-base max-w-xl leading-relaxed">
                Learn coding the way it works in the real world — guided by practicing software engineers who build at massive scale, every single day.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button asChild size="xl">
                  <Link to="/enroll">
                    Start Your Journey
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link to="/courses">Explore the Path</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: `${PUBLIC_SETTINGS.classCount}+`, label: 'Live Classes', accent: 'from-orange-400 to-amber-300' },
                  { value: '3', label: 'Sequential Stages', accent: 'from-cyan-400 to-sky-300' },
                  { value: `₹${dsaDiscounted}`, label: 'Batch Starts At', accent: 'from-violet-400 to-purple-300', badge: discount.percentage > 0 ? `${discount.percentage}% OFF` : undefined },
                  { value: '1:1', label: 'Mentorship', accent: 'from-green-400 to-emerald-300' },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-2xl px-4 py-4 text-center">
                    <div className="text-xl font-black text-foreground flex items-center justify-center gap-1.5">
                      <span className={`bg-gradient-to-br ${stat.accent} bg-clip-text text-transparent`}>{stat.value}</span>
                      {stat.badge && (
                        <Badge variant="success" className="px-1.5 py-0.5 text-[9px]">{stat.badge}</Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live stack */}
            <div className="space-y-4 reveal [transition-delay:150ms]">
              {!discount.hasBatchStarted && <CountdownCard timeLeft={timeLeft} discount={discount} />}

              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="eyebrow">Class Schedule</p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                    <span className="live-dot" /> Live now
                  </span>
                </div>
                <p className="font-display text-lg font-bold text-foreground mb-1">{PUBLIC_SETTINGS.batchSchedule}</p>
                <p className="text-sm text-muted-foreground">Weekend doubt sessions · Weekly assessments · Recordings included</p>
              </div>

              {/* Stage unlock progress */}
              <div className="glass rounded-2xl p-5">
                <p className="eyebrow mb-4">Your Roadmap</p>
                <div className="space-y-3.5">
                  {stages.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.accent} text-slate-950 text-xs font-black flex items-center justify-center shrink-0 shadow-lg`}>
                        {s.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground truncate">{s.title}</p>
                          {i === 0 ? (
                            <Badge variant="accent" className="shrink-0 ml-2 px-2 py-0 text-[10px]">Now enrolling</Badge>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground shrink-0 ml-2">
                              <Lock className="w-3 h-3" /> Locked
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${s.accent}`}
                            style={{ width: i === 0 ? '45%' : '0%', opacity: i === 0 ? 1 : 0.3 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TOPICS MARQUEE ============ */}
      <section className="border-y border-border/60 bg-secondary/20 py-5 overflow-hidden">
        <div className="marquee-track gap-3">
          {[...topics, ...topics].map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-background/60 text-muted-foreground text-sm font-medium whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal">
          {howItWorks.map((item, i) => (
            <div key={item.step} className="gradient-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/10 border border-primary/25 text-primary text-sm font-black flex items-center justify-center">
                  {item.step}
                </div>
                {i < 3 && <span className="hidden lg:block text-muted-foreground/40">────</span>}
              </div>
              <p className="font-display font-bold text-foreground text-sm mb-1">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ THE PATH ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <div className="text-center mb-12 reveal">
          <span className="eyebrow justify-center mb-3">Structured Learning</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">The Path</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Three sequential stages, each a checkpoint — not a package deal. Progress only if the prior stage is cleared.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {stages.map((stage, i) => {
            const currentDiscounted = calculateDiscountedPrice(stage.basePrice, discount.percentage)
            return (
              <div key={i} className="gradient-card p-6 group relative overflow-hidden reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stage.accent} opacity-60`} />
                <div className="flex items-center justify-between mb-5">
                  <div className={`font-mono text-4xl font-bold bg-gradient-to-br ${stage.accent} bg-clip-text text-transparent opacity-90`}>
                    {stage.step}
                  </div>
                  <Badge variant="muted">{stage.badge}</Badge>
                </div>

                <h3 className="font-display text-lg font-bold text-foreground mb-2">{stage.title}</h3>
                <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                  {discount.percentage > 0 ? (
                    <>
                      <span className={`text-2xl font-black ${stage.text}`}>₹{currentDiscounted}</span>
                      <span className="text-muted-foreground/70 line-through text-sm">₹{stage.basePrice}</span>
                    </>
                  ) : (
                    <span className={`text-2xl font-black ${stage.text}`}>₹{stage.basePrice}</span>
                  )}
                  <span className="text-muted-foreground/50">·</span>
                  <span className="text-muted-foreground text-xs font-medium">{stage.duration}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{stage.desc}</p>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/60">
                  <span className="text-xs text-muted-foreground font-medium">{stage.classes} live classes</span>
                  <Link
                    to="/courses"
                    className={`inline-flex items-center gap-1 text-sm font-semibold ${stage.text} hover:gap-2 transition-all`}
                  >
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ============ WHAT'S INCLUDED ============ */}
      <section className="relative border-y border-border/60 bg-secondary/20 py-16 lg:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[560px] h-[260px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <span className="eyebrow justify-center mb-3">Everything you get</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight">What's Included</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="group glass rounded-2xl p-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 reveal"
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.tint} border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1.5 text-sm group-hover:text-primary transition">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MENTOR ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <div className="reveal">
            <span className="eyebrow mb-3">Your Mentors</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-5">Why Learn From Us</h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-lg">
              We are active engineering professionals who teach what we actually design and code on the job.
              No academic textbooks or outdated syllabi — everything is taught with real-world scale and practical code tracing.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              {['Real production code', 'Scale-first thinking', 'Interview-ready depth'].map((t) => (
                <Badge key={t} variant="muted" className="px-3 py-1.5 text-xs font-medium">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-7 relative overflow-hidden reveal [transition-delay:120ms]">
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative flex items-start gap-5">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-3xl shadow-glow">
                👨‍💻
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Flipkart SDE Mentors</h3>
                <p className="text-primary font-bold text-xs mb-3 uppercase tracking-wider">Senior Software Engineers @ Flipkart</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  From basic variables to production-grade distributed architectures — optimized for depth, not hype.
                </p>
              </div>
            </div>
            <div className="relative mt-6 flex items-center gap-4">
              <div className="flex -space-x-3">
                {['bg-gradient-to-br from-orange-400 to-red-500', 'bg-gradient-to-br from-cyan-400 to-blue-600', 'bg-gradient-to-br from-emerald-400 to-teal-600'].map((c, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full ${c} ring-2 ring-background flex items-center justify-center text-[10px] font-black text-white`}>
                    {['DS', 'SB', 'KT'][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">A small team that knows your name.</p>            </div>
            <Button asChild className="w-full mt-6">
              <Link to="/enroll">Start Your Journey →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 lg:pb-28">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#241207] via-[#150e0b] to-[#0b0a13] light:from-[#fff7ed] light:via-[#ffedd5] light:to-[#fff1e0] border border-primary/20 px-6 py-14 lg:py-16 text-center reveal">
          <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[260px] bg-primary/25 blur-[110px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="relative">
            <Badge variant="accent" className="mb-5 px-3 py-1">
              <Flame className="w-3.5 h-3.5" /> Enroll in DSA Foundations
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white light:text-foreground tracking-tight mb-4">Ready to start?</h2>
            <p className="text-orange-200/80 light:text-orange-700/90 mb-8 max-w-xl mx-auto text-sm md:text-base">
              Enroll in DSA Foundations — starting at ₹{dsaDiscounted}
              {discount.percentage > 0 ? ` (${discount.percentage}% early bird applied)` : ''}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/enroll">
                  Enroll Now — ₹{dsaDiscounted}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/courses">View Curriculum →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
