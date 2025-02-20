import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const { data: session, status } = useSession();



    // While NextAuth is checking the session, you can show a loading state
    if (status === 'loading') {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    // If user is signed in, display your main content
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            {/* Navbar */}
            <NavBar />

            {/* Split Screen */}
            <div style={{ display: 'flex', height: '100%' }}>
                {/* Left Side - Instigate */}
                <div
                    onClick={() => router.push('/instigate')}
                    style={{
                        flex: 1,
                        backgroundColor: '#FF4D4D',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#FF6A6A')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#FF4D4D')}
                >
                    <h1 style={{ fontSize: '36px', textAlign: 'center', margin: '0 20px' }}>
                        Instigate
                        <br />
                        Click to Begin
                    </h1>
                </div>

                {/* Right Side - Debate */}
                <div
                    onClick={() => router.push('/debate')}
                    style={{
                        flex: 1,
                        backgroundColor: '#4D94FF',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#76ACFF')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#4D94FF')}
                >
                    <h1 style={{ fontSize: '36px', textAlign: 'center', margin: '0 20px' }}>
                        Debate
                        <br />
                        Click to Join
                    </h1>
                </div>
            </div>
        </div>
    );
}
