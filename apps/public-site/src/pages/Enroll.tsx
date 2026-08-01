import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, Check, CheckCircle2, Copy, Image as ImageIcon, Loader2, Lock, X } from 'lucide-react'
import { getCourses, getUpiId, submitEnrollment, CourseSummary } from '../api/client'
import { getActiveDiscount, calculateDiscountedPrice } from '../api/discount'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export default function Enroll() {
  const [searchParams] = useSearchParams()
  const preselectedSlug = searchParams.get('course')
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [basePrice, setBasePrice] = useState(0)
  const [upiId, setUpiId] = useState('myk22.wallet@phonepe')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', upiReference: '' })
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const discount = getActiveDiscount()

  useEffect(() => {
    getCourses().then(cs => {
      setCourses(cs)
      if (preselectedSlug) {
        const match = cs.find(c => c.slug === preselectedSlug)
        if (match) {
          setSelectedCourseId(match.id)
          setBasePrice(match.priceInr)
          setCoursePrice(calculateDiscountedPrice(match.priceInr, discount.percentage))
        }
      }
    })
    getUpiId().then(setUpiId).catch(() => {})
  }, [preselectedSlug, discount.percentage])

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedCourseId(id)
    const course = courses.find(c => c.id === id)
    const originalPrice = course ? course.priceInr : 0
    setBasePrice(originalPrice)
    setCoursePrice(course ? calculateDiscountedPrice(originalPrice, discount.percentage) : 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!selectedCourseId) {
      setError('Please select a course.')
      return
    }
    setSubmitting(true)
    try {
      await submitEnrollment({ ...form, courseId: selectedCourseId, paymentScreenshot: screenshot || undefined })
      setSubmitted(true)
    } catch (err) {
      setError('Failed to submit. Please check your details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md reveal is-visible">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-glow">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Request Submitted! 🎉</h1>
          <p className="text-slate-400 text-lg mb-2">We'll verify your payment and email your login details within 24 hours.</p>
          <p className="text-slate-500 text-sm mb-8">
            Check your inbox (and spam folder) for the onboarding email. If WhatsApp opened, send your payment screenshot there too.
          </p>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="btn-primary">
            Open WhatsApp
          </a>
        </div>
      </div>
    )
  }

  const upiLink = `upi://pay?pa=${upiId}&pn=devtakumi${coursePrice ? `&am=${coursePrice}` : ''}&cu=INR`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiLink)}&bgcolor=ffffff&color=0f172a&margin=10`

  return (
    <div className="relative">
      <div className="absolute -top-20 left-1/4 w-[420px] h-[420px] bg-orange-500/[0.08] blur-[130px] rounded-full pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10 reveal">
          <span className="eyebrow justify-center mb-3">Join devtakumi</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Enroll Now</h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base">
            Pay via UPI and submit your request. We'll verify your payment and send login credentials within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left — form */}
          <div className="lg:col-span-3 reveal">
            <form onSubmit={handleSubmit} className="space-y-5 glass rounded-3xl p-6 md:p-8">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="enroll-name">Full Name *</Label>
                  <Input
                    required
                    type="text"
                    id="enroll-name"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Dev Sharma"
                  />
                </div>

                <div>
                  <Label htmlFor="enroll-email">Email Address *</Label>
                  <Input
                    required
                    type="email"
                    id="enroll-email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="enroll-phone">Phone Number *</Label>
                  <Input
                    required
                    type="tel"
                    id="enroll-phone"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <Label htmlFor="enroll-course">Select Course *</Label>
                  <div className="relative">
                    <select
                      required
                      id="enroll-course"
                      value={selectedCourseId}
                      onChange={handleCourseChange}
                      className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 placeholder-slate-600 font-medium text-sm transition cursor-pointer appearance-none pr-10"
                    >
                      <option value="" className="bg-slate-950">Choose a course...</option>
                      {courses.map(c => {
                        const price = calculateDiscountedPrice(c.priceInr, discount.percentage)
                        return (
                          <option key={c.id} value={c.id} className="bg-slate-950">
                            {c.title} — ₹{price} {discount.percentage > 0 ? `(${discount.percentage}% off)` : ''}
                          </option>
                        )
                      })}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {selectedCourseId && courses.find(c => c.id === selectedCourseId)?.prerequisiteCourseTitle && (
                    <p className="text-amber-500 text-xs font-semibold mt-2 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Unlocks after completing {courses.find(c => c.id === selectedCourseId)?.prerequisiteCourseTitle}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="enroll-utr">UPI Transaction Reference / UTR Number *</Label>
                <Input
                  required
                  type="text"
                  id="enroll-utr"
                  value={form.upiReference}
                  onChange={e => setForm(p => ({ ...p, upiReference: e.target.value }))}
                  placeholder="e.g. 407212345678"
                  className="font-mono"
                />
                <p className="text-slate-500 text-xs mt-1.5 font-medium">Find this in your UPI app's transaction history</p>
              </div>

              <div>
                <Label htmlFor="screenshot-input">Payment Screenshot <span className="text-slate-500 font-normal">(optional but recommended)</span></Label>
                <div
                  className="relative border-2 border-dashed border-white/10 hover:border-orange-500/40 rounded-2xl p-8 text-center transition cursor-pointer group bg-black/20"
                  onClick={() => document.getElementById('screenshot-input')?.click()}
                >
                  {screenshot ? (
                    <div className="flex items-center justify-center gap-2 text-green-400 font-semibold text-sm">
                      <Check className="w-5 h-5" />
                      <span className="break-all">{screenshot.name}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setScreenshot(null) }}
                        className="text-slate-500 hover:text-red-400 transition ml-1"
                        aria-label="Remove screenshot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:text-orange-400 transition">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium group-hover:text-slate-300 transition">Click to upload screenshot</p>
                      <p className="text-xs text-slate-600 mt-1">PNG, JPG or WebP</p>
                    </div>
                  )}
                  <input
                    id="screenshot-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setScreenshot(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-3 text-red-400 text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" id="enroll-submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" />
                    Submitting...
                  </span>
                ) : 'Submit Enrollment Request →'}
              </Button>
            </form>
          </div>

          {/* Right — Payment info */}
          <div className="lg:col-span-2 reveal [transition-delay:120ms]">
            <div className="glass-strong rounded-3xl p-6 sticky top-24">
              <h2 className="font-display text-lg font-bold text-white mb-5">Payment Details</h2>

              <div className="bg-black/25 border border-white/10 rounded-2xl p-4 flex flex-col items-center mb-5">
                <p className="text-xs text-slate-400 mb-3 uppercase tracking-widest font-bold">Scan & Pay via UPI</p>
                <div className="bg-white rounded-2xl p-2.5 shadow-glow">
                  <img
                    src={qrUrl}
                    alt="UPI QR Code"
                    className="w-44 h-44 rounded-xl"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-3 font-medium">Works with PhonePe, GPay, Paytm & all UPI apps</p>
              </div>

              <div className="bg-black/25 border border-white/10 rounded-xl px-4 py-3 mb-4">
                <p className="text-[11px] text-slate-500 mb-1 font-bold uppercase tracking-wider">UPI ID</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-orange-400 font-mono font-bold text-sm">{upiId}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(upiId)}
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-orange-400 transition text-xs font-semibold"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>

              {coursePrice > 0 && (
                <div className="relative overflow-hidden bg-orange-500/10 border border-orange-500/25 rounded-xl px-4 py-4 mb-4">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/20 blur-2xl rounded-full" />
                  <div className="relative">
                    <p className="text-[11px] text-orange-400 mb-1 font-bold uppercase tracking-wider">Amount to Pay</p>
                    <div className="flex items-baseline gap-2">
                      <p className="font-display text-4xl font-bold text-gradient-orange">₹{coursePrice}</p>
                      {discount.percentage > 0 && (
                        <span className="text-slate-500 line-through text-xs font-semibold">₹{basePrice}</span>
                      )}
                    </div>
                    {discount.percentage > 0 && (
                      <p className="text-[10px] text-green-400 font-bold mt-1">✓ Includes {discount.percentage}% Early Bird Discount</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-1">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-4">How it works</p>
                <div className="space-y-0">
                  {[
                    'Scan QR or copy UPI ID',
                    'Pay the exact amount shown',
                    'Copy the UTR/transaction number',
                    'Paste it in the form and submit',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 relative">
                      {i < 3 && <span className="absolute left-[9px] top-6 bottom-0 w-px bg-gradient-to-b from-orange-500/40 to-transparent" />}
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed font-medium pt-0.5">{step}</p>
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
