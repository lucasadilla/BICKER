import dbConnect from '../../lib/dbConnect';
import Debate from '../../models/Debate';
import Instigate from '../../models/Instigate';
import Deliberate from '../../models/Deliberate';
import Notification from '../../models/Notification';
import User from '../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import updateBadges from '../../lib/badges';

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

        const { instigateId, debateText, voiceNote } = req.body;

        // Validate input
        if (!instigateId || ((!debateText || debateText.trim().length === 0) && !voiceNote)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (debateText && debateText.length > 200) {
            return res.status(400).json({ error: 'Debate text must be 200 characters or less' });
        }

        try {
            // 1) Get the instigate
            const instigate = await Instigate.findById(instigateId);
            if (!instigate) {
                return res.status(404).json({ error: 'Instigate not found' });
            }

            const session = await getServerSession(req, res, authOptions);
            const creator = session?.user?.email || 'anonymous';
            const instigator = instigate.createdBy || 'anonymous';

            // 2) Create the Debate
            const newDebate = await Debate.create({
                instigateText: instigate.text,
                instigateVoiceNote: instigate.voiceNote,
                debateText: debateText ? debateText.trim() : '',
                debateVoiceNote: voiceNote,
                createdBy: creator,
                instigatedBy: instigator
            });

            if (creator !== 'anonymous') {
                await User.findOneAndUpdate(
                    { email: creator },
                    { $inc: { points: 1, streak: 1 } }
                );
                await updateBadges(creator);
            }

            // Notify the creator that their debate was created
            await Notification.create({
                userId: creator,
                message: 'Your debate has been created.'
            });

            // 3) Create a Deliberate doc with the same text and reuse the debate's _id
            await Deliberate.create({
                _id: newDebate._id, // ensure deliberation uses the same id as the debate
                instigateText: instigate.text,
                instigateVoiceNote: instigate.voiceNote,
                debateText: debateText ? debateText.trim() : '',
                debateVoiceNote: voiceNote,
                createdBy: creator,
                instigatedBy: instigator,
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
