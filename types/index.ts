export interface User {
  id: string
  email: string
  fullName: string
  role: "client" | "nutritionist"
  avatarUrl?: string
  createdAt: Date
}

export interface NutritionistProfile {
  id: string
  userId: string
  bio?: string
  specializations: string[]
  certifications?: string
  yearsExperience?: number
  hourlyRate: number
  rating: number
  totalReviews: number
  isVerified: boolean
}

export interface ClientProfile {
  id: string
  userId: string
  bio?: string
  goals: string[]
  dietaryPreferences: string[]
  healthConditions: string[]
  location?: string
}

export interface Appointment {
  id: string
  clientId: string
  nutritionistId: string
  scheduledAt: Date
  durationMinutes: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  price: number
}
