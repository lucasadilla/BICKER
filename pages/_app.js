import '../styles/globals.css';
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';
import { Analytics } from "@vercel/analytics/react";
import { ColorSchemeContext } from '../lib/ColorSchemeContext';

function ThemeProvider({ children }) {
    const { status } = useSession();
    const [colorScheme, setColorScheme] = useState('light');

    // On initial load, try to use the user's last chosen scheme
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('colorScheme');
            if (stored) {
                setColorScheme(stored);
            }
        }
    }, []);

    useEffect(() => {
        document.body.classList.remove('light', 'dark', 'blue');
        document.body.classList.add(colorScheme || 'light');
        if (typeof window !== 'undefined') {
            localStorage.setItem('colorScheme', colorScheme || 'light');
        }
    }, [colorScheme]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/profile')
                .then(res => res.json())
                .then(data => setColorScheme(data.colorScheme || localStorage.getItem('colorScheme') || 'light'))
                .catch(() => {
                    const stored = typeof window !== 'undefined' ? localStorage.getItem('colorScheme') : null;
                    setColorScheme(stored || 'light');
                });
        } else {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('colorScheme') : null;
            setColorScheme(stored || 'light');
        }
    }, [status]);

    return (
        <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
            {children}
        </ColorSchemeContext.Provider>
    );
}

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    const router = useRouter();
    const showNavBar = router.pathname !== '/';

    return (
        <SessionProvider session={session}>
            <ThemeProvider>
                <DefaultSeo {...SEO} />
                {showNavBar && <NavBar />}
                <Component {...pageProps} />
                <Analytics/>
            </ThemeProvider>
        </SessionProvider>
    );
}
