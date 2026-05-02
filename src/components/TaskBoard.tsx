'use client';
import React, { useState } from 'react';
import { CheckSquare, FileSpreadsheet, UserPlus, ChevronDown } from 'lucide-react';
import { Task } from '@/types/analysis';

interface Props {
  tasks: Task[];
  availableOwners?: string[];
  onTaskUpdate?: (index: number, updates: Partial<Task>) => void;
}

export default function TaskBoard({ tasks, availableOwners = [], onTaskUpdate }: Props) {
  const [exportLoading, setExportLoading] = useState(false);
  const [exportResult, setExportResult] = useState<{ url: string; demo: boolean } | null>(null);
  const [assigningIndex, setAssigningIndex] = useState<number | null>(null);

  if (!tasks || tasks.length === 0) return null;

  const handleExportToSheets = async () => {
    setExportLoading(true);
    setExportResult(null);
    try {
      const res = await fetch('/api/export/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Invisible PM Tasks — ${new Date().toLocaleDateString()}`,
          tasks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExportResult({ url: data.sheetUrl, demo: data.demo });
        if (!data.demo && data.sheetUrl !== '#demo-export') {
          window.open(data.sheetUrl, '_blank');
        }
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleAssign = (taskIndex: number, newOwner: string) => {
    if (onTaskUpdate) {
      onTaskUpdate(taskIndex, { owner: newOwner, status: newOwner ? 'not_started' : 'unassigned' });
    }
    setAssigningIndex(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-slate-800">Implicit Task Board</h2>
        </div>
        <div className="flex items-center space-x-2">
          {exportResult && (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {exportResult.demo ? '✅ Demo export ready' : '✅ Exported!'}
            </span>
          )}
          <button
            onClick={handleExportToSheets}
            disabled={exportLoading}
            className="flex items-center space-x-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{exportLoading ? 'Exporting...' : 'Export to Sheets'}</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Task</th>
              <th className="px-6 py-3">Owner</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Deadline</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => (
              <tr key={task.task || i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{task.task}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${task.owner === 'Unassigned' || !task.owner ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                    {task.owner || 'Unassigned'}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                    {task.status.replaceAll('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
                     task.priority === 'critical' ? 'text-rose-700 bg-rose-50' :
                     task.priority === 'high' ? 'text-orange-700 bg-orange-50' :
                     'text-slate-600 bg-slate-50'
                   }`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{task.deadline || '-'}</td>
                <td className="px-6 py-4">
                  {(!task.owner || task.owner === 'Unassigned' || task.status === 'unassigned') ? (
                    <div className="relative">
                      <button
                        onClick={() => setAssigningIndex(assigningIndex === i ? null : i)}
                        className="flex items-center space-x-1 text-xs font-medium text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Assign</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {assigningIndex === i && availableOwners.length > 0 && (
                        <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                          {availableOwners.map(owner => (
                            <button
                              key={owner}
                              onClick={() => handleAssign(i, owner)}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              {owner}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
