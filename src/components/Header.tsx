'use client';
import React from 'react';
import Link from 'next/link';
import { EyeOff } from 'lucide-react';
import AuthButton from './AuthButton';

export default function Header() {
  return (
    <header className="bg-white text-slate-900 px-6 py-4 border-b border-slate-100 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100 transition-colors">
            {/* Google colored gradient icon */}
            <EyeOff className="w-6 h-6 text-[#4285F4]" aria-hidden="true" />
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EA4335]"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 group-hover:text-black transition-colors">
              The Invisible PM
            </h1>
          </div>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link 
            href="/dashboard"
            className="text-sm font-medium text-slate-500 hover:text-[#4285F4] transition-colors"
          >
            Dashboard
          </Link>
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
