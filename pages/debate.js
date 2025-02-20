// pages/debate.js
import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { useSession } from 'next-auth/react'; // for client-side session check

export default function DebatePage() {
    const [instigates, setInstigates] = useState([]);
    const [currentInstigateIndex, setCurrentInstigateIndex] = useState(0);
    const [debateText, setDebateText] = useState('');
    const [hovering, setHovering] = useState(false);

    // NextAuth session info
    const { data: session, status } = useSession();

    useEffect(() => {
        fetchInstigates();
    }, []);

    const fetchInstigates = async () => {
        try {
            const response = await fetch('/api/instigate');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setInstigates(data);
        } catch (error) {
            console.error('Error fetching instigates:', error);
        }
    };

    const handleNextInstigate = () => {
        setCurrentInstigateIndex((prevIndex) =>
            prevIndex === instigates.length - 1 ? 0 : prevIndex + 1
        );
    };

    const submitDebate = async () => {
        // If not logged in, do nothing (or show alert)
        if (!session) {
            alert('You must be signed in to submit a debate.');
            return;
        }

        const selectedInstigate = instigates[currentInstigateIndex];
        if (!selectedInstigate) {
            alert('No instigate selected.');
            return;
        }

        try {
            const response = await fetch('/api/debate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instigateId: selectedInstigate._id, debateText }),
            });

            if (!response.ok) {
                throw new Error('Failed to create debate');
            }

            alert('Debate submitted successfully!');

            // Remove from local state
            const updatedInstigates = instigates.filter(
                (_, index) => index !== currentInstigateIndex
            );
            setInstigates(updatedInstigates);

            // Update index
            setCurrentInstigateIndex((prevIndex) =>
                prevIndex >= updatedInstigates.length ? 0 : prevIndex
            );

            // Clear text
            setDebateText('');
        } catch (error) {
            console.error('Error submitting debate:', error);
            alert('Failed to submit debate. Please try again.');
        }
    };

    const currentInstigate = instigates[currentInstigateIndex];

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <NavBar />

            {/* Left Side - Red */}
            <div
                onClick={handleNextInstigate}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                style={{
                    flex: 1,
                    backgroundColor: hovering ? '#FF6A6A' : '#FF4D4D',
                    padding: '20px',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                }}
            >
                <p
                    style={{
                        textAlign: 'center',
                        fontSize: '40px',
                        margin: '0 10px',
                        maxWidth: '400px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                    }}
                >
                    {currentInstigate ? currentInstigate.text : 'No topics available'}
                </p>
            </div>

            {/* Right Side - Blue */}
            <div
                style={{
                    flex: 1,
                    backgroundColor: '#4D94FF',
                    padding: '20px',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
        <textarea
            value={debateText}
            onChange={(e) => setDebateText(e.target.value)}
            placeholder="Write your debate response here (max 200 characters)"
            maxLength={200}
            style={{
                width: '60%',
                height: '500px',
                marginBottom: '10px',
                padding: '10px',
                fontSize: '30px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                color: 'black',
                resize: 'none',
            }}
        />
                <button
                    onClick={submitDebate}
                    disabled={!session} // disabled if not signed in
                    style={{
                        width: '30%',
                        padding: '10px',
                        backgroundColor: !session ? 'gray' : '#007BFF',
                        color: 'white',
                        fontSize: '30px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: !session ? 'not-allowed' : 'pointer',
                        boxShadow: '10px 12px black',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        if (!session) return;
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'translateY(2px)';
                    }}
                    onMouseLeave={(e) => {
                        if (!session) return;
                        e.target.style.boxShadow = '10px 12px black';
                        e.target.style.transform = 'translateY(0)';
                    }}
                    title={!session ? 'Sign in to submit a debate' : ''}
                >
                    Submit Debate
                </button>
            </div>
        </div>
    );
}
