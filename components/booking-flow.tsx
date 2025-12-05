"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface BookingFlowProps {
  nutritionistId: string
  nutritionistName: string
  hourlyRate: number
  onSuccess?: () => void
}

export function BookingFlow({ nutritionistId, nutritionistName, hourlyRate, onSuccess }: BookingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<"details" | "payment" | "success">("details")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    scheduledAt: "",
    durationMinutes: 60,
    notes: "",
  })
  const [appointmentId, setAppointmentId] = useState<string>("")

  const calculatedPrice = (hourlyRate * formData.durationMinutes) / 60

  const handleNext = async () => {
    if (!formData.scheduledAt) {
      setError("Please select a date and time")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/bookings/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nutritionistId,
          scheduledAt: formData.scheduledAt,
          durationMinutes: formData.durationMinutes,
          notes: formData.notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create booking")
        return
      }

      setAppointmentId(data.appointmentId)
      setStep("payment")
    } catch (err) {
      setError("An error occurred")
      console.error("[v0] Booking error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          paymentIntentId: "pi_mock",
        }),
      })

      if (!response.ok) {
        setError("Payment confirmation failed")
        return
      }

      setStep("success")
      onSuccess?.()
    } catch (err) {
      setError("An error occurred")
      console.error("[v0] Payment error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (step === "success") {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center space-y-4">
          <div className="text-5xl">✓</div>
          <h3 className="text-2xl font-bold text-foreground">Booking Confirmed!</h3>
          <p className="text-muted-foreground">
            Your consultation with {nutritionistName} is confirmed. Check your email for details.
          </p>
          <Button onClick={() => router.push("/client/appointments")}>View My Appointments</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{step === "details" ? "Schedule Your Consultation" : "Confirm Payment"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {step === "details" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Preferred Date & Time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Session Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="30"
                step="30"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes for {nutritionistName}</Label>
              <Textarea
                id="notes"
                placeholder="Tell the nutritionist about your goals or concerns..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="min-h-24"
              />
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-semibold">${hourlyRate}/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-semibold">{formData.durationMinutes} minutes</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold text-primary">${calculatedPrice.toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={handleNext} disabled={loading} className="w-full">
              {loading ? "Processing..." : "Continue to Payment"}
            </Button>
          </>
        )}

        {step === "payment" && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">Payment Details</p>
              <p>
                Amount: <span className="font-bold">${calculatedPrice.toFixed(2)}</span>
              </p>
              <p className="text-xs mt-2">
                In production, this would integrate with Stripe for secure payment processing.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleConfirmPayment} disabled={loading} className="w-full">
                {loading ? "Processing..." : "Confirm Booking"}
              </Button>
              <Button variant="outline" onClick={() => setStep("details")} disabled={loading} className="w-full">
                Back
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
