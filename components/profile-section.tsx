import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface ProfileSectionProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  action?: ReactNode
}

export function ProfileSection({ title, icon, children, action }: ProfileSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
