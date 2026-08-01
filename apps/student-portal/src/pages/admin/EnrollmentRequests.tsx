import { useEffect, useState } from 'react'
import { getAdminEnrollmentRequests, approveEnrollmentRequest, rejectEnrollmentRequest } from '../../api/client'

interface EnrollmentRequestItem {
  id: string
  name: string
  email: string
  phone: string
  upiReference: string
  paymentScreenshotUrl: string | null
  status: string
  createdAt: string
  courseId: string
}

type FilterStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

const statusConfig = {
  PENDING:  { bg: 'bg-amber-500/15',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  APPROVED: { bg: 'bg-green-500/15',  text: 'text-green-400',  dot: 'bg-green-400' },
  REJECTED: { bg: 'bg-red-500/15',    text: 'text-red-400',    dot: 'bg-red-400'   },
}

export default function AdminEnrollmentRequests() {
  const [requests, setRequests]   = useState<EnrollmentRequestItem[]>([])
  const [filter, setFilter]       = useState<FilterStatus>('PENDING')
  const [loading, setLoading]     = useState(true)
  const [actionId, setActionId]   = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)

  const fetchRequests = (status: FilterStatus) => {
    setLoading(true)
    getAdminEnrollmentRequests(status)
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRequests(filter) }, [filter])

  const handleApprove = async (id: string) => {
    setActionId(id)
    try {
      await approveEnrollmentRequest(id)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch { /* silent */ }
    setActionId(null)
  }

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return
    setActionId(rejectTarget)
    try {
      await rejectEnrollmentRequest(rejectTarget, rejectNote || undefined)
      setRequests(prev => prev.filter(r => r.id !== rejectTarget))
    } catch { /* silent */ }
    setRejectTarget(null)
    setRejectNote('')
    setActionId(null)
  }

  const tabs: FilterStatus[] = ['PENDING', 'APPROVED', 'REJECTED']

  return (
    <div className="h-[calc(100vh)] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Enrollment Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage student payment submissions</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 p-1 bg-[#151921] border border-[#1e2433] rounded-xl mb-6 w-fit">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                filter === t
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-12 text-center">
            <div className="w-14 h-14 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No {filter.toLowerCase()} requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(r => {
              const sc = statusConfig[r.status as FilterStatus] || statusConfig.PENDING
              return (
                <div key={r.id} className="bg-[#151921] border border-[#1e2433] hover:border-purple-600/30 rounded-2xl p-5 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Info */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Name</p>
                        <p className="text-sm font-semibold text-white">{r.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Email</p>
                        <p className="text-sm text-gray-300 truncate">{r.email}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Phone</p>
                        <p className="text-sm text-gray-300">{r.phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">UTR / Reference</p>
                        <p className="text-sm font-mono text-purple-300">{r.upiReference}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Submitted</p>
                        <p className="text-sm text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {r.status}
                        </span>
                      </div>
                      {r.paymentScreenshotUrl && (
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Screenshot</p>
                          <a
                            href={`/api/admin/files/${r.paymentScreenshotUrl.split('/').pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            View payment proof
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions — only for PENDING */}
                    {r.status === 'PENDING' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={actionId === r.id}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => { setRejectTarget(r.id); setRejectNote('') }}
                          disabled={actionId === r.id}
                          className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 disabled:opacity-50 text-red-400 px-4 py-2 rounded-xl text-xs font-semibold transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reject dialog overlay */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Reject Request</h3>
            <p className="text-gray-400 text-sm mb-4">Optionally provide a reason. This will be noted on the request.</p>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              rows={3}
              className="w-full bg-[#0f1117] border border-[#2d3748] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmit}
                disabled={actionId === rejectTarget}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition"
              >
                {actionId === rejectTarget ? 'Rejecting...' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 bg-[#1a1f2e] hover:bg-[#2d3748] border border-[#2d3748] text-gray-300 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
