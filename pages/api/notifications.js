import dbConnect from '../../lib/dbConnect';
import Notification from '../../models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
    await dbConnect();
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.email;

    if (req.method === 'GET') {
        const notifications = await Notification.find({ userId, read: false }).sort({ createdAt: -1 });
        return res.status(200).json(notifications);
    } else if (req.method === 'POST') {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ error: 'Invalid ids' });
        }
        await Notification.updateMany({ _id: { $in: ids }, userId }, { $set: { read: true } });
        return res.status(200).json({ success: true });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
