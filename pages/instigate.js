// pages/instigate/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // For checking if user is signed in
import NavBar from '../components/NavBar';

export default function InstigatePage() {
    const [instigates, setInstigates] = useState([]);
    const [newInstigate, setNewInstigate] = useState('');

    // Disable scrolling on mount
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Fetch session info (to see if user is signed in)
    const { data: session } = useSession();

    useEffect(() => {
        fetchInstigates();
    }, []);

    const fetchInstigates = async () => {
        try {
            const response = await fetch('/api/instigate');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setInstigates(data);
        } catch (error) {
            console.error('Error fetching instigates:', error);
            alert('Failed to load instigates. Please try again later.');
        }
    };

    const submitInstigate = async () => {
        // If not signed in, block submission
        if (!session) {
            alert('You must be signed in to submit a new topic.');
            return;
        }

        try {
            await fetch('/api/instigate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newInstigate }),
            });
            setNewInstigate('');
            fetchInstigates();
        } catch (error) {
            console.error('Error submitting instigate:', error);
            alert('Failed to submit instigate. Please try again.');
        }
    };

    return (
        <div
            style={{
                fontFamily: 'Arial, sans-serif',
                padding: '70px',
                backgroundColor: '#ee4343',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <NavBar />

            <h1 style={{ textAlign: 'center', color: '#ffffff', marginBottom: '20px' }}>
                Instigate Topics
            </h1>

            <div
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    textAlign: 'center',
                }}
            >
        <textarea
            value={newInstigate}
            onChange={(e) => setNewInstigate(e.target.value)}
            placeholder="Write your opinion here (max 200 characters)"
            maxLength={200}
            style={{
                width: '100%',
                height: '450px',
                marginBottom: '10px',
                padding: '10px',
                fontSize: '36px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                resize: 'none',
            }}
        />
                <button
                    onClick={submitInstigate}
                    disabled={!session} // Disabled if not signed in
                    style={{
                        width: '50%',
                        padding: '10px',
                        backgroundColor: !session ? 'gray' : '#007BFF',
                        color: 'white',
                        fontSize: '26px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: !session ? 'not-allowed' : 'pointer',
                        boxShadow: '10px 12px black',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        if (session) {
                            e.target.style.boxShadow = 'none';
                            e.target.style.transform = 'translateY(2px)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (session) {
                            e.target.style.boxShadow = '10px 12px black';
                            e.target.style.transform = 'translateY(0)';
                        }
                    }}
                    title={!session ? 'Sign in to submit an instigate' : ''}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
