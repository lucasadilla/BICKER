import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import NavBar from '../components/NavBar';


export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    return (
        <SessionProvider session={session}>
            <NavBar />
            <Component {...pageProps} />
        </SessionProvider>
    );
}