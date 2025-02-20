// pages/api/debates/personal.js

import { getSession } from 'next-auth/react';
import dbConnect from '/lib/dbConnect'; // up three dirs from /api/debates/personal.js
import Debate from '/models/Debate';
import Vote from '/models/Deliberate'; // rename to "Deliberate" if you prefer

export default async function handler(req, res) {
    await dbConnect();

    // Check user session
    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { user } = session; // e.g., session.user.id
    const { sort } = req.query;

    try {
        // 1. Find all debates the user created or participated in.
        //    E.g., if Debate doc has "authorId" = user.id:
        let debates = await Debate.find({ authorId: user.id }).lean();

        // 2. Sort them in-memory based on "sort" param
        if (sort === 'oldest') {
            debates.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sort === 'newest') {
            debates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'mostPopular') {
            debates.sort(
                (a, b) => (b.votesRed + b.votesBlue) - (a.votesRed + a.votesBlue)
            );
        } else if (sort === 'mostDivisive') {
            // difference ratio near 0 => small difference
            debates.sort((a, b) => {
                const totalA = a.votesRed + a.votesBlue;
                const totalB = b.votesRed + b.votesBlue;
                const ratioA = Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = Math.abs(b.votesRed - b.votesBlue) / totalB;
                return ratioA - ratioB;
            });
        } else if (sort === 'mostDecisive') {
            // difference ratio near 1 => big difference
            debates.sort((a, b) => {
                const totalA = a.votesRed + a.votesBlue;
                const totalB = b.votesRed + b.votesBlue;
                const ratioA = Math.abs(a.votesRed - a.votesBlue) / totalA;
                const ratioB = Math.abs(b.votesRed - b.votesBlue) / totalB;
                return ratioB - ratioA;
            });
        }

        // 3. Count how many times this user has voted (if your "Vote" model is in Deliberate)
        // Alternatively, if "Deliberate" is your entire votes collection, rename or adapt logic.
        const myVotes = await Vote.find({ userId: user.id }).lean();
        const myVoteCount = myVotes.length;

        return res.status(200).json({ debates, myVoteCount });
    } catch (error) {
        console.error('Error in personal stats:', error);
        return res.status(500).json({ error: 'Failed to fetch personal stats' });
    }
}
