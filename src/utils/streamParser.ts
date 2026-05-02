import { AgentEvent, AnalysisResult } from '@/types/analysis';

export interface StreamEvent {
  type: 'agent_complete' | 'result' | 'error';
  agent?: AgentEvent;
  result?: AnalysisResult;
  error?: string;
}

const AGENT_START = '<<<AGENT:';
const AGENT_END = '<<<END_AGENT>>>';
const RESULT_START = '<<<RESULT>>>';
const RESULT_END = '<<<END_RESULT>>>';

export class StreamParser {
  private buffer = '';

  /**
   * Feed a new chunk of text from the stream.
   * Returns any complete events found in the buffer.
   */
  feed(chunk: string): StreamEvent[] {
    this.buffer += chunk;
    const events: StreamEvent[] = [];

    // Extract agent blocks
    let agentStartIdx: number;
    while ((agentStartIdx = this.buffer.indexOf(AGENT_START)) !== -1) {
      const agentEndIdx = this.buffer.indexOf(AGENT_END, agentStartIdx);
      if (agentEndIdx === -1) break; // Incomplete block, wait for more data

      const blockContent = this.buffer.substring(
        agentStartIdx + AGENT_START.length,
        agentEndIdx
      );

      // Parse: "AgentName>>>\n{json}"
      const closingBracket = blockContent.indexOf('>>>');
      if (closingBracket !== -1) {
        const agentName = blockContent.substring(0, closingBracket).trim();
        const jsonStr = blockContent.substring(closingBracket + 3).trim();

        try {
          const agentData = JSON.parse(jsonStr);
          events.push({
            type: 'agent_complete',
            agent: {
              agent: agentData.agent || agentName,
              status: agentData.status || 'completed',
              output_summary: agentData.output_summary || '',
            },
          });
        } catch {
          // If JSON parse fails, create a simple event from the agent name
          events.push({
            type: 'agent_complete',
            agent: {
              agent: agentName,
              status: 'completed',
              output_summary: jsonStr.substring(0, 200),
            },
          });
        }
      }

      // Remove processed block from buffer
      this.buffer = this.buffer.substring(agentEndIdx + AGENT_END.length);
    }

    // Extract final result block
    const resultStartIdx = this.buffer.indexOf(RESULT_START);
    if (resultStartIdx !== -1) {
      const resultEndIdx = this.buffer.indexOf(RESULT_END, resultStartIdx);
      if (resultEndIdx !== -1) {
        const resultJson = this.buffer.substring(
          resultStartIdx + RESULT_START.length,
          resultEndIdx
        ).trim();

        try {
          const result = JSON.parse(resultJson);
          events.push({ type: 'result', result });
        } catch {
          events.push({ type: 'error', error: 'Failed to parse final result JSON' });
        }

        this.buffer = this.buffer.substring(resultEndIdx + RESULT_END.length);
      }
    }

    return events;
  }

  /**
   * Try to extract a valid JSON result from whatever is in the buffer.
   * Used as a fallback when the stream ends without proper delimiters.
   */
  extractFallbackResult(): AnalysisResult | null {
    try {
      // Try to find JSON in the buffer
      const jsonMatch = this.buffer.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // ignore
    }
    return null;
  }

  reset() {
    this.buffer = '';
  }
}
