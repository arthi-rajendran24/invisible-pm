'use client';
import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';

interface HistoryEntry {
  id: string;
  timestamp: string;
  teamHealthScore: number;
  riskLevel: string;
  taskCount: number;
}

interface Props {
  entries: HistoryEntry[];
  onSelect: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function AnalysisHistory({ entries, onSelect, isOpen, onToggle }: Props) {
  if (entries.length === 0) return null;

  const riskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-rose-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-amber-600';
      default: return 'text-emerald-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-sm text-slate-800">Analysis History</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{entries.length}</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onSelect(entry.id)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group"
            >
              <div>
                <p className="text-xs text-slate-500">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm font-semibold text-slate-800">{entry.teamHealthScore}/100</span>
                  <span className={`text-xs font-medium capitalize ${riskColor(entry.riskLevel)}`}>
                    {entry.riskLevel} risk
                  </span>
                  <span className="text-xs text-slate-400">{entry.taskCount} tasks</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
