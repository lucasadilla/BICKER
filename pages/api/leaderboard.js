import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';

export default async function handler(req, res) {
    await dbConnect();
    try {
        const users = await User.find({}).sort({ points: -1 }).lean();
        res.status(200).json({ users });
    } catch (e) {
        console.error('Error fetching leaderboard:', e);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
}
