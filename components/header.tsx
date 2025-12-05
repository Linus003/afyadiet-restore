"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  isAuthenticated?: boolean
  userRole?: "client" | "nutritionist"
}

export function Header({ isAuthenticated = false, userRole }: HeaderProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <Link href="/" className="text-2xl font-bold text-primary">
        AfyaDiet
      </Link>

      <div className="flex gap-4">
        {!isAuthenticated ? (
          <>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </>
        ) : (
          <>
            <Link href={userRole === "client" ? "/client/dashboard" : "/nutritionist/dashboard"}>
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Button variant="outline">Logout</Button>
          </>
        )}
      </div>
    </nav>
  )
}
