import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface Nudge {
  recipient: string;
  reason: string;
  message: string;
  urgency: string;
}

export default function SmartNudges({ nudges }: { nudges: Nudge[] }) {
  if (!nudges || nudges.length === 0) return null;

  return (
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
              "{nudge.message}"
            </div>
            <div className="mt-3 ml-2">
              <button className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center space-x-1">
                <span>Copy to Chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
