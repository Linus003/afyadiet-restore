import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  background?: "default" | "gradient"
}

export function PageHeader({ title, subtitle, action, background = "gradient" }: PageHeaderProps) {
  const bgClass = background === "gradient" ? "bg-gradient-to-r from-primary/10 to-accent/10" : "bg-muted"

  return (
    <section className={`${bgClass} px-6 py-16`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
            {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
    </section>
  )
}
