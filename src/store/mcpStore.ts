import { create } from 'zustand';
import {
  DEFAULT_MCP_CONNECTOR_ENDPOINT,
  MCP_CONNECTOR_STORAGE_KEY,
  type McpConnectionState,
  type McpConnectorCatalog,
  type McpConnectorHealth,
} from '../lib/mcp/types';

interface McpConnectorStorage {
  version: 1;
  endpoint: string;
}

const readConnectorEndpoint = (): string => {
  if (typeof window === 'undefined') return DEFAULT_MCP_CONNECTOR_ENDPOINT;

  try {
    const raw = window.localStorage.getItem(MCP_CONNECTOR_STORAGE_KEY);
    if (!raw) return DEFAULT_MCP_CONNECTOR_ENDPOINT;
    const parsed = JSON.parse(raw) as Partial<McpConnectorStorage>;
    if (parsed.version === 1 && typeof parsed.endpoint === 'string' && parsed.endpoint.trim()) {
      return parsed.endpoint;
    }
  } catch {
    // A malformed local setting should never block the workspace from loading.
  }

  return DEFAULT_MCP_CONNECTOR_ENDPOINT;
};

const persistConnectorEndpoint = (endpoint: string) => {
  if (typeof window === 'undefined') return;

  try {
    const payload: McpConnectorStorage = { version: 1, endpoint };
    window.localStorage.setItem(MCP_CONNECTOR_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // The connector remains usable for this session when local storage is unavailable.
  }
};

// The connector token lives in sessionStorage (per-tab, cleared when the tab
// closes) — not localStorage — so a page refresh keeps the live connection
// without persisting a credential to disk long-term.
const MCP_CONNECTOR_TOKEN_KEY = 'algoglyph-mcp-connector-token';

const readConnectorToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(MCP_CONNECTOR_TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

const persistConnectorToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.sessionStorage.setItem(MCP_CONNECTOR_TOKEN_KEY, token);
    else window.sessionStorage.removeItem(MCP_CONNECTOR_TOKEN_KEY);
  } catch {
    // A non-persisted token still works for the current page lifetime.
  }
};

// Which detected CLI powers the AI features (canvas + notes). A plain preference,
// so it persists in localStorage.
const MCP_ACTIVE_AGENT_KEY = 'algoglyph-mcp-active-agent';
const PREFERRED_AGENT_ORDER = ['claude', 'codex', 'antigravity'];

const readActiveAgentId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(MCP_ACTIVE_AGENT_KEY) || null;
  } catch {
    return null;
  }
};

const persistActiveAgentId = (agentId: string | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (agentId) window.localStorage.setItem(MCP_ACTIVE_AGENT_KEY, agentId);
    else window.localStorage.removeItem(MCP_ACTIVE_AGENT_KEY);
  } catch {
    // Selection still applies for the session if storage is unavailable.
  }
};

// Keep the current choice if it is still installed; otherwise fall back to the
// most preferred available agent (Claude Code first).
const resolveActiveAgent = (catalog: McpConnectorCatalog | null, current: string | null): string | null => {
  if (!catalog) return current;
  const available = catalog.agents.filter((agent) => agent.available);
  if (current && available.some((agent) => agent.id === current)) return current;
  for (const id of PREFERRED_AGENT_ORDER) {
    if (available.some((agent) => agent.id === id)) return id;
  }
  return available[0]?.id ?? null;
};

interface McpAgentRunState {
  agentId: string;
  status: 'running' | 'done' | 'error';
  output: string;
  error: string | null;
  exitCode: number | null;
}

interface McpStoreState {
  mcpPanelOpen: boolean;
  connectorEndpoint: string;
  connectionState: McpConnectionState;
  connectorHealth: McpConnectorHealth | null;
  connectorCatalog: McpConnectorCatalog | null;
  connectionError: string | null;
  // Held in memory only (never persisted) so canvas AI features can reuse the
  // live connection after the user connects through the dialog.
  connectorToken: string | null;
  // Which CLI powers the AI features; resolved against the catalog when it loads.
  activeAgentId: string | null;
  agentRun: McpAgentRunState | null;
  openMcpPanel: () => void;
  closeMcpPanel: () => void;
  setConnectorEndpoint: (endpoint: string) => void;
  setConnectorToken: (token: string | null) => void;
  setActiveAgentId: (agentId: string) => void;
  setConnectionState: (
    state: McpConnectionState,
    health?: McpConnectorHealth | null,
    catalog?: McpConnectorCatalog | null,
    error?: string | null,
  ) => void;
  startAgentRun: (agentId: string) => void;
  appendAgentOutput: (chunk: string) => void;
  finishAgentRun: (code: number | null) => void;
  failAgentRun: (message: string) => void;
  clearAgentRun: () => void;
}

export const useMcpStore = create<McpStoreState>((set) => ({
  mcpPanelOpen: false,
  connectorEndpoint: readConnectorEndpoint(),
  connectionState: 'idle',
  connectorHealth: null,
  connectorCatalog: null,
  connectionError: null,
  connectorToken: readConnectorToken(),
  activeAgentId: readActiveAgentId(),
  agentRun: null,
  openMcpPanel: () => set({ mcpPanelOpen: true }),
  closeMcpPanel: () => set({ mcpPanelOpen: false }),
  setConnectorEndpoint: (endpoint) => {
    const nextEndpoint = endpoint || DEFAULT_MCP_CONNECTOR_ENDPOINT;
    persistConnectorEndpoint(nextEndpoint);
    set({ connectorEndpoint: nextEndpoint });
  },
  setConnectorToken: (connectorToken) => {
    persistConnectorToken(connectorToken);
    set({ connectorToken });
  },
  setActiveAgentId: (agentId) => {
    persistActiveAgentId(agentId);
    set({ activeAgentId: agentId });
  },
  setConnectionState: (connectionState, connectorHealth = null, connectorCatalog = null, connectionError = null) =>
    set((state) => {
      const activeAgentId = resolveActiveAgent(connectorCatalog, state.activeAgentId);
      if (activeAgentId !== state.activeAgentId) persistActiveAgentId(activeAgentId);
      return { connectionState, connectorHealth, connectorCatalog, connectionError, activeAgentId };
    }),
  startAgentRun: (agentId) =>
    set({ agentRun: { agentId, status: 'running', output: '', error: null, exitCode: null } }),
  appendAgentOutput: (chunk) =>
    set((state) =>
      state.agentRun && state.agentRun.status === 'running'
        ? { agentRun: { ...state.agentRun, output: state.agentRun.output + chunk } }
        : state,
    ),
  finishAgentRun: (exitCode) =>
    set((state) =>
      state.agentRun
        ? {
            // A prior `error` event (e.g. a timeout) wins over the trailing exit.
            agentRun: {
              ...state.agentRun,
              status: state.agentRun.status === 'error' ? 'error' : 'done',
              exitCode,
            },
          }
        : state,
    ),
  failAgentRun: (message) =>
    set((state) =>
      state.agentRun ? { agentRun: { ...state.agentRun, status: 'error', error: message } } : state,
    ),
  clearAgentRun: () => set({ agentRun: null }),
}));
