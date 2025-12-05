import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
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
          <h1 className="text-4xl font-bold text-foreground mb-4">About AfyaDiet</h1>
          <p className="text-lg text-muted-foreground">
            Empowering healthier lives through personalized nutrition guidance
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* Mission */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            At AfyaDiet, we believe that proper nutrition is the foundation of good health. Our mission is to make
            expert nutritionist guidance accessible and affordable to everyone by connecting people with certified
            nutrition professionals who can provide personalized diet and wellness plans.
          </p>
        </div>

        {/* Why We Started */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Why We Started</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Many people struggle with diet and wellness because they lack access to professional guidance. We founded
            AfyaDiet to bridge this gap by creating a simple marketplace where clients can find and book consultations
            with qualified nutritionists, and nutritionists can grow their practice and help more people achieve their
            health goals.
          </p>
        </div>

        {/* Values Grid */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expert Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All nutritionists on our platform are verified professionals with proper certifications and
                  credentials.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Affordable Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We work to keep nutrition services accessible by connecting clients directly with professionals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We empower nutritionists to scale their practice and reach clients who need their expertise.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary/10 rounded-lg p-12 text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Ready to Start Your Nutrition Journey?</h3>
          <div className="flex gap-4 justify-center">
            <Link href="/signup?role=client">
              <Button size="lg">Find a Nutritionist</Button>
            </Link>
            <Link href="/signup?role=nutritionist">
              <Button size="lg" variant="outline">
                Become a Provider
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
