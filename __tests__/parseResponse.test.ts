import { parseGeminiResponse } from '../src/utils/parseResponse';

describe('parseGeminiResponse', () => {
  it('should parse valid JSON string', () => {
    const validJson = '{"test": "data", "count": 42}';
    expect(parseGeminiResponse(validJson)).toEqual({ test: 'data', count: 42 });
  });

  it('should parse markdown-wrapped JSON with ```json fence', () => {
    const markdownJson = '```json\n{"test": "data"}\n```';
    expect(parseGeminiResponse(markdownJson)).toEqual({ test: 'data' });
  });

  it('should parse markdown-wrapped JSON with ``` fence (no language)', () => {
    const markdownJson = '```\n{"test": "data"}\n```';
    expect(parseGeminiResponse(markdownJson)).toEqual({ test: 'data' });
  });

  it('should return null for completely invalid input', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(parseGeminiResponse('this is not json at all')).toBeNull();
    jest.restoreAllMocks();
  });

  it('should return null for empty string', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(parseGeminiResponse('')).toBeNull();
    jest.restoreAllMocks();
  });

  it('should handle nested objects correctly', () => {
    const nested = '{"agent_timeline": [{"agent": "Test", "status": "completed", "output_summary": "Done"}]}';
    const result = parseGeminiResponse(nested);
    expect(result).not.toBeNull();
    expect(result?.agent_timeline).toHaveLength(1);
    expect(result?.agent_timeline[0].agent).toBe('Test');
  });

  it('should handle the full AnalysisResult schema', () => {
    const fullResult = JSON.stringify({
      agent_timeline: [{ agent: "Orchestrator", status: "completed", output_summary: "Done" }],
      team_health_score: 75,
      risk_level: "medium",
      pulse_summary: "Team is doing well",
      implicit_tasks: [],
      blockers: [],
      dependencies: [],
      critical_path: ["Step 1"],
      smart_nudges: [],
      leadership_brief: "All good",
      next_actions: ["Action 1"],
      communication_gaps: [],
      workflow_improvements: [],
    });
    const result = parseGeminiResponse(fullResult);
    expect(result).not.toBeNull();
    expect(result?.team_health_score).toBe(75);
    expect(result?.risk_level).toBe('medium');
    expect(result?.critical_path).toContain('Step 1');
  });
});
