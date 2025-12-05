"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ClientNav } from "@/components/client-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, FileText } from "lucide-react"

export default function ClientDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [mealPlans, setMealPlans] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, mealPlansRes] = await Promise.all([
          fetch("/api/client/appointments"),
          fetch("/api/client/meal-plans"),
        ])

        if (appointmentsRes.status === 401) {
          router.push("/login")
          return
        }

        const appointmentsData = await appointmentsRes.json()
        const mealPlansData = await mealPlansRes.json()

        setAppointments(appointmentsData.appointments || [])
        setMealPlans(mealPlansData.mealPlans || [])
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
        <ClientNav />
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
      <ClientNav />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to Your Dashboard</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Manage your appointments, meal plans, and nutritionist connections
          </p>
          <Link href="/browse">
            <Button size="lg">Book a Consultation</Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{appointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Meal Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{mealPlans.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Next Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-foreground">
                {appointments.length > 0
                  ? new Date(appointments[0].scheduled_at).toLocaleDateString()
                  : "None scheduled"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Your Appointments
            </h2>
            <Link href="/client/appointments">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>

          {appointments.length > 0 ? (
            <div className="grid gap-4">
              {appointments.slice(0, 3).map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{apt.nutritionist_name}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(apt.scheduled_at).toLocaleString()}</p>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded mt-2 inline-block">
                          {apt.status}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground mb-4">No appointments yet</p>
                <Link href="/browse">
                  <Button>Book Your First Consultation</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Meal Plans Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Your Meal Plans
            </h2>
            <Link href="/client/meal-plans">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>

          {mealPlans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {mealPlans.slice(0, 4).map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-2">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {plan.content || "No description"}
                    </p>
                    <div className="text-xs text-muted-foreground">By {plan.nutritionist_name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground">No meal plans yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
