"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NutritionistNav } from "@/components/nutritionist-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Mail, Video, Link as LinkIcon, Save, DollarSign } from "lucide-react"

const statusOptions = ["pending", "confirmed", "completed", "cancelled"]

export default function AppointmentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // State for the meeting link input being edited
  const [editingLink, setEditingLink] = useState<{ id: string, link: string } | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/nutritionist/appointments")
        if (response.status === 401) {
          router.push("/login")
          return
        }
        const data = await response.json()
        setAppointments(data.appointments || [])
      } catch (error) {
        console.error("Appointments fetch error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [router])

  // Helper to safely format dates without crashing
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) return "Invalid Date"
      
      return date.toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "short", day: "numeric"
      })
    } catch (e) {
      return "Date error"
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "--:--"
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    } catch (e) {
      return "--:--"
    }
  }

  // 1. Handle Status Update
  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    setUpdatingId(appointmentId)
    try {
      const response = await fetch("/api/nutritionist/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status: newStatus } : apt))
      }
    } catch (error) {
      console.error("Status update error:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  // 2. Handle Saving Meeting Link (Google Meet)
  const saveMeetingLink = async (appointmentId: string) => {
    if (!editingLink) return
    setUpdatingId(appointmentId)

    try {
      // Use the same PATCH endpoint but send meetingLink
      const response = await fetch("/api/nutritionist/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, meetingLink: editingLink.link }),
      })

      if (response.ok) {
        setAppointments(prev => prev.map(apt => 
          apt.id === appointmentId ? { ...apt, meeting_link: editingLink.link } : apt
        ))
        setEditingLink(null) // Close edit mode
      }
    } catch (error) {
      console.error("Link save error:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NutritionistNav />
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NutritionistNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
            <Badge variant="outline" className="text-lg px-4 py-1">
                Total: {appointments.length}
            </Badge>
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-6">
            {appointments.map((apt) => (
              <Card key={apt.id} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* LEFT: Date & Time Box */}
                    <div className="md:col-span-3 flex flex-col justify-center items-center bg-secondary/10 rounded-lg p-4 text-center">
                        <Calendar className="w-8 h-8 text-primary mb-2" />
                        <span className="text-lg font-bold text-foreground block">
                            {formatDate(apt.scheduled_at)}
                        </span>
                        <div className="flex items-center text-muted-foreground mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(apt.scheduled_at)}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                            ({apt.duration_minutes} mins)
                        </span>
                    </div>

                    {/* MIDDLE: Client Info */}
                    <div className="md:col-span-5 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{apt.client_name}</h3>
                        <a href={`mailto:${apt.client_email}`} className="flex items-center text-sm text-muted-foreground hover:text-primary mt-1">
                          <Mail className="w-4 h-4 mr-2" />
                          {apt.client_email}
                        </a>
                      </div>
                      
                      {/* Price Badge */}
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="px-3 py-1 text-green-700 bg-green-50 border-green-200">
                             <DollarSign className="w-3 h-3 mr-1" />
                             {Number(apt.price).toLocaleString()} KSh
                        </Badge>
                        <Badge variant={apt.status === 'confirmed' ? "default" : "outline"}>
                            {apt.status}
                        </Badge>
                      </div>

                      {apt.notes && (
                        <div className="text-sm bg-slate-50 p-2 rounded border text-slate-600">
                          <span className="font-semibold">Note:</span> {apt.notes}
                        </div>
                      )}
                    </div>

                    {/* RIGHT: Actions & Meeting Link */}
                    <div className="md:col-span-4 flex flex-col gap-3 border-l pl-0 md:pl-6">
                      
                      {/* GOOGLE MEET SECTION */}
                      <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center">
                            <Video className="w-3 h-3 mr-1" /> Video Meeting
                        </h4>

                        {/* 💡 FIX: Check if editingLink exists specifically for this item */}
                        {editingLink && editingLink.id === apt.id ? (
                            <div className="flex gap-2">
                                <Input 
                                    value={editingLink.link}
                                    onChange={(e) => setEditingLink({ ...editingLink, link: e.target.value })}
                                    placeholder="Paste Meet/Zoom link..."
                                    className="h-8 text-xs bg-white"
                                />
                                <Button size="sm" className="h-8 w-8 p-0" onClick={() => saveMeetingLink(apt.id)}>
                                    <Save className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            // Not editing
                            <div>
                                {apt.meeting_link ? (
                                    <div className="flex flex-col gap-2">
                                        <a 
                                            href={apt.meeting_link} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-xs text-blue-600 hover:underline truncate block font-medium"
                                        >
                                            {apt.meeting_link}
                                        </a>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="h-7 text-xs w-full" onClick={() => window.open(apt.meeting_link, '_blank')}>
                                                Join Meeting
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingLink({ id: apt.id, link: apt.meeting_link })}>
                                                <LinkIcon className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="w-full text-xs h-8 border-dashed text-muted-foreground"
                                        onClick={() => setEditingLink({ id: apt.id, link: "" })}
                                    >
                                        <LinkIcon className="w-3 h-3 mr-2" /> Add Google Meet Link
                                    </Button>
                                )}
                            </div>
                        )}
                      </div>

                      {/* STATUS ACTIONS */}
                      <div className="mt-auto">
                        <p className="text-xs text-muted-foreground mb-1">Update Status:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {['confirmed', 'completed'].map((st) => (
                                <Button 
                                    key={st}
                                    size="sm"
                                    variant={apt.status === st ? "default" : "secondary"}
                                    onClick={() => handleStatusUpdate(apt.id, st)}
                                    disabled={updatingId === apt.id || apt.status === st}
                                    className="text-xs h-7 capitalize"
                                >
                                    {st}
                                </Button>
                            ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-xl font-semibold text-foreground">No appointments yet</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Once clients book sessions with you, they will appear here. Make sure your profile is verified!
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}