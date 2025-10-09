import dbConnect from '../../lib/dbConnect';
import Deliberate from '../../models/Deliberate';
import Notification from '../../models/Notification';
import User from '../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import updateBadges from '../../lib/badges';
import emitter from '../../lib/deliberateEvents';
import updateUserActivity from '../../lib/updateUserActivity';

const sanitizeVotes = (votes = []) =>
    votes.map(({ vote, timestamp }) => ({ vote, timestamp }));

const buildResponseDebate = (debate, userMap = {}) => {
    const { _id, createdBy, instigatedBy, votedBy = [], ...rest } = debate;

    return {
        ...rest,
        _id: _id.toString(),
        creator: createdBy && createdBy !== 'anonymous' ? userMap[createdBy] || null : null,
        instigator:
            instigatedBy && instigatedBy !== 'anonymous'
                ? userMap[instigatedBy] || null
                : null,
        votesRed: debate.votesRed || 0,
        votesBlue: debate.votesBlue || 0,
        votedBy: sanitizeVotes(votedBy)
    };
};

export default async function handler(req, res) {
    try {
        await dbConnect();

        if (req.method === 'GET') {
            const deliberations = await Deliberate.find({}).lean();

            const userEmails = Array.from(
                new Set(
                    deliberations
                        .flatMap(d => [d.createdBy, d.instigatedBy])
                        .filter(email => email && email !== 'anonymous')
                )
            );

            const users = await User.find({ email: { $in: userEmails } }).lean();
            const userMap = users.reduce((acc, u) => {
                acc[u.email] = {
                    username: u.username || u.email,
                    profilePicture: u.profilePicture || ''
                };
                return acc;
            }, {});

            const deliberationsWithUsers = deliberations.map(d =>
                buildResponseDebate(d, userMap)
            );

            res.status(200).json(deliberationsWithUsers);
        } else if (req.method === 'POST') {


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

            const session = await getServerSession(req, res, authOptions);
            const voter = session?.user?.email || 'anonymous';

            // Initialize votedBy array if missing
            deliberation.votedBy = deliberation.votedBy || [];

            // Prevent users from voting more than once on the same debate
            if (deliberation.votedBy.some(v => v.userId === voter)) {
                return res.status(400).json({ error: 'You have already voted on this debate' });
            }

            // Update votes based on the vote type
            if (vote === 'red') {
                deliberation.votesRed = (deliberation.votesRed || 0) + 1;
            } else if (vote === 'blue') {
                deliberation.votesBlue = (deliberation.votesBlue || 0) + 1;
            }

            // Record this user's vote
            deliberation.votedBy.push({
                userId: voter,
                vote: vote,
                timestamp: new Date()
            });

            console.log('Saving deliberation...');
            const savedDeliberation = await deliberation.save();
            console.log('Deliberation saved:', savedDeliberation);

            if (voter !== 'anonymous') {
                await updateUserActivity(voter, { pointsToAdd: 1 });
                await updateBadges(voter);
            }

            // Notify the creator of the debate about the new vote
            if (deliberation.createdBy && deliberation.createdBy !== voter) {
                await Notification.create({
                    userId: deliberation.createdBy,
                    message: `Your debate received a new ${vote} vote.`
                });
            }

            // Emit vote update to connected clients
            emitter.emit('vote', {
                debateId: savedDeliberation._id.toString(),
                votesRed: savedDeliberation.votesRed || 0,
                votesBlue: savedDeliberation.votesBlue || 0
            });

            // Return only the necessary data
            res.status(200).json({
                _id: savedDeliberation._id,
                votesRed: savedDeliberation.votesRed || 0,
                votesBlue: savedDeliberation.votesBlue || 0,
                votedBy: sanitizeVotes(savedDeliberation.votedBy || [])
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
