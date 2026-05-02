import Link from 'next/link';
import { ArrowRight, Zap, RefreshCw, BarChart } from 'lucide-react';
import Header from '@/components/Header';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 relative overflow-hidden">
        {/* Subtle decorative colored dots (Google colors) */}
        <div className="absolute top-32 left-[20%] w-3 h-3 rounded-full bg-[#4285F4] opacity-40 blur-[1px]" aria-hidden="true"></div>
        <div className="absolute top-48 right-[25%] w-4 h-4 rounded-full bg-[#EA4335] opacity-40 blur-[1px]" aria-hidden="true"></div>
        <div className="absolute bottom-48 left-[30%] w-2 h-2 rounded-full bg-[#FBBC05] opacity-40 blur-[1px]" aria-hidden="true"></div>
        <div className="absolute bottom-32 right-[20%] w-5 h-5 rounded-full bg-[#34A853] opacity-40 blur-[1px]" aria-hidden="true"></div>

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-full mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" aria-hidden="true"></span>
          <span className="text-sm font-medium text-slate-600">Powered by Gemini Multi-Agent AI</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Turns messy team communication into{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05]">
            clear execution.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed">
          The Invisible PM observes your meetings, chats, and emails to automatically surface tasks, 
          map dependencies, and send smart nudges—no manual updates required.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center justify-center space-x-2 bg-[#4285F4] hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            <span>Try the Dashboard</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
          <a 
            href="https://github.com/arthi-rajendran24/invisible-pm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold transition-all"
          >
            <span>View Source</span>
          </a>
        </div>

        {/* Feature Highlights */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto text-left" aria-label="Key features">
          <div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-[#4285F4]" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold mb-2">Zero Friction</h3>
            <p className="text-slate-500 leading-relaxed">No manual entry. Paste your natural team communication and let the agents extract implicit signals.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-[#EA4335]" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Nudges</h3>
            <p className="text-slate-500 leading-relaxed">Automatically generate personalized follow-ups for the exact people holding up the critical path.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center mb-4">
              <BarChart className="w-6 h-6 text-[#FBBC05]" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold mb-2">Executive Pulse</h3>
            <p className="text-slate-500 leading-relaxed">Instantly gauge team health, workload risk, and communication gaps through an automated leadership brief.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
