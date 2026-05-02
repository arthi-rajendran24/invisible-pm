import React, { memo } from 'react';
import { HeartPulse, AlertTriangle } from 'lucide-react';
import HealthTrendChart from './HealthTrendChart';

interface Props {
  score: number;
  risk: string;
  summary: string;
  healthHistory?: { date: string; score: number }[];
}

/** Displays team health score, risk level, and optional trend chart */
const TeamPulseCard = memo(function TeamPulseCard({ score, risk, summary, healthHistory }: Props) {
  if (score === undefined && !summary) return null;

  const riskColor = 
    risk === 'critical' ? 'text-rose-600 bg-rose-100 border-rose-200' :
    risk === 'high' ? 'text-orange-600 bg-orange-100 border-orange-200' :
    risk === 'medium' ? 'text-amber-600 bg-amber-100 border-amber-200' :
    'text-emerald-600 bg-emerald-100 border-emerald-200';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90" role="img" aria-label={`Team health score: ${score} out of 100`}>
            <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
            <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={36 * 2 * Math.PI} strokeDashoffset={36 * 2 * Math.PI - (score / 100) * 36 * 2 * Math.PI} className="text-indigo-500" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">{score}</span>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-indigo-500" />
            <span>Team Health</span>
          </h2>
          <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${riskColor}`}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            Risk: {risk.toUpperCase()}
          </div>
          {/* Health Trend Chart */}
          {healthHistory && healthHistory.length >= 2 && (
            <HealthTrendChart data={healthHistory} />
          )}
        </div>
      </div>
      <div className="flex-1 md:pl-6 md:border-l md:border-slate-200">
        <p className="text-slate-600 text-sm leading-relaxed">{summary}</p>
      </div>
    </div>
  );
});

export default TeamPulseCard;
