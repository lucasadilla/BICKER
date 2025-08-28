import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Badge } from '../../components/ui/badge';
import badgeImages from '../../lib/badgeImages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '../../components/ui/pagination';
import { sortDeliberates } from '../../lib/sortDeliberates';

export default function UserProfile() {
  const router = useRouter();
  const { username } = router.query;
  const [user, setUser] = useState(null);
  const [debates, setDebates] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedDebates, setDisplayedDebates] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const sorted = sortDeliberates([...debates], sort);
    const start = (page - 1) * 25;
    setDisplayedDebates(sorted.slice(start, start + 25));
    setTotalPages(Math.ceil(sorted.length / 25) || 1);
  }, [debates, sort, page]);

  useEffect(() => {
    if (!username) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/user/${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setDebates(data.debates || []);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      }
    };
    fetchData();
  }, [username]);

  if (!user) {
    return <div style={{ padding: '20px', maxWidth: '800px', margin: '80px auto' }}>User not found.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#4D94FF', color: 'white', paddingTop: '80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          {user.profilePicture && (
            <img
              src={user.profilePicture}
              alt={`${user.username} profile picture`}
              style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
            />
          )}
          <div>
            <h1 style={{ margin: 0 }}>{user.username}</h1>
            {user.bio && <p style={{ marginTop: '8px' }}>{user.bio}</p>}
            {user.badges && user.badges.length > 0 && (
              <div className="text-base" style={{ marginTop: '8px' }}>
                Badges:
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {user.badges.map((badge) => {
                    const image = badgeImages[badge];
                    return (
                      <Badge key={badge} variant="secondary" style={image ? { padding: '4px' } : {}}>
                        {image ? <img src={image} alt={badge} style={{ width: '24px', height: '24px' }} /> : badge}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <h2 style={{ marginTop: '20px' }}>Debates Participated</h2>
        {debates.length === 0 ? (
          <p>No debates found.</p>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
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
            {displayedDebates.map((d) => (
              <Link
                key={d._id}
                href={{ pathname: '/deliberate', query: { id: d._id } }}
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
                        {d.instigateText}
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
                        {d.debateText}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ color: '#FF4D4D' }}>Red Votes: {d.votesRed || 0}</span>
                    <span style={{ color: '#4D94FF' }}>Blue Votes: {d.votesBlue || 0}</span>
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
        )}
      </div>
    </div>
  );
}
