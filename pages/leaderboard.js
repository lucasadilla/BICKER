import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '../components/ui/pagination';
import { useColorScheme } from '../lib/ColorSchemeContext';

export default function Leaderboard() {
  const [debates, setDebates] = useState([]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDebates, setTotalDebates] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showTopPlayers, setShowTopPlayers] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const pageBackground = isDarkMode ? '#000000' : '#4D94FF';
  const headingColor = isDarkMode ? '#f5f5f5' : '#ffffff';
  const mutedTextColor = isDarkMode ? '#d4d4d4' : '#ffffff';
  const panelBackground = isDarkMode ? '#111111' : '#ffffff';
  const panelTextColor = isDarkMode ? '#f5f5f5' : '#333333';
  const primaryBubbleBackground = isDarkMode ? '#1a1a1a' : '#FF4D4D';
  const secondaryBubbleBackground = isDarkMode ? '#262626' : '#4D94FF';
  const primaryBubbleText = isDarkMode ? '#f5f5f5' : '#ffffff';
  const secondaryBubbleText = isDarkMode ? '#f5f5f5' : '#ffffff';
  const primaryVoteColor = isDarkMode ? '#f5f5f5' : '#FF4D4D';
  const secondaryVoteColor = isDarkMode ? '#d0d0d0' : '#4D94FF';
  const controlBackground = isDarkMode ? '#111111' : 'rgba(255, 255, 255, 0.95)';
  const controlTextColor = isDarkMode ? '#f5f5f5' : '#1f2937';

  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const res = await fetch(`/api/stats?sort=${sort}`);
        if (!res.ok) throw new Error('Failed to fetch debates');
        const data = await res.json();
        const allDebates = data.debates || [];
        const debatesCount = data.totalDebates ?? allDebates.length;
        const start = (page - 1) * 25;
        setDebates(allDebates.slice(start, start + 25));
        setTotalVotes(data.totalVotes || 0);
        setTotalDebates(debatesCount);
        setTotalPages(Math.ceil(debatesCount / 25) || 1);
      } catch (err) {
        console.error('Error fetching debates:', err);
      }
    };
    fetchDebates();
  }, [sort, page]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTopPlayers = async () => {
    if (!showTopPlayers && !playerStats) {
      try {
        const res = await fetch('/api/topplayers');
        if (!res.ok) throw new Error('Failed to fetch top players');
        const data = await res.json();
        setPlayerStats(data);
      } catch (err) {
        console.error('Error fetching top players:', err);
      }
    }
    setShowTopPlayers(!showTopPlayers);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: pageBackground, paddingTop: '60px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', color: headingColor }}>
        <h1 className="heading-1" style={{ textAlign: 'center', marginBottom: '10px', color: headingColor }}>Debate Leaderboard</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '20px',
            justifyItems: 'center',
            marginBottom: '20px'
          }}
        >
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: headingColor }}>{totalDebates}</p>
            <p className="text-sm" style={{ margin: 0, color: mutedTextColor }}>Total Debates</p>
          </div>
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: headingColor }}>{totalVotes}</p>
            <p className="text-sm" style={{ margin: 0, color: mutedTextColor }}>Total Votes</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={toggleTopPlayers}
            style={{
              backgroundColor: isDarkMode ? '#f5f5f5' : '#ffffff',
              color: '#000000',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              border: 'none'
            }}
          >
            Top Players
          </button>
        </div>
        {showTopPlayers && playerStats && (
          <div style={{ backgroundColor: panelBackground, color: panelTextColor, padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <h3 style={{ marginTop: 0, color: panelTextColor }}>Highest Win Rate</h3>
                <ol style={{ paddingLeft: '18px' }}>
                  {playerStats.highestWinRate.map((p, i) => (
                    <li key={p.username || i}>
                      <Link
                        href={`/user/${encodeURIComponent(p.username)}`}
                        style={{ textDecoration: 'none', color: panelTextColor }}
                      >
                        {p.username}
                      </Link>: {(p.winRate * 100).toFixed(0)}%
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 style={{ marginTop: 0, color: panelTextColor }}>Most Total Votes</h3>
                <ol style={{ paddingLeft: '18px' }}>
                  {playerStats.mostVotes.map((p, i) => (
                    <li key={p.username || i}>
                      <Link
                        href={`/user/${encodeURIComponent(p.username)}`}
                        style={{ textDecoration: 'none', color: panelTextColor }}
                      >
                        {p.username}
                      </Link>: {p.votes}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 style={{ marginTop: 0, color: panelTextColor }}>Most Debates Participated</h3>
                <ol style={{ paddingLeft: '18px' }}>
                  {playerStats.mostDebates.map((p, i) => (
                    <li key={p.username || i}>
                      <Link
                        href={`/user/${encodeURIComponent(p.username)}`}
                        style={{ textDecoration: 'none', color: panelTextColor }}
                      >
                        {p.username}
                      </Link>: {p.debates}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 style={{ marginTop: 0, color: panelTextColor }}>Biggest Loser</h3>
                <ol style={{ paddingLeft: '18px' }}>
                  {playerStats.lowestWinRate.map((p, i) => (
                    <li key={p.username || i}>
                      <Link
                        href={`/user/${encodeURIComponent(p.username)}`}
                        style={{ textDecoration: 'none', color: panelTextColor }}
                      >
                        {p.username}
                      </Link>: {(p.winRate * 100).toFixed(0)}%
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Select
            value={sort}
            onValueChange={setSort}
            style={{
              backgroundColor: controlBackground,
              color: controlTextColor,
              border: `1px solid ${isDarkMode ? '#1f1f1f' : 'rgba(255, 255, 255, 0.7)'}`,
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="mostPopular">Most Popular</SelectItem>
              <SelectItem value="mostDivisive">Most Divisive</SelectItem>
              <SelectItem value="mostDecisive">Most Decisive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {debates.map((debate) => (
          <Link
            key={debate._id}
            href={{ pathname: '/deliberate', query: { id: debate._id } }}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                backgroundColor: panelBackground,
                color: panelTextColor,
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '25px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    alignSelf: 'flex-start',
                    maxWidth: isMobile ? '80%' : '60%',
                    backgroundColor: primaryBubbleBackground,
                    color: primaryBubbleText,
                    padding: '12px 16px',
                    borderRadius: '16px',
                    borderTopLeftRadius: '4px',
                    marginLeft: 0,
                    boxShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <p className={isMobile ? 'text-base' : 'text-lg'} style={{ margin: 0 }}>
                    {debate.instigateText}
                  </p>
                </div>
                <div
                  style={{
                    alignSelf: 'flex-end',
                    maxWidth: isMobile ? '80%' : '60%',
                    backgroundColor: secondaryBubbleBackground,
                    color: secondaryBubbleText,
                    padding: '12px 16px',
                    borderRadius: '16px',
                    borderTopRightRadius: '4px',
                    marginRight: 0,
                    boxShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <p className={isMobile ? 'text-base' : 'text-lg'} style={{ margin: 0 }}>
                    {debate.debateText}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: primaryVoteColor }}>Red Votes: {debate.votesRed || 0}</span>
                <span style={{ color: secondaryVoteColor }}>Blue Votes: {debate.votesBlue || 0}</span>
              </div>
            </div>
          </Link>
        ))}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                disabled={page === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
