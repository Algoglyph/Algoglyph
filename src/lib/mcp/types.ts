export const DEFAULT_MCP_CONNECTOR_ENDPOINT = 'http://127.0.0.1:4319';
export const MCP_CONNECTOR_STORAGE_KEY = 'algoglyph-mcp-connector-v1';

export type McpConnectionState =
  | 'idle'
  | 'checking'
  | 'ready'
  | 'needs-token'
  | 'error';

export interface McpConnectorHealth {
  service: 'algoglyph-local-connector';
  version: string;
  protocolVersion: number;
  requiresToken: boolean;
}

export interface McpAgentStatus {
  id: string;
  label: string;
  command: string;
  available: boolean;
  version?: string;
}

export interface McpConnectorCatalog {
  agents: McpAgentStatus[];
  capabilities: {
    remoteMcpTest: boolean;
    agentExecution: boolean;
  };
}

export interface McpToolSummary {
  name: string;
  title?: string;
  description?: string;
}

export interface McpServerTestResult {
  transport: 'streamable-http' | 'sse';
  server: {
    name: string;
    version?: string;
  };
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
  };
  tools: McpToolSummary[];
}

export interface McpConnectorSnapshot {
  health: McpConnectorHealth;
  catalog: McpConnectorCatalog | null;
}

export interface McpAgentRunRequest {
  agentId: string;
  prompt: string;
  // Optional MCP server to expose to the agent, reusing the test-server shape.
  mcpServer?: { endpoint: string; accessToken?: string };
}

export type McpAgentRunEvent =
  | { type: 'output'; stream: 'stdout' | 'stderr'; chunk: string }
  | { type: 'exit'; code: number | null }
  | { type: 'error'; message: string };
