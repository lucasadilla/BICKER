import dbConnect from '../../lib/dbConnect';
import Deliberate from '../../models/Deliberate';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const deliberations = await Deliberate.find({});
            return res.status(200).json(deliberations);
        } catch (error) {
            console.error('Error fetching deliberations:', error);
            return res.status(500).json({ error: 'Failed to fetch deliberations' });
        }
    } else if (req.method === 'POST') {
        // update existing doc's votes
        try {
            const { debateId, votesRed, votesBlue } = req.body;
            if (!debateId) {
                return res.status(400).json({ error: 'debateId is required' });
            }

            const doc = await Deliberate.findById(debateId);
            if (!doc) {
                return res.status(404).json({ error: 'Deliberate record not found' });
            }

            if (votesRed) doc.votesRed += votesRed;
            if (votesBlue) doc.votesBlue += votesBlue;

            await doc.save();
            return res.status(200).json(doc);
        } catch (error) {
            console.error('Error updating deliberation:', error);
            return res.status(500).json({ error: 'Failed to update deliberation' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
