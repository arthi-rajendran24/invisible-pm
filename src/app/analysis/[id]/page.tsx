'use client';
import React from 'react';
import Header from '@/components/Header';
import TeamPulseCard from '@/components/TeamPulseCard';
import TaskBoard from '@/components/TaskBoard';
import DependencyMap from '@/components/DependencyMap';
import SmartNudges from '@/components/SmartNudges';
import LeadershipBrief from '@/components/LeadershipBrief';
import AgentTimeline from '@/components/AgentTimeline';
import { AnalysisResult } from '@/types/analysis';
import { useEffect, useState } from 'react';
import { db, isConfigured } from '@/lib/firebase';
import { Share2 } from 'lucide-react';

export default function SharedAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedId, setResolvedId] = useState<string>('');

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const { id } = await params;
        setResolvedId(id);

        if (isConfigured && db) {
          try {
            const { doc, getDoc } = await import('firebase/firestore');
            const docRef = doc(db, 'shared_analyses', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setData(docSnap.data() as AnalysisResult);
              setLoading(false);
              return;
            }
          } catch {
            // Firestore not available
          }
        }

        setError('Analysis not found. It may have been deleted or the link is invalid.');
      } catch {
        setError('Failed to load analysis.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [params]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />
      <main className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center space-x-3">
          <Share2 className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-sm font-medium text-indigo-800">Shared Analysis View</p>
            <p className="text-xs text-indigo-600">Read-only view{resolvedId ? ` (ID: ${resolvedId.substring(0, 8)}...)` : ''}</p>
          </div>
        </div>

        {loading && (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center">
            {error}
          </div>
        )}

        {data && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <AgentTimeline events={data.agent_timeline} isLoading={false} />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <TeamPulseCard score={data.team_health_score} risk={data.risk_level} summary={data.pulse_summary} />
              <TaskBoard tasks={data.implicit_tasks} />
              <DependencyMap blockers={data.blockers} criticalPath={data.critical_path} />
              <SmartNudges nudges={data.smart_nudges} />
              <LeadershipBrief brief={data.leadership_brief} nextActions={data.next_actions} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
