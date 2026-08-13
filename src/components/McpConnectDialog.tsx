import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  CircleAlert,
  Copy,
  Cpu,
  KeyRound,
  PlugZap,
  RefreshCw,
  Server,
  Terminal,
  Unplug,
  X,
} from 'lucide-react';
import {
  McpConnectorRequestError,
  inspectMcpConnector,
  invokeMcpTool,
  normalizeConnectorEndpoint,
  pairMcpConnector,
  revokeMcpConnectorSession,
  testMcpServer,
} from '../lib/mcp/connectorClient';
import type { McpServerTestResult } from '../lib/mcp/types';
import { useMcpStore } from '../store/mcpStore';
import { LoadingSpinner } from './LoadingSpinner';

const inputClassName =
  'h-9 w-full rounded-md border border-hairline bg-canvas px-2.5 font-mono text-xs text-ink outline-none transition-colors placeholder:text-mute focus:border-ink';

const connectorCommand = (): string => {
  if (typeof window === 'undefined') return 'npx @algoglyph/mcp-connector';
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1'
    ? 'npm run mcp:connector'
    : 'npx @algoglyph/mcp-connector';
};

const errorMessage = (error: unknown): string => {
  if (error instanceof McpConnectorRequestError) return error.message;
  return 'The connector request could not be completed.';
};

const resultLabel = (result: McpServerTestResult): string => {
  const parts = [];
  if (result.capabilities.tools) parts.push(`${result.tools.length} tools`);
  if (result.capabilities.resources) parts.push('resources');
  if (result.capabilities.prompts) parts.push('prompts');
  return parts.length ? parts.join(' / ') : 'No advertised capabilities';
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
  const [connectorToken, setConnectorToken] = useState(() => useMcpStore.getState().connectorToken || '');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [serverEndpoint, setServerEndpoint] = useState('');
  const [serverToken, setServerToken] = useState('');
  const [allowPrivateNetwork, setAllowPrivateNetwork] = useState(false);
  const [toolName, setToolName] = useState('');
  const [toolArguments, setToolArguments] = useState('{}');
  const [toolResult, setToolResult] = useState<string | null>(null);
  const [serverResult, setServerResult] = useState<McpServerTestResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [testingServer, setTestingServer] = useState(false);
  const clearSessionOwnedUi = useCallback(() => {
    setServerToken('');
    setServerResult(null);
    setServerError(null);
    setToolName('');
    setToolArguments('{}');
    setToolResult(null);
  }, []);
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

  useEffect(() => useMcpStore.subscribe((state, previousState) => {
    if (state.connectorToken === previousState.connectorToken) return;
    setConnectorToken(state.connectorToken || '');
    clearSessionOwnedUi();
  }), [clearSessionOwnedUi]);

  useEffect(() => {
    const initialState = useMcpStore.getState();
    if (!isOpen || initialState.connectionState === 'ready') return;

    let cancelled = false;
    let timer: number | undefined;
    let attempt = 0;

    const schedule = () => {
      const delay = attempt < 8 ? 1500 : 4000;
      timer = window.setTimeout(() => void connect(), delay);
    };

    const connect = async () => {
      attempt += 1;
      setServerResult(null);
      setServerError(null);

      try {
        const endpoint = normalizeConnectorEndpoint(connectorEndpoint);
        setConnectionState(attempt === 1 ? 'searching' : 'checking');
        const snapshot = await pairMcpConnector(endpoint);
        if (cancelled) return;
        setConnectorEndpoint(endpoint);
        setStoredConnectorToken(snapshot.session.sessionToken, snapshot.session);
        setConnectorToken(snapshot.session.sessionToken);
        setConnectionState('ready', snapshot.health, snapshot.catalog);
        setEditingConnection(false);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof McpConnectorRequestError && error.status === 404) {
          setConnectionState('needs-token', connectorHealth, null, 'Connector detected, but it does not support automatic pairing yet.');
          return;
        }
        const message = errorMessage(error);
        const isReachabilityError = message === 'Could not reach the local connector.' || message === 'The connector did not respond in time.';
        setConnectionState(isReachabilityError ? 'not-found' : 'error', null, null, message);
        if (isReachabilityError) schedule();
      }
    };

    void connect();

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [connectorEndpoint, connectorHealth, isOpen, setConnectionState, setConnectorEndpoint, setStoredConnectorToken]);

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
        setStoredConnectorToken(null);
        setConnectorToken('');
        clearSessionOwnedUi();
        setConnectionState('needs-token', connectorHealth, null, message);
      } else {
        setConnectionState('error', null, null, message);
      }
    }
  };

  const disconnectConnector = async () => {
    const token = useMcpStore.getState().connectorToken || connectorToken;
    try {
      await revokeMcpConnectorSession(connectorEndpoint, token || undefined);
    } catch {
      // Local disconnect should still clear the browser-side session if revoke fails.
    } finally {
      setStoredConnectorToken(null);
      setConnectorToken('');
      clearSessionOwnedUi();
      setConnectionState('idle');
      setEditingConnection(false);
    }
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(connectorCommand());
      setCopiedCommand(true);
      window.setTimeout(() => setCopiedCommand(false), 1500);
    } catch {
      setCopiedCommand(false);
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
        useMcpStore.getState().connectorToken || undefined,
        serverEndpoint,
        serverToken || undefined,
        allowPrivateNetwork,
      );
      setServerResult(result);
      setToolName(result.tools[0]?.name || '');
    } catch (error) {
      if (error instanceof McpConnectorRequestError && error.status === 401) {
        setStoredConnectorToken(null);
        setConnectorToken('');
        clearSessionOwnedUi();
      }
      setServerError(errorMessage(error));
    } finally {
      setTestingServer(false);
    }
  };

  const invokeTool = async () => {
    if (!serverResult || !toolName) return;
    let args: Record<string, unknown>;
    try {
      const parsed = JSON.parse(toolArguments) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
      args = parsed as Record<string, unknown>;
    } catch {
      setServerError('Tool arguments must be a JSON object.');
      return;
    }
    const preview = `${toolName}\n${JSON.stringify(args, null, 2)}`;
    if (!window.confirm(`Invoke this MCP tool with exactly these arguments?\n\n${preview}`)) return;
    try {
      setServerError(null);
      const token = useMcpStore.getState().connectorToken;
      if (!token) throw new McpConnectorRequestError('The connector session is no longer available.');
      const result = await invokeMcpTool(connectorEndpoint, token, serverResult.serverId, toolName, args);
      setToolResult(JSON.stringify(result, null, 2));
    } catch (error) {
      if (error instanceof McpConnectorRequestError && error.status === 401) {
        setStoredConnectorToken(null);
        setConnectorToken('');
        clearSessionOwnedUi();
      }
      setServerError(errorMessage(error));
    }
  };

  if (!isOpen) return null;

  const isReady = connectionState === 'ready';
  const isSearching = connectionState === 'searching' || connectionState === 'checking' || connectionState === 'pairing';
  const showManualConnectionForm = advancedOpen || editingConnection || connectionState === 'needs-token';
  const agents = connectorCatalog?.agents ?? [];
  const availableAgents = agents.filter((agent) => agent.available);
  const activeAgent = agents.find((agent) => agent.id === activeAgentId) || null;

  const statusTitle = isReady
    ? 'Local Agent Connected'
    : connectionState === 'not-found'
      ? 'Local connector not running'
      : connectionState === 'needs-token'
        ? 'Connector detected'
        : connectionState === 'error'
          ? 'Connection needs attention'
          : 'Looking for AlgoGlyph Connector...';

  const statusDescription = isReady
    ? `Connected to ${endpointHost(connectorEndpoint)}${connectorHealth?.version ? ` / v${connectorHealth.version}` : ''}`
    : connectionState === 'needs-token'
      ? connectionError || 'Automatic pairing is unavailable for this connector. Use Advanced to connect manually.'
      : connectionState === 'error'
        ? connectionError || 'The connector request failed.'
        : connectionState === 'not-found'
          ? 'Start the connector locally. This page will connect as soon as it appears.'
          : 'Searching localhost and pairing automatically when the connector is ready.';

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
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">Local AI Agent</span>
            </div>
            <h2 id="mcp-connect-title" className="mt-2 text-base font-semibold text-ink">
              {statusTitle}
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
          <div className="flex items-start gap-3">
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                isReady ? 'bg-ink' : connectionState === 'error' ? 'bg-error' : isSearching ? 'bg-mute animate-pulse' : 'bg-mute/70'
              }`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{statusTitle}</p>
              <p className="mt-1 text-xs leading-5 text-body">{statusDescription}</p>
            </div>
            {connectionState === 'error' && <CircleAlert size={16} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />}
            {isSearching && <LoadingSpinner size={16} className="mt-0.5" />}
          </div>

          {!isReady && (
            <section className="mt-5 rounded-md border border-hairline bg-canvas-soft/45 px-3 py-3" aria-label="Start connector">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink">Start the AlgoGlyph Connector</p>
                  <div className="mt-2 flex min-w-0 items-center gap-2 rounded-md border border-hairline bg-canvas px-2.5 py-2">
                    <Terminal size={13} className="shrink-0 text-body" aria-hidden="true" />
                    <code className="truncate font-mono text-[11px] text-ink">{connectorCommand()}</code>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void copyCommand()}
                  className="mt-6 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-hairline px-2.5 text-[11px] font-medium text-body transition-colors hover:border-hairline-strong hover:text-ink"
                >
                  <Copy size={13} />
                  {copiedCommand ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-mute">Waiting for connector...</p>
            </section>
          )}

          {isReady && (
            <section className="mt-5" aria-labelledby="ai-agent-title">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-body" aria-hidden="true" />
                <h3 id="ai-agent-title" className="text-sm font-medium text-ink">AI agent</h3>
              </div>
              <p className="mt-1 text-xs leading-5 text-body">
                Powers Ask AI on the canvas and note-making. {activeAgent ? `Using ${activeAgent.label}.` : ''}
              </p>

              {availableAgents.length === 0 ? (
                <p className="mt-3 text-xs text-mute">No CLI detected. Install Codex, Claude Code, or Antigravity and reconnect.</p>
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
                          selected ? 'border-ink bg-canvas-soft' : 'border-hairline hover:border-hairline-strong'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-ink' : 'border-hairline-strong'}`}
                          aria-hidden="true"
                        >
                          {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-ink">{agent.label}</span>
                            <span className="font-mono text-[10px] text-mute">{agent.command}</span>
                          </div>
                          {agent.version && <p className="mt-0.5 truncate font-mono text-[10px] text-mute">{agent.version}</p>}
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

          <div className="mt-5 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={() => setAdvancedOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-3 text-left"
              aria-expanded={advancedOpen}
            >
              <span className="text-xs font-medium text-body">Advanced settings</span>
              <ChevronDown
                size={15}
                className={`shrink-0 text-mute transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {(showManualConnectionForm || advancedOpen) && (
              <div className="mt-4 grid gap-4">
                <form
                  className="grid gap-3"
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
                    Manual token / session
                    <div className="relative">
                      <KeyRound size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mute" />
                      <input
                        id="mcp-connector-token"
                        type="password"
                        value={connectorToken}
                        onChange={(event) => setConnectorToken(event.target.value)}
                        className={`${inputClassName} pl-8`}
                        placeholder="Fallback token"
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </div>
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                    {isReady ? (
                      <button
                        type="button"
                        onClick={() => void disconnectConnector()}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-hairline px-3 text-xs font-medium text-body transition-colors hover:border-hairline-strong hover:text-ink"
                      >
                        <Unplug size={14} />
                        Disconnect
                      </button>
                    ) : (
                      <span className="text-[11px] leading-4 text-mute">Use this only if automatic pairing is unavailable.</span>
                    )}
                    <button
                      type="submit"
                      disabled={connectionState === 'checking'}
                      className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {connectionState === 'checking' ? <LoadingSpinner size={14} inverted /> : <RefreshCw size={14} />}
                      {connectionState === 'checking' ? 'Checking' : 'Check connector'}
                    </button>
                  </div>
                </form>

                {isReady && (
                  <form
                    className="grid gap-3 border-t border-hairline pt-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void testServer();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Server size={14} className="text-body" aria-hidden="true" />
                      <span className="text-xs font-medium text-body">Test an MCP server</span>
                    </div>
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

                    <label className="flex items-start gap-2 text-[11px] leading-4 text-body">
                      <input
                        type="checkbox"
                        checked={allowPrivateNetwork}
                        onChange={(event) => setAllowPrivateNetwork(event.target.checked)}
                        className="mt-0.5"
                      />
                      Allow a loopback MCP server on this device. Other private, reserved, link-local, and metadata addresses stay blocked.
                    </label>

                    <div className="flex justify-end pt-0.5">
                      <button
                        type="submit"
                        disabled={testingServer}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-hairline px-3 text-xs font-medium text-body transition-colors hover:border-hairline-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {testingServer ? <LoadingSpinner size={14} /> : <Server size={14} />}
                        {testingServer ? 'Testing' : 'Test server'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {serverError && <p className="mt-3 border-l-2 border-error pl-3 text-xs leading-5 text-error">{serverError}</p>}

          {serverResult && (
            <div className="mt-4 rounded-md border border-hairline px-3 py-3">
              <p className="truncate text-xs font-medium text-ink">
                {serverResult.server.name}
                {serverResult.server.version ? ` v${serverResult.server.version}` : ''}
              </p>
              <p className="mt-1 font-mono text-[10px] text-mute">
                {serverResult.transport} / {resultLabel(serverResult)}
              </p>
              {(serverResult.resources.length > 0 || serverResult.prompts.length > 0 || serverResult.tools.length > 0) && (
                <div className="mt-3 grid gap-2 border-t border-hairline pt-3 text-[11px] text-body">
                  {serverResult.tools.map((tool) => (
                    <div key={`tool:${tool.name}`}>
                      <span className="font-mono text-ink">tool / {tool.name}</span>
                      {tool.description && <span className="ml-2 text-mute">{tool.description}</span>}
                    </div>
                  ))}
                  {serverResult.resources.map((resource) => (
                    <div key={`resource:${resource.uri}`}>
                      <span className="font-mono text-ink">resource / {resource.name || resource.uri}</span>
                    </div>
                  ))}
                  {serverResult.prompts.map((prompt) => (
                    <div key={`prompt:${prompt.name}`}>
                      <span className="font-mono text-ink">prompt / {prompt.name}</span>
                    </div>
                  ))}
                  {serverResult.truncated && <p className="text-mute">Results were capped at the connector safety limit.</p>}
                </div>
              )}
              {serverResult.tools.length > 0 && (
                <div className="mt-3 grid gap-2 border-t border-hairline pt-3">
                  <select value={toolName} onChange={(event) => setToolName(event.target.value)} className={inputClassName}>
                    {serverResult.tools.map((tool) => <option key={tool.name} value={tool.name}>{tool.name}</option>)}
                  </select>
                  <textarea
                    value={toolArguments}
                    onChange={(event) => setToolArguments(event.target.value)}
                    className={`${inputClassName} h-24 py-2`}
                    spellCheck={false}
                    aria-label="Exact MCP tool arguments as JSON"
                  />
                  <button
                    type="button"
                    onClick={() => void invokeTool()}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-hairline px-3 text-xs font-medium text-body"
                  >
                    Preview and invoke tool
                  </button>
                  {toolResult && <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-[10px] text-body">{toolResult}</pre>}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
