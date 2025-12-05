import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import Link from "next/link"

interface NutritionistCardProps {
  id: string
  name: string
  specializations: string[]
  rating: number
  reviews: number
  hourlyRate: number
  imageUrl: string
}

export function NutritionistCard({
  id,
  name,
  specializations,
  rating,
  reviews,
  hourlyRate,
  imageUrl,
}: NutritionistCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <img
            src={imageUrl || "/placeholder.svg?height=50&width=50&query=nutritionist"}
            alt={name}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-semibold">{rating}</span>
            <span className="text-sm text-muted-foreground">({reviews})</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {specializations.map((spec) => (
            <span key={spec} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
              {spec}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">${hourlyRate}/hr</span>
          <Link href={`/client/booking/${id}`}>
            <Button size="sm">Book Now</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
