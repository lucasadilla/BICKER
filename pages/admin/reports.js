import { useState } from 'react';
import dbConnect from '../../lib/dbConnect';
import Report from '../../models/Report';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';

export default function ReportsAdmin({ reports: initialReports }) {
  const [reports, setReports] = useState(initialReports);

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

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(a => a.trim());
  if (!session || !admins.includes(session.user.email)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  await dbConnect();
  const reports = await Report.find({}).sort({ createdAt: -1 }).lean();
  return {
    props: {
      reports: reports.map(r => ({
        _id: r._id.toString(),
        targetId: r.targetId,
        targetType: r.targetType,
        reporter: r.reporter,
        reason: r.reason,
        status: r.status,
      })),
    },
  };
}
