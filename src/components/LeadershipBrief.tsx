import React from 'react';
import { Presentation, ArrowRight } from 'lucide-react';

interface Props {
  brief: string;
  nextActions: string[];
}

export default function LeadershipBrief({ brief, nextActions }: Props) {
  if (!brief && (!nextActions || nextActions.length === 0)) return null;

  return (
    <div className="bg-slate-900 rounded-xl shadow-md border border-slate-800 overflow-hidden text-slate-200">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center space-x-2">
        <Presentation className="w-5 h-5 text-emerald-400" />
        <h2 className="font-semibold text-white">Leadership Brief & Next Actions</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Executive Summary</h3>
          <p className="text-sm leading-relaxed text-slate-300 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            {brief || "No executive summary available."}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Recommended Actions</h3>
          <ul className="space-y-3">
            {nextActions.map((action, i) => (
              <li key={i} className="flex items-start space-x-2">
                <ArrowRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-300">{action}</span>
              </li>
            ))}
            {(!nextActions || nextActions.length === 0) && (
              <li className="text-sm text-slate-500">No immediate actions identified.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
