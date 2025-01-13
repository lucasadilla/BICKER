import dbConnect from '../../lib/dbConnect';
import Debate from '../../models/Debate';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const debates = await Debate.find({}).populate('instigateId'); // Fetch debates and populate their related instigates
            res.status(200).json(debates);
        } catch (error) {
            console.error('Error fetching debates:', error);
            res.status(500).json({ error: 'Failed to fetch debates' });
        }
    } else if (req.method === 'POST') {
        const { instigateId, debateText } = req.body;
        if (!instigateId || !debateText || debateText.length > 200) {
            return res.status(400).json({ error: 'Invalid input. Provide instigateId and debateText under 200 characters.' });
        }
        try {
            const newDebate = await Debate.create({ instigateId, debateText });
            res.status(201).json(newDebate);
        } catch (error) {
            console.error('Error creating debate:', error);
            res.status(500).json({ error: 'Failed to create debate' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
