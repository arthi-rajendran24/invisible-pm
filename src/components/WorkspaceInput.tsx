'use client';
import React, { useState, useCallback, useRef } from 'react';
import { Play, Upload, Mail, MessageSquare, Mic } from 'lucide-react';
import SentimentIndicator from './SentimentIndicator';
import { SentimentContext } from '@/utils/geminiPrompt';

interface SentimentData {
  score: number;
  magnitude: number;
  label: 'positive' | 'neutral' | 'negative';
  channel: string;
}

interface Props {
  onAnalyze: (inputs: { meeting: string; chat: string; email: string }, sentimentContext?: SentimentContext) => void;
  isLoading: boolean;
}

export default function WorkspaceInput({ onAnalyze, isLoading }: Props) {
  const [activeTab, setActiveTab] = useState<'meeting' | 'chat' | 'email'>('meeting');
  const [inputs, setInputs] = useState({
    meeting: 'Friday launch is still on. Arthi said the landing page copy is done but waiting for design approval. Rahul mentioned Firebase login is still broken, so QA has not started. Meena said the email campaign is ready but needs final review. Sales needs the demo script by tomorrow morning. Nobody confirmed who owns the product walkthrough. Priya sounded worried that testing is getting pushed too late.',
    chat: 'Rahul: I am still stuck on auth.\nMeena: Email copy is ready, but I need someone to review it.\nArthi: Landing page is done from my side, waiting on design.\nPriya: Can someone confirm who is owning QA?\nSales: We need the demo script by tomorrow.',
    email: 'Hi team, quick update before tomorrow\'s sync. The launch plan is mostly on track, but QA is delayed because login is not fixed yet. Design approval is pending for the landing page. Email campaign is ready for review. We still need an owner for the final product walkthrough.'
  });
  const [sentiments, setSentiments] = useState<Record<string, SentimentData | null>>({});
  const [sentimentLoading, setSentimentLoading] = useState<Record<string, boolean>>({});
  const [audioUploading, setAudioUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sentimentTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Debounced sentiment analysis
  const analyzeSentiment = useCallback((text: string, channel: string) => {
    if (sentimentTimers.current[channel]) {
      clearTimeout(sentimentTimers.current[channel]);
    }

    if (!text.trim()) {
      setSentiments(prev => ({ ...prev, [channel]: null }));
      return;
    }

    sentimentTimers.current[channel] = setTimeout(async () => {
      setSentimentLoading(prev => ({ ...prev, [channel]: true }));
      try {
        const res = await fetch('/api/sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.substring(0, 1000), channel }),
        });
        if (res.ok) {
          const data = await res.json();
          setSentiments(prev => ({ ...prev, [channel]: data }));
        }
      } catch {
        // Silently fail
      } finally {
        setSentimentLoading(prev => ({ ...prev, [channel]: false }));
      }
    }, 800);
  }, []);

  const handleInputChange = (tab: string, value: string) => {
    setInputs(prev => ({ ...prev, [tab]: value }));
    analyzeSentiment(value, tab);
  };

  const handleRun = () => {
    const sentimentContext: SentimentContext = {};
    if (sentiments.meeting) sentimentContext.meeting = { score: sentiments.meeting.score, label: sentiments.meeting.label };
    if (sentiments.chat) sentimentContext.chat = { score: sentiments.chat.score, label: sentiments.chat.label };
    if (sentiments.email) sentimentContext.email = { score: sentiments.email.score, label: sentiments.email.label };

    onAnalyze(inputs, Object.keys(sentimentContext).length > 0 ? sentimentContext : undefined);
  };

  const handleAudioUpload = async (file: File) => {
    setAudioUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transcript) {
          setInputs(prev => ({ ...prev, meeting: data.transcript }));
          analyzeSentiment(data.transcript, 'meeting');
        }
      }
    } catch {
      console.error('Audio upload failed');
    } finally {
      setAudioUploading(false);
    }
  };

  const tabs = [
    { id: 'meeting' as const, label: 'Meeting Transcript', icon: Mic },
    { id: 'chat' as const, label: 'Chat Thread', icon: MessageSquare },
    { id: 'email' as const, label: 'Email Update', icon: Mail },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div role="tablist" aria-label="Communication input sources" className="flex border-b border-slate-200 bg-slate-50">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => {
              let newIndex = index;
              if (e.key === 'ArrowRight') newIndex = (index + 1) % tabs.length;
              else if (e.key === 'ArrowLeft') newIndex = (index - 1 + tabs.length) % tabs.length;
              else if (e.key === 'Home') newIndex = 0;
              else if (e.key === 'End') newIndex = tabs.length - 1;
              else return;
              e.preventDefault();
              setActiveTab(tabs[newIndex].id);
              document.getElementById(`tab-${tabs[newIndex].id}`)?.focus();
            }}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === tab.id
                ? 'border-b-2 border-emerald-500 text-emerald-700 bg-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <SentimentIndicator
              sentiment={sentiments[tab.id] || null}
              isLoading={sentimentLoading[tab.id]}
            />
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="p-4">
        <label htmlFor={`${activeTab}-input`} className="sr-only">
          {tabs.find(t => t.id === activeTab)?.label}
        </label>
        <textarea
          id={`${activeTab}-input`}
          className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm text-slate-800"
          value={inputs[activeTab]}
          onChange={(e) => handleInputChange(activeTab, e.target.value)}
          placeholder={`Paste your ${activeTab} content here...`}
        />

        {/* Audio upload for meeting tab */}
        {activeTab === 'meeting' && (
          <div className="mt-2 flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAudioUpload(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={audioUploading}
              className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{audioUploading ? 'Transcribing...' : 'Upload Audio (Speech-to-Text)'}</span>
            </button>
            {audioUploading && (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin"></div>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            id="run-analysis-button"
            onClick={handleRun}
            disabled={isLoading}
            aria-busy={isLoading}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>{isLoading ? 'Analyzing...' : 'Run Invisible PM Analysis'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
