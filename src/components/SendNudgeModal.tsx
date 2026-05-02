'use client';
import React, { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recipient: string;
  message: string;
}

export default function SendNudgeModal({ isOpen, onClose, recipient, message }: Props) {
  const [spaceId, setSpaceId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!spaceId.trim()) return;
    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId: spaceId.trim(), message, recipient }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: data.demo
            ? '✅ Message sent (demo mode)'
            : '✅ Message delivered to Google Chat!',
        });
      } else {
        setResult({ success: false, message: data.error || 'Failed to send' });
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center space-x-2">
            <Send className="w-4 h-4 text-sky-500" />
            <span>Send to Google Chat</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Recipient
            </label>
            <p className="text-sm font-medium text-slate-800">{recipient}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Message Preview
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 italic">
              &quot;{message}&quot;
            </div>
          </div>

          <div>
            <label htmlFor="space-id" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Google Chat Space ID
            </label>
            <input
              id="space-id"
              type="text"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              placeholder="e.g. AAAAxxxxxxx"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">Find this in your Google Chat space URL</p>
          </div>

          {result && (
            <div className={`flex items-center space-x-2 text-sm p-3 rounded-lg ${
              result.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{result.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !spaceId.trim()}
            className="flex items-center space-x-2 px-5 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Sending...' : 'Send Nudge'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
