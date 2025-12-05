import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BadgeCheck, Calendar, BarChart } from "lucide-react" // <--- Added Imports

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="text-2xl font-bold text-primary">AfyaDiet</div>
        <div className="flex gap-4">
          <Link href="/browse">
            <Button variant="ghost">Browse Nutritionists</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-6 max-w-2xl">
          Your Personal Nutrition Journey Starts Here
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-xl">
          Connect with certified nutritionists for personalized diet and wellness plans tailored to your goals.
        </p>
        <div className="flex gap-4">
          <Link href="/signup?role=client">
            <Button size="lg" className="text-lg">
              Find a Nutritionist
            </Button>
          </Link>
          <Link href="/signup?role=nutritionist">
            <Button size="lg" variant="outline" className="text-lg bg-transparent">
              Become a Provider
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-16 max-w-6xl mx-auto">
        
        {/* Feature 1 */}
        <div className="bg-card rounded-lg p-6 border border-border flex flex-col items-center text-center">
          <div className="mb-4 p-3 bg-primary/10 rounded-full">
            <BadgeCheck className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Certified Experts</h3>
          <p className="text-muted-foreground">
            Access only verified and certified nutritionists with proven expertise.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-card rounded-lg p-6 border border-border flex flex-col items-center text-center">
          <div className="mb-4 p-3 bg-primary/10 rounded-full">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Easy Scheduling</h3>
          <p className="text-muted-foreground">Book consultations instantly with flexible time slots.</p>
        </div>

        {/* Feature 3 */}
        <div className="bg-card rounded-lg p-6 border border-border flex flex-col items-center text-center">
          <div className="mb-4 p-3 bg-primary/10 rounded-full">
            <BarChart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Personalized Plans</h3>
          <p className="text-muted-foreground">Receive custom meal plans and progress tracking tailored to you.</p>
        </div>

      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Health?</h2>
        <p className="text-lg mb-8 opacity-90">
          Join thousands of people achieving their nutrition goals with expert guidance.
        </p>
        <Link href="/signup">
          <Button size="lg" variant="secondary">
            Start Your Journey Today
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-muted-foreground">
        <p>&copy; 2025 AfyaDiet.Built by Halitechnology All rights reserved.</p>
      </footer>
    </main>
  )
}