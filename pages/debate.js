// pages/debate.js
import { useState, useEffect, useLayoutEffect } from 'react';
import { NextSeo } from 'next-seo';
import { useColorScheme } from '../lib/ColorSchemeContext';
import { getSplitTheme } from '../lib/splitTheme';

export default function DebatePage({ initialDebates }) {
    const [instigates, setInstigates] = useState(initialDebates || []);
    const [currentInstigateIndex, setCurrentInstigateIndex] = useState(0);
    const [debateText, setDebateText] = useState('');
    const [hoveringSide, setHoveringSide] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const { colorScheme: activeScheme } = useColorScheme() || { colorScheme: 'light' };
    const theme = getSplitTheme(activeScheme);
    const useIsomorphicLayoutEffect =
        typeof window !== 'undefined' ? useLayoutEffect : useEffect;
    // Search-related state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const leftSideColor = hoveringSide === 'red' ? theme.left.hover : theme.left.base;
    const rightSideColor = hoveringSide === 'blue' ? theme.right.hover : theme.right.base;
    const splitGradient = `linear-gradient(to right, ${leftSideColor} 50%, ${rightSideColor} 50%)`;
    const navGradient =
        activeScheme === 'monochrome'
            ? `linear-gradient(to right, ${theme.left.base} 0%, ${theme.left.base} 100%)`
            : splitGradient;

    useIsomorphicLayoutEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--nav-gradient', navGradient);
            document.documentElement.style.setProperty('--nav-button-color', theme.nav.text);
            document.documentElement.style.setProperty('--nav-button-color-hover', theme.nav.text);
            document.documentElement.style.setProperty('--nav-button-border', theme.nav.border);
            document.documentElement.style.setProperty('--nav-button-border-hover', theme.nav.borderHover);
        }
    }, [navGradient, theme.nav.border, theme.nav.borderHover, theme.nav.text]);

    useIsomorphicLayoutEffect(() => {
        return () => {
            if (typeof document !== 'undefined') {
                document.documentElement.style.removeProperty('--nav-gradient');
                document.documentElement.style.removeProperty('--nav-button-color');
                document.documentElement.style.removeProperty('--nav-button-color-hover');
                document.documentElement.style.removeProperty('--nav-button-border');
                document.documentElement.style.removeProperty('--nav-button-border-hover');
            }
        };
    }, []);

    useEffect(() => {
        if (!initialDebates || initialDebates.length === 0) {
            fetchInstigates();
        }
    }, [initialDebates]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const containers = document.querySelectorAll('.search-bar-container');
            const clickedInside = Array.from(containers).some((container) =>
                container.contains(event.target)
            );
            if (!clickedInside) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                gap: '12px',
                backgroundColor: theme.surfaces.raised,
                padding: '12px 20px',
                borderRadius: showSearchResults
                    ? '16px 16px 0 0'
                    : '16px',
                boxShadow: showSearchResults ? 'none' : theme.shadows.raised,
                transition: 'all 0.2s ease',
                border: `1px solid ${theme.surfaces.border}`,
                borderBottom: showSearchResults
                    ? 'none'
                    : `1px solid ${theme.surfaces.border}`,
                width: '100%',
                boxSizing: 'border-box',
                color: theme.text.strong,
            }}
        >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            flexShrink: 0,
                            opacity: 0.7,
                            transition: 'opacity 0.2s ease',
                            transform: 'scale(1)',
                            color: theme.icon.muted,
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
                        onFocus={() =>
                            searchResults.length > 0 && setShowSearchResults(true)
                        }
                        style={{
                            flex: 1,
                            padding: '0',
                            fontSize: '16px',
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            color: theme.text.strong,
                            fontWeight: '500',
                            letterSpacing: '0.2px',
                            width: '100%',
                        }}
                    />
                </div>
    );

    const searchResultsList =
        showSearchResults && searchResults.length > 0 ? (
            <div
                className="search-results-dropdown"
                style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    backgroundColor: theme.surfaces.solid,
                    border: `1px solid ${theme.surfaces.border}`,
                    borderTop: 'none',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    borderRadius: '0 0 16px 16px',
                    boxShadow: theme.shadows.dropdown,
                    zIndex: 1000,
                    boxSizing: 'border-box',
                }}
            >
                {searchResults.map((instigate, index) => (
                    <div
                        key={instigate._id}
                        onClick={() => selectSearchResult(instigate)}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = theme.surfaces.highlight)
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = theme.surfaces.solid)
                        }
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderBottom:
                                index === searchResults.length - 1
                                    ? 'none'
                                    : `1px solid ${theme.surfaces.borderMuted}`,
                            backgroundColor: theme.surfaces.solid,
                            transition: 'background-color 0.15s ease',
                        }}
                    >
                        <p
                            className="text-base"
                            style={{
                                margin: 0,
                                color: theme.text.strong,
                                fontWeight: 500,
                            }}
                        >
                            {instigate.text}
                        </p>
                    </div>
                ))}
            </div>
        ) : null;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                minHeight: '100vh',
                width: '100vw',
                overflowX: 'hidden',
                overflowY: 'auto',
                position: 'relative',
            }}
        >
            <NextSeo
                title="Debate - Bicker"
                description="Join ongoing debates and share your stance."/>

            {/* Mobile Search Bar */}
            {isMobile && (
                <div
                    className="search-bar-container"
                    style={{
                        position: 'fixed',
                        top: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        maxWidth: '600px',
                        zIndex: 1000,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        willChange: 'width, transform',
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxSizing: 'border-box',
                        pointerEvents: 'auto',
                    }}
                >
                    {searchBarContent}
                    {searchResultsList}
                </div>
            )}

            {/* Left Side (Red) */}
            <div
                onClick={handleNextInstigate}
                onMouseEnter={() => setHoveringSide('red')}
                onMouseLeave={() => setHoveringSide('')}
                style={{
                    flex: 1,
                    backgroundColor: leftSideColor,
                    padding: '20px',
                    boxSizing: 'border-box',
                    color: theme.left.text,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                    position: 'relative',
                    width: '100%',
                    height: isMobile ? '50vh' : '100vh',
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
                            width: '80%',
                            maxWidth: '600px',
                            zIndex: 1000,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            willChange: 'width, transform',
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            pointerEvents: 'auto',
                        }}
                    >
                        {searchBarContent}
                        {searchResultsList}
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
                    {currentInstigate ? (
                        <div style={{ textAlign: 'center' }}>
                            {currentInstigate.text && (
                                <p
                                    className="heading-1"
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
                                    {currentInstigate.text}
                                </p>
                            )}
                            
                        </div>
                    ) : (
                        <p
                            className="heading-1"
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
                            No topics available
                        </p>
                    )}
                </div>
            </div>

            {/* Right Side (Blue) */}
            <div
                onMouseEnter={() => setHoveringSide('blue')}
                onMouseLeave={() => setHoveringSide('')}
                style={{
                    flex: 1,
                    backgroundColor: rightSideColor,
                    padding: '20px',
                    boxSizing: 'border-box',
                    color: theme.right.text,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    width: '100%',
                    height: isMobile ? '50vh' : '100vh',
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
                            margin: '0 auto',
                        }}
                    >
                        <textarea
                            value={debateText}
                            onChange={(e) => setDebateText(e.target.value)}
                            placeholder="Write your debate response here (max 200 characters)"
                            maxLength={200}
                            style={{
                                width: '100%',
                                height: isMobile ? '150px' : '500px',
                                marginBottom: '10px',
                                padding: '10px',
                                fontSize: isMobile ? '20px' : '30px',
                                borderRadius: '4px',
                                border: `1px solid ${theme.surfaces.border}`,
                                color: theme.text.strong,
                                resize: 'none',
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                margin: '0 auto',
                                backgroundColor: theme.surfaces.solid,
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '15px',
                                right: '15px',
                                fontSize: '14px',
                                color: theme.counter,
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
                            backgroundColor: theme.buttons.primary.bg,
                            color: theme.buttons.primary.text,
                            fontSize: isMobile ? '20px' : '30px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: theme.buttons.primary.shadow,
                            transition: 'all 0.1s ease',
                            position: 'relative',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(4px)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = theme.buttons.primary.hoverBg;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = theme.buttons.primary.shadow;
                            e.target.style.backgroundColor = theme.buttons.primary.bg;
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
