import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { Badge } from '../components/ui/badge';
import badgeImages from '../lib/badgeImages';
import badgeDescriptions from '../lib/badgeDescriptions';
import { useColorScheme } from '../lib/ColorSchemeContext';
import SupporterList from '../components/SupporterList';
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
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const winRate = totalDebates ? ((wins / totalDebates) * 100).toFixed(0) : '0';

  const pageBackground = isDarkMode ? '#000000' : '#4D94FF';
  const headingColor = isDarkMode ? '#f5f5f5' : '#ffffff';
  const statLabelColor = isDarkMode ? '#d4d4d4' : '#ffffff';
  const panelBackground = isDarkMode ? '#111111' : '#ffffff';
  const panelTextColor = isDarkMode ? '#f5f5f5' : '#333333';
  const primaryBubbleBackground = isDarkMode ? '#1a1a1a' : '#FF4D4D';
  const secondaryBubbleBackground = isDarkMode ? '#262626' : '#4D94FF';
  const bubbleTextColor = '#f5f5f5';
  const primaryVoteColor = isDarkMode ? '#f5f5f5' : '#FF4D4D';
  const secondaryVoteColor = isDarkMode ? '#d0d0d0' : '#4D94FF';
  const controlBackground = isDarkMode ? '#111111' : 'rgba(255, 255, 255, 0.95)';
  const controlTextColor = isDarkMode ? '#f5f5f5' : '#1f2937';
  const counterBorderColor = isDarkMode ? '#1f1f1f' : 'rgba(255, 255, 255, 0.6)';

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
    <div style={{ minHeight: '100vh', backgroundColor: pageBackground, paddingTop: '60px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', color: headingColor }}>
        <h1 className="heading-1" style={{ textAlign: 'center', marginBottom: '10px', color: headingColor }}>My Debates</h1>
        {session?.user?.email && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <SupporterList
              identifier={session.user.email}
              textColor={headingColor}
              borderColor={counterBorderColor}
              darkMode={isDarkMode}
            />
          </div>
        )}
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
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: headingColor }}>{totalDebates}</p>
              <p className="text-sm" style={{ margin: 0, color: statLabelColor }}>Debates</p>
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: headingColor }}>{winRate}%</p>
              <p className="text-sm" style={{ margin: 0, color: statLabelColor }}>Win Rate</p>
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: headingColor }}>{points}</p>
              <p className="text-sm" style={{ margin: 0, color: statLabelColor }}>Total Points</p>
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: headingColor }}>{streak}</p>
              <p className="text-sm" style={{ margin: 0, color: statLabelColor }}>Current Streak</p>
            </div>
          </div>
          <div className="text-base" style={{ margin: '4px 0', color: headingColor }}>
            Badges:
            {badges.length ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px', justifyContent: 'center' }}>
                {badges.map((badge) => {
                  const image = badgeImages[badge];
                  const description = badgeDescriptions[badge];
                  return (
                    <Badge
                      key={badge}
                      variant="secondary"
                      style={image ? { padding: '4px', backgroundColor: isDarkMode ? '#1f1f1f' : undefined } : { backgroundColor: isDarkMode ? '#1f1f1f' : undefined, color: isDarkMode ? '#f5f5f5' : undefined }}
                      title={description || badge}
                      aria-label={description || badge}
                    >
                      {image ? <img src={image} alt={badge} style={{ width: '75px', height: '75px' }} /> : badge}
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
                <div style={{ alignSelf: 'flex-start', maxWidth: isMobile ? '80%' : '60%', backgroundColor: primaryBubbleBackground, color: bubbleTextColor, padding: '12px 16px', borderRadius: '16px', borderTopLeftRadius: '4px', marginLeft: 0, boxShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <p className={isMobile ? 'text-base' : 'text-lg'} style={{ margin: 0 }}>
                    {debate.instigateText}
                  </p>
                </div>
                <div style={{ alignSelf: 'flex-end', maxWidth: isMobile ? '80%' : '60%', backgroundColor: secondaryBubbleBackground, color: bubbleTextColor, padding: '12px 16px', borderRadius: '16px', borderTopRightRadius: '4px', marginRight: 0, boxShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <p className={isMobile ? 'text-base' : 'text-lg'} style={{ margin: 0 }}>
                    {debate.debateText}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: primaryVoteColor }}>Red Votes: {debate.votesRed || 0}</span>
                <span style={{ color: secondaryVoteColor }}>Blue Votes: {debate.votesBlue || 0}</span>
              </div>
              {debate.userWroteSide && (
                <div style={{ marginTop: '8px', textAlign: 'center', fontWeight: 'bold', color: headingColor }}>
                  You wrote: {debate.userWroteSide === 'red' ? 'Red' : 'Blue'}
                </div>
              )}
            </div>
          </Link>
        ))}
        {debates.length === 0 && (
          <p className="text-base" style={{ textAlign: 'center', color: headingColor }}>You have not participated in any debates yet.</p>
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
