// lib/userStore.ts
type User = {
  email: string;
  password: string;
  name: string;
};

class UserStore {
  private static instance: UserStore;
  private users: User[] = [
    // Pre-populated test user for development
    { 
      email: 'test@example.com', 
      password: 'password123', 
      name: 'Test User' 
    }
  ];

  private constructor() {
    console.log('UserStore initialized with test user');
  }

  static getInstance(): UserStore {
    if (!UserStore.instance) {
      UserStore.instance = new UserStore();
    }
    return UserStore.instance;
  }

  addUser(user: User): void {
    const exists = this.users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (exists) {
      throw new Error('User with this email already exists');
    }
    this.users.push(user);
    console.log('User registered:', user.email);
    console.log('Total users:', this.users.length);
  }

  getUser(email: string, password: string): User | null {
    const normalizedEmail = email.toLowerCase();
    const user = this.users.find(
      u => u.email.toLowerCase() === normalizedEmail && u.password === password
    );
    
    if (user) {
      console.log('User found:', normalizedEmail);
    } else {
      console.log('User not found:', normalizedEmail);
      console.log('Available users:', this.users.map(u => u.email));
    }
    return user || null;
  }

  getAllUsers(): Omit<User, 'password'>[] {
    return this.users.map(u => ({ email: u.email, name: u.name }));
  }
}

export const userStore = UserStore.getInstance();
