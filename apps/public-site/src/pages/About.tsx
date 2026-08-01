import { Link } from 'react-router-dom'
import { Target, Factory, BadgeCheck, FlaskConical, Mail, MessageCircle, ArrowRight, Check, Code2 } from 'lucide-react'
import { DevtakumiLogo } from '../components/Logo'
import { PUBLIC_SETTINGS } from '../data/settings'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

const values = [
  { icon: Target, title: 'Depth over breadth', desc: 'One rigorous roadmap instead of scattered tutorials.' },
  { icon: Factory, title: 'Industry-first teaching', desc: 'Concepts tied to how Flipkart-scale systems are built.' },
  { icon: BadgeCheck, title: 'Checkpoint progression', desc: 'Each stage unlocks only after you clear assessments.' },
  { icon: FlaskConical, title: 'Small batch focus', desc: 'Limited seats so mentors can actually review your work.' },
]

export default function About() {
  return (
    <div className="relative">
      <div className="absolute -top-20 right-0 w-[400px] h-[400px] bg-orange-500/[0.08] blur-[130px] rounded-full pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-12 reveal">
          <span className="eyebrow justify-center mb-4">About</span>
          <div className="flex justify-center mb-6">
            <div className="glass rounded-3xl p-4 inline-block shadow-glow">
              <DevtakumiLogo size="lg" />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Built for <span className="text-gradient-orange">depth</span>, not breadth
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
            A coding bootcamp where real SDE mentors, one comprehensive roadmap, and a deliberate curriculum take you from absolute beginner to advanced full-stack.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {values.map((v, i) => (
            <div key={v.title} className="gradient-card p-6 flex items-start gap-4 reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/25 flex items-center justify-center">
                <v.icon className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-sm mb-1">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-strong rounded-3xl p-7 md:p-9 mb-6 relative overflow-hidden reveal">
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-orange-500/15 blur-3xl rounded-full" />
          <div className="relative flex flex-col md:flex-row gap-6 items-start">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-glow">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white mb-1">Flipkart SDE Mentors</h2>
              <p className="text-orange-500 font-bold text-xs mb-3 uppercase tracking-widest">Senior Software Engineers @ Flipkart</p>
              <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                We built Devtakumi because the best way to learn software engineering is from professionals
                who are actively doing it — not from educators who haven't written production code in years.
                Every topic we teach is something we encounter at our jobs. Every project is real-world.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['Production-grade code', 'Scale-first thinking', 'Interview-ready depth'].map((t) => (
                  <Badge key={t} variant="muted" className="gap-1.5 !text-slate-300">
                    <Check className="w-3 h-3 text-orange-400" />
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass rounded-3xl p-6 reveal">
            <h2 className="font-display text-lg font-bold text-white mb-5">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/25 rounded-xl flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-105 transition">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Email</p>
                  <a href={`mailto:${PUBLIC_SETTINGS.contactEmail}`} className="text-orange-400 hover:text-orange-300 font-bold text-sm transition">
                    {PUBLIC_SETTINGS.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-green-500/10 border border-green-500/25 rounded-xl flex items-center justify-center text-green-400 shrink-0 group-hover:scale-105 transition">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">WhatsApp</p>
                  <a href={`https://wa.me/${PUBLIC_SETTINGS.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 font-bold text-sm transition">
                    Message us →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 flex flex-col justify-between reveal [transition-delay:120ms]">
            <div>
              <h2 className="font-display text-lg font-bold text-white mb-2">Ready to join?</h2>
              <p className="text-slate-400 text-sm mb-1">{PUBLIC_SETTINGS.batchSchedule}</p>
              <p className="text-slate-500 text-xs">{PUBLIC_SETTINGS.classCount} live classes across 3 stages</p>
            </div>
            <Button asChild className="w-full mt-5" size="lg">
              <Link to="/enroll">
                Start Your Journey <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
