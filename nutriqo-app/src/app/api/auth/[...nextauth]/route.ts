import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import pb from '../../../../shared/lib/pocketbase';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email && credentials?.password) {
          try {
            const authData = await pb.collection('users').authWithPassword(credentials.email, credentials.password);
            // authData.record is the user object
            return {
              id: authData.record.id,
              name: authData.record.name,
              email: authData.record.email
            };
          } catch (err) {
            console.error('PocketBase login error', err);
            return null;
          }
        }
        return null;
      }
    })
  ],

  // without a database adapter we rely on JWT sessions and our own PocketBase helpers
  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // ensure user exists in PocketBase; create if necessary when using OAuth
        if (account?.provider !== 'credentials') {
          const email = (user.email || '').toString();
          const list = await pb.records.getList('users', 1, 1, { filter: `email="${email}"` });
          if (list.totalItems === 0) {
            const created = await pb.records.create('users', {
              email,
              name: user.name || ''
            });
            user.id = created.id;
          } else {
            user.id = list.items[0].id;
          }
        }
        return true;
      } catch (err) {
        console.error('signIn callback error', err);
        return false;
      }
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user = {
          ...session.user,
          id: token.sub
        };
      }
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };