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
                            badges: []
                        }
                    },
                    { upsert: true }
                );
            }
            return true;
        },
        // The redirect callback is called anytime NextAuth needs to redirect
        async redirect({ url, baseUrl }) {
            // If sign-in succeeded, send them to the homepage
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            // If you want to force them to always go to the homepage:
            return baseUrl;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
