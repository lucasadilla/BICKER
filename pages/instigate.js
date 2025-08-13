// pages/instigate/index.js
import { useState, useEffect } from 'react';

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
                padding: '70px',
                backgroundColor: '#ee4343',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <h1 className="heading-1" style={{ textAlign: 'center', color: '#ffffff', marginBottom: '20px' }}>
                Instigate
            </h1>

            <div
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        position: 'relative',
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
                            padding: '10px',
                            fontSize: '36px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            resize: 'none',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '15px',
                            right: '15px',
                            fontSize: '14px',
                            color: '#555',
                            pointerEvents: 'none',
                        }}
                    >
                        {newInstigate.length}/200
                    </div>
                </div>
                <button
                    className="submit-topic-button"
                    onClick={submitInstigate}
                    style={{
                        width: '50%',
                        padding: '10px',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        fontSize: '26px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '10px 12px black',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        marginTop: '10px',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(4px)';
                        e.target.style.boxShadow = 'none';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '10px 12px black';
                    }}
                >
                    Submit Topic
                </button>
                <style jsx>{`
                    @media (max-width: 480px) {
                        .submit-topic-button {
                            width: 100% !important;
                            white-space: nowrap;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}
