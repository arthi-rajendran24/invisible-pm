import React from 'react';
import { CheckCircle2, CircleDashed } from 'lucide-react';

interface AgentEvent {
  agent: string;
  status: string;
  output_summary: string;
}

export default function AgentTimeline({ events, isLoading }: { events: AgentEvent[], isLoading: boolean }) {
  if (!events || events.length === 0) {
    if (isLoading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse" aria-live="polite">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Agent Timeline</h2>
          <div className="space-y-4">
             <div className="flex items-center space-x-3 text-slate-400">
               <CircleDashed className="w-5 h-5 animate-spin text-emerald-500" />
               <span>Orchestrating agents...</span>
             </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" aria-live="polite">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Agent Timeline</h2>
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {events.map((event, index) => (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-emerald-100 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              {event.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <CircleDashed className="w-4 h-4 animate-spin" />}
            </div>
            <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-slate-800 text-sm">{event.agent}</h3>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{event.status}</span>
              </div>
              <p className="text-sm text-slate-600">{event.output_summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
