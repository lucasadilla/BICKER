import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            await dbConnect();
            if (user?.email) {
                await User.findOneAndUpdate(
                    { email: user.email },
                    {
                        $setOnInsert: {
                            email: user.email,
                            points: 0,
                            streak: 0,
                            badges: [],
                            username: user.name || '',
                            avatar: user.image || ''
                        }
                    },
                    { upsert: true }
                );
            }
            return true;
        },
        async session({ session }) {
            await dbConnect();
            if (session.user?.email) {
                const dbUser = await User.findOne({ email: session.user.email });
                if (dbUser) {
                    session.user.username = dbUser.username || session.user.name;
                    session.user.bio = dbUser.bio || '';
                    session.user.image = dbUser.avatar || session.user.image;
                    session.user.badges = dbUser.badges || [];
                    session.user.selectedBadge = dbUser.selectedBadge || '';
                }
            }
            return session;
        },
        // The redirect callback is called anytime NextAuth needs to redirect
        async redirect({ url, baseUrl }) {
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            return baseUrl;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
