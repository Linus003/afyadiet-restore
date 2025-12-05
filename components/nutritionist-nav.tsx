"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"

export function NutritionistNav() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <Link href="/nutritionist/dashboard" className="text-2xl font-bold text-primary">
        AfyaDiet
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/nutritionist/appointments">
          <Button variant="ghost">Appointments</Button>
        </Link>
        <Link href="/nutritionist/meal-plans">
          <Button variant="ghost">Meal Plans</Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Account
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/nutritionist/profile">My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/nutritionist/availability">Availability</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
