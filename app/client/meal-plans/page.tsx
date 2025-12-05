"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ClientNav } from "@/components/client-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MealPlansPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [mealPlans, setMealPlans] = useState<any[]>([])

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const response = await fetch("/api/client/meal-plans")
        if (response.status === 401) {
          router.push("/login")
          return
        }

        const data = await response.json()
        setMealPlans(data.mealPlans || [])
      } catch (error) {
        console.error("[v0] Meal plans fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMealPlans()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ClientNav />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Meal Plans</h1>

        {mealPlans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mealPlans.map((plan) => (
              <Card key={plan.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{plan.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground flex-1 mb-4 line-clamp-3">
                    {plan.content || "No description provided"}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium">By {plan.nutritionist_name}</p>
                    <p>
                      {new Date(plan.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground text-lg">No meal plans available yet</p>
              <p className="text-sm text-muted-foreground">
                Your nutritionist will share meal plans here after your consultations.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
