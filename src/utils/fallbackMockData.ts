export const fallbackMockData = {
  "agent_timeline": [
    { "agent": "Orchestrator Agent", "status": "completed", "output_summary": "Analyzed 3 inputs. Coordinated workflow." },
    { "agent": "Scribe Agent", "status": "completed", "output_summary": "Extracted 4 tasks and identified 1 missing owner." },
    { "agent": "Architect Agent", "status": "completed", "output_summary": "Mapped 2 dependencies and identified 1 critical blocker." },
    { "agent": "Nudge Agent", "status": "completed", "output_summary": "Drafted 2 smart nudges for blocked owners." },
    { "agent": "Vibe-Check Agent", "status": "completed", "output_summary": "Assessed team sentiment as cautious due to delays." },
    { "agent": "Synthesis Agent", "status": "completed", "output_summary": "Compiled final dashboard data." }
  ],
  "team_health_score": 65,
  "risk_level": "high",
  "pulse_summary": "Team is generally on track for Friday launch, but delayed QA and pending design approvals are causing moderate anxiety. Clear ownership needed for walkthrough.",
  "implicit_tasks": [
    { "task": "Landing page copy", "owner": "Arthi", "source": "meeting", "status": "needs_review", "priority": "high", "deadline": "Friday", "dependency": "Design approval", "confidence": 95 },
    { "task": "Fix Firebase login", "owner": "Rahul", "source": "chat", "status": "blocked", "priority": "critical", "deadline": "ASAP", "dependency": "", "confidence": 90 },
    { "task": "Email campaign review", "owner": "Meena", "source": "email", "status": "needs_review", "priority": "medium", "deadline": "", "dependency": "", "confidence": 85 },
    { "task": "Demo script", "owner": "Sales", "source": "chat", "status": "not_started", "priority": "high", "deadline": "Tomorrow morning", "dependency": "", "confidence": 95 },
    { "task": "Product walkthrough", "owner": "Unassigned", "source": "meeting", "status": "unassigned", "priority": "high", "deadline": "Friday", "dependency": "", "confidence": 100 }
  ],
  "blockers": [
    { "blocker": "Firebase login is broken", "blocked_work": "QA testing", "owner": "Rahul", "severity": "critical", "recommended_fix": "Pair program to unblock auth immediately." },
    { "blocker": "Design approval pending", "blocked_work": "Landing page completion", "owner": "Design Team", "severity": "high", "recommended_fix": "Ping design lead for immediate sign-off." }
  ],
  "dependencies": [
    { "from": "Firebase login fix", "to": "QA testing", "relationship": "blocks", "risk": "critical" },
    { "from": "Design approval", "to": "Landing page completion", "relationship": "blocks", "risk": "high" }
  ],
  "critical_path": [
    "Fix Firebase Login",
    "Start QA",
    "Final Product Walkthrough"
  ],
  "smart_nudges": [
    { "recipient": "Design Team", "reason": "Blocking landing page", "message": "Hi Design, any update on the landing page approval? Arthi is waiting to finalize.", "urgency": "high" },
    { "recipient": "Team", "reason": "Missing owner", "message": "We still need an owner for the final product walkthrough. Who can pick this up?", "urgency": "critical" }
  ],
  "leadership_brief": "Launch is at risk due to broken Firebase auth blocking QA. Design approval is also pending for the landing page. We need an immediate owner for the product walkthrough.",
  "next_actions": [
    "Swarm on Firebase login fix with Rahul.",
    "Get design sign-off for landing page.",
    "Assign owner for product walkthrough.",
    "Review email campaign."
  ],
  "communication_gaps": [
    "No clear owner for product walkthrough mentioned in any channel.",
    "QA ownership was questioned in chat but not explicitly resolved."
  ],
  "workflow_improvements": [
    "Establish clear ownership for QA and final demos earlier in the process."
  ]
};
