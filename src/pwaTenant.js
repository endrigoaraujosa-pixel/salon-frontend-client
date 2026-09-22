// Capture the original link before the router removes its query string.
export function pwaTenant(location) {
  const query = new URLSearchParams(location.search).get('loja');
  const path = location.pathname.match(/^\/loja=([a-zA-Z0-9_-]{1,63})(?:\/|$)/)?.[1] || '';
  const parts = location.hostname.split('.');
  const host = parts.length > 1 && !['localhost', 'www', 'admin', 'agendamento'].includes(parts[0]) ? parts[0] : '';
  const tenant = path || query || host;
  return /^[a-zA-Z0-9_-]{1,63}$/.test(tenant) ? tenant : '';
}
// Keep the store in the path, including after navigation/reload. Installation
// must not depend on a query string that a router can remove.
export function bookingBasePath(location) {
  const tenant = pwaTenant(location);
  return tenant ? `/loja=${encodeURIComponent(tenant)}` : '/';
}

export function prepareBookingLocation(browser) {
  const tenant = pwaTenant(browser.location);
  if (!tenant) return '';
  const base = bookingBasePath(browser.location);
  const url = new URL(browser.location.href);
  if (url.pathname !== base && !url.pathname.startsWith(`${base}/`)) {
    url.pathname = `${base}${url.pathname}`;
  } else if (url.pathname === base) {
    url.pathname += '/';
  }
  url.searchParams.delete('loja');
  browser.history.replaceState(browser.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  return tenant;
}
export function configureBookingManifest() {
  const tenant = pwaTenant(window.location);
  const link = document.getElementById('manifest-link');
  if (link && tenant) link.href = `/manifest.json?loja=${encodeURIComponent(tenant)}`;
}
