"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications'>('overview')

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // 1. Fetch Stats
        const statsRes = await fetch('/api/admin/stats')
        if (statsRes.status === 401 || statsRes.status === 403) {
          throw new Error("Unauthorized: Please log in as an Admin.")
        }
        const statsData = await statsRes.json()
        setStats(statsData)

        // 2. Fetch Verifications
        const verifyRes = await fetch('/api/admin/verifications')
        const verifyData = await verifyRes.json()
        setPendingUsers(verifyData.pending || [])

      } catch (err: any) {
        console.error("Admin Load Error:", err)
        setError(err.message || "Failed to load admin data")
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const handleVerify = async (id: number, action: 'approve' | 'reject') => {
    if(!confirm(`Are you sure you want to ${action}?`)) return
    
    await fetch('/api/admin/verifications', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nutritionistId: id, action })
    })
    
    // Refresh List
    alert(`User ${action}d!`)
    window.location.reload()
  }

  if (loading) return <div className="p-10 text-center text-lg animate-pulse">Loading Command Center...</div>

  if (error) return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-gray-700 mb-4">{error}</p>
      <button onClick={() => router.push('/login')} className="px-4 py-2 bg-blue-600 text-white rounded">Go to Login</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">🛡️ AfyaDiet Admin</h1>
          <div className="flex gap-4 text-xs md:text-sm text-gray-400">
             <span className="flex items-center gap-1">
               System: <span className="text-green-400 font-bold">● {stats?.system?.status || 'Active'}</span>
             </span>
             <span>Uptime: {Math.floor(stats?.system?.uptime / 60 || 0)}m</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b pb-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}
          >
            📊 System Overview
          </button>
          <button 
            onClick={() => setActiveTab('verifications')}
            className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'verifications' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}
          >
            🛡️ Verifications 
            {pendingUsers.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingUsers.length}</span>}
          </button>
        </div>

        {/* --- VIEW 1: OVERVIEW --- */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <p className="text-gray-500 text-sm font-medium uppercase">Total Clients</p>
                <p className="text-4xl font-extrabold text-gray-800 mt-2">{stats.stats?.clients || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                <p className="text-gray-500 text-sm font-medium uppercase">Nutritionists</p>
                <p className="text-4xl font-extrabold text-gray-800 mt-2">{stats.stats?.nutritionists || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
                <p className="text-gray-500 text-sm font-medium uppercase">Total Revenue</p>
                <p className="text-4xl font-extrabold text-green-600 mt-2">KSh {(stats.stats?.revenue || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                <p className="text-gray-500 text-sm font-medium uppercase">Pending Actions</p>
                <p className="text-4xl font-extrabold text-orange-500 mt-2">{stats.stats?.pending || 0}</p>
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="font-bold text-gray-700">Live Activity Log</h2>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentActivity?.map((act: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(act.created_at).toLocaleDateString()} {new Date(act.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-blue-600">New Booking</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="font-bold">{act.client?.name || 'Unknown'}</span> booked a session with <span className="font-bold">{act.nutritionist?.user?.name || 'Unknown'}</span>
                      </td>
                    </tr>
                  ))}
                  {(!stats.recentActivity || stats.recentActivity.length === 0) && (
                    <tr><td colSpan={3} className="p-8 text-center text-gray-400">No recent activity found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- VIEW 2: VERIFICATIONS --- */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-6">Pending Verifications</h2>
            {pendingUsers.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-500 text-lg font-medium">All caught up!</p>
                <p className="text-sm text-gray-400">There are no nutritionists waiting for verification.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingUsers.map(user => (
                  <div key={user.id} className="border p-5 rounded-lg flex flex-col md:flex-row justify-between items-center bg-yellow-50/50 hover:bg-yellow-50 transition">
                    <div className="mb-4 md:mb-0">
                      <h3 className="font-bold text-lg text-gray-800">{user.user.name}</h3>
                      <p className="text-sm text-gray-600">{user.user.email}</p>
                      <a 
                        href={user.kndi_document_url} 
                        target="_blank" 
                        className="inline-flex items-center gap-1 text-blue-600 underline text-sm mt-2 font-medium hover:text-blue-800"
                      >
                        📄 View KNDI Document (PDF)
                      </a>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleVerify(user.id, 'reject')} 
                        className="bg-white border border-red-200 text-red-600 px-5 py-2 rounded-lg font-bold hover:bg-red-50 transition"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleVerify(user.id, 'approve')} 
                        className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 shadow-sm transition"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
