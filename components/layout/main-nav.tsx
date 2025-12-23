"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react"; 
import { useState, useEffect } from "react";

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Default links (used while loading or if DB is empty)
  const [navLinks, setNavLinks] = useState([
    { label: "How it works", href: "/how-it-works" },
    { label: "Browse Experts", href: "/browse" },
    { label: "For Dietitians", href: "/signup?role=nutritionist" }
  ]);

  // Fetch Dynamic Menu from Admin Settings
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.mainMenu && Array.isArray(data.mainMenu) && data.mainMenu.length > 0) {
          setNavLinks(data.mainMenu);
        }
      })
      .catch((err) => console.error("Menu fetch error:", err));
  }, []);

  return (
    // Dark background with blur (glass effect)
    <nav className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LEFT: Logo & Links */}
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              Afya<span className="text-blue-500">Diet</span>
            </span>
          </Link>

          {/* Desktop Nav Links - DYNAMIC */}
          <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-300">
            {navLinks.map((link, idx) => (
              <Link 
                key={idx} 
                href={link.href} 
                className="hover:text-white hover:text-blue-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT: Auth Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/account/settings" 
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            My Account
          </Link>
          
          <Link 
            href="/login" 
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Log in
          </Link>

          {/* Primary Action */}
          <Button 
            asChild 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 h-11 font-semibold text-sm shadow-sm transition-all border border-transparent"
          >
            <Link href="/browse">
              Find a dietitian
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-slate-300 hover:text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Dropdown - Dark Theme */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 absolute w-full shadow-xl flex flex-col gap-4 z-50">
          
          {/* Mobile Links - DYNAMIC */}
          {navLinks.map((link, idx) => (
            <Link 
              key={idx}
              href={link.href} 
              className="text-slate-300 font-medium py-2 hover:text-white hover:pl-2 transition-all" 
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="h-px bg-slate-800 my-1"></div>
          
          <Link href="/account/settings" className="text-slate-300 font-medium py-2 hover:text-white" onClick={() => setIsOpen(false)}>
            My Account Settings
          </Link>
          
          <Link href="/login" className="text-slate-300 font-medium py-2 hover:text-white" onClick={() => setIsOpen(false)}>
            Log in
          </Link>
          
          <Link 
            href="/browse" 
            className="bg-blue-600 text-white text-center py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Find a dietitian
          </Link>
        </div>
      )}
    </nav>
  );
}