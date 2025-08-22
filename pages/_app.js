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
    const [colorScheme, setColorScheme] = useState('light');

    useEffect(() => {
        document.body.classList.remove('light', 'dark', 'blue');
        document.body.classList.add(colorScheme || 'light');
    }, [colorScheme]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/profile')
                .then(res => res.json())
                .then(data => setColorScheme(data.colorScheme || 'light'))
                .catch(() => setColorScheme('light'));
        } else {
            setColorScheme('light');
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
