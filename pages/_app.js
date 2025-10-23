import '../styles/globals.css';
import { SessionProvider, useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';
import { Analytics } from "@vercel/analytics/react";
import { ColorSchemeContext } from '../lib/ColorSchemeContext';

const normalizeScheme = (value) => {
    const normalized = (value || '').toString().toLowerCase();
    if (normalized === 'monochrome' || normalized === 'dark') {
        return 'monochrome';
    }
    if (normalized === 'light') {
        return 'light';
    }
    return 'light';
};

function ThemeProvider({ children }) {
    const { status } = useSession();
    const [colorScheme, setColorSchemeState] = useState('light');

    const setColorScheme = useCallback((value) => {
        setColorSchemeState(normalizeScheme(value));
    }, [setColorSchemeState]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const stored = localStorage.getItem('colorScheme');
        if (stored) {
            setColorScheme(stored);
        }
    }, [setColorScheme]);

    useEffect(() => {
        const scheme = normalizeScheme(colorScheme);
        document.body.classList.remove('light', 'monochrome', 'dark', 'blue');
        document.body.classList.add(scheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('colorScheme', scheme);
        }
    }, [colorScheme]);

    useEffect(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('colorScheme') : null;

        if (status === 'authenticated') {
            fetch('/api/profile')
                .then(res => res.json())
                .then(data => {
                    const scheme = data.colorScheme || stored || 'light';
                    setColorScheme(scheme);
                })
                .catch(() => {
                    setColorScheme(stored || 'light');
                });
        } else {
            setColorScheme(stored || 'light');
        }
    }, [setColorScheme, status]);

    return (
        <ColorSchemeContext.Provider value={{ colorScheme: normalizeScheme(colorScheme), setColorScheme }}>
            {children}
        </ColorSchemeContext.Provider>
    );
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
