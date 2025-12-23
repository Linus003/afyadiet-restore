"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { NutritionistNav } from "@/components/nutritionist-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge" 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, AlertCircle, CheckCircle, Upload, MapPin } from "lucide-react" // Added MapPin
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const SPECIALIZATION_OPTIONS = [
  "Clinical Nutrition", "Sports Nutrition", "Pediatric Nutrition", "Weight Management",
  "Diabetes Management", "Gut Health", "Vegan/Vegetarian", "General Wellness",
  "Maternal Health", "Eating Disorders", "Renal Nutrition", "Ketogenic Diet"
]

const KENYA_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Meru", "Kiambu",
  "Machakos", "Kajiado", "Nyeri", "Kilifi", "Garissa", "Embu", "Kakamega",
  "Bungoma", "Kitui", "Makueni", "Murang'a", "Kirinyaga", "Kisii", "Nyamira",
  "Kericho", "Bomet", "Nandi", "Trans Nzoia", "Turkana", "Marsabit", "Isiolo",
  "Mandera", "Wajir", "Tana River", "Lamu", "Taita Taveta", "Kwale", "Nyandarua",
  "Laikipia", "Narok", "Samburu", "West Pokot", "Elgeyo Marakwet", "Baringo",
  "Vihiga", "Busia", "Siaya", "Homa Bay", "Migori", "Tharaka-Nithi"
];

export default function NutritionistProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Profile Data
  const [isVerified, setIsVerified] = useState(false) // Dynamic Badge State
  const [userName, setUserName] = useState("")
  const [formData, setFormData] = useState({
    bio: "",
    specializations: [] as string[], 
    certifications: "",
    yearsExperience: 0,
    hourlyRate: 0,
    avatarUrl: "",
    county: "", // <--- NEW FIELD
  })

  // 1. Fetch Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/nutritionist/profile")
        if (response.status === 401) {
          router.push("/login")
          return
        }

        const data = await response.json()
        
        if (!response.ok) {
            throw new Error(data.error || "Failed to load profile")
        }

        if (data.profile) {
          setIsVerified(data.profile.is_verified)
          setUserName(data.profile.full_name)
          
          // Handle specializations parsing
          let specs: string[] = []
          const incomingData = data.profile.specializations || data.profile.specialty;
          if (Array.isArray(incomingData)) {
             specs = incomingData
          } else if (typeof incomingData === 'string') {
             specs = incomingData.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "")
          }

          setFormData({
            bio: data.profile.bio || "",
            specializations: specs,
            certifications: data.profile.certifications || "",
            yearsExperience: data.profile.years_experience || 0,
            hourlyRate: data.profile.hourly_rate || 0,
            avatarUrl: data.profile.avatar_url || "",
            county: data.profile.county || "", // <--- Load Saved County
          })
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router])

  // 2. Handle Image Upload (Convert to Base64)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("Image file is too large. Please choose an image under 4MB.")
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }))
        setError(null) // Clear errors if image is good
      }
      reader.readAsDataURL(file)
    }
  }

  // 3. Handle Checkboxes
  const toggleSpecialization = (option: string) => {
    setFormData((prev) => {
      const current = prev.specializations
      if (current.includes(option)) {
        return { ...prev, specializations: current.filter((item) => item !== option) }
      } else {
        return { ...prev, specializations: [...current, option] }
      }
    })
  }

  // 4. Save Data
  const handleSave = async () => {
    if (!formData.county) {
      setError("Please select your practicing county.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch("/api/nutritionist/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong saving the profile.")
      }

      setSuccess("Profile saved successfully! Your changes are now live.")
      
      // Scroll to top to see message
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (err: any) {
      setError(err.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8"><Skeleton className="h-96 w-full max-w-2xl mx-auto" /></div>

  return (
    <div className="min-h-screen bg-background">
      <NutritionistNav />

      <main className="max-w-3xl mx-auto px-6 py-12">
        
        {/* HEADER & BADGE */}
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Professional Profile</h1>
            
            {/* DYNAMIC BADGE LOGIC */}
            {isVerified ? (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white gap-1 px-3 py-1">
                    <CheckCircle className="w-4 h-4" /> Verified Nutritionist
                </Badge>
            ) : (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600 gap-1 px-3 py-1 bg-yellow-50">
                    <AlertCircle className="w-4 h-4" /> Verification Pending
                </Badge>
            )}
        </div>

        {/* ERROR / SUCCESS BANNERS */}
        {error && (
            <Alert variant="destructive" className="mb-6 bg-red-50 text-red-900 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {success && (
            <Alert className="mb-6 bg-green-50 text-green-900 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
            </Alert>
        )}

        <div className="grid gap-6">
            {/* 1. PROFILE PICTURE CARD */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Click the image to upload a new photo.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                            <AvatarImage src={formData.avatarUrl} className="object-cover" />
                            <AvatarFallback className="text-4xl bg-slate-200">
                                {userName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" /> Upload Photo
                    </Button>
                </CardContent>
            </Card>

            {/* 2. DETAILS CARD */}
            <Card>
            <CardHeader>
                <CardTitle>Details & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* 📍 NEW: COUNTY SELECTOR */}
                <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                  <Label htmlFor="county" className="flex items-center gap-2 mb-2 font-bold text-green-900">
                    <MapPin className="w-4 h-4 text-green-600"/> Practicing County
                  </Label>
                  <select
                    id="county"
                    required
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    className="w-full p-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">-- Select Your Location --</option>
                    {KENYA_COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Clients will find you based on this location.</p>
                </div>

                {/* BIO */}
                <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                    id="bio"
                    placeholder="Tell clients about your expertise..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="min-h-32"
                />
                </div>

                {/* SPECIALIZATIONS GRID */}
                <div className="space-y-2">
                <Label>Specializations</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-input p-4 rounded-md bg-secondary/10">
                    {SPECIALIZATION_OPTIONS.map((option) => (
                    <label 
                        key={option} 
                        className={`
                        flex items-center space-x-3 cursor-pointer p-2 rounded transition-colors
                        ${formData.specializations.includes(option) ? "bg-primary/10 border-primary" : "hover:bg-accent"}
                        `}
                    >
                        <input
                        type="checkbox"
                        className="rounded border-gray-400 text-primary focus:ring-primary h-4 w-4"
                        checked={formData.specializations.includes(option)}
                        onChange={() => toggleSpecialization(option)}
                        />
                        <span className="text-sm font-medium leading-none">{option}</span>
                    </label>
                    ))}
                </div>
                </div>

                {/* CERTIFICATIONS */}
                <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                    id="certifications"
                    placeholder="List your degrees and certifications..."
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                />
                </div>

                {/* NUMBERS */}
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="experience">Years Experience</Label>
                    <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: Number.parseInt(e.target.value) || 0 })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate (ksh)</Label>
                    <Input
                    id="rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number.parseFloat(e.target.value) || 0 })}
                    />
                </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full text-lg py-6">
                {saving ? "Saving Changes..." : "Save Profile"}
                </Button>
            </CardContent>
            </Card>
        </div>
      </main>
    </div>
  )
}