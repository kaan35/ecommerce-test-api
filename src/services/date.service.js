class DateService {
  #timezone;

  constructor() {
    this.#timezone = "UTC";
  }

  // Current time methods
  now() {
    return this.format();
  }

  timestamp() {
    return Date.now();
  }

  toISOString(date = new Date()) {
    return date.toISOString();
  }

  // Conversion methods
  fromTimestamp(timestamp) {
    return new Date(timestamp);
  }

  fromISOString(isoString) {
    return new Date(isoString);
  }

  fromString(dateString, format = "YYYY-MM-DD") {
    const normalizedFormat = format.toUpperCase();
    const parts = dateString.split(/[-/\s:]/);
    const formatParts = normalizedFormat.split(/[-/\s:]/);
    const dateObj = new Date(0);

    formatParts.forEach((formatPart, index) => {
      const value = parseInt(parts[index], 10);
      switch (formatPart) {
        case "YYYY":
          dateObj.setFullYear(value);
          break;
        case "MM":
          dateObj.setMonth(value - 1);
          break;
        case "DD":
          dateObj.setDate(value);
          break;
        case "HH":
          dateObj.setHours(value);
          break;
        case "mm":
          dateObj.setMinutes(value);
          break;
        case "ss":
          dateObj.setSeconds(value);
          break;
        case "ms":
          dateObj.setMilliseconds(value);
          break;
      }
    });

    return dateObj;
  }

  // Formatting methods
  format(date = new Date(), format = "DD-MM-YYYY HH:mm:ss") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    return format
      .replace("YYYY", year)
      .replace("MM", month)
      .replace("DD", day)
      .replace("HH", hours)
      .replace("mm", minutes)
      .replace("ss", seconds)
      .replace("ms", milliseconds);
  }

  // Duration methods
  duration(start, end = this.now()) {
    const diff = end - (typeof start === "number" ? start : start.getTime());
    return {
      milliseconds: diff,
      seconds: Math.floor(diff / 1000),
      minutes: Math.floor(diff / (1000 * 60)),
      hours: Math.floor(diff / (1000 * 60 * 60)),
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    };
  }

  durationString(start, end = this.now()) {
    const dur = this.duration(start, end);
    if (dur.days > 0) return `${dur.days}d`;
    if (dur.hours > 0) return `${dur.hours}h`;
    if (dur.minutes > 0) return `${dur.minutes}m`;
    if (dur.seconds > 0) return `${dur.seconds}s`;
    return `${dur.milliseconds}ms`;
  }

  // Comparison methods
  isBefore(date1, date2 = this.now()) {
    return date1 < date2;
  }

  isAfter(date1, date2 = this.now()) {
    return date1 > date2;
  }

  isSameDay(date1, date2 = this.now()) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Manipulation methods
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  addHours(date, hours) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds * 1000);
  }

  // Utility methods
  startOfDay(date = this.now()) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  endOfDay(date = this.now()) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  startOfMonth(date = this.now()) {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  endOfMonth(date = this.now()) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  // Validation methods
  isValid(date) {
    return date instanceof Date && !isNaN(date);
  }

  isPast(date) {
    return this.isBefore(date);
  }

  isFuture(date) {
    return this.isAfter(date);
  }
}

export const dateService = new DateService();
