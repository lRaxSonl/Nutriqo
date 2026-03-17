import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createPocketBaseClient, getPocketBaseUsersCollection } from "@/shared/lib/pocketbase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const pocketbase = createPocketBaseClient();
          const usersCollection = getPocketBaseUsersCollection();
          const authData = await pocketbase
            .collection(usersCollection)
            .authWithPassword(credentials.email, credentials.password);

          return {
            id: authData.record.id,
            email: authData.record.email,
            name: authData.record.name || authData.record.email,
            pbToken: authData.token, // Сохраняем PocketBase token
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      // При первом логине, сохраняем данные пользователя в token
      if (user) {
        token.id = user.id;
        token.pbToken = (user as any).pbToken;
      }
      // pbToken сохраняется в token на протяжении всей жизни JWT
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      // Копируем pbToken из token в session для использования в API routes
      if (token.pbToken) {
        session.pbToken = token.pbToken as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
