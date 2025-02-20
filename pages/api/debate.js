import dbConnect from '../../lib/dbConnect';
import Debate from '../../models/Debate';
import Instigate from '../../models/Instigate';
import Deliberate from '../../models/Deliberate';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const debates = await Debate.find({});
            return res.status(200).json(debates);
        } catch (error) {
            console.error('Error fetching debates:', error);
            return res.status(500).json({ error: 'Failed to fetch debates' });
        }
    } else if (req.method === 'POST') {
        const { instigateId, debateText } = req.body;
        if (!instigateId || !debateText || debateText.length > 200) {
            return res
                .status(400)
                .json({ error: 'Invalid input. Provide instigateId and debateText under 200 characters.' });
        }

        try {
            // 1) Get the instigate
            const instigate = await Instigate.findById(instigateId);
            if (!instigate) {
                return res.status(404).json({ error: 'Instigate not found.' });
            }

            // 2) Create the Debate
            const newDebate = await Debate.create({
                instigateText: instigate.text,
                debateText: debateText,
            });

            // 3) Delete the instigate
            await Instigate.findByIdAndDelete(instigateId);

            // 4) Also create a Deliberate doc with the same text
            await Deliberate.create({
                instigateText: newDebate.instigateText,
                debateText: newDebate.debateText,
            });

            return res.status(201).json(newDebate);
        } catch (error) {
            console.error('Error creating debate:', error);
            return res.status(500).json({ error: 'Failed to create debate' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
