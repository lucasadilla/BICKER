// pages/auth/signin.js
import { getProviders, signIn } from 'next-auth/react';

export default function SignIn({ providers }) {
    // If providers is undefined or empty, handle gracefully:
    if (!providers || Object.keys(providers).length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <h1>No providers configured</h1>
                <p>Make sure you have set up providers in your NextAuth config.</p>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>Sign In</h1>
            {Object.values(providers).map((provider) => (
                <div key={provider.name} style={{ margin: '20px' }}>
                    <button onClick={() => signIn(provider.id, {callbackUrl: '/'})}>
                        Sign in with {provider.name}
                    </button>
                </div>
            ))}
        </div>
    );
}

// Use server-side rendering to fetch the providers
export async function getServerSideProps(context) {
    const providers = await getProviders();
    return {
        props: { providers }, // pass them to the component
    };
}
