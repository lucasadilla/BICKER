import dbConnect from '../../lib/dbConnect';
import Debate from '../../models/Debate';
import Instigate from '../../models/Instigate';
import Deliberate from '../../models/Deliberate';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const debates = await Debate.find({}).sort({ createdAt: -1 });
            return res.status(200).json(debates);
        } catch (error) {
            console.error('Error fetching debates:', error);
            return res.status(500).json({ error: 'Failed to fetch debates' });
        }
    } else if (req.method === 'POST') {
        // Check if this is a reset request
        if (req.body.reset) {
            try {
                await Deliberate.collection.drop();
                return res.status(200).json({ success: true, message: 'Deliberate collection reset' });
            } catch (error) {
                console.error('Error resetting collection:', error);
                return res.status(500).json({ error: 'Failed to reset collection' });
            }
        }

        // Check user session
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user || !session.user.email) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { instigateId, debateText } = req.body;
        
        // Validate input
        if (!instigateId || !debateText) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (debateText.length > 200) {
            return res.status(400).json({ error: 'Debate text must be 200 characters or less' });
        }

        try {
            // 1) Get the instigate
            const instigate = await Instigate.findById(instigateId);
            if (!instigate) {
                return res.status(404).json({ error: 'Instigate not found' });
            }

            // 2) Create the Debate
            const newDebate = await Debate.create({
                instigateText: instigate.text,
                debateText: debateText.trim(),
                createdBy: session.user.email
            });

            // 3) Create a Deliberate doc with the same text
            await Deliberate.create({
                instigateText: instigate.text,
                debateText: debateText.trim(),
                createdBy: session.user.email,
                votesRed: 0,
                votesBlue: 0,
                votedBy: []
            });

            // 4) Delete the instigate
            await Instigate.findByIdAndDelete(instigateId);

            return res.status(201).json({ 
                success: true, 
                debate: newDebate 
            });
        } catch (error) {
            console.error('Error creating debate:', error);
            return res.status(500).json({ 
                error: error.message || 'Failed to create debate' 
            });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
