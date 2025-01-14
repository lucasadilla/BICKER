import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function DebatePage() {
    const [instigates, setInstigates] = useState([]);
    const [currentInstigateIndex, setCurrentInstigateIndex] = useState(0); // Track the current instigate
    const [debateText, setDebateText] = useState('');
    const [hovering, setHovering] = useState(false); // Track hover state

    // Fetch instigates when the component loads
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
        const selectedInstigate = instigates[currentInstigateIndex];
        if (!selectedInstigate) {
            alert('No instigate selected.');
            return;
        }

        try {
            await fetch('/api/debate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instigateId: selectedInstigate._id, debateText }),
            });
            alert('Debate submitted successfully!');

            // Remove debated instigate from the list
            const updatedInstigates = instigates.filter(
                (_, index) => index !== currentInstigateIndex
            );

            setInstigates(updatedInstigates);

            // Reset the index to ensure valid navigation
            setCurrentInstigateIndex((prevIndex) =>
                prevIndex >= updatedInstigates.length ? 0 : prevIndex
            );

            // Clear the debate text
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
                onMouseEnter={() => setHovering(true)} // Set hovering state
                onMouseLeave={() => setHovering(false)} // Remove hovering state
                style={{
                    flex: 1,
                    backgroundColor: hovering ? '#FF6A6A' : '#FF4D4D', // Lighten red on hover
                    padding: '20px',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease', // Smooth transition
                }}
            >
                <p
                    style={{
                        textAlign: 'center',
                        fontSize: '40px',
                        margin: '0 10px',
                        maxWidth: '400px',
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
                    style={{
                        width: '30%',
                        padding: '10px',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        fontSize: '30px',
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
