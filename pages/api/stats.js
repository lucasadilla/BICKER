// pages/api/stats.js
import dbConnect from '../../lib/dbConnect';
import Deliberate from '../../models/Deliberate';
import { sortDeliberates } from '../../lib/sortDeliberates';

const toPlainObject = (counts = {}) => {
    if (!counts) {
        return {};
    }

    if (counts instanceof Map) {
        return Array.from(counts.entries()).reduce((acc, [emoji, value]) => {
            acc[emoji] = value;
            return acc;
        }, {});
    }

    return Object.entries(counts).reduce((acc, [emoji, value]) => {
        acc[emoji] = value;
        return acc;
    }, {});
};

const sumReactionValues = (counts = {}) =>
    Object.values(counts || {}).reduce((total, value) => total + (typeof value === 'number' ? value : 0), 0);

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
            (sum, d) => sum + (d.votesRed || 0) + (d.votesBlue || 0),
            0
        );

        let overallReactions = 0;

        // 4. Remove any personally identifiable information before returning data
        const sanitizedDebates = debates.map(({
            _id,
            instigateText,
            debateText,
            votesRed,
            votesBlue,
            createdAt,
            updatedAt,
            reactions = {},
        }) => {
            const reactionCounts = {
                red: toPlainObject(reactions.red),
                blue: toPlainObject(reactions.blue),
            };

            const reactionTotals = {
                red: sumReactionValues(reactionCounts.red),
                blue: sumReactionValues(reactionCounts.blue),
            };

            const debateReactionTotal = reactionTotals.red + reactionTotals.blue;
            overallReactions += debateReactionTotal;

            return {
                _id,
                instigateText,
                debateText,
                votesRed,
                votesBlue,
                createdAt,
                updatedAt,
                reactionCounts,
                reactionTotals,
                totalReactions: debateReactionTotal,
            };
        });

        return res.status(200).json({
            debates: sanitizedDebates,
            totalVotes,
            totalReactions: overallReactions,
            totalDebates: sanitizedDebates.length,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
}
