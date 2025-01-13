import dbConnect from '../../lib/dbConnect';
import Debate from '../../models/Debate';
import Deliberate from '../../models/Deliberate';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            // Fetch all debates
            const debates = await Debate.find({}).populate('instigateId');

            // Fetch associated votes for each debate
            const deliberations = await Deliberate.find({});

            // Combine debates with their votes
            const debatesWithVotes = debates.map((debate) => {
                const deliberation = deliberations.find((d) => d.debateId.toString() === debate._id.toString());
                return {
                    ...debate.toObject(),
                    votesRed: deliberation?.votesRed || 0,
                    votesBlue: deliberation?.votesBlue || 0,
                };
            });

            res.status(200).json(debatesWithVotes);
        } catch (error) {
            console.error('Error fetching debates and votes:', error);
            res.status(500).json({ error: 'Failed to fetch debates and votes' });
        }
    } else if (req.method === 'POST') {
        const { debateId, votesRed = 0, votesBlue = 0 } = req.body;

        if (!debateId) {
            return res.status(400).json({ error: 'debateId is required.' });
        }

        try {
            const deliberate = await Deliberate.findOneAndUpdate(
                { debateId },
                { $inc: { votesRed, votesBlue } },
                { new: true, upsert: true }
            );
            res.status(201).json(deliberate);
        } catch (error) {
            console.error('Error updating votes:', error);
            res.status(500).json({ error: 'Failed to update votes' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
