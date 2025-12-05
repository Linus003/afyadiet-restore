"use client"

import { useEffect, useState } from "react"
import { NutritionistCard } from "./nutritionist-card"
import { Skeleton } from "@/components/ui/skeleton"

interface Nutritionist {
  id: string
  full_name: string
  specializations: string[]
  rating: number
  total_reviews: number
  hourly_rate: number
  avatar_url?: string
}

interface NutritionistGridProps {
  specialty?: string
  minRating?: number
}

export function NutritionistGrid({ specialty, minRating }: NutritionistGridProps) {
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNutritionists = async () => {
      try {
        const params = new URLSearchParams()
        if (specialty) params.append("specialty", specialty)
        if (minRating) params.append("minRating", minRating.toString())

        const response = await fetch(`/api/nutritionists?${params}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Failed to fetch nutritionists")
          return
        }

        setNutritionists(data.nutritionists)
      } catch (err) {
        setError("An error occurred while fetching nutritionists")
        console.error("[v0] Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchNutritionists()
  }, [specialty, minRating])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>{error}</p>
      </div>
    )
  }

  if (nutritionists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No nutritionists found. Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {nutritionists.map((nutritionist) => (
        <NutritionistCard
          key={nutritionist.id}
          id={nutritionist.id}
          name={nutritionist.full_name}
          specializations={nutritionist.specializations}
          rating={nutritionist.rating}
          reviews={nutritionist.total_reviews}
          hourlyRate={nutritionist.hourly_rate}
          imageUrl={nutritionist.avatar_url || ""}
        />
      ))}
    </div>
  )
}
