"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react"; 
import { useState } from "react";

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LEFT: Logo & Links */}
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Afya<span className="text-blue-600">Diet</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-600">
            <Link href="/how-it-works" className="hover:text-blue-600 transition-colors">
              How it works
            </Link>
            <Link href="/browse" className="hover:text-blue-600 transition-colors">
              Browse Experts
            </Link>
            {/* Direct link to nutritionist specific signup */}
            <Link href="/nutritionist/signup" className="hover:text-blue-600 transition-colors">
              For Dietitians
            </Link>
          </div>
        </div>

        {/* RIGHT: Auth Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/login" 
            className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
          >
            Log in
          </Link>

          {/* Primary Action -> Goes to full browse list */}
          <Button 
            asChild 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 h-11 font-semibold text-sm shadow-sm transition-all"
          >
            <Link href="/browse">
              Find a dietitian
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-slate-600" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 absolute w-full shadow-xl flex flex-col gap-4 z-50">
          <Link href="/how-it-works" className="text-slate-600 font-medium py-2" onClick={() => setIsOpen(false)}>
            How it works
          </Link>
          <Link href="/browse" className="text-slate-600 font-medium py-2" onClick={() => setIsOpen(false)}>
            Browse Experts
          </Link>
          <Link href="/nutritionist/signup" className="text-slate-600 font-medium py-2" onClick={() => setIsOpen(false)}>
            For Dietitians
          </Link>
          <div className="h-px bg-gray-100 my-1"></div>
          <Link href="/login" className="text-slate-600 font-medium py-2" onClick={() => setIsOpen(false)}>
            Log in
          </Link>
          <Link 
            href="/browse" 
            className="bg-blue-600 text-white text-center py-3 rounded-md font-semibold"
            onClick={() => setIsOpen(false)}
          >
            Find a dietitian
          </Link>
        </div>
      )}
    </nav>
  );
}