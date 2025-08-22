import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { Badge } from '../components/ui/badge';
import badgeImages from '../lib/badgeImages';
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

export default function MyStats() {
  const { data: session } = useSession();
  const [debates, setDebates] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDebates, setTotalDebates] = useState(0);
  const [wins, setWins] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);

  const winRate = totalDebates ? ((wins / totalDebates) * 100).toFixed(0) : '0';

  useEffect(() => {
    if (!session) return;
    const fetchDebates = async () => {
      try {
        const res = await fetch(`/api/user/debates?sort=${sort}&page=${page}`);
        if (!res.ok) throw new Error('Failed to fetch debates');
        const data = await res.json();
        setDebates(data.debates || []);
        setTotalDebates(data.totalDebates || 0);
        setWins(data.wins || 0);
        setPoints(data.points || 0);
        setStreak(data.streak || 0);
        setBadges(data.badges || []);
        setTotalPages(Math.ceil((data.totalDebates || 0) / 25) || 1);
      } catch (err) {
        console.error('Error fetching user debates:', err);
      }
    };
    fetchDebates();
  }, [session, sort, page]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!session) {
    return (
      <div style={{ paddingTop: '60px', textAlign: 'center' }}>
        <h2 className="heading-2">Please sign in to view your stats.</h2>
        <button onClick={() => signIn('google')}>Sign In with Google</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#4D94FF', paddingTop: '60px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', color: 'white' }}>
        <h1 className="heading-1" style={{ textAlign: 'center', marginBottom: '10px' }}>My Debates</h1>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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
              <p className="text-sm" style={{ margin: 0 }}>Debates</p>
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{winRate}%</p>
              <p className="text-sm" style={{ margin: 0 }}>Win Rate</p>
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{points}</p>
              <p className="text-sm" style={{ margin: 0 }}>Total Points</p>
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{streak}</p>
              <p className="text-sm" style={{ margin: 0 }}>Current Streak</p>
            </div>
          </div>
          <div className="text-base" style={{ margin: '4px 0' }}>
            Badges:
            {badges.length ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px', justifyContent: 'center' }}>
                {badges.map((badge) => {
                  const image = badgeImages[badge];
                  return (
                    <Badge key={badge} variant="secondary" style={image ? { padding: '4px' } : {}}>
                      {image ? <img src={image} alt={badge} style={{ width: '24px', height: '24px' }} /> : badge}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              ' None'
            )}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Select value={sort} onValueChange={setSort}>
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
                <div style={{ alignSelf: 'flex-start', maxWidth: isMobile ? '80%' : '60%', backgroundColor: '#FF4D4D', color: 'white', padding: '12px 16px', borderRadius: '16px', borderTopLeftRadius: '4px', marginLeft: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <p className={isMobile ? 'text-base' : 'text-lg'} style={{ margin: 0 }}>
                    {debate.instigateText}
                  </p>
                </div>
                <div style={{ alignSelf: 'flex-end', maxWidth: isMobile ? '80%' : '60%', backgroundColor: '#4D94FF', color: 'white', padding: '12px 16px', borderRadius: '16px', borderTopRightRadius: '4px', marginRight: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <p className={isMobile ? 'text-base' : 'text-lg'} style={{ margin: 0 }}>
                    {debate.debateText}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: '#FF4D4D' }}>Red Votes: {debate.votesRed || 0}</span>
                <span style={{ color: '#4D94FF' }}>Blue Votes: {debate.votesBlue || 0}</span>
              </div>
              {debate.userWroteSide && (
                <div style={{ marginTop: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                  You wrote: {debate.userWroteSide === 'red' ? 'Red' : 'Blue'}
                </div>
              )}
            </div>
          </Link>
        ))}
        {debates.length === 0 && (
          <p className="text-base" style={{ textAlign: 'center' }}>You have not participated in any debates yet.</p>
        )}
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
