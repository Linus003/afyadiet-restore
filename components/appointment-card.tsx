"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User } from "lucide-react"

interface AppointmentCardProps {
  id: string
  personName: string
  scheduledAt: string
  durationMinutes: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  price?: number
  notes?: string
  onAction?: (action: string) => void
  actionLabel?: string
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
}

export function AppointmentCard({
  id,
  personName,
  scheduledAt,
  durationMinutes,
  status,
  price,
  notes,
  onAction,
  actionLabel = "View Details",
}: AppointmentCardProps) {
  const date = new Date(scheduledAt)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">{personName}</h3>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  ({durationMinutes} min)
                </span>
              </div>

              {notes && <p className="text-xs mt-2 line-clamp-2">Notes: {notes}</p>}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <Badge className={statusColors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>

            {price && <span className="text-lg font-bold text-primary">${price.toFixed(2)}</span>}

            {onAction && (
              <Button variant="outline" size="sm" onClick={() => onAction(id)} className="mt-auto">
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
