"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "client" | "nutritionist"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.status === 401) {
          router.push("/login")
          return
        }

        const data = await response.json()
        if (requiredRole && data.user?.role !== requiredRole) {
          router.push("/")
          return
        }

        setAuthorized(true)
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requiredRole, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
