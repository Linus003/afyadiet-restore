"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No token found. Please check your email link.")
      return
    }

    // Call API to verify
    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setStatus("success")
          setMessage("Email verified! You can now log in.")
        } else {
          setStatus("error")
          setMessage(data.error || "Verification failed. The token may be invalid or expired.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      })
  }, [token])

  return (
    <Card className="w-full max-w-md text-center shadow-lg bg-white">
      <CardHeader>
        <div className="mx-auto mb-4">
          {status === "loading" && <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />}
          {status === "success" && <CheckCircle className="w-12 h-12 text-green-500" />}
          {status === "error" && <XCircle className="w-12 h-12 text-red-500" />}
        </div>
        <CardTitle className="text-2xl">
            {status === "loading" ? "Verifying..." : status === "success" ? "Verified!" : "Verification Failed"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground text-lg">{message}</p>
        <Button 
            onClick={() => router.push("/login")} 
            className={`w-full h-12 text-lg ${status === "success" ? "bg-green-600 hover:bg-green-700" : ""}`}
        >
          {status === "success" ? "Continue to Login" : "Back to Login"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<div>Loading verification...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  )
}
