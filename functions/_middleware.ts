// Cloudflare Pages middleware — runs at the edge for every request.
//
// Why this exists: algoglyph.com and www.algoglyph.com are two separate
// origins, so the app's IndexedDB/localStorage (it is local-first) is NOT
// shared between them — data saved on one is invisible on the other. We
// canonicalize on the apex domain so there is a single storage origin.
//
// This lives in a Pages Function instead of public/_redirects on purpose:
// `_redirects` matches on request PATH, not host, so a www->apex rule there
// never fires (both custom domains serve the same bundle directly). A
// middleware sees the real Host header and can redirect reliably.

interface MiddlewareContext {
  request: Request;
  next: () => Promise<Response>;
}

const CANONICAL_HOST = 'algoglyph.com';
const REDIRECT_HOSTS = new Set(['www.algoglyph.com']);

export async function onRequest(context: MiddlewareContext): Promise<Response> {
  const url = new URL(context.request.url);
  if (REDIRECT_HOSTS.has(url.hostname)) {
    url.hostname = CANONICAL_HOST;
    // 301 permanent: path + query are preserved by reusing the URL object.
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
