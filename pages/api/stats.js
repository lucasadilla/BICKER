// pages/api/debates/stats.js
import dbConnect from '../../lib/dbConnect';
import Debate from '../../models/Debate';

export default async function handler(req, res) {
    await dbConnect();

    const { sort } = req.query;
    try {
        // 1. Fetch all debates with at least 10 total votes
        let debates = await Debate.find({
            $expr: { $gte: [{ $add: ["$votesRed", "$votesBlue"] }, 10] }
        }).lean();

        // 2. Sort them based on the "sort" param
        if (sort === 'oldest') {
            debates.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sort === 'newest') {
            debates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'mostPopular') {
            // Sort by total votes descending
            debates.sort(
                (a, b) => (b.votesRed + b.votesBlue) - (a.votesRed + a.votesBlue)
            );
        } else if (sort === 'mostDivisive') {
            // Sort by closest split (difference ratio near 0)
            debates.sort((a, b) => {
                const totalA = a.votesRed + a.votesBlue;
                const totalB = b.votesRed + b.votesBlue;
                const ratioA = Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = Math.abs(b.votesRed - b.votesBlue) / totalB;
                return ratioA - ratioB; // smaller ratio => more divisive
            });
        } else if (sort === 'mostDecisive') {
            // Sort by most lopsided (largest ratio)
            debates.sort((a, b) => {
                const totalA = a.votesRed + a.votesBlue;
                const totalB = b.votesRed + b.votesBlue;
                const ratioA = Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = Math.abs(b.votesRed - b.votesBlue) / totalB;
                return ratioB - ratioA; // bigger ratio => more decisive
            });
        }

        // 3. Calculate total votes across the site
        const allDebates = await Debate.find({}).lean();
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
