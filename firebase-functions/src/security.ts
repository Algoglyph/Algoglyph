import { createHash } from 'node:crypto';
import { getAppCheck } from 'firebase-admin/app-check';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Request } from 'firebase-functions/v2/https';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface AuthenticatedPrincipal {
  uid: string;
  email?: string;
  displayName?: string;
  token: DecodedIdToken;
}

type VerifyIdToken = (idToken: string, checkRevoked: boolean) => Promise<DecodedIdToken>;
type VerifyAppCheckToken = (appCheckToken: string) => Promise<unknown>;

export const sha256 = (value: string | Buffer): string =>
  createHash('sha256').update(value).digest('hex');

export const requireFirebaseUser = async (
  request: Request,
  verifyIdToken: VerifyIdToken = (idToken, checkRevoked) => getAuth().verifyIdToken(idToken, checkRevoked),
): Promise<AuthenticatedPrincipal> => {
  const authorization = request.header('authorization');
  if (!authorization?.startsWith('Bearer ')) throw new HttpError(401, 'Authentication required.');
  const idToken = authorization.slice(7).trim();
  if (!idToken) throw new HttpError(401, 'Authentication required.');

  try {
    const token = await verifyIdToken(idToken, true);
    return {
      uid: token.uid,
      email: typeof token.email === 'string' ? token.email : undefined,
      displayName: typeof token.name === 'string' ? token.name : undefined,
      token,
    };
  } catch {
    throw new HttpError(401, 'Authentication required.');
  }
};

export const requireAppCheck = async (
  request: Request,
  verifyAppCheckToken: VerifyAppCheckToken = (token) => getAppCheck().verifyToken(token),
): Promise<void> => {
  if (process.env.FUNCTIONS_EMULATOR === 'true' && process.env.REQUIRE_EMULATOR_APP_CHECK !== 'true') return;
  const appCheckToken = request.header('x-firebase-appcheck')?.trim();
  if (!appCheckToken) throw new HttpError(401, 'App verification required.');
  try {
    await verifyAppCheckToken(appCheckToken);
  } catch {
    throw new HttpError(401, 'App verification required.');
  }
};

export const allowedOrigins = (): Set<string> => new Set(
  (process.env.ALLOWED_WEB_ORIGINS ?? 'https://algoglyph.com')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      try {
        return new URL(origin).origin;
      } catch {
        return '';
      }
    })
    .filter(Boolean),
);

export const requireVerifiedEmail = (principal: AuthenticatedPrincipal): void => {
  if (!principal.email || principal.token.email_verified !== true) {
    throw new HttpError(403, 'A verified email address is required for billing and managed-agent access.');
  }
};

export const requireRecentAuthentication = (
  principal: AuthenticatedPrincipal,
  maximumAgeSeconds = 10 * 60,
  nowSeconds = Math.floor(Date.now() / 1_000),
): void => {
  const authenticatedAt = principal.token.auth_time;
  if (typeof authenticatedAt !== 'number'
    || !Number.isFinite(authenticatedAt)
    || authenticatedAt > nowSeconds + 60
    || nowSeconds - authenticatedAt > maximumAgeSeconds) {
    throw new HttpError(401, 'Recent authentication required.');
  }
};

export const requireBillingAuthorization = (
  principal: AuthenticatedPrincipal,
  options: { recentAuthentication?: boolean } = {},
): void => {
  requireVerifiedEmail(principal);
  if (options.recentAuthentication) requireRecentAuthentication(principal);
};

export const requirePersonalWorkspaceAccess = (principal: AuthenticatedPrincipal, workspaceId: string): void => {
  if (workspaceId !== `personal_${principal.uid}`) throw new HttpError(403, 'Workspace access denied.');
};

export const requireConfiguredBrowserUrl = (value: string, name: string): string => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new HttpError(503, `${name} is not configured with a valid URL.`);
  }
  const emulatorHttp = process.env.FUNCTIONS_EMULATOR === 'true'
    && parsed.protocol === 'http:'
    && ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !emulatorHttp) {
    throw new HttpError(503, `${name} must use HTTPS outside the local emulator.`);
  }
  if (parsed.username || parsed.password || parsed.hash || !allowedOrigins().has(parsed.origin)) {
    throw new HttpError(503, `${name} must use an explicitly allowed web origin.`);
  }
  return parsed.toString();
};

export const applyBrowserCors = (request: Request, response: {
  setHeader(name: string, value: string): void;
}): void => {
  const origin = request.header('origin');
  if (!origin || !allowedOrigins().has(origin)) throw new HttpError(403, 'Origin is not allowed.');
  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Firebase-AppCheck');
  response.setHeader('Access-Control-Max-Age', '600');
  response.setHeader('Vary', 'Origin');
};

export const assertJsonObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }
  return value as Record<string, unknown>;
};

export const assertExactKeys = (body: Record<string, unknown>, allowedKeys: readonly string[]): void => {
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(body)) {
    if (!allowed.has(key)) throw new HttpError(400, `Unsupported request field: ${key}.`);
  }
};

export const requireRequestBodyWithin = (request: Request, maximumBytes: number): void => {
  const bodyBytes = Buffer.isBuffer(request.rawBody) ? request.rawBody.byteLength : 0;
  if (bodyBytes > maximumBytes) throw new HttpError(413, 'Request body is too large.');
};

export const requireJsonContentType = (request: Request): void => {
  const contentType = request.header('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
  if (contentType !== 'application/json') throw new HttpError(415, 'Content-Type must be application/json.');
};

export const requestIp = (request: Request): string => request.ip || 'unknown';

export const enforceRateLimit = async (
  operation: string,
  principals: readonly string[],
  maximum: number,
  windowSeconds: number,
): Promise<void> => {
  const db = getFirestore();
  const nowMs = Date.now();
  const windowStartMs = Math.floor(nowMs / (windowSeconds * 1_000)) * windowSeconds * 1_000;
  const ids = [...new Set(principals.filter(Boolean))]
    .map((principal) => sha256(`${operation}:${principal}:${windowStartMs}`));

  await db.runTransaction(async (transaction) => {
    const refs = ids.map((id) => db.collection('rateLimits').doc(id));
    const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
    if (snapshots.some((snapshot) => Number(snapshot.data()?.count ?? 0) >= maximum)) {
      throw new HttpError(429, 'Too many requests. Try again later.');
    }
    refs.forEach((ref, index) => {
      const snapshot = snapshots[index];
      transaction.set(ref, {
        operation,
        count: Number(snapshot?.data()?.count ?? 0) + 1,
        windowStart: Timestamp.fromMillis(windowStartMs),
        expiresAt: Timestamp.fromMillis(windowStartMs + windowSeconds * 2_000),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    });
  });
};

export const redactError = (error: unknown): { status: number; message: string } => {
  if (error instanceof HttpError) return { status: error.status, message: error.message };
  return { status: 500, message: 'The request could not be completed.' };
};
