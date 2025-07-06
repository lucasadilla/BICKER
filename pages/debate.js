// pages/debate.js
import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { NextSeo } from 'next-seo';

export default function DebatePage({ initialDebates }) {
    const [instigates, setInstigates] = useState(initialDebates || []);
    const [currentInstigateIndex, setCurrentInstigateIndex] = useState(0);
    const [debateText, setDebateText] = useState('');
    const [hoveringSide, setHoveringSide] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    // Search-related state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    // Toggle search bar expansion
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const searchBar = document.querySelector('.search-bar-container');
            if (searchBar && !searchBar.contains(event.target) && !searchTerm) {
                setIsSearchExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchTerm]);

    useEffect(() => {
        if (!initialDebates || initialDebates.length === 0) {
            fetchInstigates();
        }
    }, [initialDebates]);

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
            const shuffled = data.sort(() => Math.random() - 0.5);
            setInstigates(shuffled);
            setCurrentInstigateIndex(0);
        } catch (error) {
            console.error('Error fetching instigates:', error);
        }
    };

    const handleNextInstigate = () => {
        setCurrentInstigateIndex((prevIndex) =>
            prevIndex === instigates.length - 1 ? 0 : prevIndex + 1
        );
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim()) {
                try {
                    const response = await fetch(
                        `/api/instigate?search=${encodeURIComponent(searchTerm)}`
                    );
                    if (!response.ok)
                        throw new Error(`HTTP error! status: ${response.status}`);
                    const results = await response.json();
                    
                    const resultsWithDebates = await Promise.all(
                        results.slice(0, 5).map(async (instigate) => {
                            const debateResponse = await fetch(
                                `/api/debate?instigateId=${instigate._id}`
                            );
                            const debates = await debateResponse.json();
                            return {
                                ...instigate,
                                debates: debates || [],
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
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const selectSearchResult = (instigate) => {
        setInstigates([instigate, ...instigates]);
        setCurrentInstigateIndex(0);
        setSearchTerm('');
        setShowSearchResults(false);
    };

    const submitDebate = async () => {
        const selectedInstigate = instigates[currentInstigateIndex];
        if (!selectedInstigate) {
            alert('No instigate selected.');
            return;
        }
        if (!debateText.trim()) {
            alert('Please enter your debate text.');
            return;
        }
        try {
            const response = await fetch('/api/debate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    instigateId: selectedInstigate._id, 
                    debateText: debateText.trim(),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create debate');
            }
            if (data.success) {
                const updatedInstigates = instigates.filter(
                    (_, index) => index !== currentInstigateIndex
                );
                setInstigates(updatedInstigates);
                setCurrentInstigateIndex(
                    updatedInstigates.length > 0 ? 0 : currentInstigateIndex
                );
                setDebateText('');
            }
        } catch (error) {
            console.error('Error submitting debate:', error);
            alert(error.message);
        }
    };

    const currentInstigate = instigates[currentInstigateIndex];

    // Shared search bar content
    const searchBarContent = (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                gap: '19px',
                backgroundColor: isSearchExpanded
                    ? 'rgba(255, 255, 255, 0.98)'
                    : 'transparent',
                        padding: isSearchExpanded ? '10px 20px' : '0',
                        borderRadius: isSearchExpanded ? '16px' : '0',
                boxShadow: isSearchExpanded
                    ? '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)'
                    : 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: isSearchExpanded ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                        cursor: 'pointer',
                        width: isSearchExpanded ? '100%' : 'auto',
                    }}
                    onClick={() => setIsSearchExpanded(true)}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                stroke={isSearchExpanded ? "#666" : 'white'}
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{
                            flexShrink: 0, 
                            opacity: isSearchExpanded ? 0.7 : 1,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isSearchExpanded ? 'scale(1)' : 'scale(1.2)',
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
                        }}
                    />
                </div>
    );

    const searchResultsList =
        showSearchResults && searchResults.length > 0 ? (
            <div
                style={{
                    position: 'fixed',
                    top: isMobile ? '120px' : '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    maxWidth: '600px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    overflow: 'hidden',
                }}
            >
                {searchResults.map((instigate) => (
                    <div
                        key={instigate._id}
                        onClick={() => selectSearchResult(instigate)}
                        style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                            backgroundColor: '#fff',
                        }}
                    >
                        <p style={{ margin: 0, color: '#333' }}>{instigate.text}</p>
                    </div>
                ))}
            </div>
        ) : null;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                width: '100vw',
                fontFamily: 'Arial, sans-serif',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
        >
            <NavBar />
            <NextSeo
                title="Debate - Bicker"
                description="Join ongoing debates and share your stance."/>

            {searchResultsList}

            {/* Mobile Search Bar */}
            {isMobile && (
                <div
                    className="search-bar-container"
                    style={{
                        position: 'fixed',
                        top: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: isSearchExpanded ? '80%' : '48px',
                        maxWidth: '600px',
                        zIndex: 1000,
                        padding: '0 20px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        willChange: 'width, transform',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    {searchBarContent}
                    </div>
                )}

            {/* Left Side (Red) */}
            <div
                onClick={handleNextInstigate}
                onMouseEnter={() => setHoveringSide('red')}
                onMouseLeave={() => setHoveringSide('')}
                style={{
                    flex: 1,
                    backgroundColor: hoveringSide === 'red' ? '#FF6A6A' : '#FF4D4D',
                    padding: '20px',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: isMobile ? '100%' : '50%',
                    height: isMobile ? '50%' : '100%',
                    overflow: 'hidden',
                }}
            >
                {/* Desktop Search Bar: Stop propagation so clicks do not trigger parent onClick and adjust top */}
                {!isMobile && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="search-bar-container"
                        style={{
                            position: 'absolute',
                            top: '60px', // increased from 20px to lower the search bar
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: isSearchExpanded ? '80%' : '48px',
                            maxWidth: '600px',
                            zIndex: 1000,
                            padding: '0 20px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            willChange: 'width, transform',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        {searchBarContent}
                    </div>
                )}

                {/* Topic Display */}
                <div
                    style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                        overflow: 'hidden',
                    }}
                >
                    <p
                        style={{
                            textAlign: 'center',
                            fontSize: isMobile ? '24px' : '40px',
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
                    top: isMobile ? '50%' : 0,
                    right: 0,
                    width: isMobile ? '100%' : '50%',
                    height: isMobile ? '50%' : '100%',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: isMobile ? 'flex-start' : 'center',
                    width: '100%',
                    height: '100%',
                    gap: '20px',
                        paddingTop: isMobile ? '20px' : '0',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            width: isMobile ? '85%' : '60%',
                        }}
                    >
                        <textarea
                            value={debateText}
                            onChange={(e) => setDebateText(e.target.value)}
                            placeholder="Write your debate response here (max 200 characters)"
                            maxLength={200}
                            style={{
                                width: '100%',
                                height: isMobile ? '40%' : '500px',
                                marginBottom: '10px',
                                padding: '10px',
                                fontSize: isMobile ? '20px' : '30px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                color: 'black',
                                resize: 'none',
                                overflow: 'hidden',
                                marginLeft: 'auto',
                                marginRight: 'auto',
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
                            {debateText.length}/200
                        </div>
                    </div>
                    <button
                        onClick={submitDebate}
                        style={{
                            width: isMobile ? '85%' : '30%',
                            padding: '10px',
                            backgroundColor: '#007BFF',
                            color: 'white',
                            fontSize: isMobile ? '20px' : '30px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 0 #0056b3',
                            transition: 'all 0.1s ease',
                            position: 'relative',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(4px)';
                            e.target.style.boxShadow = 'none';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 0 #0056b3';
                        }}
                    >
                        Submit Debate
                    </button>
                </div>
            </div>
        </div>
    );
}

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

<style jsx>{`
    .search-bar-container {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        padding: 0 20px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: width, transform;
        display: flex;
        justify-content: center;
    }

    @media (min-width: 769px) {
        .search-bar-container {
            width: 600px;
            max-width: 100%;
        }
    }

    @media (max-width: 768px) {
        .search-bar-container {
            width: 80%;
            max-width: 600px;
            left: 20%;
            transform: translateX(0);
        }
    }
`}</style>
