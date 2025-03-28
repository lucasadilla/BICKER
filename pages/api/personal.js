// pages/api/debates/personal.js

import { getSession } from 'next-auth/react';
import dbConnect from '../../lib/dbConnect';
import Deliberate from '../../models/Deliberate';

export default async function handler(req, res) {
    await dbConnect();

    // Check user session
    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { user } = session;
    const { sort } = req.query;

    try {
        // Get all deliberations where the user has either created or voted
        const deliberations = await Deliberate.find({
            $or: [
                { createdBy: user.id },
                { 'votedBy.userId': user.id }
            ]
        }).lean();

        // Sort them based on "sort" param
        if (sort === 'oldest') {
            deliberations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sort === 'newest') {
            deliberations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'mostPopular') {
            deliberations.sort(
                (a, b) => (b.votesRed + b.votesBlue) - (a.votesRed + a.votesBlue)
            );
        } else if (sort === 'mostDivisive') {
            deliberations.sort((a, b) => {
                const totalA = a.votesRed + a.votesBlue;
                const totalB = b.votesRed + b.votesBlue;
                const ratioA = Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = Math.abs(b.votesRed - b.votesBlue) / totalB;
                return ratioA - ratioB;
            });
        } else if (sort === 'mostDecisive') {
            deliberations.sort((a, b) => {
                const totalA = a.votesRed + a.votesBlue;
                const totalB = b.votesRed + b.votesBlue;
                const ratioA = Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = Math.abs(b.votesRed - b.votesBlue) / totalB;
                return ratioB - ratioA;
            });
        }

        // Count total deliberations for this user
        const myDebateCount = deliberations.length;

        return res.status(200).json({ debates: deliberations, myDebateCount });
    } catch (error) {
        console.error('Error in personal stats:', error);
        return res.status(500).json({ error: 'Failed to fetch personal stats' });
    }
}
