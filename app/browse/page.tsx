"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NutritionistGrid } from "@/components/nutritionist-grid"
import { Filter } from "lucide-react"

const specialties = [
  "Weight Loss",
  "Sports Nutrition",
  "Diabetes Management",
  "Heart Health",
  "Keto Diet",
  "Plant-Based",
  "Food Allergies",
  "Athletic Performance",
]

export default function BrowsePage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [minRating, setMinRating] = useState(0)
  const [key, setKey] = useState(0)

  const handleFilterChange = () => {
    setKey((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <Link href="/" className="text-2xl font-bold text-primary">
          AfyaDiet
        </Link>
        <div className="flex gap-4">
       
         <Link href="/signup?role=client">
            <Button>Book a Session</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Find Your Perfect Nutritionist</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Browse verified nutritionists and find the perfect match for your health goals
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h2>

              <div className="space-y-6">
                {/* Specialty Filter */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Specialty</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {specialties.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() => {
                          setSelectedSpecialty(selectedSpecialty === specialty ? "" : specialty)
                          handleFilterChange()
                        }}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedSpecialty === specialty
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Minimum Rating</Label>
                  <div className="space-y-2">
                    {[0, 3, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => {
                          setMinRating(rating)
                          handleFilterChange()
                        }}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          minRating === rating
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }`}
                      >
                        {rating === 0 ? "All Ratings" : `${rating}+ Stars`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            <NutritionistGrid key={key} specialty={selectedSpecialty} minRating={minRating} />
          </div>
        </div>
      </section>
    </main>
  )
}
