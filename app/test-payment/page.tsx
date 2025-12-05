"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone } from "lucide-react"

export default function TestPaymentPage() {
  const [phone, setPhone] = useState("")
  const [amount, setAmount] = useState("1")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handlePay = async () => {
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/mpesa/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            amount: Number(amount), 
            phoneNumber: phone,
            reference: "TEST1234" 
        }),
      })
      const data = await res.json()
      console.log(data)

      if (data.ResponseCode === "0") {
        setMessage("✅ Success! Check your phone for the PIN prompt.")
      } else {
        setMessage(`❌ Error: ${data.errorMessage || "Failed to initiate"}`)
      }
    } catch (err) {
      setMessage("❌ Network Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-green-100 p-4 rounded-full mb-2">
            <Smartphone className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">M-Pesa Test</CardTitle>
          <p className="text-muted-foreground">Test payment on afyadietsolutions.co.ke</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-left">
            <label className="text-sm font-medium">Phone Number</label>
            <Input 
              placeholder="0712 345 678" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="text-left">
            <label className="text-sm font-medium">Amount (KSh)</label>
            <Input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg" 
            onClick={handlePay}
            disabled={loading || !phone}
          >
            {loading ? "Processing..." : "Pay Now"}
          </Button>

          {message && (
            <div className={`p-3 rounded text-sm font-medium ${message.startsWith("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}