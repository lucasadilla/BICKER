import dbConnect from '../../../lib/dbConnect';
import Deliberate from '../../../models/Deliberate';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    await dbConnect();
    try {
        const userId = session.user.email;
        const debates = await Deliberate.find({
            $or: [
                { createdBy: userId },
                { 'votedBy.userId': userId }
            ]
        }).lean();
        return res.status(200).json({ debates });
    } catch (e) {
        console.error('Error fetching user debates:', e);
        return res.status(500).json({ error: 'Failed to fetch user debates' });
    }
}
