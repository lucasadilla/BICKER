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
        const { page = '1', limit = '3' } = req.query || {};
        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 3, 1), 100);
        const skip = (pageNumber - 1) * limitNumber;

        const [notifications, unreadCount, totalCount] = await Promise.all([
            Notification.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            Notification.countDocuments({ userId, read: false }),
            Notification.countDocuments({ userId })
        ]);

        const totalPages = Math.max(Math.ceil(totalCount / limitNumber), 1);

        const serializedNotifications = notifications.map((notification) => {
            let createdAt = null;
            if (notification.createdAt) {
                const dateValue = notification.createdAt instanceof Date
                    ? notification.createdAt
                    : new Date(notification.createdAt);
                if (!Number.isNaN(dateValue.getTime())) {
                    createdAt = dateValue.toISOString();
                }
            }

            const debateId = notification.debateId
                ? notification.debateId.toString()
                : null;

            const directUrl = typeof notification.url === 'string' && notification.url.trim() !== ''
                ? notification.url.trim()
                : typeof notification.link === 'string' && notification.link.trim() !== ''
                    ? notification.link.trim()
                    : null;

            return {
                _id: notification._id?.toString?.() || notification._id,
                message: notification.message,
                read: Boolean(notification.read),
                debateId,
                type: notification.type || 'response',
                createdAt,
                url: directUrl
            };
        });

        return res.status(200).json({
            notifications: serializedNotifications,
            unreadCount,
            totalCount,
            totalPages,
            page: pageNumber,
            limit: limitNumber
        });
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
