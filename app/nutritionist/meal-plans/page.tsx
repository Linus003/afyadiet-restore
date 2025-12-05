"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NutritionistNav } from "@/components/nutritionist-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, FileText, User, Calendar } from "lucide-react"

export default function MealPlansPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // 💡 FIX: Using 'content' to match database field
  const [newPlan, setNewPlan] = useState({ title: "", clientId: "", content: "" })

  useEffect(() => {
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/nutritionist/meal-plans")
      if (response.status === 401) {
        router.push("/login")
        return
      }
      const data = await response.json()
      setPlans(data.plans || [])
      setClients(data.clients || [])
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/nutritionist/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan),
      })

      if (res.ok) {
        setIsCreateOpen(false)
        setNewPlan({ title: "", clientId: "", content: "" }) 
        fetchData()
      } else {
        alert("Failed to create plan. Please try again.")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-background"><NutritionistNav /><div className="p-8">Loading...</div></div>
  }

  return (
    <div className="min-h-screen bg-background">
      <NutritionistNav />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Meal Plans</h1>
                <p className="text-muted-foreground">Create and manage diet plans for your clients.</p>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" /> Create New Plan
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create Meal Plan</DialogTitle>
                        <DialogDescription>Assign a new diet plan to one of your clients.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Plan Title</Label>
                            <Input 
                                placeholder="e.g. Weight Loss Week 1" 
                                value={newPlan.title}
                                onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Select Client</Label>
                            <Select onValueChange={(val) => setNewPlan({...newPlan, clientId: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a client..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.length > 0 ? (
                                        clients.map(client => (
                                            <SelectItem key={client.id} value={client.id.toString()}>
                                                {client.full_name} ({client.email})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No clients found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Instructions / Meal Details</Label>
                            <Textarea 
                                className="min-h-[150px]" 
                                placeholder="Monday: Breakfast - Oats..." 
                                // 💡 FIX: Binding to 'content'
                                value={newPlan.content}
                                onChange={(e) => setNewPlan({...newPlan, content: e.target.value})}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={isSaving || !newPlan.clientId || !newPlan.title}>
                            {isSaving ? "Saving..." : "Create Plan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold truncate">{plan.title}</CardTitle>
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {plan.client?.full_name || "Unknown Client"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {/* 💡 FIX: Read from 'instructions' or 'content' depending on what API sends */}
                    {plan.instructions || plan.content || "No details provided."}
                  </p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground border-t pt-3 mt-auto">
                    <Calendar className="w-3 h-3 mr-1" />
                    Created: {new Date(plan.created_at).toLocaleDateString()}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg bg-slate-50">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
               <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium">No meal plans created yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
               Start by creating a plan for one of your clients using the button above.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}