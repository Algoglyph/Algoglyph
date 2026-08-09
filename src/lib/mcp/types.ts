export const DEFAULT_MCP_CONNECTOR_ENDPOINT = 'http://127.0.0.1:4319';
export const MCP_CONNECTOR_STORAGE_KEY = 'algoglyph-mcp-connector-v1';

export type McpConnectionState =
  | 'idle'
  | 'searching'
  | 'checking'
  | 'pairing'
  | 'ready'
  | 'needs-token'
  | 'not-found'
  | 'error';

export interface McpConnectorHealth {
  service: 'algoglyph-local-connector';
  status?: 'ready';
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
  inputSchema?: Record<string, unknown>;
}

export interface McpResourceSummary {
  uri: string;
  name?: string;
  title?: string;
  description?: string;
  mimeType?: string;
}

export interface McpPromptSummary {
  name: string;
  title?: string;
  description?: string;
  arguments?: Array<Record<string, unknown>>;
}

export interface McpServerTestResult {
  serverId: string;
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
  resources: McpResourceSummary[];
  prompts: McpPromptSummary[];
  truncated: boolean;
}

export interface McpConnectorSnapshot {
  health: McpConnectorHealth;
  catalog: McpConnectorCatalog | null;
}

export interface McpPairingCredential {
  pairingToken: string;
  expiresAt: string;
  ttlSeconds: number;
  scopes: McpSessionScope[];
}

export type McpSessionScope = 'catalog:read' | 'mcp:test' | 'mcp:invoke' | 'agent:run' | 'session:revoke';

export interface McpConnectorSession {
  sessionToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  idleTimeoutSeconds: number;
  scopes: McpSessionScope[];
}

export interface McpPairedConnectorSnapshot extends McpConnectorSnapshot {
  sessionToken: string;
  catalog: McpConnectorCatalog;
}

export interface McpAgentRunRequest {
  agentId: string;
  prompt: string;
  /** Coalesce process chunks when the caller only needs the completed result. */
  outputMode?: 'stream' | 'buffered';
  /** Connector-side ID returned only after a successful server test. */
  mcpServerId?: string;
}

export type McpAgentRunEvent =
  | { type: 'output'; stream: 'stdout' | 'stderr'; chunk: string }
  | { type: 'exit'; code: number | null }
  | { type: 'error'; message: string };
