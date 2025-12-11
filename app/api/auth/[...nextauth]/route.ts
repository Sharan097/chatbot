// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import FacebookProvider from "next-auth/providers/facebook";
import { userStore } from "@/lib/userStore";
import { z } from "zod";
import crypto from "crypto";

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

function checkRateLimit(email: string) {
  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (!attempts || now > attempts.resetTime) {
    loginAttempts.set(email, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return { allowed: true };
  }

  if (attempts.count >= 5) {
    return { allowed: false, retryAfter: Math.ceil((attempts.resetTime - now) / 1000) };
  }

  attempts.count++;
  return { allowed: true };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("MISSING_CREDENTIALS");
        }

        const validation = loginSchema.safeParse(credentials);
        if (!validation.success) throw new Error("INVALID_INPUT");

        const email = validation.data.email.toLowerCase().trim();
        const password = validation.data.password;

        const limit = checkRateLimit(email);
        if (!limit.allowed) throw new Error("RATE_LIMIT_EXCEEDED");

        const user = userStore.getUser(email, password);
        if (!user) {
          const existing = userStore.getUserByEmail(email);
          if (existing && !existing.isVerified) throw new Error("EMAIL_NOT_VERIFIED");

          throw new Error("INVALID_CREDENTIALS");
        }

        loginAttempts.delete(email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          hasAccess: user.hasAccess,
          provider: "credentials",
        } as ExtendedUser;
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async signIn({ user, account }) {
      // OAuth sign-in logic
      if (account?.provider && account.provider !== "credentials") {
        const email = user.email?.toLowerCase().trim();
        if (!email) return false;

        const existing = userStore.getUserByEmail(email);

        if (!existing) {
          // Create OAuth user
          userStore.addUser({
            id: crypto.randomUUID(),
            email,
            password: "",
            name: user.name || email.split("@")[0],
            role: "user",
            isVerified: true,
            hasAccess: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        const ext = user as ExtendedUser;

        token.id = ext.id;
        token.email = user.email;
        token.name = user.name;
        token.role = ext.role || "user";
        token.hasAccess = ext.hasAccess || false;
        token.provider = account?.provider || "credentials";

        if (account?.provider === "twitter") {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.hasAccess = token.hasAccess as boolean;
        session.user.provider = token.provider as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/login") || url.startsWith("/register")) {
        return baseUrl;
      }
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
