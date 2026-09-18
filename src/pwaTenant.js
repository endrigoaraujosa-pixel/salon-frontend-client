// Capture the original link before the router removes its query string.
export function pwaTenant(location) {
  const query = new URLSearchParams(location.search).get('loja');
  const path = location.pathname.startsWith('/loja=') ? location.pathname.split('=')[1] : '';
  const parts = location.hostname.split('.');
  const host = parts.length > 1 && !['localhost', 'www', 'admin', 'agendamento'].includes(parts[0]) ? parts[0] : '';
  const tenant = query || path || host;
  return /^[a-zA-Z0-9_-]{1,63}$/.test(tenant) ? tenant : '';
}
export function configureBookingManifest() {
  const tenant = pwaTenant(window.location);
  const link = document.getElementById('manifest-link');
  if (link && tenant) link.href = `/manifest.json?loja=${encodeURIComponent(tenant)}`;
}
