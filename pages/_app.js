import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import NavBar from '../components/NavBar';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';


export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    return (
        <SessionProvider session={session}>
            <DefaultSeo {...SEO} />
            <NavBar />
            <Component {...pageProps} />
        </SessionProvider>
    );
}