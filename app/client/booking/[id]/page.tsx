"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function BookingPage() {
  const router = useRouter()
  const params = useParams() // <--- The safe way to get ID in Next.js 16
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  // Debugging: Check if we have the ID
  useEffect(() => {
    console.log("Booking Page Loaded. Nutritionist ID:", params.id)
  }, [params])

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Ensure we have a valid ID
    const rawId = params?.id
    if (!rawId) return alert("Error: No Nutritionist ID found in URL")

    if (!date || !time) return alert("Please pick a date and time")

    setLoading(true)
    const scheduledAt = new Date(`${date}T${time}`).toISOString()

    try {
      const res = await fetch("/api/bookings/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nutritionistId: parseInt(rawId as string), // Ensure it is a number
          scheduledAt,
          durationMinutes: 60,
          notes
        })
      })

      const data = await res.json()
      setLoading(false)

      if (res.ok) {
        alert(`Booking Confirmed! Please pay KSh ${data.amount}.`)
        router.push("/client/dashboard")
      } else {
        alert(data.error || "Booking failed")
      }
    } catch (err) {
      console.error("Booking Error:", err)
      setLoading(false)
      alert("Something went wrong. Check console.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Book Session</h1>
        <p className="text-gray-600 mb-6">Select a time for your appointment.</p>
        
        {/* Debug ID Display */}
        <p className="text-xs text-gray-400 mb-4">Booking for ID: {params?.id}</p>

        <form onSubmit={handleBook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input 
              type="date" 
              required
              className="w-full border p-2 rounded"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input 
              type="time" 
              required
              className="w-full border p-2 rounded"
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea 
              className="w-full border p-2 rounded"
              rows={3}
              placeholder="E.g., I want to discuss weight loss..."
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  )
}
