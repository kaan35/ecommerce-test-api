export interface DateOptions {
  format?: DateFormat;
  timezone?: string;
}

export type DateFormat = 'date' | 'time' | 'datetime' | 'timestamp';

/** Time unit options */
export type DateUnit = 'days' | 'hours' | 'minutes' | 'seconds';
