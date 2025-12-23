import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Calendar, Users, MapPin, Search, Loader2, Check, ArrowRight, HeartPulse, Quote, HelpCircle, Lock } from "lucide-react";
import prisma from "@/lib/prisma";
import { SearchSection } from "@/components/search-section"; // We will separate the client component below to avoid server/client errors

export default async function Home() {
  // 1. Fetch Dynamic Settings (Hero Image, etc.)
  const settings = await prisma.globalSettings.findFirst();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      <MainNav />

      {/* --- HERO SECTION --- */}
      <main className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Personalized Nutrition Care <br />
              <span className="text-green-600">for Kenyans, by Kenyans.</span>
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              AfyaDiet Solutions connects you with licensed nutrition professionals for safe, evidence-based, and culturally relevant nutrition support—online or in-clinic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                <Link href="/browse">
                  Book a Nutritionist
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-200 text-slate-700 hover:bg-slate-50 h-14 px-8 text-lg rounded-full">
                <Link href="/signup?role=nutritionist">
                  Join as a Nutritionist
                </Link>
              </Button>
            </div>

            <div className="pt-6 flex flex-wrap gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Licensed Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Culturally Relevant</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC HERO IMAGE */}
          <div className="hidden lg:block relative h-[500px] rounded-[3rem] overflow-hidden shadow-sm border border-slate-100">
             {settings?.landingHeroImage ? (
                <img 
                  src={settings.landingHeroImage} 
                  alt="Healthy Lifestyle" 
                  className="w-full h-full object-cover"
                />
             ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-semibold text-lg bg-green-50/30">
                    <HeartPulse className="w-20 h-20 text-green-200 mb-4" />
                </div>
             )}
          </div>
        </div>
      </main>

      {/* --- SEARCH SECTION (Moved to Client Component to fix Hydration issues) --- */}
      <SearchSection />

      {/* --- CORE VALUES --- */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16 max-w-3xl mx-auto">
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Core Values</h2>
               <p className="text-slate-500">AfyaDiet Solutions connects you to licensed nutritionists for personalized, affordable care.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
                        <BadgeCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Professionalism</h3>
                    <p className="text-slate-500 leading-relaxed">We work exclusively with verified, licensed nutritionists to ensure safe care.</p>
                </div>

                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Cultural Relevance</h3>
                    <p className="text-slate-500 leading-relaxed">We design solutions that reflect real Kenyan foods, lifestyles, and communities.</p>
                </div>

                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Accessibility</h3>
                    <p className="text-slate-500 leading-relaxed">We make nutrition support available regardless of county, income level, or location.</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">What Our Clients Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <Quote className="w-10 h-10 text-green-200 mb-4" />
              <p className="text-lg text-slate-600 italic mb-6">“I finally found a nutritionist who understands ugali, githeri, and what I actually eat daily.”</p>
              <div className="font-semibold text-slate-900">- Happy Client</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <Quote className="w-10 h-10 text-green-200 mb-4" />
              <p className="text-lg text-slate-600 italic mb-6">“The online sessions fit my work schedule, and I can still follow up from my county.”</p>
              <div className="font-semibold text-slate-900">- Remote Patient</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border border-slate-200 rounded-xl p-6 hover:border-green-300 transition-colors">
              <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-green-600"/> Is AfyaDiet only for people in Nairobi?</h3>
              <p className="text-slate-600">No. AfyaDiet serves clients across all 47 counties. You can choose online sessions from anywhere in Kenya.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-6 hover:border-green-300 transition-colors">
              <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-green-600"/> Are your nutritionists licensed?</h3>
              <p className="text-slate-600">Yes, we verify all professionals and require valid registration and practice details before they can see clients.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-6 hover:border-green-300 transition-colors">
              <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-green-600"/> How do I pay?</h3>
              <p className="text-slate-600">We support digital payments in Kenya.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="bg-slate-900 py-24 text-center">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Nutrition care for Kenyans, by Kenyans</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
              Eat well. Live well. The Kenyan way.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white h-14 px-8 rounded-full text-lg">
                    <Link href="/browse">Book a Nutritionist</Link>
                </Button>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
             <div className="mb-4 md:mb-0 text-center md:text-left">
                <p>&copy; {new Date().getFullYear()} AfyaDiet Solutions. All rights reserved.</p>
             </div>
             <div className="flex gap-6 mb-4 md:mb-0">
               <Link href="/terms-condition" className="hover:text-green-600">Terms & Conditions</Link>
               <Link href="/privacy-policy" className="hover:text-green-600">Privacy Policy</Link>
               <a href="mailto:Info@afyadietsolutions.co.ke" className="hover:text-green-600">Contact Us</a>
             </div>
             <div>
                <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-slate-600">
                    <Lock className="w-3 h-3" /> Admin Portal
                </Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}