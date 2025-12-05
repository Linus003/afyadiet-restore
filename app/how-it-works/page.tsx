import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <Link href="/" className="text-2xl font-bold text-primary">
          AfyaDiet
        </Link>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup?role=client">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">How It Works</h1>
          <p className="text-lg text-muted-foreground">
            Simple steps to get started with personalized nutrition guidance
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        {/* For Clients */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-12">For Clients</h2>
          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Sign Up",
                description:
                  "Create your AfyaDiet account and tell us about your health goals and dietary preferences.",
              },
              {
                step: 2,
                title: "Browse Nutritionists",
                description:
                  "Explore verified nutritionists with specializations that match your needs. Check ratings and reviews.",
              },
              {
                step: 3,
                title: "Book a Session",
                description:
                  "Choose an available time slot and book your first consultation with your chosen nutritionist.",
              },
              {
                step: 4,
                title: "Get Your Plan",
                description:
                  "Receive personalized meal plans, dietary recommendations, and ongoing support from your nutritionist.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* For Nutritionists */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-12">For Nutritionists</h2>
          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Create Your Profile",
                description:
                  "Sign up as a nutritionist and build your profile with your credentials, specializations, and experience.",
              },
              {
                step: 2,
                title: "Get Verified",
                description: "We verify your credentials to ensure quality and build trust with our client community.",
              },
              {
                step: 3,
                title: "Set Your Availability",
                description:
                  "Add your available consultation slots and set your hourly rate to reflect your expertise.",
              },
              {
                step: 4,
                title: "Start Consulting",
                description: "Begin receiving bookings from clients and grow your practice with flexible scheduling.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent text-accent-foreground font-bold text-lg">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Verified Professional Nutritionists",
              "Flexible Scheduling",
              "Personalized Meal Plans",
              "Real-time Booking",
              "Secure Messaging",
              "Progress Tracking",
              "Ratings & Reviews",
              "Consultation History",
            ].map((feature) => (
              <div key={feature} className="flex gap-3 items-start">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-lg text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary/10 rounded-lg p-12 text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Ready to Get Started?</h3>
          <div className="flex gap-4 justify-center">
            <Link href="/signup?role=client">
              <Button size="lg">Sign Up as Client</Button>
            </Link>
            <Link href="/signup?role=nutritionist">
              <Button size="lg" variant="outline">
                Sign Up as Nutritionist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-muted-foreground">
        <p>&copy; 2025 AfyaDiet. All rights reserved.</p>
      </footer>
    </main>
  )
}
