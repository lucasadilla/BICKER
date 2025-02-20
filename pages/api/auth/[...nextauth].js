import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        // The redirect callback is called anytime NextAuth needs to redirect
        async redirect({ url, baseUrl }) {
            // If sign-in succeeded, send them to the homepage
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            // If you want to force them to always go to the homepage:
            return baseUrl;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});
