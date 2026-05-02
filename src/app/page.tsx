'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import WorkspaceInput from '@/components/WorkspaceInput';
import AgentTimeline from '@/components/AgentTimeline';
import TeamPulseCard from '@/components/TeamPulseCard';
import TaskBoard from '@/components/TaskBoard';
import DependencyMap from '@/components/DependencyMap';
import SmartNudges from '@/components/SmartNudges';
import LeadershipBrief from '@/components/LeadershipBrief';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (inputs: { meeting: string; chat: string; email: string }) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze data');
      }
      
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <Header />
      <main className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
        <section>
          <WorkspaceInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          {error && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}
        </section>

        {(isLoading || data) && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <AgentTimeline events={data?.agent_timeline} isLoading={isLoading} />
            </div>
            
            <div className="lg:col-span-2 space-y-8">
              {data && (
                <>
                  <TeamPulseCard score={data.team_health_score} risk={data.risk_level} summary={data.pulse_summary} />
                  <TaskBoard tasks={data.implicit_tasks} />
                  <DependencyMap blockers={data.blockers} criticalPath={data.critical_path} />
                  <SmartNudges nudges={data.smart_nudges} />
                  <LeadershipBrief brief={data.leadership_brief} nextActions={data.next_actions} />
                </>
              )}
              {isLoading && !data && (
                <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <div className="text-center text-slate-400 flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    <p className="animate-pulse">AI Agents are analyzing communication context...</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
