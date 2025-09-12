import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function ReportsAdmin() {
  const [reports, setReports] = useState([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map(a => a.trim());

    if (!session || !admins.includes(session.user?.email)) {
      router.replace('/');
      return;
    }

    const fetchReports = async () => {
      try {
        const res = await fetch('/api/report');
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      }
    };

    fetchReports();
  }, [session, status, router]);

  const resolveReport = async (id) => {
    const res = await fetch('/api/report', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'resolved' })
    });
    if (res.ok) {
      const updated = await res.json();
      setReports(reports.map(r => r._id === id ? updated : r));
    }
  };

  return (
    <div style={{ paddingTop: '70px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="heading-1">Reports</h1>
      {reports.length === 0 ? (
        <p>No reports</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {reports.map(r => (
            <li key={r._id} style={{ borderBottom: '1px solid #ccc', marginBottom: '15px', paddingBottom: '10px' }}>
              <p><strong>Target:</strong> {r.targetType} {r.targetId}</p>
              <p><strong>Reporter:</strong> {r.reporter}</p>
              <p><strong>Reason:</strong> {r.reason}</p>
              <p><strong>Status:</strong> {r.status}</p>
              {r.status !== 'resolved' && (
                <button onClick={() => resolveReport(r._id)}>Resolve</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
