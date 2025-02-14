import { DATE_FORMATTERS, DATE_PATTERNS, MS_PER_UNIT } from './constants.ts';
import type { DateFormat, DateUnit } from './types.ts';

/** Date utility service */
class DateService {
  /**
   * Get current date/time in specified format
   * @param format - Format type (default: 'datetime')
   * @example
   * now()              // '11/02/2024, 14:30:45'
   * now('date')        // '11/02/2024'
   * now('time')        // '14:30:45'
   * now('timestamp')   // '2024-02-11T14:30:45.123Z'
   */
  now(format: DateFormat = 'datetime'): string {
    return DATE_FORMATTERS[format](new Date());
  }

  /**
   * Format date using pattern
   * @param date - Date to format (default: now)
   * @param pattern - Format pattern (default: 'DD/MM/YYYY')
   * @example format(new Date(), 'YYYY-MM-DD') // '2024-02-11'
   */
  format(date: Date | number = new Date(), pattern = 'DD/MM/YYYY'): string {
    const d = this.toDate(date);
    return Object.entries(DATE_PATTERNS).reduce(
      (result, [token, fn]) => result.replace(token, String(fn(d))),
      pattern,
    );
  }

  /**
   * Add time to date
   * @param date - Base date
   * @param amount - Amount to add (negative to subtract)
   * @param unit - Time unit
   * @example add(new Date(), 1, 'days') // adds 1 day
   */
  add(date: Date | number, amount: number, unit: DateUnit): Date {
    const d = this.toDate(date);
    return new Date(d.getTime() + amount * MS_PER_UNIT[unit]);
  }

  /**
   * Set time to start of day (00:00:00)
   * @param date - Date to modify (default: now)
   */
  startOf(date: Date | number = new Date()): Date {
    const d = this.toDate(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Set time to end of day (23:59:59.999)
   * @param date - Date to modify (default: now)
   */
  endOf(date: Date | number = new Date()): Date {
    const d = this.toDate(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * Check if date is before another
   * @param date - Date to check
   * @param compareWith - Date to compare against (default: now)
   */
  isBefore(date: Date | number, compareWith: Date | number = new Date()): boolean {
    return this.toTimestamp(date) < this.toTimestamp(compareWith);
  }

  /**
   * Check if date is after another
   * @param date - Date to check
   * @param compareWith - Date to compare against (default: now)
   */
  isAfter(date: Date | number, compareWith: Date | number = new Date()): boolean {
    return this.toTimestamp(date) > this.toTimestamp(compareWith);
  }

  /**
   * Check if value is a valid date
   * @param date - Value to check
   */
  isValid(date: unknown): boolean {
    if (!(date instanceof Date) && typeof date !== 'number' && typeof date !== 'string') {
      return false;
    }
    const timestamp = this.toTimestamp(date as Date | number);
    return !isNaN(timestamp);
  }

  /**
   * Convert datetime to timestamp
   * @param date - Date to convert (default: now)
   * @example toTimestamp('11/02/2024, 14:30:45') // 1707658245000
   */
  toTimestamp(date: Date | number | string = new Date()): number {
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
   * @param timestamp - Unix timestamp in milliseconds
   * @param format - Output format (default: 'datetime')
   * @example fromTimestamp(1707658245000) // '11/02/2024, 14:30:45'
   */
  fromTimestamp(timestamp: number, format: DateFormat = 'datetime'): string | number {
    return DATE_FORMATTERS[format](new Date(timestamp));
  }

  /** Convert value to Date object */
  private toDate(date: Date | number): Date {
    return date instanceof Date ? date : new Date(date);
  }
}

/** Singleton date service instance */
export const dateService = new DateService();
