"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ClientNav } from "@/components/client-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClientProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    bio: "",
    goals: [] as string[],
    dietaryPreferences: [] as string[],
    healthConditions: [] as string[],
    location: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/client/profile")
        if (response.status === 401) {
          router.push("/login")
          return
        }

        const data = await response.json()
        if (data.profile) {
          setProfile(data.profile)
          setFormData({
            bio: data.profile.bio || "",
            goals: data.profile.goals || [],
            dietaryPreferences: data.profile.dietary_preferences || [],
            healthConditions: data.profile.health_conditions || [],
            location: data.profile.location || "",
          })
        }
      } catch (error) {
        console.error("[v0] Profile fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error("[v0] Profile save error:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ClientNav />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Health & Wellness Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Health Goals (comma-separated)</Label>
              <Input
                id="goals"
                placeholder="e.g., weight loss, muscle gain, better energy"
                value={formData.goals.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    goals: e.target.value.split(",").map((g) => g.trim()),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary">Dietary Preferences (comma-separated)</Label>
              <Input
                id="dietary"
                placeholder="e.g., vegetarian, gluten-free, keto"
                value={formData.dietaryPreferences.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dietaryPreferences: e.target.value.split(",").map((d) => d.trim()),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Health Conditions (comma-separated)</Label>
              <Input
                id="conditions"
                placeholder="e.g., diabetes, hypertension"
                value={formData.healthConditions.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    healthConditions: e.target.value.split(",").map((c) => c.trim()),
                  })
                }
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
