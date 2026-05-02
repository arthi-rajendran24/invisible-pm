'use client';
import React from 'react';
import { Download } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';

interface Props {
  data: AnalysisResult;
}

/**
 * Exports the analysis results as a downloadable Markdown file.
 */
export default function ExportButton({ data }: Props) {
  const handleExport = () => {
    const md = generateMarkdown(data);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invisible-pm-brief-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
      aria-label="Export analysis results as Markdown"
    >
      <Download className="w-4 h-4" aria-hidden="true" />
      <span>Export Brief</span>
    </button>
  );
}

function generateMarkdown(data: AnalysisResult): string {
  const lines: string[] = [];

  lines.push('# The Invisible PM — Analysis Brief');
  lines.push(`> Generated on ${new Date().toLocaleString()}`);
  lines.push('');

  // Team Health
  lines.push('## Team Health');
  lines.push(`- **Score:** ${data.team_health_score}/100`);
  lines.push(`- **Risk Level:** ${data.risk_level.toUpperCase()}`);
  lines.push(`- **Summary:** ${data.pulse_summary}`);
  lines.push('');

  // Agent Timeline
  lines.push('## Agent Timeline');
  data.agent_timeline.forEach((e) => {
    lines.push(`- **${e.agent}** (${e.status}): ${e.output_summary}`);
  });
  lines.push('');

  // Tasks
  lines.push('## Implicit Tasks');
  lines.push('| Task | Owner | Status | Priority | Deadline |');
  lines.push('|------|-------|--------|----------|----------|');
  data.implicit_tasks.forEach((t) => {
    lines.push(`| ${t.task} | ${t.owner || 'Unassigned'} | ${t.status} | ${t.priority} | ${t.deadline || '-'} |`);
  });
  lines.push('');

  // Blockers
  lines.push('## Blockers');
  data.blockers.forEach((b) => {
    lines.push(`- **${b.blocker}** → Blocks: ${b.blocked_work} (Owner: ${b.owner}, Severity: ${b.severity})`);
    if (b.recommended_fix) lines.push(`  - _Fix:_ ${b.recommended_fix}`);
  });
  lines.push('');

  // Critical Path
  lines.push('## Critical Path');
  data.critical_path.forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`);
  });
  lines.push('');

  // Smart Nudges
  lines.push('## Smart Nudges');
  data.smart_nudges.forEach((n) => {
    lines.push(`- **To ${n.recipient}** (${n.urgency}): "${n.message}"`);
  });
  lines.push('');

  // Leadership Brief
  lines.push('## Leadership Brief');
  lines.push(data.leadership_brief);
  lines.push('');

  // Next Actions
  lines.push('## Next Actions');
  data.next_actions.forEach((a) => lines.push(`- ${a}`));
  lines.push('');

  // Communication Gaps
  if (data.communication_gaps.length > 0) {
    lines.push('## Communication Gaps');
    data.communication_gaps.forEach((g) => lines.push(`- ${g}`));
    lines.push('');
  }

  // Workflow Improvements
  if (data.workflow_improvements.length > 0) {
    lines.push('## Workflow Improvements');
    data.workflow_improvements.forEach((w) => lines.push(`- ${w}`));
    lines.push('');
  }

  return lines.join('\n');
}
