import bcrypt from "bcrypt";
import { cacheService } from "../../services/cache.service.js";
import { configService } from "../../services/config.service.js";

export class AuthService {
  #config;
  #cacheConfig = {
    ttl: 1800, // 30 minutes
    keys: {
      user: (id) => `user:${id}`,
      session: (id) => `session:${id}`,
    },
  };

  constructor() {
    this.#config = configService.get("auth");
  }

  async register(userData) {
    const { email, password, ...rest } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.#config.saltRounds);

    // Create user in database
    const user = await this.#createUser({
      email,
      password: hashedPassword,
      ...rest,
    });

    // Cache user data
    const { password: _, ...userWithoutPassword } = user;
    await cacheService.set(
      this.#cacheConfig.keys.user(user.id),
      userWithoutPassword,
      this.#cacheConfig.ttl,
    );

    return userWithoutPassword;
  }

  async login(email, password) {
    // Get user from database
    const user = await this.#findUserByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // Create session
    const session = await this.#createSession(user.id);

    // Cache session
    await cacheService.set(
      this.#cacheConfig.keys.session(session.id),
      session,
      this.#cacheConfig.ttl,
    );

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      session,
    };
  }

  async logout(userId) {
    // Remove session from cache
    await cacheService.del(this.#cacheConfig.keys.session(userId));

    // Remove user from cache
    await cacheService.del(this.#cacheConfig.keys.user(userId));

    // Invalidate session in database
    await this.#invalidateSession(userId);
  }

  // Private methods
  async #createUser(userData) {
    // Implementation for creating user in database
    // This would interact with your database service/repository
  }

  async #findUserByEmail(email) {
    // Implementation for finding user by email
    // This would interact with your database service/repository
  }

  async #createSession(userId) {
    // Implementation for creating a new session
    // This would interact with your database service/repository
  }

  async #invalidateSession(userId) {
    // Implementation for invalidating a session
    // This would interact with your database service/repository
  }
}
