import dbConnect from '../../lib/dbConnect';
import Deliberate from '../../models/Deliberate';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
    try {
        await dbConnect();
        console.log('Database connected successfully');

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
                console.log('Request body:', { debateId, votesRed, votesBlue });

                if (!debateId) {
                    return res.status(400).json({ error: 'debateId is required' });
                }

                // Use findOneAndUpdate to handle the update atomically
                const update = {
                    $inc: {
                        votesRed: votesRed || 0,
                        votesBlue: votesBlue || 0
                    }
                };

                // If user is authenticated, add their vote to votedBy array
                const session = await getServerSession(req, res, authOptions);
                if (session) {
                    update.$push = {
                        votedBy: {
                            userId: session.user.email,
                            vote: votesRed ? 'red' : 'blue'
                        }
                    };
                }

                const doc = await Deliberate.findOneAndUpdate(
                    { 
                        _id: debateId,
                        ...(session && { 'votedBy.userId': { $ne: session.user.email } }) // Only check if user is authenticated
                    },
                    update,
                    { 
                        new: true, // Return the updated document
                        runValidators: true // Run schema validations
                    }
                );

                if (!doc) {
                    // Check if document exists at all
                    const exists = await Deliberate.exists({ _id: debateId });
                    if (!exists) {
                        return res.status(404).json({ error: 'Deliberate record not found' });
                    }
                    if (session) {
                        return res.status(400).json({ error: 'User has already voted on this debate' });
                    }
                }

                console.log('Document updated successfully:', doc);
                return res.status(200).json(doc);
            } catch (error) {
                console.error('Error updating deliberation:', error);
                return res.status(500).json({ 
                    error: 'Failed to update deliberation',
                    details: error.message 
                });
            }
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Top-level error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
