// --- Enums for strict typing ---
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'needs_review' | 'unassigned';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type InputSource = 'meeting' | 'chat' | 'email';
export type AgentStatus = 'completed' | 'in_progress' | 'pending';

// --- Interfaces ---
export interface AgentEvent {
  agent: string;
  status: AgentStatus;
  output_summary: string;
}

export interface Task {
  task: string;
  owner: string;
  source: InputSource;
  status: TaskStatus;
  priority: Priority;
  deadline: string;
  dependency?: string;
  confidence?: number;
}

export interface Blocker {
  blocker: string;
  blocked_work: string;
  owner: string;
  severity: RiskLevel;
  recommended_fix?: string;
}

export interface Dependency {
  from: string;
  to: string;
  relationship: string;
  risk: RiskLevel;
}

export interface Nudge {
  recipient: string;
  reason: string;
  message: string;
  urgency: RiskLevel;
}

export interface AnalysisResult {
  agent_timeline: AgentEvent[];
  team_health_score: number;
  risk_level: RiskLevel;
  pulse_summary: string;
  implicit_tasks: Task[];
  blockers: Blocker[];
  dependencies: Dependency[];
  critical_path: string[];
  smart_nudges: Nudge[];
  leadership_brief: string;
  next_actions: string[];
  communication_gaps: string[];
  workflow_improvements: string[];
}
