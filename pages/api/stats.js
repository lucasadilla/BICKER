// pages/api/stats.js
import dbConnect from '../../lib/dbConnect';
import Deliberate from '../../models/Deliberate';
import { sortDeliberates } from '../../lib/sortDeliberates';

export default async function handler(req, res) {
    await dbConnect();

    const { sort } = req.query;
    try {
        // 1. Fetch all deliberations with at least 10 total votes
        let debates = await Deliberate.find({
            $expr: { $gte: [{ $add: ["$votesRed", "$votesBlue"] }, 10] }
        }).lean();

        // 2. Sort them based on the "sort" param
        debates = sortDeliberates(debates, sort);

        // 3. Calculate total votes across the site
        const allDebates = await Deliberate.find({}).lean();
        const totalVotes = allDebates.reduce(
            (sum, d) => sum + d.votesRed + d.votesBlue,
            0
        );

        return res.status(200).json({ debates, totalVotes });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
}
