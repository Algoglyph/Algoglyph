import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  CircleAlert,
  Cpu,
  KeyRound,
  Loader2,
  PlugZap,
  RefreshCw,
  Server,
  Terminal,
  X,
} from 'lucide-react';
import {
  McpConnectorRequestError,
  inspectMcpConnector,
  normalizeConnectorEndpoint,
  testMcpServer,
} from '../lib/mcp/connectorClient';
import type { McpServerTestResult } from '../lib/mcp/types';
import { useMcpStore } from '../store/mcpStore';

// Inputs stay monochrome: a white (ink) border on focus, never the blue accent.
const inputClassName =
  'h-9 w-full rounded-md border border-hairline bg-canvas px-2.5 font-mono text-xs text-ink outline-none transition-colors placeholder:text-mute focus:border-ink';

const errorMessage = (error: unknown): string => {
  if (error instanceof McpConnectorRequestError) return error.message;
  return 'The connector request could not be completed.';
};

const resultLabel = (result: McpServerTestResult): string => {
  const parts = [];
  if (result.capabilities.tools) parts.push(`${result.tools.length} tools`);
  if (result.capabilities.resources) parts.push('resources');
  if (result.capabilities.prompts) parts.push('prompts');
  return parts.length ? parts.join(' · ') : 'No advertised capabilities';
};

const endpointHost = (endpoint: string): string => {
  try {
    return new URL(endpoint).host;
  } catch {
    return endpoint;
  }
};

export const McpConnectDialog: React.FC = () => {
  const isOpen = useMcpStore((state) => state.mcpPanelOpen);
  const connectorEndpoint = useMcpStore((state) => state.connectorEndpoint);
  const connectionState = useMcpStore((state) => state.connectionState);
  const connectorHealth = useMcpStore((state) => state.connectorHealth);
  const connectorCatalog = useMcpStore((state) => state.connectorCatalog);
  const connectionError = useMcpStore((state) => state.connectionError);
  const activeAgentId = useMcpStore((state) => state.activeAgentId);
  const closeMcpPanel = useMcpStore((state) => state.closeMcpPanel);
  const setConnectorEndpoint = useMcpStore((state) => state.setConnectorEndpoint);
  const setConnectionState = useMcpStore((state) => state.setConnectionState);
  const setStoredConnectorToken = useMcpStore((state) => state.setConnectorToken);
  const setActiveAgentId = useMcpStore((state) => state.setActiveAgentId);

  const endpointInputRef = useRef<HTMLInputElement>(null);
  // Seed from any token adopted via the one-click link / remembered this session,
  // so "Check connector" reuses it instead of forcing a re-paste.
  const [connectorToken, setConnectorToken] = useState(() => useMcpStore.getState().connectorToken || '');
  const [editingConnection, setEditingConnection] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [serverEndpoint, setServerEndpoint] = useState('');
  const [serverToken, setServerToken] = useState('');
  const [serverResult, setServerResult] = useState<McpServerTestResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [testingServer, setTestingServer] = useState(false);

  const closeDialog = useCallback(() => {
    setServerToken('');
    setServerResult(null);
    setServerError(null);
    closeMcpPanel();
  }, [closeMcpPanel]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDialog();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeDialog, isOpen]);

  const checkConnector = async () => {
    setConnectionState('checking');
    setServerResult(null);
    setServerError(null);

    try {
      const endpoint = normalizeConnectorEndpoint(connectorEndpoint);
      const snapshot = await inspectMcpConnector(endpoint, connectorToken || undefined);
      setConnectorEndpoint(endpoint);

      if (snapshot.catalog) {
        setConnectionState('ready', snapshot.health, snapshot.catalog);
        setStoredConnectorToken(connectorToken || null);
        setEditingConnection(false);
      } else {
        setConnectionState('needs-token', snapshot.health);
        setStoredConnectorToken(null);
      }
    } catch (error) {
      const message = errorMessage(error);
      if (error instanceof McpConnectorRequestError && error.status === 401) {
        setConnectionState('needs-token', connectorHealth, null, message);
      } else {
        setConnectionState('error', null, null, message);
      }
    }
  };

  const testServer = async () => {
    if (connectionState !== 'ready') {
      setServerError('Connect the local connector before testing an MCP server.');
      return;
    }
    setTestingServer(true);
    setServerError(null);
    setServerResult(null);
    try {
      const result = await testMcpServer(
        connectorEndpoint,
        connectorToken || undefined,
        serverEndpoint,
        serverToken || undefined,
      );
      setServerResult(result);
    } catch (error) {
      setServerError(errorMessage(error));
    } finally {
      setTestingServer(false);
    }
  };

  if (!isOpen) return null;

  const isChecking = connectionState === 'checking';
  const isReady = connectionState === 'ready';
  const showConnectionForm = !isReady || editingConnection;

  const agents = connectorCatalog?.agents ?? [];
  const availableAgents = agents.filter((agent) => agent.available);
  const activeAgent = agents.find((agent) => agent.id === activeAgentId) || null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-3 py-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={closeDialog}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="mcp-connect-title"
        className="max-h-full w-full max-w-md overflow-y-auto rounded-lg border border-hairline bg-canvas shadow-[var(--shadow-modal)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-6 border-b border-hairline px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-body">
              <PlugZap size={15} aria-hidden="true" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">MCP bridge</span>
            </div>
            <h2 id="mcp-connect-title" className="mt-2 text-base font-semibold text-ink">
              Local AI connection
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-md text-body transition-colors hover:bg-canvas-soft hover:text-ink"
            aria-label="Close connection dialog"
            title="Close"
          >
            <X size={16} />
          </button>
        </header>

        <div className="px-5 py-4">
          {/* Connection status */}
          <div className="flex items-center justify-between gap-4">
            {isReady ? (
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />
                <span className="text-sm font-medium text-ink">Connected</span>
                <span className="truncate font-mono text-[11px] text-mute">
                  v{connectorHealth?.version} · {endpointHost(connectorEndpoint)}
                </span>
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-2">
                {connectionState === 'error' && <CircleAlert size={15} className="shrink-0 text-error" aria-hidden="true" />}
                <span className="text-sm font-medium text-ink">
                  {connectionState === 'needs-token'
                    ? 'Token required'
                    : connectionState === 'error'
                      ? 'Not connected'
                      : 'Not connected'}
                </span>
              </div>
            )}
            {isReady && (
              <button
                type="button"
                onClick={() => setEditingConnection((value) => !value)}
                className="shrink-0 text-[11px] font-medium text-body transition-colors hover:text-ink"
              >
                {editingConnection ? 'Hide' : 'Edit'}
              </button>
            )}
          </div>

          {!isReady && (
            <p className="mt-1.5 text-xs leading-5 text-body">
              {connectionState === 'needs-token'
                ? 'Connector found. Paste its token below, or open the Quick connect link it prints.'
                : connectionState === 'error'
                  ? connectionError || 'Connector unavailable.'
                  : 'Run the connector, then open its Quick connect link — no token to paste.'}
            </p>
          )}

          {/* AI agent selector — which CLI powers the AI */}
          {isReady && (
            <section className="mt-5" aria-labelledby="ai-agent-title">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-body" aria-hidden="true" />
                <h3 id="ai-agent-title" className="text-sm font-medium text-ink">
                  AI agent
                </h3>
              </div>
              <p className="mt-1 text-xs leading-5 text-body">
                Powers Ask AI on the canvas and note-making. {activeAgent ? `Using ${activeAgent.label}.` : ''}
              </p>

              {availableAgents.length === 0 ? (
                <p className="mt-3 text-xs text-mute">
                  No CLI detected. Install Codex, Claude Code, or Antigravity and reconnect.
                </p>
              ) : (
                <div className="mt-3 grid gap-1.5" role="radiogroup" aria-label="AI agent">
                  {agents.map((agent) => {
                    const selected = agent.id === activeAgentId;
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={!agent.available}
                        onClick={() => setActiveAgentId(agent.id)}
                        className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                          selected
                            ? 'border-ink bg-canvas-soft'
                            : 'border-hairline hover:border-hairline-strong'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            selected ? 'border-ink' : 'border-hairline-strong'
                          }`}
                          aria-hidden="true"
                        >
                          {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-ink">{agent.label}</span>
                            <span className="font-mono text-[10px] text-mute">{agent.command}</span>
                          </div>
                          {agent.version && (
                            <p className="mt-0.5 truncate font-mono text-[10px] text-mute">{agent.version}</p>
                          )}
                        </div>
                        <span className="shrink-0 font-mono text-[10px] text-mute">
                          {!agent.available ? 'not installed' : selected ? 'active' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Connection settings — collapsed once connected */}
          {showConnectionForm && (
            <form
              className={`grid gap-3 ${isReady ? 'mt-5 border-t border-hairline pt-5' : 'mt-4'}`}
              onSubmit={(event) => {
                event.preventDefault();
                void checkConnector();
              }}
            >
              <label className="grid gap-1.5 text-[11px] font-mono text-body" htmlFor="mcp-connector-endpoint">
                Connector URL
                <input
                  ref={endpointInputRef}
                  id="mcp-connector-endpoint"
                  value={connectorEndpoint}
                  onChange={(event) => setConnectorEndpoint(event.target.value)}
                  className={inputClassName}
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="url"
                />
              </label>

              <label className="grid gap-1.5 text-[11px] font-mono text-body" htmlFor="mcp-connector-token">
                Connector token
                <div className="relative">
                  <KeyRound size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mute" />
                  <input
                    id="mcp-connector-token"
                    type="password"
                    value={connectorToken}
                    onChange={(event) => setConnectorToken(event.target.value)}
                    className={`${inputClassName} pl-8`}
                    placeholder="Session token"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
              </label>

              <p className="-mt-1 text-[11px] leading-4 text-mute">
                Tip: open the <span className="text-body">Quick connect</span> link the connector prints — it fills this in
                and connects automatically.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2 text-[11px] font-mono text-mute">
                  <Terminal size={13} aria-hidden="true" />
                  <code>npm run mcp:connector</code>
                </div>
                <button
                  type="submit"
                  disabled={isChecking}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isChecking ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {isChecking ? 'Checking' : 'Check connector'}
                </button>
              </div>
            </form>
          )}

          {/* Advanced: test an MCP server — collapsed by default */}
          {isReady && (
            <div className="mt-5 border-t border-hairline pt-4">
              <button
                type="button"
                onClick={() => setAdvancedOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-3 text-left"
                aria-expanded={advancedOpen}
              >
                <span className="text-xs font-medium text-body">Advanced · test an MCP server</span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-mute transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {advancedOpen && (
                <div className="mt-4">
                  <form
                    className="grid gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void testServer();
                    }}
                  >
                    <label className="grid gap-1.5 text-[11px] font-mono text-body" htmlFor="mcp-server-endpoint">
                      Server URL
                      <input
                        id="mcp-server-endpoint"
                        value={serverEndpoint}
                        onChange={(event) => setServerEndpoint(event.target.value)}
                        className={inputClassName}
                        placeholder="https://example.com/mcp"
                        spellCheck={false}
                        autoCapitalize="none"
                        autoCorrect="off"
                        inputMode="url"
                      />
                    </label>

                    <label className="grid gap-1.5 text-[11px] font-mono text-body" htmlFor="mcp-server-token">
                      Server token (optional)
                      <input
                        id="mcp-server-token"
                        type="password"
                        value={serverToken}
                        onChange={(event) => setServerToken(event.target.value)}
                        className={inputClassName}
                        placeholder="Bearer token"
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </label>

                    <div className="flex justify-end pt-0.5">
                      <button
                        type="submit"
                        disabled={testingServer}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-hairline px-3 text-xs font-medium text-body transition-colors hover:border-hairline-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {testingServer ? <Loader2 size={14} className="animate-spin" /> : <Server size={14} />}
                        {testingServer ? 'Testing' : 'Test server'}
                      </button>
                    </div>
                  </form>

                  {serverError && (
                    <p className="mt-3 border-l-2 border-error pl-3 text-xs leading-5 text-error">{serverError}</p>
                  )}

                  {serverResult && (
                    <div className="mt-4 rounded-md border border-hairline px-3 py-3">
                      <p className="truncate text-xs font-medium text-ink">
                        {serverResult.server.name}
                        {serverResult.server.version ? ` v${serverResult.server.version}` : ''}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-mute">
                        {serverResult.transport} · {resultLabel(serverResult)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
