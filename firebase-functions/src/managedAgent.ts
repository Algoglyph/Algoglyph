import { HttpError } from './security.js';

const MAX_MANAGED_AGENT_OUTPUT_BYTES = 512 * 1024;

const configuredEndpoint = (value: string): URL => {
  let endpoint: URL;
  try {
    endpoint = new URL(value);
  } catch {
    throw new HttpError(503, 'The managed-agent provider is not configured.');
  }
  const emulatorLoopback = process.env.FUNCTIONS_EMULATOR === 'true'
    && endpoint.protocol === 'http:'
    && ['localhost', '127.0.0.1', '::1'].includes(endpoint.hostname);
  if (endpoint.protocol !== 'https:' && !emulatorLoopback) {
    throw new HttpError(503, 'The managed-agent provider must use HTTPS.');
  }
  if (endpoint.username || endpoint.password || endpoint.hash) {
    throw new HttpError(503, 'The managed-agent provider URL is invalid.');
  }
  return endpoint;
};

const outputFrom = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices)) return null;
  const first = choices[0];
  if (!first || typeof first !== 'object') return null;
  const message = (first as { message?: unknown }).message;
  if (!message || typeof message !== 'object') return null;
  const content = (message as { content?: unknown }).content;
  return typeof content === 'string' && content.trim() ? content : null;
};

export const runManagedAgent = async (options: {
  endpoint: string;
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<string> => {
  const endpoint = configuredEndpoint(options.endpoint);
  if (!options.apiKey.trim() || !options.model.trim()) {
    throw new HttpError(503, 'The managed-agent provider is not configured.');
  }
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: [{ role: 'user', content: options.prompt }],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    throw new HttpError(502, 'The managed-agent provider could not be reached.');
  }
  const raw = await response.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_MANAGED_AGENT_OUTPUT_BYTES) {
    throw new HttpError(502, 'The managed-agent provider returned too much data.');
  }
  let payload: unknown;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    throw new HttpError(502, 'The managed-agent provider returned an invalid response.');
  }
  if (!response.ok) throw new HttpError(502, 'The managed-agent provider rejected the request.');
  const output = outputFrom(payload);
  if (!output) throw new HttpError(502, 'The managed-agent provider returned no usable output.');
  return output;
};
