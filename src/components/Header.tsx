import React from 'react';
import { EyeOff } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-slate-900 text-white p-6 shadow-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto flex items-center space-x-3">
        <EyeOff className="text-emerald-400 w-8 h-8" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">The Invisible PM</h1>
          <p className="text-slate-400 text-sm mt-1">Turns messy team communication into clear execution.</p>
        </div>
      </div>
    </header>
  );
}
