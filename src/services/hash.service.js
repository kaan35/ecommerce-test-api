import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

class HashService {
  #keyLength = 32;
  #saltLength = 16;

  /**
   * Hash a password with a random salt
   * @param {string} password - Password to hash
   * @returns {Promise<string>} - Hashed password with salt
   */
  async create(password) {
    const salt = randomBytes(this.#saltLength).toString("hex");
    const derivedKey = await scryptAsync(password, salt, this.#keyLength);
    return `${salt}:${derivedKey.toString("hex")}`;
  }

  /**
   * Verify a password against a hash
   * @param {string} password - Password to verify
   * @param {string} hash - Hash to verify against
   * @returns {Promise<boolean>} - Whether password matches hash
   */
  async verify(password, hash) {
    const [salt, key] = hash.split(":");
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = await scryptAsync(password, salt, this.#keyLength);
    return timingSafeEqual(keyBuffer, derivedKey);
  }

  /**
   * Generate a random token
   * @param {number} length - Length of token in bytes
   * @returns {string} - Random token
   */
  generateToken(length = 32) {
    return randomBytes(length).toString("hex");
  }
}

// Singleton instance
export const hashService = new HashService();
