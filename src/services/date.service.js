/** @typedef {'date' | 'time' | 'datetime' | 'timestamp' | 'number'} DateFormat */
/** @typedef {'days' | 'hours' | 'minutes' | 'seconds'} DateUnit */

/** @type {const} Milliseconds per time unit */
const MS_PER_UNIT = {
  days: 86400000, // 24 * 60 * 60 * 1000
  hours: 3600000, // 60 * 60 * 1000
  minutes: 60000, // 60 * 1000
  seconds: 1000,
};

/** @type {const} Date formatters using en-GB locale */
const DATE_FORMATTERS = {
  date: (d) => d.toLocaleDateString('en-GB'),
  time: (d) => d.toLocaleTimeString('en-GB'),
  datetime: (d) => d.toLocaleString('en-GB'),
  timestamp: (d) => d.toISOString(),
  number: (d) => d.getTime(),
};

/** @type {const} Date pattern formatters */
const DATE_PATTERNS = {
  YYYY: (d) => d.getFullYear(),
  MM: (d) => String(d.getMonth() + 1).padStart(2, '0'),
  DD: (d) => String(d.getDate()).padStart(2, '0'),
  HH: (d) => String(d.getHours()).padStart(2, '0'),
  mm: (d) => String(d.getMinutes()).padStart(2, '0'),
  ss: (d) => String(d.getSeconds()).padStart(2, '0'),
};

class DateService {
  /**
   * Get current date/time in specified format
   * @param {DateFormat} [format='datetime'] Format type
   * @returns {string | number} Formatted date or timestamp
   * @example
   * now()              // '11/02/2024, 14:30:45'
   * now('date')        // '11/02/2024'
   * now('time')        // '14:30:45'
   * now('timestamp')   // '2024-02-11T14:30:45.123Z'
   * now('number')      // 1707658279123
   */
  now(format = 'datetime') {
    return DATE_FORMATTERS[format](new Date());
  }

  /**
   * Format date using pattern
   * @param {Date | number} [date=new Date()] Date to format
   * @param {string} [pattern='DD/MM/YYYY'] Format pattern
   * @returns {string} Formatted date string
   * @example format(new Date(), 'YYYY-MM-DD') // '2024-02-11'
   */
  format(date = new Date(), pattern = 'DD/MM/YYYY') {
    const d = this.toDate(date);
    return Object.entries(DATE_PATTERNS).reduce(
      (result, [token, fn]) => result.replace(token, String(fn(d))),
      pattern,
    );
  }

  /**
   * Add time to date
   * @param {Date | number} date Base date
   * @param {number} amount Amount to add (negative to subtract)
   * @param {DateUnit} unit Time unit
   * @returns {Date} New date with added time
   * @example add(new Date(), 1, 'days') // adds 1 day
   */
  add(date, amount, unit) {
    const d = this.toDate(date);
    return new Date(d.getTime() + amount * MS_PER_UNIT[unit]);
  }

  /**
   * Set time to start of day (00:00:00)
   * @param {Date | number} [date=new Date()] Date to modify
   * @returns {Date} Date with time set to start of day
   */
  startOf(date = new Date()) {
    const d = this.toDate(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Set time to end of day (23:59:59.999)
   * @param {Date | number} [date=new Date()] Date to modify
   * @returns {Date} Date with time set to end of day
   */
  endOf(date = new Date()) {
    const d = this.toDate(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * Check if date is before another
   * @param {Date | number} date Date to check
   * @param {Date | number} [compareWith=new Date()] Date to compare against
   * @returns {boolean} True if date is before compareWith
   */
  isBefore(date, compareWith = new Date()) {
    return this.toTimestamp(date) < this.toTimestamp(compareWith);
  }

  /**
   * Check if date is after another
   * @param {Date | number} date Date to check
   * @param {Date | number} [compareWith=new Date()] Date to compare against
   * @returns {boolean} True if date is after compareWith
   */
  isAfter(date, compareWith = new Date()) {
    return this.toTimestamp(date) > this.toTimestamp(compareWith);
  }

  /**
   * Check if value is a valid date
   * @param {unknown} date Value to check
   * @returns {boolean} True if value is a valid date
   */
  isValid(date) {
    if (!(date instanceof Date) && typeof date !== 'number' && typeof date !== 'string') {
      return false;
    }
    const timestamp = this.toTimestamp(date);
    return !isNaN(timestamp);
  }

  /**
   * Convert datetime to timestamp
   * @param {Date | number | string} [date=new Date()] Date to convert
   * @returns {number} Unix timestamp in milliseconds
   * @example toTimestamp('11/02/2024, 14:30:45') // 1707658245000
   */
  toTimestamp(date = new Date()) {
    if (typeof date === 'string') {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        throw new Error('Invalid date string format');
      }
      return parsed.getTime();
    }
    return this.toDate(date).getTime();
  }

  /**
   * Convert timestamp to datetime
   * @param {number} timestamp Unix timestamp in milliseconds
   * @param {DateFormat} [format='datetime'] Output format
   * @returns {string | number} Formatted date or timestamp
   * @example fromTimestamp(1707658245000) // '11/02/2024, 14:30:45'
   */
  fromTimestamp(timestamp, format = 'datetime') {
    return DATE_FORMATTERS[format](new Date(timestamp));
  }

  /**
   * Convert value to Date object
   * @param {Date | number} date Value to convert
   * @returns {Date} Date object
   * @private
   */
  toDate(date) {
    return date instanceof Date ? date : new Date(date);
  }
}

/** @type {DateService} Singleton date service instance */
export const dateService = new DateService();
