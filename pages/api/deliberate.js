import dbConnect from '../../lib/dbConnect';
import Deliberate from '../../models/Deliberate';
import Notification from '../../models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
    try {
        await dbConnect();

        if (req.method === 'GET') {
            const deliberations = await Deliberate.find({});
            res.status(200).json(deliberations);
        } else if (req.method === 'POST') {
            // Handle reset request
            if (req.body.reset) {
                console.log('Resetting collection...');
                await Deliberate.collection.drop();
                console.log('Collection dropped successfully');
                return res.status(200).json({ message: 'Collection reset successfully' });
            }

            const { debateId, vote } = req.body;
            
            if (!debateId || !vote) {
                return res.status(400).json({ error: 'Missing debateId or vote' });
            }

            if (vote !== 'red' && vote !== 'blue') {
                return res.status(400).json({ error: 'Invalid vote type' });
            }

            console.log('Finding deliberation with ID:', debateId);
            const deliberation = await Deliberate.findById(debateId);
            if (!deliberation) {
                return res.status(404).json({ error: 'Deliberation not found' });
            }

            console.log('Current deliberation:', deliberation);

            // Ensure createdBy field exists
            if (!deliberation.createdBy) {
                deliberation.createdBy = 'system';
            }

            // Update votes based on the vote type
            if (vote === 'red') {
                deliberation.votesRed = (deliberation.votesRed || 0) + 1;
            } else if (vote === 'blue') {
                deliberation.votesBlue = (deliberation.votesBlue || 0) + 1;
            }

            const session = await getServerSession(req, res, authOptions);
            const voter = session?.user?.email || 'anonymous';

            // Add user's vote to votedBy array
            deliberation.votedBy = deliberation.votedBy || [];
            deliberation.votedBy.push({
                userId: voter,
                vote: vote,
                timestamp: new Date()
            });

            console.log('Saving deliberation...');
            const savedDeliberation = await deliberation.save();
            console.log('Deliberation saved:', savedDeliberation);

            // Notify the creator of the debate about the new vote
            if (deliberation.createdBy && deliberation.createdBy !== voter) {
                await Notification.create({
                    userId: deliberation.createdBy,
                    message: `Your debate received a new ${vote} vote.`
                });
            }
            
            // Return only the necessary data
            res.status(200).json({
                _id: savedDeliberation._id,
                votesRed: savedDeliberation.votesRed || 0,
                votesBlue: savedDeliberation.votesBlue || 0,
                votedBy: savedDeliberation.votedBy || []
            });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to process request',
            details: error.message 
        });
    }
}
