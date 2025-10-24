import '../styles/globals.css';
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';
import { Analytics } from "@vercel/analytics/react";
import { ColorSchemeContext } from '../lib/ColorSchemeContext';

function ThemeProvider({ children }) {
    const { status } = useSession();
    const [colorScheme, setColorScheme] = useState('default');

    const normalizeColorScheme = (scheme) => {
        if (!scheme) return 'default';
        if (scheme === 'blue' || scheme === 'light') return 'default';
        return scheme;
    };

    // On initial load, try to use the user's last chosen scheme
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('colorScheme');
            if (stored) {
                setColorScheme(normalizeColorScheme(stored));
            }
        }
    }, []);

    useEffect(() => {
        document.body.classList.remove('light', 'default', 'dark', 'blue');
        const nextScheme = normalizeColorScheme(colorScheme);
        document.body.classList.add(nextScheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('colorScheme', nextScheme);
        }
    }, [colorScheme]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/profile')
                .then(res => res.json())
                .then(data => {
                    const stored = typeof window !== 'undefined' ? localStorage.getItem('colorScheme') : null;
                    if (data.colorScheme) {
                        setColorScheme(normalizeColorScheme(data.colorScheme));
                    } else if (stored) {
                        setColorScheme(normalizeColorScheme(stored));
                    } else {
                        setColorScheme('default');
                    }
                })
                .catch(() => {
                    const stored = typeof window !== 'undefined' ? localStorage.getItem('colorScheme') : null;
                    if (stored) {
                        setColorScheme(normalizeColorScheme(stored));
                    } else {
                        setColorScheme('default');
                    }
                });
        } else {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('colorScheme') : null;
            if (stored) {
                setColorScheme(normalizeColorScheme(stored));
            } else {
                setColorScheme('default');
            }
        }
    }, [status]);

    return (
        <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
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
