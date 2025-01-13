import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function DebatePage() {
    const [instigates, setInstigates] = useState([]);
    const [selectedInstigate, setSelectedInstigate] = useState('');
    const [debateText, setDebateText] = useState('');

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
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setInstigates(data);
        } catch (error) {
            console.error('Error fetching instigates:', error);
        }
    };

    const submitDebate = async () => {
        if (!selectedInstigate) {
            alert('Please select a debate topic.');
            return;
        }

        try {
            await fetch('/api/debate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instigateId: selectedInstigate, debateText }),
            });
            setDebateText('');
            alert('Debate submitted successfully!');
        } catch (error) {
            console.error('Error submitting debate:', error);
            alert('Failed to submit debate. Please try again.');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <NavBar />

            {/* Left Side - Red */}
            <div
                style={{
                    flex: 1,
                    backgroundColor: '#FF4D4D',
                    padding: '20px',
                    color: 'white',
                }}
            >
                <h2 style={{ textAlign: 'center' }}>Select a Topic</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {instigates.map((instigate) => (
                        <li key={instigate._id} style={{ marginBottom: '10px' }}>
                            <button
                                onClick={() => setSelectedInstigate(instigate._id)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: selectedInstigate === instigate._id ? '#FF6A6A' : '#FF4D4D',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                }}
                            >
                                {instigate.text}
                            </button>
                        </li>
                    ))}
                </ul>
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
                <h2 style={{ textAlign: 'center' }}>Write Your Debate</h2>
                <textarea
                    value={debateText}
                    onChange={(e) => setDebateText(e.target.value)}
                    placeholder="Write your debate response here (max 200 characters)"
                    maxLength={200}
                    style={{
                        width: '80%',
                        height: '100px',
                        marginBottom: '10px',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        color: 'black',
                    }}
                />
                <button
                    onClick={submitDebate}
                    style={{
                        width: '80%',
                        padding: '10px',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        fontSize: '16px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    Submit Debate
                </button>
            </div>
        </div>
    );
}
