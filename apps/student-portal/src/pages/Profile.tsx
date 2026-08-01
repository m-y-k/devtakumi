import { useState } from 'react'
import { useAuth } from '../api/auth'
import { changePassword } from '../api/client'

export default function Profile() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      await changePassword(currentPassword, newPassword)
      setMessage('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err: any) {
      setError(err.message || 'Failed to change password')
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <p className="text-gray-700"><strong>Name:</strong> {user?.name}</p>
        <p className="text-gray-700"><strong>Email:</strong> {user?.email}</p>
        <p className="text-gray-700"><strong>Role:</strong> {user?.role}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password (min 8 characters)</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit"
            className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700">
            Change Password
          </button>
        </form>
      </div>
    </div>
  )
}
