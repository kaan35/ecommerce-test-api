import { randomBytes } from 'crypto';
import { loggerService } from './logger.service.js';

class TokenService {
  #tokens = new Map();
  #config = {
    expiresIn: 3600,
    length: 32,
  };

  generate() {
    try {
      const token = randomBytes(this.#config.length).toString('hex');
      const expiresAt = Date.now() + this.#config.expiresIn * 1000;

      this.#tokens.set(token, expiresAt);
      return token;
    } catch (error) {
      loggerService.error('Token generation failed', error);
      throw error;
    }
  }

  verify(token) {
    const expiresAt = this.#tokens.get(token);
    if (!expiresAt) return false;

    if (Date.now() > expiresAt) {
      this.#tokens.delete(token);
      return false;
    }

    return true;
  }

  revoke(token) {
    return this.#tokens.delete(token);
  }
}

export const tokenService = new TokenService();
