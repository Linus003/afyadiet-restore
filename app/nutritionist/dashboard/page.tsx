"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { NutritionistNav } from "@/components/nutritionist-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Users, TrendingUp, History } from "lucide-react"

export default function NutritionistDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  
  // Stats
  const [earnings, setEarnings] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    totalEarnings: 0,
    averageRate: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Profile First (To Check Verification)
        const profileRes = await fetch("/api/nutritionist/profile")
        if (profileRes.status === 401) {
          router.push("/login")
          return
        }
        const profileData = await profileRes.json()
        
        if (profileData.profile) {
          setProfile(profileData.profile)
          // --- GATEKEEPER CHECK ---
          if (profileData.profile.verification_status !== 'verified') {
            router.push("/nutritionist/verify")
            return // Stop loading dashboard if redirecting
          }
        }

        // 2. Fetch Dashboard Data
        const [appointmentsRes, earningsRes, historyRes] = await Promise.all([
          fetch("/api/nutritionist/appointments"),
          fetch("/api/nutritionist/earnings"),
          fetch("/api/nutritionist/earnings/history") // New API for table
        ])

        const appointmentsData = await appointmentsRes.json()
        const earningsData = await earningsRes.json()
        const historyData = await historyRes.json()

        setAppointments(appointmentsData.appointments || [])
        setEarnings(earningsData)
        setHistory(historyData.history || [])
        
      } catch (error) {
        console.error("[v0] Dashboard fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NutritionistNav />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NutritionistNav />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Welcome, {profile?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Your practice overview. <span className="text-green-600 font-medium">Status: Verified ✅</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/nutritionist/profile">
              <Button variant="outline">Edit Profile</Button>
            </Link>
            <Link href="/nutritionist/availability">
              <Button>Update Availability</Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{earnings.totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{earnings.completedAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Earnings (KSh)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* UPDATED TO KSH */}
              <div className="text-3xl font-bold text-green-600">
                KSh {earnings.totalEarnings?.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
               {/* UPDATED TO KSH */}
              <div className="text-3xl font-bold text-foreground">
                KSh {earnings.averageRate?.toFixed(0)}/hr
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Upcoming Sessions</h2>
              <Link href="/nutritionist/appointments">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            
            {appointments.filter(a => a.status !== 'completed').length > 0 ? (
              <div className="space-y-4">
                {appointments.slice(0, 3).map((apt) => (
                  <Card key={apt.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{apt.client_name}</h3>
                          <p className="text-sm text-muted-foreground">{new Date(apt.scheduled_at).toLocaleString()}</p>
                          <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                            {apt.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">KSh {Number(apt.price).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{apt.duration_minutes} min</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                No upcoming sessions found.
              </div>
            )}
          </div>

          {/* NEW: Payment History Table */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <History className="w-6 h-6" /> Payment Log
              </h2>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-muted-foreground border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Client</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                          No completed payments yet.
                        </td>
                      </tr>
                    ) : (
                      history.slice(0, 5).map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{item.clientName}</td>
                          <td className="px-4 py-3 text-right font-bold text-green-700">
                            KSh {item.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
