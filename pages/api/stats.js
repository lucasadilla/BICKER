// pages/api/stats.js
import dbConnect from '../../lib/dbConnect';
import Deliberate from '../../models/Deliberate';
import { sortDeliberates } from '../../lib/sortDeliberates';

export default async function handler(req, res) {
    await dbConnect();

    const { sort } = req.query;
    try {
        // 1. Fetch all deliberations
        let debates = await Deliberate.find({}).lean();

        // 2. Sort them based on the "sort" param
        debates = sortDeliberates(debates, sort);

        // 3. Calculate total votes and total debates across the site
        const totalVotes = debates.reduce(
            (sum, d) => sum + d.votesRed + d.votesBlue,
            0
        );

        // 4. Remove any personally identifiable information before returning data
        const sanitizedDebates = debates.map(({
            _id,
            instigateText,
            debateText,
            votesRed,
            votesBlue,
            createdAt,
            updatedAt,
        }) => ({
            _id,
            instigateText,
            debateText,
            votesRed,
            votesBlue,
            createdAt,
            updatedAt,
        }));

        return res.status(200).json({
            debates: sanitizedDebates,
            totalVotes,
            totalDebates: sanitizedDebates.length,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
}
