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
    const [showSearchResults, setShowSearchResults] = useState(false);

    // NextAuth session info
    const { data: session } = useSession();

    // Add new state for search bar expansion
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            const searchBar = document.querySelector('.search-bar-container');
            if (searchBar && !searchBar.contains(event.target) && !searchTerm) {
                setIsSearchExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchTerm]);

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

    // Debounced search function
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim()) {
                try {
                    const response = await fetch(`/api/instigate?search=${encodeURIComponent(searchTerm)}`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const results = await response.json();
                    
                    // Fetch debates for each instigate (limit to 5)
                    const resultsWithDebates = await Promise.all(
                        results.slice(0, 5).map(async (instigate) => {
                            const debateResponse = await fetch(`/api/debate?instigateId=${instigate._id}`);
                            const debates = await debateResponse.json();
                            return {
                                ...instigate,
                                debates: debates || []
                            };
                        })
                    );
                    
                    setSearchResults(resultsWithDebates);
                    setShowSearchResults(true);
                } catch (error) {
                    console.error('Error searching instigates:', error);
                }
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // When a user clicks on a search result, set that topic as the current topic
    const selectSearchResult = (instigate) => {
        setInstigates([instigate, ...instigates]);
        setCurrentInstigateIndex(0);
        setSearchTerm('');
        setShowSearchResults(false);
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
        <div style={{ 
            display: 'flex', 
            height: '100vh', 
            fontFamily: 'Arial, sans-serif'
        }}>
            <NavBar />

            {/* Search Bar (top of page) */}
            <div 
                className="search-bar-container"
                style={{ 
                    position: 'fixed',
                    top: '80px',
                    left: '25%',
                    transform: 'translateX(-50%)',
                    width: isSearchExpanded ? '600px' : '48px',
                    maxWidth: isSearchExpanded ? '100%' : '48px',
                    zIndex: 1000,
                    padding: '0 20px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'width, transform',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <div 
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        backgroundColor: isSearchExpanded ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
                        padding: isSearchExpanded ? '10px 20px' : '0',
                        borderRadius: isSearchExpanded ? '16px' : '0',
                        boxShadow: isSearchExpanded ? '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)' : 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: isSearchExpanded ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                        cursor: 'pointer',
                        width: isSearchExpanded ? '100%' : 'auto',
                        height: isSearchExpanded ? 'auto' : 'auto',
                        willChange: 'width, height, padding'
                    }}
                    onClick={() => setIsSearchExpanded(true)}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke={isSearchExpanded ? "#666" : "white"} 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ 
                            flexShrink: 0, 
                            opacity: isSearchExpanded ? 0.7 : 1,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isSearchExpanded ? 'scale(1)' : 'scale(1.2)',
                            willChange: 'transform'
                        }}
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search debates..."
                        style={{
                            flex: 1,
                            padding: '12px 8px',
                            fontSize: '16px',
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            color: '#333',
                            fontWeight: '500',
                            letterSpacing: '0.2px',
                            width: isSearchExpanded ? '100%' : '0',
                            opacity: isSearchExpanded ? 1 : 0,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            pointerEvents: isSearchExpanded ? 'auto' : 'none',
                            willChange: 'width, opacity'
                        }}
                    />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        width: '100%',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
                        marginTop: '8px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        opacity: isSearchExpanded ? 1 : 0,
                        transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        willChange: 'opacity'
                    }}>
                        {searchResults.map((result) => (
                            <div
                                key={result._id}
                                onClick={() => selectSearchResult(result)}
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease',
                                    color: '#333',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    ':hover': {
                                        backgroundColor: '#f5f5f5'
                                    }
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                {result.text}
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '50%'
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
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '50%'
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
                        boxShadow: '0 4px 0 #0056b3',
                        transition: 'all 0.1s ease',
                        position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                        if (!session) return;
                        e.target.style.transform = 'translateY(4px)';
                        e.target.style.boxShadow = 'none';
                    }}
                    onMouseLeave={(e) => {
                        if (!session) return;
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 0 #0056b3';
                    }}
                    title={!session ? 'Sign in to submit a debate' : ''}
                >
                    Submit Debate
                </button>
            </div>
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
