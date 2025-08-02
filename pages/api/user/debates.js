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

    const { sort, page = '1', limit = '25' } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;

    try {
        const userId = session.user.email;

        let debates = await Deliberate.find({ createdBy: userId }).lean();

        // Sort debates using the same logic as the public stats endpoint
        if (sort === 'oldest') {
            debates.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sort === 'newest') {
            debates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'mostDivisive') {
            debates.sort((a, b) => {
                const totalA = (a.votesRed || 0) + (a.votesBlue || 0);
                const totalB = (b.votesRed || 0) + (b.votesBlue || 0);
                const ratioA = totalA === 0 ? Infinity : Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = totalB === 0 ? Infinity : Math.abs(b.votesRed - b.votesBlue) / totalB;
                if (ratioA === ratioB) {
                    return totalB - totalA;
                }
                return ratioA - ratioB;
            });
        } else if (sort === 'mostDecisive') {
            debates.sort((a, b) => {
                const totalA = (a.votesRed || 0) + (a.votesBlue || 0);
                const totalB = (b.votesRed || 0) + (b.votesBlue || 0);
                const ratioA = totalA === 0 ? 0 : Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = totalB === 0 ? 0 : Math.abs(b.votesRed - b.votesBlue) / totalB;
                if (ratioA === ratioB) {
                    return totalB - totalA;
                }
                return ratioB - ratioA;
            });
        }

        const totalDebates = debates.length;
        const startIndex = (pageNum - 1) * limitNum;
        const pagedDebates = debates.slice(startIndex, startIndex + limitNum);

        // Calculate wins for the user (blue side victory)
        const wins = debates.reduce((sum, d) => {
            const winningSide = (d.votesRed === d.votesBlue)
                ? null
                : (d.votesRed > d.votesBlue ? 'red' : 'blue');
            return winningSide === 'blue' ? sum + 1 : sum;
        }, 0);

        return res.status(200).json({ debates: pagedDebates, totalDebates, wins });
    } catch (e) {
        console.error('Error fetching user debates:', e);
        return res.status(500).json({ error: 'Failed to fetch user debates' });
    }
}
