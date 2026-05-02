import { generatePrompt, generateSystemInstruction, SentimentContext } from '../src/utils/geminiPrompt';

describe('generateSystemInstruction', () => {
  it('should return a non-empty system instruction string', () => {
    const instruction = generateSystemInstruction();
    expect(typeof instruction).toBe('string');
    expect(instruction.length).toBeGreaterThan(50);
  });

  it('should mention multi-agent coordination', () => {
    const instruction = generateSystemInstruction();
    expect(instruction.toLowerCase()).toContain('agent');
  });
});

describe('generatePrompt', () => {
  it('should include all three input sources in the prompt', () => {
    const prompt = generatePrompt('meeting notes', 'chat thread', 'email content');
    expect(prompt).toContain('meeting notes');
    expect(prompt).toContain('chat thread');
    expect(prompt).toContain('email content');
  });

  it('should include sentiment context when provided', () => {
    const sentiment: SentimentContext = {
      meeting: { score: 0.8, label: 'positive' },
      chat: { score: -0.3, label: 'negative' },
    };
    const prompt = generatePrompt('notes', 'chat', 'email', sentiment);
    expect(prompt).toContain('positive');
    expect(prompt).toContain('negative');
    expect(prompt).toContain('0.8');
  });

  it('should not include sentiment section when context is undefined', () => {
    const prompt = generatePrompt('notes', 'chat', 'email');
    expect(prompt).not.toContain('Pre-Analysis Sentiment');
  });

  it('should include the output schema with all required fields', () => {
    const prompt = generatePrompt('notes', 'chat', 'email');
    expect(prompt).toContain('agent_timeline');
    expect(prompt).toContain('team_health_score');
    expect(prompt).toContain('implicit_tasks');
    expect(prompt).toContain('smart_nudges');
    expect(prompt).toContain('leadership_brief');
    expect(prompt).toContain('blockers');
    expect(prompt).toContain('dependencies');
  });

  it('should include all 6 agent roles', () => {
    const prompt = generatePrompt('', '', '');
    expect(prompt).toContain('Orchestrator Agent');
    expect(prompt).toContain('Scribe Agent');
    expect(prompt).toContain('Architect Agent');
    expect(prompt).toContain('Nudge Agent');
    expect(prompt).toContain('Vibe-Check Agent');
    expect(prompt).toContain('Synthesis Agent');
  });

  it('should handle empty inputs gracefully', () => {
    const prompt = generatePrompt('', '', '');
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });
});
