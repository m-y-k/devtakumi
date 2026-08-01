import { useEffect, useState } from 'react'
import { getAnnouncements, createAdminAnnouncement, deleteAdminAnnouncement, Announcement } from '../../api/client'

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [title, setTitle]   = useState('')
  const [body, setBody]     = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const fetchData = () => {
    setLoading(true)
    getAnnouncements().then(setAnnouncements).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPosting(true)
    try {
      await createAdminAnnouncement(title, body)
      setTitle('')
      setBody('')
      setShowForm(false)
      fetchData()
    } catch {
      setError('Failed to post announcement. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteAdminAnnouncement(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } catch { /* silent */ }
    setDeletingId(null)
  }

  return (
    <div className="h-[calc(100vh)] overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Announcements</h1>
            <p className="text-gray-500 text-sm mt-1">Post updates visible to enrolled students</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-purple-900/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-[#151921] border border-purple-600/30 rounded-2xl p-6 mb-6 space-y-4"
          >
            <h2 className="font-semibold text-white">New Announcement</h2>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="E.g. New class scheduled for Friday"
                required
                className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-600/50 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Message *</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your announcement here..."
                required
                rows={4}
                className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-600/50 transition resize-none"
              />
            </div>
            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={posting}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                {posting ? 'Posting...' : 'Post Announcement'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-[#1a1f2e] hover:bg-[#2d3748] border border-[#2d3748] text-gray-300 px-6 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-12 text-center">
            <div className="w-14 h-14 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No announcements yet. Post your first update above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="bg-[#151921] border border-[#1e2433] hover:border-purple-600/30 rounded-2xl p-5 transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                      <h3 className="font-semibold text-white text-sm truncate">{a.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{a.body}</p>
                    <p className="text-gray-600 text-xs mt-3">
                      {new Date(a.createdAt).toLocaleDateString('en-IN', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                      {a.courseId && <span className="ml-2 text-purple-500/70">• Course-scoped</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
