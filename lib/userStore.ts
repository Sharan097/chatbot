// lib/userStore.ts
import crypto from "crypto";

type User = {
   id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  isLocked?: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  stripeCustomerId?: string;
  hasAccess?: boolean;
  priceId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

class UserStore {
  private static instance: UserStore;
  
  private users: User[] = [
    {
      id: crypto.randomBytes(16).toString("hex"),
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'user',
      isVerified: true,
      hasAccess: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: crypto.randomBytes(16).toString("hex"),
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      isVerified: true,
      hasAccess: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private constructor() {}

  static getInstance(): UserStore {
    if (!UserStore.instance) {
      UserStore.instance = new UserStore();
    }
    return UserStore.instance;
  }

  private generateUserId(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  addUser(user: User): void {
    const exists = this.users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (exists) {
      throw new Error('User already exists');
    }
    this.users.push({
      ...user,
      id: user.id || this.generateUserId(),
      role: user.role || 'user',
      isVerified: false,
      hasAccess: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  getUser(email: string, password: string): User | null {
    const user = this.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (user && !user.isVerified) {
      return null;
    }
    
    return user || null;
  }

  getUserByEmail(email: string): User | null {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  getUserByVerificationToken(token: string): User | null {
    return this.users.find(u => u.verificationToken === token) || null;
  }

  getUserByCustomerId(customerId: string): User | null {
    return this.users.find(u => u.stripeCustomerId === customerId) || null;
  }

  getUserById(id: string): User | null {
    return this.users.find(u => u.id === id) || null;
  }

  verifyUser(token: string): User | null {
    const user = this.getUserByVerificationToken(token);
    if (!user) return null;

    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      return null;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    user.updatedAt = new Date();

    return user;
  }

  updateUser(email: string, updates: Partial<User>): User | null {
    const user = this.getUserByEmail(email);
    if (user) {
      Object.assign(user, {
        ...updates,
        updatedAt: new Date()
      });
      return user;
    }
    return null;
  }

  getAllUsers(): Omit<User, 'password'>[] {
    return this.users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
  }

  validateCredentials(email: string, password: string): boolean {
    const user = this.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    return !!user;
  }

  getUserStatus(email: string): { exists: boolean; isVerified: boolean } | null {
    const user = this.getUserByEmail(email);
    if (!user) return null;
    return {
      exists: true,
      isVerified: user.isVerified
    };
  }
}

export const userStore = UserStore.getInstance();
export type { User };
