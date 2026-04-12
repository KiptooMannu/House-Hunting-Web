/**
 * Format a number as Kenyan Shillings.
 */
export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return `KES ${num.toLocaleString('en-KE')}`;
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a datetime string.
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get a CSS class for a status badge.
 */
export function getStatusClass(status) {
  const map = {
    available: 'badge-success',
    booked: 'badge-warning',
    unlisted: 'badge-secondary',
    pending: 'badge-warning',
    confirmed: 'badge-success',
    cancelled: 'badge-danger',
    completed: 'badge-success',
    failed: 'badge-danger',
    filed: 'badge-success',
  };
  return map[status] || 'badge-secondary';
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text to a max length.
 */
export function truncate(str, max = 100) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

/**
 * Robustly extract image URL from house image data (object or string)
 */
export function getHouseImage(imgData, fallback = "https://images.unsplash.com/photo-1518780664697-55e3ad937233") {
  if (!imgData) return fallback;
  if (typeof imgData === 'string') return imgData;
  if (imgData.imageUrl) return imgData.imageUrl;
  if (imgData.url) return imgData.url;
  return fallback;
}
