"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-12 pb-12 text-center space-y-4">
        {icon && <div className="flex justify-center text-4xl">{icon}</div>}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {action && (
          <Button onClick={action.onClick} className="mt-4">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
