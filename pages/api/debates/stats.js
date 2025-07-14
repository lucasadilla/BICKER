// pages/api/debates/stats.js
import dbConnect from '../../../lib/dbConnect';
import Deliberate from '../../../models/Deliberate';

export default async function handler(req, res) {
    await dbConnect();

    const { sort } = req.query;
    try {
        // 1. Fetch all deliberations
        let debates = await Deliberate.find({}).lean();

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
            // Sort by closest split with more votes taking precedence
            debates.sort((a, b) => {
                const totalA = a.votesRed + a.votesBlue;
                const totalB = b.votesRed + b.votesBlue;
                const ratioA = totalA === 0 ? Infinity : Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = totalB === 0 ? Infinity : Math.abs(b.votesRed - b.votesBlue) / totalB;
                if (ratioA === ratioB) {
                    return totalB - totalA; // more total votes first when equally divisive
                }
                return ratioA - ratioB; // smaller ratio => more divisive
            });
        } else if (sort === 'mostDecisive') {
            // Sort by most lopsided with more votes taking precedence
            debates.sort((a, b) => {
                const totalA = a.votesRed + a.votesBlue;
                const totalB = b.votesRed + b.votesBlue;
                const ratioA = totalA === 0 ? 0 : Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = totalB === 0 ? 0 : Math.abs(b.votesRed - b.votesBlue) / totalB;
                if (ratioA === ratioB) {
                    return totalB - totalA; // more total votes first when ratio equal
                }
                return ratioB - ratioA; // bigger ratio => more decisive
            });
        }

        // 3. Calculate total votes across the site
        const totalVotes = debates.reduce(
            (sum, d) => sum + (d.votesRed || 0) + (d.votesBlue || 0),
            0
        );

        return res.status(200).json({ debates, totalVotes });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
} 
