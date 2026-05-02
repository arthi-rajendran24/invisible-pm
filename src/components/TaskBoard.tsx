import React from 'react';
import { CheckSquare } from 'lucide-react';

interface Task {
  task: string;
  owner: string;
  source: string;
  status: string;
  priority: string;
  deadline: string;
}

export default function TaskBoard({ tasks }: { tasks: Task[] }) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center space-x-2">
        <CheckSquare className="w-5 h-5 text-emerald-600" />
        <h2 className="font-semibold text-slate-800">Implicit Task Board</h2>
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
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{task.task}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${task.owner === 'Unassigned' || !task.owner ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                    {task.owner || 'Unassigned'}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                    {task.status.replace('_', ' ')}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
