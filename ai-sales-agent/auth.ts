import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUserByEmail, verifyPassword } from '@/lib/auth-store';

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = getUserByEmail(credentials.email as string);
                if (!user) return null;

                const valid = await verifyPassword(user, credentials.password as string);
                if (!valid) return null;

                return { id: user.id, email: user.email, name: user.name };
            },
        }),
    ],
    pages: {
        signIn: '/auth',
    },
    session: { strategy: 'jwt' },
    callbacks: {
        jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        session({ session, token }) {
            if (session.user) session.user.id = token.id as string;
            return session;
        },
    },
});
