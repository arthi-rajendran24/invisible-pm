'use client';
import React from 'react';
import { Network, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { Blocker, Dependency } from '@/types/analysis';

interface Props {
  blockers: Blocker[];
  criticalPath: string[];
  dependencies?: Dependency[];
  blockerHistory?: { [blockerKey: string]: string }; // blocker key -> first seen ISO date
}

export default function DependencyMap({ blockers, criticalPath, dependencies, blockerHistory }: Props) {
  if (!blockers?.length && !criticalPath?.length && !dependencies?.length) return null;

  const getBlockerAge = (blocker: string): { days: number; label: string } | null => {
    if (!blockerHistory) return null;
    const firstSeen = blockerHistory[blocker];
    if (!firstSeen) return null;
    const days = Math.floor((Date.now() - new Date(firstSeen).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return { days: 0, label: 'Today' };
    if (days === 1) return { days: 1, label: '1 day' };
    return { days, label: `${days} days` };
  };

  const getEscalationStyle = (severity: string, days: number | null) => {
    if (days === null) return '';
    if (days >= 3 && (severity === 'critical' || severity === 'high')) {
      return 'ring-2 ring-rose-500 ring-offset-1 animate-pulse';
    }
    if (days >= 2) return 'ring-1 ring-amber-400';
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center space-x-2">
        <Network className="w-5 h-5 text-indigo-600" />
        <h2 className="font-semibold text-slate-800">Dependencies & Blockers</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Critical Blockers</h3>
          <div className="space-y-4">
            {blockers.map((b, i) => {
              const age = getBlockerAge(b.blocker);
              const escalation = getEscalationStyle(b.severity, age?.days ?? null);
              return (
                <div key={i} className={`flex items-start space-x-3 p-3 rounded-lg bg-rose-50 border border-rose-100 transition-all ${escalation}`}>
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-rose-900 text-sm">{b.blocker}</p>
                      {age && (
                        <span className={`flex items-center space-x-1 text-xs px-2 py-0.5 rounded-full ${
                          age.days >= 3 ? 'bg-rose-200 text-rose-800 font-semibold' :
                          age.days >= 1 ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{age.label}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-rose-700 text-xs mt-1">Blocks: {b.blocked_work} • Owner: {b.owner}</p>
                    {b.recommended_fix && (
                      <div className="mt-2 bg-white/50 p-2 rounded text-xs border border-rose-100/50">
                        <span className="font-semibold text-rose-800">Recommended Fix: </span>
                        <span className="text-rose-700">{b.recommended_fix}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {blockers.length === 0 && <p className="text-sm text-slate-500">No active blockers.</p>}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Critical Path</h3>
          <div className="relative border-l-2 border-indigo-100 pl-4 space-y-6">
            {criticalPath.map((step, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white shadow-sm"></div>
                <p className="font-medium text-slate-800 text-sm">{step}</p>
              </div>
            ))}
            {criticalPath.length === 0 && <p className="text-sm text-slate-500">Critical path not identified.</p>}
          </div>

          {dependencies && dependencies.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Dependencies</h3>
              <div className="space-y-3">
                {dependencies.map((dep, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-medium text-slate-700">{dep.from}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{dep.to}</span>
                    {dep.risk && (
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        dep.risk === 'high' || dep.risk === 'critical' ? 'bg-rose-100 text-rose-700' :
                        dep.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {dep.risk} risk
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
