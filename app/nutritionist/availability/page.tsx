"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NutritionistNav } from "@/components/nutritionist-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export default function AvailabilityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slots, setSlots] = useState<any[]>([])
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
  })

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch("/api/nutritionist/availability")
        if (response.status === 401) {
          router.push("/login")
          return
        }

        const data = await response.json()
        setSlots(data.slots || [])
      } catch (error) {
        console.error("[v0] Slots fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [router])

  const handleAddSlot = async () => {
    if (!formData.startTime || !formData.endTime) {
      setError("Please fill in all fields")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/nutritionist/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: formData.startTime,
          endTime: formData.endTime,
          isAvailable: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSlots([...slots, data.slot])
        setFormData({ startTime: "", endTime: "" })
      } else {
        setError("Failed to add availability slot")
      }
    } catch (error) {
      console.error("[v0] Add slot error:", error)
      setError("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NutritionistNav />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NutritionistNav />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Manage Your Availability</h1>

        {/* Add Slot Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Available Time Slot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleAddSlot} disabled={saving} className="w-full">
              {saving ? "Adding..." : "Add Availability"}
            </Button>
          </CardContent>
        </Card>

        {/* Available Slots List */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Time Slots</h2>

          {slots.length > 0 ? (
            <div className="space-y-4">
              {slots.map((slot) => (
                <Card key={slot.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {new Date(slot.start_time).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(slot.start_time).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(slot.end_time).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {slot.is_available ? "Available" : "Booked"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground text-lg">No availability slots yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your first available time slot above to start receiving bookings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
