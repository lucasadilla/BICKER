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
    <div style={{ minHeight: '100vh', backgroundColor: '#4D94FF', paddingTop: '60px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', color: 'white' }}>
        <h1 className="heading-1" style={{ textAlign: 'center', marginBottom: '10px' }}>Debate Leaderboard</h1>
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
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalDebates}</p>
            <p className="text-sm" style={{ margin: 0 }}>Total Debates</p>
          </div>
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalVotes}</p>
            <p className="text-sm" style={{ margin: 0 }}>Total Votes</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={toggleTopPlayers}
            style={{
              backgroundColor: 'white',
              color: '#333',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Top Players
          </button>
        </div>
        {showTopPlayers && playerStats && (
          <div style={{ backgroundColor: 'white', color: '#333', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <h3 style={{ marginTop: 0 }}>Highest Win Rate</h3>
                <ol>
                  {playerStats.highestWinRate.map((p, i) => (
                    <li key={p.username || i}>
                      <Link
                        href={`/user/${encodeURIComponent(p.username)}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {p.username}
                      </Link>: {(p.winRate * 100).toFixed(0)}%
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 style={{ marginTop: 0 }}>Most Total Votes</h3>
                <ol>
                  {playerStats.mostVotes.map((p, i) => (
                    <li key={p.username || i}>
                      <Link
                        href={`/user/${encodeURIComponent(p.username)}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {p.username}
                      </Link>: {p.votes}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 style={{ marginTop: 0 }}>Most Debates Participated</h3>
                <ol>
                  {playerStats.mostDebates.map((p, i) => (
                    <li key={p.username || i}>
                      <Link
                        href={`/user/${encodeURIComponent(p.username)}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {p.username}
                      </Link>: {p.debates}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 style={{ marginTop: 0 }}>Biggest Loser</h3>
                <ol>
                  {playerStats.lowestWinRate.map((p, i) => (
                    <li key={p.username || i}>
                      <Link
                        href={`/user/${encodeURIComponent(p.username)}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
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
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.7)',
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
                backgroundColor: 'white',
                color: '#333',
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
                    backgroundColor: '#FF4D4D',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    borderTopLeftRadius: '4px',
                    marginLeft: 0,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
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
                    backgroundColor: '#4D94FF',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    borderTopRightRadius: '4px',
                    marginRight: 0,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <p className={isMobile ? 'text-base' : 'text-lg'} style={{ margin: 0 }}>
                    {debate.debateText}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: '#FF4D4D' }}>Red Votes: {debate.votesRed || 0}</span>
                <span style={{ color: '#4D94FF' }}>Blue Votes: {debate.votesBlue || 0}</span>
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
