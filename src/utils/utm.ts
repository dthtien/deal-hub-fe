export const UTM_PARAMS = {
  utm_source: 'ozvfy',
  utm_medium: 'deals',
  utm_campaign: 'deal_page',
} as const;

export function buildRedirectUrl(baseUrl: string, dealId: number | string): string {
  const params = new URLSearchParams({
    ...UTM_PARAMS,
  });
  return `${baseUrl}/api/v1/deals/${dealId}/redirect?${params.toString()}`;
}

export function appendUtmToUrl(url: string): string {
  if (!url || url === '#') return url;
  try {
    const u = new URL(url);
    Object.entries(UTM_PARAMS).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.toString();
  } catch {
    return url;
  }
}
