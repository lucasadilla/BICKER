// pages/debate.js
import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { useSession } from 'next-auth/react';

export default function DebatePage({ initialDebates }) {
    const [instigates, setInstigates] = useState(initialDebates || []);
    const [currentInstigateIndex, setCurrentInstigateIndex] = useState(0);
    const [debateText, setDebateText] = useState('');
    const [hovering, setHovering] = useState(false);

    // Search-related state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchPopup, setShowSearchPopup] = useState(false);

    // NextAuth session info
    const { data: session } = useSession();

    // On mount, fetch all instigates (random order)
    useEffect(() => {
        if (!initialDebates || initialDebates.length === 0) {
            fetchInstigates();
        }
    }, [initialDebates]);

    // Fetch instigates (optionally filtered by search)
    const fetchInstigates = async (search = '') => {
        try {
            const url = search
                ? `/api/instigate?search=${encodeURIComponent(search)}`
                : `/api/instigate`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Shuffle for randomness
            const shuffled = data.sort(() => Math.random() - 0.5);
            setInstigates(shuffled);
            setCurrentInstigateIndex(0);
        } catch (error) {
            console.error('Error fetching instigates:', error);
        }
    };

    // When user clicks the left side (outside the search controls), cycle to next topic
    const handleNextInstigate = () => {
        setCurrentInstigateIndex((prevIndex) =>
            prevIndex === instigates.length - 1 ? 0 : prevIndex + 1
        );
    };

    // Handle search: fetch topics matching searchTerm and show popup
    const handleSearch = async () => {
        try {
            const response = await fetch(`/api/instigate?search=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const results = await response.json();
            setSearchResults(results);
            setShowSearchPopup(true);
        } catch (error) {
            console.error('Error searching instigates:', error);
        }
    };

    // When a user clicks on a search result, set that topic as the current topic
    const selectSearchResult = (instigate) => {
        // Option: prepend the selected topic to the list and set it as current index 0
        setInstigates([instigate, ...instigates]);
        setCurrentInstigateIndex(0);
        setShowSearchPopup(false);
    };

    // Submit debate (only if signed in)
    const submitDebate = async () => {
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

            // Remove the selected topic from local state
            const updatedInstigates = instigates.filter(
                (_, index) => index !== currentInstigateIndex
            );
            setInstigates(updatedInstigates);
            setCurrentInstigateIndex(
                updatedInstigates.length > 0 ? 0 : currentInstigateIndex
            );
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

            {/* Left Side (Red) */}
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                }}
            >
                {/* Topic Display (top part) */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

                {/* Search Bar (bottom part) */}
                <div
                    onClick={(e) => e.stopPropagation()} // prevent parent's onClick
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '20px',
                    }}
                >
                    <input
                        type="text"
                        placeholder="Search a topic..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            fontSize: '16px',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '60%',
                        }}
                    />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSearch();
                        }}
                        style={{
                            marginLeft: '10px',
                            padding: '8px 16px',
                            fontSize: '16px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#007BFF',
                            color: 'white',
                        }}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Right Side (Blue) */}
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
                    disabled={!session}
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

            {/* Search Popup Modal */}
            {showSearchPopup && (
                <div
                    onClick={() => setShowSearchPopup(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10000,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside popup
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            width: '80%',
                            maxWidth: '600px',
                        }}
                    >
                        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Search Results</h2>
                        {searchResults.length === 0 ? (
                            <p>No topics found.</p>
                        ) : (
                            searchResults.map((result) => (
                                <div
                                    key={result._id}
                                    onClick={() => selectSearchResult(result)}
                                    style={{
                                        padding: '10px',
                                        borderBottom: '1px solid #ccc',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {result.text}
                                </div>
                            ))
                        )}
                        <button
                            onClick={() => setShowSearchPopup(false)}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: '#007BFF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Use getServerSideProps to fetch initial instigates
export async function getServerSideProps() {
    try {
        const res = await fetch('http://localhost:3000/api/instigate');
        const initialInstigates = await res.json();
        const shuffled = initialInstigates.sort(() => Math.random() - 0.5);
        return { props: { initialDebates: shuffled } };
    } catch (error) {
        console.error('Error prefetching instigates:', error);
        return { props: { initialDebates: [] } };
    }
}
