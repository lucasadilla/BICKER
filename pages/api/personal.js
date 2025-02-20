// pages/api/debates/personal.js

import { getSession } from 'next-auth/react';
import dbConnect from '../../lib/dbConnect';
import Debate from '../../models/Debate';
import Vote from '../../models/Deliberate'; // optional if you track user votes

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
        // 1. Find all debates the user created or participated in
        // (depends on how you store user info on Debate docs).
        // Example: if Debate has a "userId" or "authorId" field:
        let debates = await Debate.find({ authorId: user.id }).lean();
        // If you also want their "debate" responses,
        // you might store them in the same collection or a different one.

        // 2. Sort them in memory or with Mongo queries
        if (sort === 'oldest') {
            debates.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sort === 'newest') {
            debates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'mostPopular') {
            debates.sort((a, b) => (b.votesRed + b.votesBlue) - (a.votesRed + a.votesBlue));
        } else if (sort === 'mostDivisive') {
            // difference ratio near 0
            debates.sort((a, b) => {
                const totalA = a.votesRed + a.votesBlue;
                const totalB = b.votesRed + b.votesBlue;
                const ratioA = Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = Math.abs(b.votesRed - b.votesBlue) / totalB;
                return ratioA - ratioB;
            });
        } else if (sort === 'mostDecisive') {
            // difference ratio near 1
            debates.sort((a, b) => {
                const totalA = a.votesRed + a.votesBlue;
                const totalB = b.votesRed + b.votesBlue;
                const ratioA = Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = Math.abs(b.votesRed - b.votesBlue) / totalB;
                return ratioB - ratioA;
            });
        }

        // 3. Count how many times this user has voted, if you store votes
        // For example, if you have a "Vote" model with { userId, debateId, side }
        // You could do:
        const myVotes = await Vote.find({ userId: user.id }).lean();
        const myVoteCount = myVotes.length;

        return res.status(200).json({ debates, myVoteCount });
    } catch (error) {
        console.error('Error in personal stats:', error);
        return res.status(500).json({ error: 'Failed to fetch personal stats' });
    }
}
