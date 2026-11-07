export interface AnalyticsClient {
  capture: (event: string, properties?: Record<string, unknown>) => unknown;
}

/** Workspace IDs and invite tokens are route data and must not go to analytics. */
export const isPrivateAnalyticsPath = (pathname: string): boolean =>
  /^\/(?:workspace(?:s)?|invite)(?:\/|$)/i.test(pathname);

/** Keep query strings and fragments out of analytics events. */
export const getPublicPageViewProperties = (
  pathname: string,
): Record<string, string> | null => {
  if (typeof window === 'undefined' || isPrivateAnalyticsPath(pathname)) return null;
  return {
    $current_url: `${window.location.origin}${pathname || '/'}`,
    $pathname: pathname || '/',
  };
};

export const capturePublicPageView = (
  client: AnalyticsClient,
  pathname: string,
): void => {
  const properties = getPublicPageViewProperties(pathname);
  if (properties) client.capture('$pageview', properties);
};
