import React from 'react';
import { Network, AlertCircle } from 'lucide-react';

interface Blocker {
  blocker: string;
  blocked_work: string;
  owner: string;
  severity: string;
}

export default function DependencyMap({ blockers, criticalPath }: { blockers: Blocker[], criticalPath: string[] }) {
  if (!blockers?.length && !criticalPath?.length) return null;

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
            {blockers.map((b, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-rose-50 border border-rose-100">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-rose-900 text-sm">{b.blocker}</p>
                  <p className="text-rose-700 text-xs mt-1">Blocks: {b.blocked_work} • Owner: {b.owner}</p>
                </div>
              </div>
            ))}
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
        </div>
      </div>
    </div>
  );
}
