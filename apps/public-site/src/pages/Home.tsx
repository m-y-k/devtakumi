import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
    ring: 'hover:border-orange-500/40',
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
    ring: 'hover:border-indigo-500/40',
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
    ring: 'hover:border-sky-500/40',
    text: 'text-sky-400',
  },
]

const features = [
  { icon: '⚡', title: 'Live Interactive Sessions', desc: 'Real-time classes with the instructors, not pre-recorded videos.', tint: 'from-orange-500/20 to-amber-500/10' },
  { icon: '💬', title: 'WhatsApp Doubt Group', desc: 'Get your doubts resolved quickly via a dedicated support channel.', tint: 'from-green-500/20 to-emerald-500/10' },
  { icon: '🧩', title: 'Curated Practice Questions', desc: '5–8 tailored coding problems per class to reinforce every concept.', tint: 'from-indigo-500/20 to-blue-500/10' },
  { icon: '🔨', title: 'Hands-On Projects', desc: 'Build real projects at every stage of the curriculum.', tint: 'from-sky-500/20 to-cyan-500/10' },
  { icon: '🎯', title: 'Direct Mentorship', desc: 'Your instructors are working SDEs at Flipkart — not full-time teachers.', tint: 'from-rose-500/20 to-pink-500/10' },
  { icon: '👥', title: 'Small Batches', desc: 'Limited seats ensure you get personal attention, not just a seat number.', tint: 'from-violet-500/20 to-purple-500/10' },
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
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-bold uppercase tracking-wider">
            {discount.percentage > 0 ? `🔥 ${discount.percentage}% Early Bird` : '⚡ Batch Commencing'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Ends {formatMilestoneDate(discount.expiresAt)}</span>
        </div>

        <h3 className="font-display text-base font-bold text-white mb-1">
          {discount.percentage > 0
            ? `${discount.percentage}% off if you enroll before the deadline`
            : 'Seats fill fast — next batch launches soon'}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {discount.percentage > 0 ? 'Discount drops at the next milestone. Enroll today.' : 'Enrollment closes once the batch fills up.'}
        </p>

        <div className="flex gap-2 font-mono">
          {[
            { v: timeLeft.days, l: 'Days' },
            { v: String(timeLeft.hours).padStart(2, '0'), l: 'Hrs' },
            { v: String(timeLeft.minutes).padStart(2, '0'), l: 'Min' },
            { v: String(timeLeft.seconds).padStart(2, '0'), l: 'Sec' },
          ].map((t, idx) => (
            <div key={t.l} className="flex items-center gap-2">
              <div className="flex flex-col items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2 min-w-[56px] shadow-inner">
                <span className="text-xl font-bold text-gradient-orange leading-none">{t.v}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-1">{t.l}</span>
              </div>
              {idx < 3 && <span className="text-slate-600 font-bold text-lg animate-pulse-soft">:</span>}
            </div>
          ))}
        </div>

        <Link to="/enroll" className="btn-primary w-full mt-4 !py-2.5 !text-sm">
          Reserve My Seat
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
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
        {/* Background layers */}
        <div className="absolute inset-0 bg-grid opacity-70 pointer-events-none" />
        <div className="absolute -top-32 -left-24 w-[480px] h-[480px] bg-orange-500/15 blur-[130px] rounded-full animate-aurora pointer-events-none" />
        <div className="absolute top-20 right-0 w-[420px] h-[420px] bg-cyan-500/12 blur-[130px] rounded-full animate-aurora [animation-delay:2s] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] bg-violet-600/12 blur-[130px] rounded-full animate-aurora [animation-delay:4s] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left */}
            <div className="reveal">
              <div className="inline-flex items-center gap-2 chip mb-6">
                <span className="live-dot" />
                <span className="text-orange-200">Taught by Flipkart SDEs · Now enrolling</span>
              </div>

              <h1 className="font-display text-[2.6rem] md:text-6xl lg:text-[4.2rem] font-bold leading-[1.04] tracking-tight text-white mb-6">
                One mentor team.
                <span className="block text-gradient-orange mt-1">One robust roadmap.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 mb-3 font-medium">
                From your first array to a full production stack.
              </p>
              <p className="text-slate-400 mb-8 text-sm md:text-base max-w-xl leading-relaxed">
                Learn coding the way it works in the real world — guided by practicing software engineers who build at massive scale, every single day.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link to="/enroll" className="btn-primary !px-8 !py-4 !text-base">
                  Start Your Journey
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link to="/courses" className="btn-ghost !px-8 !py-4 !text-base">
                  Explore the Path
                </Link>
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
                    <div className="text-xl font-black text-white flex items-center justify-center gap-1.5">
                      <span className={`bg-gradient-to-br ${stat.accent} bg-clip-text text-transparent`}>{stat.value}</span>
                      {stat.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">
                          {stat.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">{stat.label}</div>
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
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-400">
                    <span className="live-dot" /> Live now
                  </span>
                </div>
                <p className="font-display text-lg font-bold text-white mb-1">{PUBLIC_SETTINGS.batchSchedule}</p>
                <p className="text-sm text-slate-400">Weekend doubt sessions · Weekly assessments · Recordings included</p>
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
                          <p className="text-sm font-semibold text-white truncate">{s.title}</p>
                          {i === 0 ? (
                            <span className="text-[10px] font-bold text-orange-300 shrink-0 ml-2">Now enrolling</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 shrink-0 ml-2">🔒 Locked</span>
                          )}
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-white/5 overflow-hidden">
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
      <section className="border-y border-white/5 bg-white/[0.02] py-5 overflow-hidden">
        <div className="marquee-track gap-3">
          {[...topics, ...topics].map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.03] text-slate-400 text-sm font-medium whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500/70" />
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
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/25 text-orange-300 text-sm font-black flex items-center justify-center">
                  {item.step}
                </div>
                {i < 3 && <span className="hidden lg:block text-slate-600">────</span>}
              </div>
              <p className="font-display font-bold text-white text-sm mb-1">{item.title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ THE PATH ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <div className="text-center mb-12 reveal">
          <span className="eyebrow justify-center mb-3">Structured Learning</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">The Path</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
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
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-slate-300 uppercase tracking-wider">
                    {stage.badge}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-2">{stage.title}</h3>
                <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                  {discount.percentage > 0 ? (
                    <>
                      <span className={`text-2xl font-black ${stage.text}`}>₹{currentDiscounted}</span>
                      <span className="text-slate-500 line-through text-sm">₹{stage.basePrice}</span>
                    </>
                  ) : (
                    <span className={`text-2xl font-black ${stage.text}`}>₹{stage.basePrice}</span>
                  )}
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 text-xs font-medium">{stage.duration}</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{stage.desc}</p>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500 font-medium">{stage.classes} live classes</span>
                  <Link
                    to="/courses"
                    className={`inline-flex items-center gap-1 text-sm font-semibold ${stage.text} hover:gap-2 transition-all`}
                  >
                    Learn more
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ============ WHAT'S INCLUDED ============ */}
      <section className="relative border-y border-white/5 bg-white/[0.02] py-16 lg:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[560px] h-[260px] bg-orange-500/[0.07] blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <span className="eyebrow justify-center mb-3">Everything you get</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight">What's Included</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="group glass rounded-2xl p-6 hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300 reveal"
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.tint} border border-white/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-white mb-1.5 text-sm group-hover:text-orange-300 transition">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
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
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight mb-5">Why Learn From Us</h2>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base max-w-lg">
              We are active engineering professionals who teach what we actually design and code on the job.
              No academic textbooks or outdated syllabi — everything is taught with real-world scale and practical code tracing.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              {['Real production code', 'Scale-first thinking', 'Interview-ready depth'].map((t) => (
                <span key={t} className="chip !bg-white/[0.03] !border-white/10 !text-slate-300">
                  <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-7 relative overflow-hidden reveal [transition-delay:120ms]">
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-orange-500/20 blur-3xl rounded-full" />
            <div className="relative flex items-start gap-5">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-3xl shadow-glow">
                👨‍💻
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Flipkart SDE Mentors</h3>
                <p className="text-orange-500 font-bold text-xs mb-3 uppercase tracking-wider">Senior Software Engineers @ Flipkart</p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  From basic variables to production-grade distributed architectures — optimized for depth, not hype.
                </p>
              </div>
            </div>
            <div className="relative mt-6 flex items-center gap-4">
              <div className="flex -space-x-3">
                {['bg-gradient-to-br from-orange-400 to-red-500', 'bg-gradient-to-br from-cyan-400 to-blue-600', 'bg-gradient-to-br from-emerald-400 to-teal-600'].map((c, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full ${c} ring-2 ring-[#0a0e17] flex items-center justify-center text-[10px] font-black text-white`}>
                    {['DS', 'SB', 'KT'][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">A small team that knows your name.</p>
            </div>
            <Link to="/enroll" className="btn-primary w-full mt-6">
              Start Your Journey →
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 lg:pb-28">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#241207] via-[#150e0b] to-[#0b0a13] border border-orange-900/50 px-6 py-14 lg:py-16 text-center reveal">
          <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[260px] bg-orange-500/25 blur-[110px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

          <div className="relative">
            <span className="chip mb-5">🚀 Enroll in DSA Foundations</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Ready to start?</h2>
            <p className="text-orange-200/80 mb-8 max-w-xl mx-auto text-sm md:text-base">
              Enroll in DSA Foundations — starting at ₹{dsaDiscounted}
              {discount.percentage > 0 ? ` (${discount.percentage}% early bird applied)` : ''}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/enroll" className="btn-primary !px-8 !py-4 !text-base">
                Enroll Now — ₹{dsaDiscounted}
              </Link>
              <Link to="/courses" className="btn-ghost !px-8 !py-4 !text-base">
                View Curriculum →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
