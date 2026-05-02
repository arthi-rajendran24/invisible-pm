interface SentimentContext {
  meeting?: { score: number; label: string };
  chat?: { score: number; label: string };
  email?: { score: number; label: string };
}

export const generateSystemInstruction = () => `
You are the intelligence engine for "The Invisible PM", a zero-friction multi-agent coordination system.
You simulate 6 specialized agents that process team communication and produce structured coordination output.
You MUST follow the output format precisely — emitting each agent's work sequentially with delimiters, then the full JSON result.
`;

export const generatePrompt = (meeting: string, chat: string, email: string, sentimentContext?: SentimentContext) => `
--- Inputs ---
<meeting_transcript>
${meeting}
</meeting_transcript>

<chat_thread>
${chat}
</chat_thread>

<email_update>
${email}
</email_update>
---

${sentimentContext ? `
--- Pre-Analysis Sentiment (from Google Cloud Natural Language API) ---
${sentimentContext.meeting ? `Meeting Tone: ${sentimentContext.meeting.label} (score: ${sentimentContext.meeting.score})` : ''}
${sentimentContext.chat ? `Chat Tone: ${sentimentContext.chat.label} (score: ${sentimentContext.chat.score})` : ''}
${sentimentContext.email ? `Email Tone: ${sentimentContext.email.label} (score: ${sentimentContext.email.score})` : ''}
Use these sentiment signals to enrich your analysis of team morale and communication gaps.
---
` : ''}

--- Agent Roles ---
1. Orchestrator Agent: Understands the communication context and coordinates the analysis.
2. Scribe Agent: Extracts implicit tasks, owners, promises, deadlines, and missing ownership.
3. Architect Agent: Maps dependencies, blockers, bottlenecks, and critical path.
4. Nudge Agent: Creates personalized, non-spammy Google Chat-style nudges for only the people on the critical path.
5. Vibe-Check Agent: Summarizes team sentiment, workload risk, communication gaps, and leadership pulse.
6. Synthesis Agent: Combines all outputs into one clean coordination dashboard.

--- CRITICAL OUTPUT FORMAT ---
You MUST emit each agent's work one at a time, using these exact delimiters.
After each agent completes, emit their result immediately before starting the next agent.

For each agent, emit:
<<<AGENT:Agent Name>>>
{"agent": "Agent Name", "status": "completed", "output_summary": "Brief description of what this agent found"}
<<<END_AGENT>>>

After ALL 6 agents have completed, emit the full combined JSON result:

<<<RESULT>>>
{full JSON object matching the schema below}
<<<END_RESULT>>>

--- Rules ---
1. Emit agents in order: Orchestrator → Scribe → Architect → Nudge → Vibe-Check → Synthesis
2. The final JSON inside <<<RESULT>>> must be valid JSON matching the schema below
3. DO NOT include markdown code blocks. NO \`\`\`json or \`\`\`
4. Ensure all fields are present. If data is missing, infer reasonably or leave strings empty
5. Confidence scores should be between 0 and 100
6. Provide realistic agent_timeline summaries demonstrating simulated work

--- Output Schema (for the <<<RESULT>>> block) ---
{
  "agent_timeline": [
    {
      "agent": "Orchestrator Agent",
      "status": "completed",
      "output_summary": ""
    },
    {
      "agent": "Scribe Agent",
      "status": "completed",
      "output_summary": ""
    },
    {
      "agent": "Architect Agent",
      "status": "completed",
      "output_summary": ""
    },
    {
      "agent": "Nudge Agent",
      "status": "completed",
      "output_summary": ""
    },
    {
      "agent": "Vibe-Check Agent",
      "status": "completed",
      "output_summary": ""
    },
    {
      "agent": "Synthesis Agent",
      "status": "completed",
      "output_summary": ""
    }
  ],
  "team_health_score": 0,
  "risk_level": "low | medium | high | critical",
  "pulse_summary": "",
  "implicit_tasks": [
    {
      "task": "",
      "owner": "",
      "source": "meeting | chat | email",
      "status": "not_started | in_progress | blocked | completed | needs_review | unassigned",
      "priority": "low | medium | high | critical",
      "deadline": "",
      "dependency": "",
      "confidence": 0
    }
  ],
  "blockers": [
    {
      "blocker": "",
      "blocked_work": "",
      "owner": "",
      "severity": "low | medium | high | critical",
      "recommended_fix": ""
    }
  ],
  "dependencies": [
    {
      "from": "",
      "to": "",
      "relationship": "",
      "risk": "low | medium | high | critical"
    }
  ],
  "critical_path": [],
  "smart_nudges": [
    {
      "recipient": "",
      "reason": "",
      "message": "",
      "urgency": "low | medium | high | critical"
    }
  ],
  "leadership_brief": "",
  "next_actions": [],
  "communication_gaps": [],
  "workflow_improvements": []
}
`;
