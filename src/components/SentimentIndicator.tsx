'use client';
import React from 'react';

interface SentimentData {
  score: number;
  magnitude: number;
  label: 'positive' | 'neutral' | 'negative';
  channel: string;
}

interface Props {
  sentiment: SentimentData | null;
  isLoading?: boolean;
}

export default function SentimentIndicator({ sentiment, isLoading }: Props) {
  if (isLoading) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1"></span>
        Analyzing...
      </span>
    );
  }

  if (!sentiment) return null;

  const config = {
    positive: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200',
      emoji: '😊',
    },
    neutral: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      border: 'border-amber-200',
      emoji: '😐',
    },
    negative: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
      border: 'border-rose-200',
      emoji: '😟',
    },
  };

  const c = config[sentiment.label];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border} transition-all duration-300`}
      title={`Sentiment: ${sentiment.label} (score: ${sentiment.score}, magnitude: ${sentiment.magnitude})`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mr-1`}></span>
      {c.emoji} {sentiment.label}
    </span>
  );
}
