import type { ReactNode } from "react"

interface MainLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "7xl"
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
}

export function MainLayout({ children, sidebar, maxWidth = "7xl" }: MainLayoutProps) {
  return (
    <main className={`${maxWidthClasses[maxWidth]} mx-auto px-6 py-12`}>
      {sidebar ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">{sidebar}</div>
          <div className="lg:col-span-3">{children}</div>
        </div>
      ) : (
        <>{children}</>
      )}
    </main>
  )
}
