"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" 
import { Alert } from "@/components/ui/alert" 
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, DollarSign, Smartphone, Loader2, CheckCircle, XCircle } from "lucide-react"

// Define the time options available for booking
const TIME_SLOTS = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00", "18:00"
]

// Payment Status States
type PaymentStatus = "idle" | "initiated" | "pending" | "success" | "failure";

export default function BookingPage() {
    const params = useParams()
    const router = useRouter()
    const nutritionistId = Array.isArray(params.id) ? params.id[0] : params.id
    
    // UI State
    const [loading, setLoading] = useState(true)
    const [nutritionist, setNutritionist] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    // Booking State
    const [selectedDate, setSelectedDate] = useState<string>("")
    const [selectedTime, setSelectedTime] = useState<string>("")
    const [notes, setNotes] = useState("")
    
    // Payment State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState("")
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle")
    const [checkoutId, setCheckoutId] = useState<string | null>(null)
    const [appointmentId, setAppointmentId] = useState<number | null>(null)


    // 1. Fetch Nutritionist Details
    useEffect(() => {
        if (!nutritionistId) return

        const fetchNutritionist = async () => {
            try {
                const response = await fetch(`/api/nutritionists/${nutritionistId}`)
                if (!response.ok) throw new Error("Nutritionist not found")
                
                const data = await response.json()
                setNutritionist(data.nutritionist)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchNutritionist()
    }, [nutritionistId])

    // 2. Calculate Price (Hardcoded duration for now, assumes 60 mins)
    const consultationDuration = 60 // minutes
    const calculatedPrice = nutritionist ? (nutritionist.hourly_rate * (consultationDuration / 60)).toFixed(2) : "0.00"

    // 3. Trigger M-Pesa Payment
    const handleInitiatePayment = async () => {
        if (!selectedDate || !selectedTime || !phoneNumber) {
            setError("Please select date, time, and enter your phone number.")
            return
        }

        setPaymentStatus("initiated")
        setError(null)

        try {
            const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString()
            
            const bookingDetails = {
                nutritionistId: nutritionist.userId,
                scheduledAt: scheduledAt,
                durationMinutes: consultationDuration,
                price: calculatedPrice,
                notes: notes,
                phoneNumber: phoneNumber, // M-Pesa requires phone number
            }

            const response = await fetch("/api/bookings/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingDetails),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setCheckoutId(data.checkoutId)
                setAppointmentId(data.appointmentId)
                setPaymentStatus("pending")
                // Close button to be handled in the modal based on status
            } else {
                setPaymentStatus("failure")
                setError(data.error || "M-Pesa payment initiation failed.")
                // If appointment was created, it will be cleaned up by the backend
            }

        } catch (err) {
            setPaymentStatus("failure")
            setError("Network error. Please try again.")
        }
    }

    // 4. Polling for Payment Confirmation (Optional but adds responsiveness)
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (paymentStatus === 'pending' && appointmentId) {
            interval = setInterval(async () => {
                // Poll the server to check the appointment status
                try {
                    const res = await fetch(`/api/appointments/${appointmentId}`);
                    const data = await res.json();
                    
                    if (data.appointment?.status === 'confirmed') {
                        setPaymentStatus('success');
                        clearInterval(interval!);
                    }
                    // Note: The M-Pesa callback handles 'cancelled' status automatically
                } catch (e) {
                    console.error("Polling error:", e);
                }
            }, 5000); // Poll every 5 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [paymentStatus, appointmentId]);


    if (loading) return <div className="p-8"><Skeleton className="h-64 w-full max-w-2xl mx-auto" /></div>
    if (error && !isPaymentOpen) return <div className="p-8 text-red-500">Error: {error}</div>

    // Note: The phone number check should be removed here since it's collected in the modal later, 
    // but kept in the state to ensure a user is ready to pay.
    const isFormComplete = selectedDate && selectedTime && !loading

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-foreground mb-4">Book Consultation</h1>
                <p className="text-muted-foreground mb-8">Scheduling session with: <span className="font-semibold text-primary">{nutritionist?.full_name || '...'}</span></p>

                {/* Booking Form */}
                <Card className="shadow-lg">
                    <CardHeader><CardTitle>1. Select Time</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        
                        {/* Date Picker */}
                        <div className="space-y-2">
                            <Label htmlFor="date">Appointment Date</Label>
                            <Input 
                                id="date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} // Block past dates
                            />
                        </div>

                        {/* Time Slot Picker (Simplified for now) */}
                        <div className="space-y-2">
                            <Label>Time Slot ({consultationDuration} min)</Label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {TIME_SLOTS.map(time => (
                                    <Button 
                                        key={time}
                                        variant={selectedTime === time ? "default" : "outline"}
                                        onClick={() => setSelectedTime(time)}
                                        className="gap-2"
                                    >
                                        <Clock className="w-4 h-4" /> {time}
                                    </Button>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Note: Availability checks would be integrated here in a fully functional system.
                            </p>
                        </div>
                        
                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes for Nutritionist (Optional)</Label>
                            <Textarea 
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. I want to discuss a low-carb diet plan."
                            />
                        </div>

                        {/* Price Display */}
                         <div className="flex justify-between items-center border-t pt-4">
                            <p className="font-semibold text-lg flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-500" /> Total Price:
                            </p>
                            <p className="text-2xl font-bold text-green-500">
                                KSh {calculatedPrice}
                            </p>
                        </div>

                        {/* Payment Button */}
                        <Button 
                            className="w-full h-12 text-lg mt-6"
                            onClick={() => setIsPaymentOpen(true)}
                            disabled={!isFormComplete || isPaymentOpen}
                        >
                            Proceed to Payment
                        </Button>

                    </CardContent>
                </Card>

                {/* ? M-PESA PAYMENT MODAL */}
                <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Smartphone className="w-6 h-6 text-green-600" /> M-Pesa Payment
                            </DialogTitle>
                            <DialogDescription>
                                Confirm your phone number and payment will be pushed to your device.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Content based on Payment Status */}
                        {paymentStatus === 'idle' || paymentStatus === 'failure' ? (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number (e.g., 2547XXXXXXXX)</Label>
                                    <Input 
                                        id="phone"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="2547..."
                                        className="text-lg"
                                    />
                                </div>
                                
                                {error && <Alert variant="destructive">{error}</Alert>}
                                
                                <Button 
                                    onClick={handleInitiatePayment} 
                                    className="w-full bg-green-600 hover:bg-green-700 h-10"
                                    // ? FIX: Removed conflicting comparison
                                    disabled={!phoneNumber || parseFloat(calculatedPrice) <= 0} 
                                >
                                    Pay KSh {calculatedPrice} Now
                                </Button>
                            </div>
                        ) : paymentStatus === 'pending' || paymentStatus === 'initiated' ? (
                            <div className="text-center py-10 space-y-4">
                                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                                <h3 className="text-xl font-semibold">Awaiting Payment...</h3>
                                <p className="text-muted-foreground">
                                    Please enter your M-Pesa PIN on your phone to complete the transaction for KSh {calculatedPrice}. 
                                </p>
                                <p className="text-xs text-red-500">
                                    Do not close this window.
                                </p>
                            </div>
                        ) : paymentStatus === 'success' ? (
                            <div className="text-center py-10 space-y-4">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                                <h3 className="text-xl font-semibold">Payment Confirmed!</h3>
                                <p className="text-muted-foreground">
                                    Your appointment is confirmed. Redirecting you to your dashboard.
                                </p>
                                <Button onClick={() => router.push('/client/dashboard')} className="w-full">
                                    Go to Dashboard
                                </Button>
                            </div>
                        ) : null}
                    </DialogContent>
                </Dialog>

            </main>
        </div>
    )
}