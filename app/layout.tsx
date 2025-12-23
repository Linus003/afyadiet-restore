import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import prisma from "@/lib/prisma"; // Import Prisma to fetch settings

// Configure fonts correctly
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// CHANGE: Async Metadata Generation (Fetches from Database)
export async function generateMetadata(): Promise<Metadata> {
  // 1. Fetch the Global Settings from your DB
  const settings = await prisma.globalSettings.findFirst();

  // 2. Define defaults in case nothing is saved yet
  const siteTitle = settings?.siteName || "AfyaDiet - Connect with Nutritionists";
  const favicon = settings?.faviconUrl || "/icon.svg"; // Fallback to default

  return {
    title: siteTitle,
    description: "Personalized nutrition and wellness plans from certified nutritionists",
    generator: "AfyaDiet Platform",
    icons: {
      icon: favicon, // Uses the uploaded image if available
      shortcut: favicon,
      apple: "/apple-icon.png", // You can make this dynamic too if needed
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}