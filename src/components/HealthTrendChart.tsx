'use client';
import React from 'react';

interface DataPoint {
  date: string;
  score: number;
}

interface Props {
  data: DataPoint[];
}

export default function HealthTrendChart({ data }: Props) {
  if (!data || data.length < 2) return null;

  const width = 200;
  const height = 48;
  const padding = 4;

  const scores = data.map(d => d.score);
  const minScore = Math.max(0, Math.min(...scores) - 10);
  const maxScore = Math.min(100, Math.max(...scores) + 10);
  const range = maxScore - minScore || 1;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - (d.score - minScore) / range) * (height - padding * 2),
  }));

  // Build SVG path
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Gradient area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  // Determine trend direction
  const trend = scores[scores.length - 1] - scores[0];
  const strokeColor = trend >= 0 ? '#10b981' : '#f43f5e';
  const fillColor = trend >= 0 ? '#10b98120' : '#f43f5e20';

  return (
    <div className="mt-3">
      <p className="text-xs text-slate-500 mb-1 font-medium">Health Trend</p>
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* Gradient fill */}
          <path d={areaD} fill={fillColor} />
          {/* Line */}
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3" fill="white" stroke={strokeColor} strokeWidth="1.5" />
              <title>{`${data[i].date}: ${data[i].score}/100`}</title>
            </g>
          ))}
        </svg>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>{data[0].date}</span>
          <span>{data[data.length - 1].date}</span>
        </div>
      </div>
    </div>
  );
}
