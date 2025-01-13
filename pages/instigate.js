import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function InstigatePage() {
    const [instigates, setInstigates] = useState([]);
    const [newInstigate, setNewInstigate] = useState('');

    // Disable scrolling for the page
    useEffect(() => {
        document.body.style.overflow = 'hidden'; // Disable scrolling on the body
        return () => {
            document.body.style.overflow = 'auto'; // Re-enable scrolling when unmounting
        };
    }, []);

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
                overflow: 'hidden', // Prevent scrolling within the container
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
                        height: '150px',
                        marginBottom: '10px',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                    }}
                />
                <button
                    onClick={submitInstigate}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        fontSize: '16px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
