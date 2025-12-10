// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import FacebookProvider from "next-auth/providers/facebook";
import { userStore } from "@/lib/userStore";
import { z } from "zod";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be set in .env.local");
}

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface ExtendedUser extends User {
  role?: string;
  hasAccess?: boolean;
  provider?: string;
}

const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(email: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (!attempts || now > attempts.resetTime) {
    loginAttempts.set(email, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return { allowed: true };
  }

  if (attempts.count >= 5) {
    const retryAfter = Math.ceil((attempts.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  attempts.count++;
  return { allowed: true };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "2.0",
    }),

    FacebookProvider({
      clientId: process.env.META_CLIENT_ID || "",
      clientSecret: process.env.META_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "test@example.com",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("MISSING_CREDENTIALS");
          }

          const validation = loginSchema.safeParse(credentials);

          if (!validation.success) {
            throw new Error("INVALID_INPUT");
          }

          const { email, password } = validation.data;
          const normalizedEmail = email.toLowerCase().trim();

          const rateLimit = checkRateLimit(normalizedEmail);
          if (!rateLimit.allowed) {
            throw new Error("RATE_LIMIT_EXCEEDED");
          }

          const user = userStore.getUser(normalizedEmail, password);

          if (!user) {
            const existingUser = userStore.getUserByEmail(normalizedEmail);

            if (existingUser && !existingUser.isVerified) {
              throw new Error("EMAIL_NOT_VERIFIED");
            }

            throw new Error("INVALID_CREDENTIALS");
          }

          if ("isLocked" in user && user.isLocked) {
            throw new Error("ACCOUNT_LOCKED");
          }

          loginAttempts.delete(normalizedEmail);

          return {
            id: user.email,
            email: user.email,
            name: user.name,
            role: user.role,
            hasAccess: user.hasAccess || false,
            provider: "credentials",
          } as ExtendedUser;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("AUTHENTICATION_FAILED");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider && account.provider !== "credentials") {
        const email = user.email?.toLowerCase().trim();

        if (!email) {
          return false;
        }

        let existingUser = userStore.getUserByEmail(email);

        if (!existingUser) {
          try {
            userStore.addUser({
              email: email,
              password: "",
              name: user.name || email.split("@")[0],
              role: "user",
              isVerified: true,
              hasAccess: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            existingUser = userStore.getUserByEmail(email);
          } catch (error) {
            console.error("Error creating OAuth user:", error);
            return false;
          }
        } else if (!existingUser.isVerified) {
          existingUser.isVerified = true;
          existingUser.updatedAt = new Date();
        }
      }

      return true;
    },

    async jwt({ token, user, account, trigger }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.id = extendedUser.id;
        token.email = user.email;
        token.name = user.name;
        token.role = extendedUser.role || "user";
        token.hasAccess = extendedUser.hasAccess || false;
        token.provider = account?.provider || "credentials";

        if (account?.provider === "twitter") {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
        }
      }

      if (trigger === "update") {
        const email = token.email as string;
        const userData = userStore.getUserByEmail(email);
        if (userData) {
          token.role = userData.role;
          token.hasAccess = userData.hasAccess;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
          hasAccess: token.hasAccess as boolean,
          provider: token.provider as string,
          accessToken: token.accessToken as string | undefined,
        };
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (
        url.includes("/login") ||
        url.includes("/signup") ||
        url.includes("/api/auth")
      ) {
        return baseUrl + "/";
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return baseUrl + "/";
    },
  },

  events: {
    async signIn({ user, account }) {
      console.log("User signed in:", user.email, "via", account?.provider);
    },
    async signOut({ token }) {
      console.log("User signed out:", token?.email);
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
