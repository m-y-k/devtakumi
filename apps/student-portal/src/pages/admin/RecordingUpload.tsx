import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getClass, uploadRecording, ClassDetail } from '../../api/client'

export default function AdminRecordingUpload() {
  const { classId } = useParams<{ classId: string }>()
  const [cls, setCls]         = useState<ClassDetail | null>(null)
  const [file, setFile]       = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [status, setStatus]       = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [dragOver, setDragOver]   = useState(false)

  useEffect(() => {
    if (!classId) return
    getClass(classId).then(setCls).catch(() => {}).finally(() => setLoading(false))
  }, [classId])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type.startsWith('video/')) {
      setFile(dropped)
      setStatus('idle')
    }
  }, [])

  const handleUpload = async () => {
    if (!classId || !file) return
    setUploading(true)
    setProgress(0)
    setStatus('idle')
    setMessage('')

    // Simulate progress (actual XHR progress would require custom fetch)
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 90))
    }, 300)

    try {
      const result = await uploadRecording(classId, file)
      clearInterval(interval)
      setProgress(100)
      setStatus('success')
      setMessage(`Recording uploaded successfully.${result.key ? ` Key: ${result.key}` : ''}`)
      setFile(null)
    } catch (err: any) {
      clearInterval(interval)
      setProgress(0)
      setStatus('error')
      setMessage(err.message || 'Upload failed. Check file size and format.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!cls) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Class not found</p>
    </div>
  )

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(1) : null

  return (
    <div className="h-[calc(100vh)] overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link to="/admin/courses" className="text-gray-500 hover:text-purple-400 transition">Curriculum</Link>
          <span className="text-gray-700">/</span>
          <Link to={`/admin/classes/${classId}`} className="text-gray-500 hover:text-purple-400 transition">Class #{cls.globalClassNumber}</Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400">Recording</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Upload Recording</h1>
          <p className="text-gray-500 text-sm mt-1">#{cls.globalClassNumber} · {cls.title}</p>
          {cls.hasRecording && (
            <div className="mt-3 flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              This class already has a recording. Uploading will replace it.
            </div>
          )}
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !file && document.getElementById('recording-file-input')?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-purple-500 bg-purple-600/10'
              : file
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-[#2d3748] hover:border-purple-600/50 hover:bg-purple-600/5'
          }`}
        >
          <input
            id="recording-file-input"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) { setFile(f); setStatus('idle') }
            }}
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{file.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{fileSizeMB} MB · {file.type}</p>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setFile(null); setStatus('idle') }}
                className="text-xs text-gray-500 hover:text-red-400 transition"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-[#1a1f2e] rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Drag & drop your MP4 file here</p>
                <p className="text-gray-500 text-xs mt-1">or click to browse · MP4, MOV, AVI · max 500 MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress */}
        {uploading && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Uploading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-[#1a1f2e] rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Status message */}
        {status === 'success' && (
          <div className="mt-4 flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
          </div>
        )}
        {status === 'error' && (
          <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="mt-5 w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-purple-900/30"
        >
          {uploading ? 'Uploading...' : 'Upload Recording'}
        </button>

        <p className="text-center text-gray-600 text-xs mt-3">
          The video will be stored securely and streamed to enrolled students only.
        </p>
      </div>
    </div>
  )
}