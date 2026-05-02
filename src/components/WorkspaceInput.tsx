'use client';
import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface Props {
  onAnalyze: (inputs: { meeting: string; chat: string; email: string }) => void;
  isLoading: boolean;
}

export default function WorkspaceInput({ onAnalyze, isLoading }: Props) {
  const [activeTab, setActiveTab] = useState<'meeting' | 'chat' | 'email'>('meeting');
  const [inputs, setInputs] = useState({
    meeting: 'Friday launch is still on. Arthi said the landing page copy is done but waiting for design approval. Rahul mentioned Firebase login is still broken, so QA has not started. Meena said the email campaign is ready but needs final review. Sales needs the demo script by tomorrow morning. Nobody confirmed who owns the product walkthrough. Priya sounded worried that testing is getting pushed too late.',
    chat: 'Rahul: I am still stuck on auth.\nMeena: Email copy is ready, but I need someone to review it.\nArthi: Landing page is done from my side, waiting on design.\nPriya: Can someone confirm who is owning QA?\nSales: We need the demo script by tomorrow.',
    email: 'Hi team, quick update before tomorrow’s sync. The launch plan is mostly on track, but QA is delayed because login is not fixed yet. Design approval is pending for the landing page. Email campaign is ready for review. We still need an owner for the final product walkthrough.'
  });

  const handleRun = () => {
    onAnalyze(inputs);
  };

  const tabs = [
    { id: 'meeting', label: 'Meeting Transcript' },
    { id: 'chat', label: 'Chat Thread' },
    { id: 'email', label: 'Email Update' }
  ] as const;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-200 bg-slate-50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-emerald-500 text-emerald-700 bg-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        <label htmlFor={`${activeTab}-input`} className="sr-only">
          {tabs.find(t => t.id === activeTab)?.label}
        </label>
        <textarea
          id={`${activeTab}-input`}
          className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm text-slate-800"
          value={inputs[activeTab]}
          onChange={(e) => setInputs({ ...inputs, [activeTab]: e.target.value })}
          placeholder={`Paste your ${activeTab} content here...`}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleRun}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>{isLoading ? 'Analyzing...' : 'Run Invisible PM Analysis'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
