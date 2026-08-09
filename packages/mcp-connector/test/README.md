# MCP connector tests

Run the connector security and regression suite from the repository root:

```bash
npm run test:mcp
```

The integration suite starts the real connector entry point on a temporary
loopback port with an isolated working directory. It exercises the HTTP API as a
browser client and uses an in-process Streamable HTTP MCP fixture for protocol
inspection. It then stops both servers and removes the temporary directory.

A test-only chunked agent fixture verifies that diagram-mode buffering coalesces
multiple process writes into one transport event without contacting installed agents.

## Remediation TODOs

The `security remediation contract` tests intentionally use `test.todo`. They
name the security behavior that later remediation stages must implement without
making Stage 1 lock in today's unsafe behavior. When a stage is implemented, its
TODOs should be replaced with executable positive and negative tests in the same
change.

Tests must never contact public MCP servers, metadata endpoints, or installed AI
agents. Later agent tests should use deterministic fixture executables in the
temporary harness directory.
