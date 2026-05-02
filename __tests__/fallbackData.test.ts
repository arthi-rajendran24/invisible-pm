import { fallbackMockData } from '../src/utils/fallbackMockData';

/**
 * Tests that the fallback mock data conforms to the AnalysisResult schema.
 * This ensures the app never crashes when using fallback data.
 */
describe('fallbackMockData', () => {
  it('should have all required top-level fields', () => {
    expect(fallbackMockData).toHaveProperty('agent_timeline');
    expect(fallbackMockData).toHaveProperty('team_health_score');
    expect(fallbackMockData).toHaveProperty('risk_level');
    expect(fallbackMockData).toHaveProperty('pulse_summary');
    expect(fallbackMockData).toHaveProperty('implicit_tasks');
    expect(fallbackMockData).toHaveProperty('blockers');
    expect(fallbackMockData).toHaveProperty('dependencies');
    expect(fallbackMockData).toHaveProperty('critical_path');
    expect(fallbackMockData).toHaveProperty('smart_nudges');
    expect(fallbackMockData).toHaveProperty('leadership_brief');
    expect(fallbackMockData).toHaveProperty('next_actions');
    expect(fallbackMockData).toHaveProperty('communication_gaps');
    expect(fallbackMockData).toHaveProperty('workflow_improvements');
  });

  it('should have exactly 6 agents in timeline', () => {
    expect(fallbackMockData.agent_timeline).toHaveLength(6);
  });

  it('should have valid agent timeline entries', () => {
    fallbackMockData.agent_timeline.forEach((event) => {
      expect(event).toHaveProperty('agent');
      expect(event).toHaveProperty('status');
      expect(event).toHaveProperty('output_summary');
      expect(typeof event.agent).toBe('string');
      expect(event.agent.length).toBeGreaterThan(0);
    });
  });

  it('should have team_health_score between 0 and 100', () => {
    expect(fallbackMockData.team_health_score).toBeGreaterThanOrEqual(0);
    expect(fallbackMockData.team_health_score).toBeLessThanOrEqual(100);
  });

  it('should have a valid risk_level', () => {
    expect(['low', 'medium', 'high', 'critical']).toContain(fallbackMockData.risk_level);
  });

  it('should have valid task entries with required fields', () => {
    fallbackMockData.implicit_tasks.forEach((task) => {
      expect(task).toHaveProperty('task');
      expect(task).toHaveProperty('owner');
      expect(task).toHaveProperty('source');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('priority');
    });
  });

  it('should have valid blocker entries', () => {
    fallbackMockData.blockers.forEach((blocker) => {
      expect(blocker).toHaveProperty('blocker');
      expect(blocker).toHaveProperty('blocked_work');
      expect(blocker).toHaveProperty('owner');
      expect(blocker).toHaveProperty('severity');
    });
  });

  it('should have valid nudge entries', () => {
    fallbackMockData.smart_nudges.forEach((nudge) => {
      expect(nudge).toHaveProperty('recipient');
      expect(nudge).toHaveProperty('reason');
      expect(nudge).toHaveProperty('message');
      expect(nudge).toHaveProperty('urgency');
    });
  });

  it('should have arrays for list fields', () => {
    expect(Array.isArray(fallbackMockData.critical_path)).toBe(true);
    expect(Array.isArray(fallbackMockData.next_actions)).toBe(true);
    expect(Array.isArray(fallbackMockData.communication_gaps)).toBe(true);
    expect(Array.isArray(fallbackMockData.workflow_improvements)).toBe(true);
  });
});
