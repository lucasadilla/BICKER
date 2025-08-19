import '../styles/globals.css';
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import NavBar from '../components/NavBar';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';
import { Analytics } from "@vercel/analytics/react";

function ThemeProvider({ children }) {
    const { status } = useSession();
    useEffect(() => {
        const applyScheme = scheme => {
            document.body.classList.remove('light', 'dark', 'blue');
            document.body.classList.add(scheme || 'light');
        };
        if (status === 'authenticated') {
            fetch('/api/profile')
                .then(res => res.json())
                .then(data => applyScheme(data.colorScheme))
                .catch(() => applyScheme('light'));
        } else {
            applyScheme('light');
        }
    }, [status]);
    return children;
}

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    return (
        <SessionProvider session={session}>
            <ThemeProvider>
                <DefaultSeo {...SEO} />
                <NavBar />
                <Component {...pageProps} />
                <Analytics/>
            </ThemeProvider>
        </SessionProvider>
    );
}
