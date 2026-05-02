'use client';
import React, { useState } from 'react';
import { MessageSquarePlus, Check, Send, Copy } from 'lucide-react';
import { Nudge } from '@/types/analysis';
import SendNudgeModal from './SendNudgeModal';

export default function SmartNudges({ nudges }: { nudges: Nudge[] }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [modalNudge, setModalNudge] = useState<{ recipient: string; message: string } | null>(null);

  const handleCopy = (message: string, index: number) => {
    navigator.clipboard.writeText(message);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!nudges || nudges.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center space-x-2">
          <MessageSquarePlus className="w-5 h-5 text-sky-500" />
          <h2 className="font-semibold text-slate-800">Smart Nudge Drafts</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {nudges.map((nudge, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                nudge.urgency === 'critical' ? 'bg-rose-500' :
                nudge.urgency === 'high' ? 'bg-orange-500' : 'bg-sky-500'
              }`}></div>
              <div className="flex justify-between items-start mb-2 pl-2">
                <span className="text-sm font-semibold text-slate-800">To: {nudge.recipient}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{nudge.reason}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 ml-2 text-sm text-slate-700 italic relative">
                &quot;{nudge.message}&quot;
              </div>
              <div className="mt-3 ml-2 flex items-center space-x-3">
                {/* Send to Google Chat */}
                <button
                  onClick={() => setModalNudge({ recipient: nudge.recipient, message: nudge.message })}
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center space-x-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Send to Chat</span>
                </button>
                {/* Copy to clipboard */}
                <button
                  onClick={() => handleCopy(nudge.message, i)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center space-x-1 px-2.5 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Send Nudge Modal */}
      {modalNudge && (
        <SendNudgeModal
          isOpen={true}
          onClose={() => setModalNudge(null)}
          recipient={modalNudge.recipient}
          message={modalNudge.message}
        />
      )}
    </>
  );
}
