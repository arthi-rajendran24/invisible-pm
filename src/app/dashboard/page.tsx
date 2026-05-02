'use client';
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Header from '@/components/Header';
import WorkspaceInput from '@/components/WorkspaceInput';
import AgentTimeline from '@/components/AgentTimeline';
import { AnalysisResult, AgentEvent, Task } from '@/types/analysis';
import { SentimentContext } from '@/utils/geminiPrompt';
import { Share2, Check } from 'lucide-react';
import { auth, db, isConfigured } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection, getDocs, query, orderBy, limit,
  addDoc, doc, setDoc, getDoc,
  type DocumentData,
} from 'firebase/firestore';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Lazy-loaded heavy components for code splitting
const TeamPulseCard = lazy(() => import('@/components/TeamPulseCard'));
const TaskBoard = lazy(() => import('@/components/TaskBoard'));
const DependencyMap = lazy(() => import('@/components/DependencyMap'));
const SmartNudges = lazy(() => import('@/components/SmartNudges'));
const LeadershipBrief = lazy(() => import('@/components/LeadershipBrief'));
const AnalysisHistory = lazy(() => import('@/components/AnalysisHistory'));

/** Fallback skeleton shown while lazy components load */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse" role="status" aria-label="Loading component">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
      <div className="h-3 bg-slate-100 rounded w-2/3"></div>
    </div>
  );
}

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

  const loadHistory = useCallback(async (userId: string) => {
    if (!db) return;
    try {
      const q = query(
        collection(db, 'analyses', userId, 'runs'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const entries: HistoryEntry[] = [];
      const healthData: { date: string; score: number }[] = [];

      snapshot.forEach((d) => {
        const docData = d.data();
        entries.push({
          id: d.id,
          timestamp: docData.timestamp,
          teamHealthScore: docData.team_health_score || 0,
          riskLevel: docData.risk_level || 'unknown',
          taskCount: docData.implicit_tasks?.length || 0,
        });
        healthData.push({
          date: new Date(docData.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: docData.team_health_score || 0,
        });
      });

      setHistory(entries);
      setHealthHistory(healthData.reverse());
    } catch {
      // Firestore not available
    }
  }, []);

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
  }, [loadHistory]);

  const saveAnalysis = useCallback(async (result: AnalysisResult) => {
    if (!user || !db) return;
    try {
      await addDoc(collection(db, 'analyses', user.uid, 'runs'), {
        ...result,
        timestamp: new Date().toISOString(),
      });
      loadHistory(user.uid);
    } catch {
      // Silently fail
    }
  }, [user, loadHistory]);

  const handleShare = useCallback(async () => {
    if (!data) return;
    try {
      if (db) {
        const shareId = `share_${Date.now()}_${crypto.randomUUID()}`;
        await setDoc(doc(db, 'shared_analyses', shareId), {
          ...data,
          sharedAt: new Date().toISOString(),
          sharedBy: user?.displayName || 'Anonymous',
          expiresAt: new Date(Date.now() + SEVEN_DAYS_MS).toISOString(),
        });
        const url = `${window.location.origin}/analysis/${shareId}`;
        setShareUrl(url);
        navigator.clipboard.writeText(url);
      } else {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  }, [data, user]);

  /** Memoized list of unique team members for task reassignment */
  const availableOwners = useMemo(() => {
    if (!data) return [];
    return [
      ...new Set([
        ...data.implicit_tasks.map(t => t.owner).filter(o => o && o !== 'Unassigned'),
        ...data.smart_nudges.map(n => n.recipient),
        ...data.blockers.map(b => b.owner),
      ])
    ];
  }, [data]);

  const handleTaskUpdate = useCallback((index: number, updates: Partial<Task>) => {
    if (!data) return;
    const newTasks = [...data.implicit_tasks];
    newTasks[index] = { ...newTasks[index], ...updates };
    setData({ ...data, implicit_tasks: newTasks });
  }, [data]);

  const handleAnalyze = useCallback(async (
    inputs: { meeting: string; chat: string; email: string },
    sentimentContext?: SentimentContext
  ) => {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [saveAnalysis]);

  // Fix #11: db included in deps to avoid stale closure flagged by static analysis
  const handleHistorySelect = useCallback(async (id: string) => {
    if (!user || !db) return;
    try {
      const docRef = doc(db, 'analyses', user.uid, 'runs', id);
      const docSnap = await getDoc(docRef);
      // Fix #12: safe field existence check before casting
      if (docSnap.exists()) {
        const raw: DocumentData = docSnap.data();
        if ('team_health_score' in raw && 'implicit_tasks' in raw) {
          setData(raw as AnalysisResult);
          setStreamingAgents([]);
        }
      }
    } catch {
      console.error('Failed to load history entry');
    }
  }, [user, db]);

  const toggleHistory = useCallback(() => setHistoryOpen(prev => !prev), []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
        <section aria-label="Communication inputs">
          <WorkspaceInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          {error && (
            <div role="alert" className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}
        </section>

        {/* Live region for screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading && 'AI agents are analyzing your communication data...'}
          {data && !isLoading && 'Analysis complete. Results are displayed below.'}
        </div>

        {history.length > 0 && (
          <Suspense fallback={<CardSkeleton />}>
            <AnalysisHistory
              entries={history}
              onSelect={handleHistorySelect}
              isOpen={historyOpen}
              onToggle={toggleHistory}
            />
          </Suspense>
        )}

        {(isLoading || data) && (
          <>
            {data && (
              <div className="flex justify-end">
                <button
                  onClick={handleShare}
                  aria-label={shareCopied ? 'Link copied to clipboard' : 'Share analysis results'}
                  className="flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                      <span className="text-emerald-600">{shareUrl ? 'Link Copied!' : 'JSON Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" aria-hidden="true" />
                      <span>Share Analysis</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8" aria-label="Analysis results">
              <div className="lg:col-span-1 space-y-8">
                <AgentTimeline
                  events={data?.agent_timeline}
                  isLoading={isLoading}
                  streamingAgents={streamingAgents}
                />
              </div>
              
              <div className="lg:col-span-2 space-y-8">
                {data && (
                  <Suspense fallback={<CardSkeleton />}>
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
                  </Suspense>
                )}
                {isLoading && !data && (
                  <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50" role="status" aria-label="Loading analysis results">
                    <div className="text-center text-slate-400 flex flex-col items-center">
                      <div className="w-8 h-8 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin mb-4" aria-hidden="true"></div>
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
