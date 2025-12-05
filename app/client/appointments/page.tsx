"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ClientNav } from "@/components/client-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/client/appointments")
        if (response.status === 401) {
          router.push("/login")
          return
        }

        const data = await response.json()
        setAppointments(data.appointments || [])
      } catch (error) {
        console.error("[v0] Appointments fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ClientNav />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Appointments</h1>

        {appointments.length > 0 ? (
          <div className="space-y-6">
            {appointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{apt.nutritionist_name}</h3>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(apt.scheduled_at).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(apt.scheduled_at).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {apt.notes && (
                          <div className="pt-2 border-t border-border">
                            <p className="text-foreground font-medium mb-1">Notes:</p>
                            <p>{apt.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className={statusColors[apt.status as keyof typeof statusColors]}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </Badge>
                      {apt.price && <span className="text-lg font-semibold text-primary">${apt.price.toFixed(2)}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground mb-4 text-lg">No appointments scheduled yet</p>
              <p className="text-sm text-muted-foreground">
                Browse nutritionists and book your first consultation to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
