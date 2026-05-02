'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import WorkspaceInput from '@/components/WorkspaceInput';
import AgentTimeline from '@/components/AgentTimeline';
import TeamPulseCard from '@/components/TeamPulseCard';
import TaskBoard from '@/components/TaskBoard';
import DependencyMap from '@/components/DependencyMap';
import SmartNudges from '@/components/SmartNudges';
import LeadershipBrief from '@/components/LeadershipBrief';
import AnalysisHistory from '@/components/AnalysisHistory';
import { AnalysisResult, AgentEvent, Task } from '@/types/analysis';
import { Share2, Check } from 'lucide-react';
import { auth, db, isConfigured } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface HistoryEntry {
  id: string;
  timestamp: string;
  teamHealthScore: number;
  riskLevel: string;
  taskCount: number;
}

export default function Home() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingAgents, setStreamingAgents] = useState<AgentEvent[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [healthHistory, setHealthHistory] = useState<{ date: string; score: number }[]>([]);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Listen to auth state
  useEffect(() => {
    if (!isConfigured || !auth) return;
    try {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u) loadHistory(u.uid);
      });
      return () => unsubscribe();
    } catch {
      // Firebase not configured
    }
  }, []);

  const loadHistory = async (userId: string) => {
    if (!db) return;
    try {
      const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
      const q = query(
        collection(db, 'analyses', userId, 'runs'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const entries: HistoryEntry[] = [];
      const healthData: { date: string; score: number }[] = [];

      snapshot.forEach((d) => {
        const data = d.data();
        entries.push({
          id: d.id,
          timestamp: data.timestamp,
          teamHealthScore: data.team_health_score || 0,
          riskLevel: data.risk_level || 'unknown',
          taskCount: data.implicit_tasks?.length || 0,
        });
        healthData.push({
          date: new Date(data.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: data.team_health_score || 0,
        });
      });

      setHistory(entries);
      setHealthHistory(healthData.reverse());
    } catch {
      // Firestore not available
    }
  };

  const saveAnalysis = async (result: AnalysisResult) => {
    if (!user || !db) return;
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'analyses', user.uid, 'runs'), {
        ...result,
        timestamp: new Date().toISOString(),
      });
      loadHistory(user.uid);
    } catch {
      // Silently fail
    }
  };

  const handleShare = async () => {
    if (!data) return;
    try {
      if (db) {
        const { doc, setDoc } = await import('firebase/firestore');
        const shareId = `share_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await setDoc(doc(db, 'shared_analyses', shareId), {
          ...data,
          sharedAt: new Date().toISOString(),
          sharedBy: user?.displayName || 'Anonymous',
        });
        const url = `${window.location.origin}/analysis/${shareId}`;
        setShareUrl(url);
        navigator.clipboard.writeText(url);
      } else {
        // Fallback: copy JSON
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  const availableOwners = data ? [
    ...new Set([
      ...data.implicit_tasks.map(t => t.owner).filter(o => o && o !== 'Unassigned'),
      ...data.smart_nudges.map(n => n.recipient),
      ...data.blockers.map(b => b.owner),
    ])
  ] : [];

  const handleTaskUpdate = (index: number, updates: Partial<Task>) => {
    if (!data) return;
    const newTasks = [...data.implicit_tasks];
    newTasks[index] = { ...newTasks[index], ...updates };
    setData({ ...data, implicit_tasks: newTasks });
  };

  const handleAnalyze = async (inputs: { meeting: string; chat: string; email: string }, sentimentContext?: any) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setStreamingAgents([]);
    setShareUrl(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inputs, sentimentContext }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze data');
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('No response body');

        let buffer = '';
        const seenAgents = new Set<string>();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let eventType = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
              const dataStr = line.substring(6).trim();
              try {
                const eventData = JSON.parse(dataStr);
                if (eventType === 'agent_complete') {
                  if (!seenAgents.has(eventData.agent)) {
                    seenAgents.add(eventData.agent);
                    setStreamingAgents(prev => [...prev, eventData]);
                  }
                } else if (eventType === 'result') {
                  setData(eventData);
                  saveAnalysis(eventData);
                } else if (eventType === 'error') {
                  setError(eventData.error || 'Stream error');
                }
              } catch {
                // Skip malformed JSON
              }
              eventType = '';
            }
          }
        }
      } else {
        const result = await response.json();
        setData(result);
        saveAnalysis(result);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = async (id: string) => {
    if (!user || !db) return;
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'analyses', user.uid, 'runs', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data() as AnalysisResult);
        setStreamingAgents([]);
      }
    } catch {
      console.error('Failed to load history entry');
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

        {history.length > 0 && (
          <AnalysisHistory
            entries={history}
            onSelect={handleHistorySelect}
            isOpen={historyOpen}
            onToggle={() => setHistoryOpen(!historyOpen)}
          />
        )}

        {(isLoading || data) && (
          <>
            {data && (
              <div className="flex justify-end">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600">{shareUrl ? 'Link Copied!' : 'JSON Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share Analysis</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-8">
                <AgentTimeline
                  events={data?.agent_timeline}
                  isLoading={isLoading}
                  streamingAgents={streamingAgents}
                />
              </div>
              
              <div className="lg:col-span-2 space-y-8">
                {data && (
                  <>
                    <TeamPulseCard
                      score={data.team_health_score}
                      risk={data.risk_level}
                      summary={data.pulse_summary}
                      healthHistory={healthHistory.length >= 2 ? healthHistory : undefined}
                    />
                    <TaskBoard
                      tasks={data.implicit_tasks}
                      availableOwners={availableOwners}
                      onTaskUpdate={handleTaskUpdate}
                    />
                    <DependencyMap
                      blockers={data.blockers}
                      criticalPath={data.critical_path}
                      dependencies={data.dependencies}
                    />
                    <SmartNudges nudges={data.smart_nudges} />
                    <LeadershipBrief
                      brief={data.leadership_brief}
                      nextActions={data.next_actions}
                      teamHealthScore={data.team_health_score}
                      riskLevel={data.risk_level}
                      pulseSummary={data.pulse_summary}
                    />
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
          </>
        )}
      </main>
    </div>
  );
}
