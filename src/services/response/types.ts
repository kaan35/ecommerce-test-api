import { STATUS_CODES } from './constants';

export type ResponseStatus = 'success' | 'error';

export type ResponseData = {
  message?: string;
  status?: string;
  data?: unknown;
};

/** Type for status codes derived from the constant */
export type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];
