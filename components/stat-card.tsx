import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  subtitle?: string
  variant?: "default" | "primary" | "success"
}

export function StatCard({ title, value, icon, subtitle, variant = "default" }: StatCardProps) {
  const variantClasses = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-green-600",
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${variantClasses[variant]}`}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
