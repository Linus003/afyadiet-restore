"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2, BadgeCheck, ArrowRight } from "lucide-react";

const KENYA_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Meru", "Kiambu",
  "Machakos", "Kajiado", "Nyeri", "Kilifi", "Garissa", "Embu", "Kakamega",
  "Bungoma", "Kitui", "Makueni", "Murang'a", "Kirinyaga", "Kisii", "Nyamira",
  "Kericho", "Bomet", "Nandi", "Trans Nzoia", "Turkana", "Marsabit", "Isiolo",
  "Mandera", "Wajir", "Tana River", "Lamu", "Taita Taveta", "Kwale", "Nyandarua",
  "Laikipia", "Narok", "Samburu", "West Pokot", "Elgeyo Marakwet", "Baringo",
  "Vihiga", "Busia", "Siaya", "Homa Bay", "Migori", "Tharaka-Nithi"
];

export function SearchSection() {
  const [selectedCounty, setSelectedCounty] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!selectedCounty) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/public/nutritionists?county=${selectedCounty}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Error fetching nutritionists. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="find-experts" className="bg-slate-50 py-20 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Find Experts Near You</h2>
              <p className="text-slate-500">Search for verified nutritionists in your county.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-12">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select 
                  className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none appearance-none text-slate-700 text-lg"
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                >
                  <option value="">Select your County...</option>
                  {KENYA_COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Button 
                onClick={handleSearch} 
                className="h-14 px-8 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-semibold"
                disabled={loading || !selectedCounty}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Searching...</>
                ) : (
                  <><Search className="mr-2 h-5 w-5" /> Search</>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hasSearched && results.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No nutritionists found in {selectedCounty} yet. 
                  <Link href="/signup?role=nutritionist" className="text-green-600 font-semibold hover:underline ml-1">
                    Be the first to join!
                  </Link>
                </div>
              )}

              {results.map((nutri) => (
                <div key={nutri.id} className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-xl overflow-hidden shrink-0">
                      {nutri.user.avatar_url ? (
                        <img src={nutri.user.avatar_url} alt={nutri.user.name} className="h-full w-full object-cover" />
                      ) : (
                        nutri.user.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{nutri.user.name}</h3>
                      <p className="text-xs text-green-600 font-semibold uppercase tracking-wide bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                        {nutri.specialty}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{nutri.county}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-green-500" />
                      <span>Verified Expert</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="font-bold text-slate-900">KES {nutri.hourly_rate}<span className="text-slate-400 text-xs font-normal">/hr</span></span>
                    <Link href={`/login`}> 
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0 h-auto font-medium">
                        View Profile <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}
