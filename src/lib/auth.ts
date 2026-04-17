import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getMemberByEmail, getMemberByGoogleSub, createMember, updateMemberLastLogin } from './google-sheets';

function generateMemberId(): string {
  return 'M' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const member = await getMemberByEmail(credentials.email);
        
        if (!member) {
          return null;
        }

        if (member.status === 'pending') {
          return null;
        }

        if (member.status !== 'active') {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, member.password_hash);
        
        if (!isValid) {
          return null;
        }

        await updateMemberLastLogin(member.member_id);

        return {
          id: member.member_id,
          email: member.email,
          name: member.name,
          role: member.role,
          status: member.status,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const googleSub = account.providerAccountId;
        const email = user.email!;
        const name = user.name || 'User';
        
        let member = await getMemberByGoogleSub(googleSub);
        
        if (!member) {
          member = await getMemberByEmail(email);
        }
        
        if (!member) {
          await createMember({
            member_id: generateMemberId(),
            email,
            password_hash: '',
            google_sub: googleSub,
            name,
            role: 'user',
            status: 'pending',
          });
          return '/login?error=pending';
        }
        
        if (member.status === 'pending') {
          return '/login?error=pending';
        }
        
        if (member.status !== 'active') {
          return '/login?error=inactive';
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google') {
        token.googleAccessToken = account.access_token;
        const googleSub = account.providerAccountId;
        const member = await getMemberByGoogleSub(googleSub);
        if (member) {
          token.id = member.member_id;
          token.role = member.role;
          token.status = member.status;
        }
      } else if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
