'use client';
import React from 'react';
import { CheckCircle2, CircleDashed, Clock } from 'lucide-react';
import { AgentEvent } from '@/types/analysis';

const AGENT_ORDER = [
  'Orchestrator Agent',
  'Scribe Agent',
  'Architect Agent',
  'Nudge Agent',
  'Vibe-Check Agent',
  'Synthesis Agent',
];

interface Props {
  events?: AgentEvent[];
  isLoading: boolean;
  streamingAgents?: AgentEvent[];
}

export default function AgentTimeline({ events, isLoading, streamingAgents }: Props) {
  // Determine which agents to show
  const completedAgentNames = new Set(
    (streamingAgents || []).map(a => a.agent)
  );

  // If we have final events, show those
  const finalEvents = events && events.length > 0 ? events : null;

  // If we're streaming, show the progressive timeline
  const isStreaming = isLoading && !finalEvents && (streamingAgents !== undefined);

  if (!finalEvents && !isStreaming && !isLoading) return null;

  // Loading state before any agents arrive
  if (isLoading && !finalEvents && (!streamingAgents || streamingAgents.length === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" aria-live="polite">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Agent Timeline</h2>
        <div className="space-y-4">
          {AGENT_ORDER.map((name, i) => (
            <div key={name} className="flex items-center space-x-3 text-slate-400" style={{ animationDelay: `${i * 100}ms` }}>
              <CircleDashed className="w-5 h-5 animate-spin text-slate-300" style={{ animationDuration: '3s' }} />
              <span className="text-sm">{name}</span>
              <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full ml-auto">waiting</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayEvents = finalEvents || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" aria-live="polite">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Agent Timeline</h2>
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {(isStreaming ? AGENT_ORDER : displayEvents.map(e => e.agent)).map((agentName, index) => {
          const isCompleted = isStreaming
            ? completedAgentNames.has(agentName)
            : true;
          const agentData = isStreaming
            ? (streamingAgents || []).find(a => a.agent === agentName)
            : displayEvents[index];
          const isActive = isStreaming && !isCompleted && 
            (completedAgentNames.size === index);

          return (
            <div
              key={agentName}
              className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group transition-all duration-500 ${
                isCompleted ? 'opacity-100' : isActive ? 'opacity-70' : 'opacity-40'
              }`}
              style={{
                transform: isCompleted ? 'translateX(0)' : 'translateX(0)',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all duration-500 ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-600'
                  : isActive
                    ? 'bg-amber-100 text-amber-500'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isActive ? (
                  <CircleDashed className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div className={`w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border shadow-sm transition-all duration-500 ${
                isCompleted
                  ? 'border-emerald-100 bg-emerald-50/50'
                  : isActive
                    ? 'border-amber-100 bg-amber-50/30 animate-pulse'
                    : 'border-slate-100 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-800 text-sm">{agentName}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                    isCompleted
                      ? 'text-emerald-600 bg-emerald-50'
                      : isActive
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-slate-400 bg-slate-100'
                  }`}>
                    {isCompleted ? 'completed' : isActive ? 'processing...' : 'waiting'}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {isCompleted && agentData
                    ? agentData.output_summary
                    : isActive
                      ? 'Analyzing communication signals...'
                      : 'Queued'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
