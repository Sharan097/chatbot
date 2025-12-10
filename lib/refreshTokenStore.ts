// lib/refreshTokenStore.ts
import crypto from "crypto";

type RefreshToken = {
  token: string;
  userEmail: string;
  expiresAt: Date;
  createdAt: Date;
};

class RefreshTokenStore {
  private tokens: Map<string, RefreshToken> = new Map();

  generateToken(userEmail: string, days: number = 30) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const refreshToken: RefreshToken = {
      token,
      userEmail,
      expiresAt,
      createdAt: new Date(),
    };

    this.tokens.set(token, refreshToken);
    console.log(
      `[REFRESH TOKEN] Generated for ${userEmail}, ${days} days`
    );

    return { token, expiresAt };
  }

  validateToken(token: string) {
    const rt = this.tokens.get(token);
    if (!rt) return { valid: false };

    if (new Date() > rt.expiresAt) {
      this.tokens.delete(token);
      return { valid: false };
    }

    return { valid: true, userEmail: rt.userEmail };
  }

  get(token: string) {
    return this.tokens.get(token);
  }

  revokeToken(token: string) {
    return this.tokens.delete(token);
  }

  revokeAllUserTokens(userEmail: string) {
    let count = 0;
    for (const [token, rt] of this.tokens.entries()) {
      if (rt.userEmail === userEmail) {
        this.tokens.delete(token);
        count++;
      }
    }
    console.log(
      `[REFRESH TOKEN] Revoked ${count} tokens for ${userEmail}`
    );
    return count;
  }
}

export const refreshTokenStore = new RefreshTokenStore();
