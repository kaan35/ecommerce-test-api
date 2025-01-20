/** Milliseconds per time unit */
export const MS_PER_UNIT = {
  days: 86400000, // 24 * 60 * 60 * 1000
  hours: 3600000, // 60 * 60 * 1000
  minutes: 60000, // 60 * 1000
  seconds: 1000,
} as const;

/** Date formatters using en-GB locale */
export const DATE_FORMATTERS = {
  date: (d: Date) => d.toLocaleDateString('en-GB'),
  time: (d: Date) => d.toLocaleTimeString('en-GB'),
  datetime: (d: Date) => d.toLocaleString('en-GB'),
  timestamp: (d: Date) => d.toISOString(),
} as const;

/** Date pattern formatters */
export const DATE_PATTERNS = {
  YYYY: (d: Date) => d.getFullYear(),
  MM: (d: Date) => String(d.getMonth() + 1).padStart(2, '0'),
  DD: (d: Date) => String(d.getDate()).padStart(2, '0'),
  HH: (d: Date) => String(d.getHours()).padStart(2, '0'),
  mm: (d: Date) => String(d.getMinutes()).padStart(2, '0'),
  ss: (d: Date) => String(d.getSeconds()).padStart(2, '0'),
} as const;
