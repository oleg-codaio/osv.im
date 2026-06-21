export function formatDate(dateStr: string, monthFormat: 'short' | 'long' = 'short') {
  if (!dateStr) return '';
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: monthFormat,
    day: 'numeric',
    timeZone: 'UTC'
  };
  return new Date(dateStr).toLocaleDateString('en-US', options);
}
