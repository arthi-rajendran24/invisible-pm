'use client';
import React, { useState } from 'react';
import { Presentation, ArrowRight, FileText, CheckCircle } from 'lucide-react';

interface Props {
  brief: string;
  nextActions: string[];
  teamHealthScore?: number;
  riskLevel?: string;
  pulseSummary?: string;
}

export default function LeadershipBrief({ brief, nextActions, teamHealthScore, riskLevel, pulseSummary }: Props) {
  const [exportLoading, setExportLoading] = useState(false);
  const [exportResult, setExportResult] = useState<{ url: string; demo: boolean } | null>(null);

  if (!brief && (!nextActions || nextActions.length === 0)) return null;

  const handleExportToDocs = async () => {
    setExportLoading(true);
    setExportResult(null);
    try {
      const res = await fetch('/api/export/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Invisible PM Leadership Brief — ${new Date().toLocaleDateString()}`,
          brief,
          nextActions,
          teamHealthScore,
          riskLevel,
          pulseSummary,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExportResult({ url: data.docUrl, demo: data.demo });
        if (!data.demo && data.docUrl !== '#demo-export') {
          window.open(data.docUrl, '_blank');
        }
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-md border border-slate-800 overflow-hidden text-slate-200">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Presentation className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold text-white">Leadership Brief & Next Actions</h2>
        </div>
        <div className="flex items-center space-x-2">
          {exportResult && (
            <span className="text-xs text-emerald-400 flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>{exportResult.demo ? 'Demo export ready' : 'Exported!'}</span>
            </span>
          )}
          <button
            onClick={handleExportToDocs}
            disabled={exportLoading}
            className="flex items-center space-x-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{exportLoading ? 'Exporting...' : 'Export to Docs'}</span>
          </button>
        </div>
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
