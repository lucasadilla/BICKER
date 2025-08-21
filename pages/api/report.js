import dbConnect from '../../lib/dbConnect';
import Report from '../../models/Report';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

function isAdmin(email) {
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map(a => a.trim());
    return email && admins.includes(email);
}

export default async function handler(req, res) {
    await dbConnect();
    const session = await getServerSession(req, res, authOptions);

    if (req.method === 'POST') {
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { targetId, targetType, reason } = req.body;
        if (!targetId || !targetType || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const report = await Report.create({
            targetId,
            targetType,
            reporter: session.user.email,
            reason,
            status: 'pending'
        });
        return res.status(201).json(report);
    } else if (req.method === 'GET') {
        if (!session || !isAdmin(session.user.email)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const reports = await Report.find({}).sort({ createdAt: -1 });
        return res.status(200).json(reports);
    } else if (req.method === 'PUT') {
        if (!session || !isAdmin(session.user.email)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const updated = await Report.findByIdAndUpdate(id, { status }, { new: true });
        return res.status(200).json(updated);
    } else {
        res.setHeader('Allow', ['POST', 'GET', 'PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
