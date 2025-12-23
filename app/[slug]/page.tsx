import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { MainNav } from "@/components/layout/main-nav";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";

// 1. Generate Metadata for SEO
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params; 
  const page = await prisma.dynamicPage.findUnique({
    where: { slug: params.slug },
  });
  if (!page) return { title: "Page Not Found" };
  return {
    title: `${page.title} | AfyaDiet Solutions`,
    description: page.description || `Read about ${page.title} at AfyaDiet.`,
  };
}

// 2. Fetch Page Data
async function getPage(slug: string) {
  return await prisma.dynamicPage.findUnique({
    where: { slug, isPublished: true },
    include: {
      sections: { orderBy: { order: "asc" } },
    },
  });
}

// 3. The Page Component
export default async function DynamicPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const page = await getPage(params.slug);

  if (!page) return notFound();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <MainNav />
      
      <main className="py-0">
        {page.sections.map((section) => {
          const content = section.content as any; 

          // --- BLOCK: HERO ---
          if (section.type === "HERO") {
            return (
              <section key={section.id} className="relative bg-slate-50 py-20 md:py-32 overflow-hidden border-b border-slate-100">
                <div className="container mx-auto px-6 text-center relative z-10">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 leading-tight">
                    {content.heading}
                  </h1>
                  <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                    {content.subheading}
                  </p>
                  {content.ctaLink && (
                    <Button asChild size="lg" className="rounded-full bg-green-600 hover:bg-green-700 text-white px-8 h-12 text-lg shadow-lg">
                      <Link href={content.ctaLink}>{content.ctaText || "Get Started"}</Link>
                    </Button>
                  )}
                </div>
              </section>
            );
          }

          // --- BLOCK: RICH TEXT ---
          if (section.type === "TEXT") {
            return (
              <section key={section.id} className="container mx-auto px-6 py-12 max-w-4xl">
                {/* Render HTML safely */}
                <div 
                  className="prose prose-lg max-w-none text-slate-600 prose-headings:text-slate-900 prose-a:text-green-600 prose-strong:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: content.html || "" }} 
                />
              </section>
            );
          }

          // --- BLOCK: FULL IMAGE ---
          if (section.type === "IMAGE_FULL") {
            return (
              <section key={section.id} className="container mx-auto px-6 py-8 max-w-5xl">
                {content.imageUrl && (
                  <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <img 
                      src={content.imageUrl} 
                      alt="Page Content" 
                      className="w-full h-auto object-cover" 
                    />
                  </div>
                )}
              </section>
            );
          }

          // --- BLOCK: CUSTOM BUTTON ---
          if (section.type === "BUTTON") {
            // Determine styling based on admin selection
            const buttonVariant = 
              content.style === "primary" ? "default" : 
              content.style === "outline" ? "outline" : "ghost";
            
            const buttonClass = 
              content.style === "primary" ? "bg-green-600 hover:bg-green-700 text-white" : "";

            return (
              <section key={section.id} className="container mx-auto px-6 py-8 text-center">
                 <Button asChild size="lg" variant={buttonVariant} className={`${buttonClass} px-8`}>
                    <Link href={content.link || "#"}>
                       {content.text || "Click Here"} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                 </Button>
              </section>
            );
          }

          return null;
        })}
      </main>

      <footer className="border-t border-slate-100 bg-white py-12 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} AfyaDiet Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}