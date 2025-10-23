import dbConnect from '../../lib/dbConnect';
import Deliberate from '../../models/Deliberate';
import Notification from '../../models/Notification';
import User from '../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import updateBadges from '../../lib/badges';
import emitter from '../../lib/deliberateEvents';
import updateUserActivity from '../../lib/updateUserActivity';

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

const sanitizeVotes = (votes = [], currentUser = null) => {
    const sanitizedVotes = votes.map(({ vote, timestamp }) => ({ vote, timestamp }));
    const myVoteEntry = currentUser
        ? votes.find(entry => entry.userId === currentUser)
        : null;

    return {
        votes: sanitizedVotes,
        myVote: myVoteEntry ? myVoteEntry.vote : null
    };
};

const toPlainObject = counts => {
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

const formatReactionTotals = (reactions = {}) => ({
    red: toPlainObject(reactions.red),
    blue: toPlainObject(reactions.blue)
});

const extractMyReactions = (reactionsBy = [], userId = null) => {
    const selections = { red: null, blue: null };

    if (!userId) {
        return selections;
    }

    reactionsBy.forEach(({ userId: reactorId, side, emoji }) => {
        if (reactorId === userId && (side === 'red' || side === 'blue')) {
            selections[side] = emoji || null;
        }
    });

    return selections;
};

const getReactionCount = (reactions = {}, side, emoji) => {
    if (!side || !emoji || !reactions) {
        return 0;
    }

    const sideCounts = reactions[side];
    if (!sideCounts) {
        return 0;
    }

    if (sideCounts instanceof Map) {
        return sideCounts.get(emoji) || 0;
    }

    return sideCounts[emoji] || 0;
};

const buildAggregateResponse = (debate, currentUser = null) => {
    if (!debate) {
        return null;
    }

    const doc = debate.toObject ? debate.toObject() : debate;

    const { votes: sanitizedVotes, myVote } = sanitizeVotes(doc.votedBy || [], currentUser);

    return {
        _id: doc._id.toString(),
        votesRed: doc.votesRed || 0,
        votesBlue: doc.votesBlue || 0,
        votedBy: sanitizedVotes,
        myVote,
        reactions: formatReactionTotals(doc.reactions || {}),
        myReactions: extractMyReactions(doc.reactionsBy || [], currentUser)
    };
};

const buildResponseDebate = (debate, userMap = {}, currentUser = null) => {
    const doc = debate?.toObject ? debate.toObject() : debate;

    if (!doc) {
        return null;
    }

    const {
        _id,
        createdBy,
        instigatedBy,
        votedBy: _votedBy,
        reactions: _reactions,
        reactionsBy: _reactionsBy,
        ...rest
    } = doc;

    const aggregate = buildAggregateResponse(doc, currentUser);

    return {
        ...rest,
        ...aggregate,
        creator:
            createdBy && createdBy !== 'anonymous' ? userMap[createdBy] || null : null,
        instigator:
            instigatedBy && instigatedBy !== 'anonymous'
                ? userMap[instigatedBy] || null
                : null
    };
};

export default async function handler(req, res) {
    try {
        await dbConnect();

        if (req.method === 'GET') {
            const session = await getServerSession(req, res, authOptions);
            const currentUser = session?.user?.email || null;

            const deliberations = await Deliberate.find({}).lean();

            const filteredDeliberations = currentUser
                ? deliberations.filter(
                      debate => !(debate.votedBy || []).some(vote => vote.userId === currentUser)
                  )
                : deliberations;

            const userEmails = Array.from(
                new Set(
                    filteredDeliberations
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

            const deliberationsWithUsers = filteredDeliberations
                .map(d => buildResponseDebate(d, userMap, currentUser))
                .filter(Boolean);

            res.status(200).json(deliberationsWithUsers);
        } else if (req.method === 'POST') {
            const session = await getServerSession(req, res, authOptions);
            const actor = session?.user?.email || 'anonymous';

            const { debateId, vote, type, side, emoji } = req.body || {};

            if (!debateId) {
                return res.status(400).json({ error: 'Missing debateId' });
            }

            const isReactionRequest =
                type === 'reaction' || hasOwn(req.body, 'emoji') || hasOwn(req.body, 'side');

            if (isReactionRequest) {
                if (!side || (side !== 'red' && side !== 'blue')) {
                    return res.status(400).json({ error: 'Invalid side for reaction' });
                }

                const deliberation = await Deliberate.findById(debateId);
                if (!deliberation) {
                    return res.status(404).json({ error: 'Deliberation not found' });
                }

                deliberation.reactions = deliberation.reactions || { red: new Map(), blue: new Map() };
                if (!deliberation.reactions.red) {
                    deliberation.reactions.red = new Map();
                }
                if (!deliberation.reactions.blue) {
                    deliberation.reactions.blue = new Map();
                }
                deliberation.reactionsBy = deliberation.reactionsBy || [];

                const existingReaction = deliberation.reactionsBy.find(
                    reaction => reaction.userId === actor && reaction.side === side
                );

                const updates = {
                    $pull: { reactionsBy: { userId: actor, side } }
                };

                const inc = {};

                if (existingReaction?.emoji) {
                    const currentCount = getReactionCount(
                        deliberation.reactions,
                        side,
                        existingReaction.emoji
                    );

                    if (currentCount > 0) {
                        inc[`reactions.${side}.${existingReaction.emoji}`] = -1;
                    }
                }

                const normalizedEmoji =
                    typeof emoji === 'string' ? emoji.trim() : emoji;
                const shouldAddReaction =
                    normalizedEmoji !== undefined &&
                    normalizedEmoji !== null &&
                    normalizedEmoji !== '';

                if (shouldAddReaction) {
                    inc[`reactions.${side}.${normalizedEmoji}`] =
                        (inc[`reactions.${side}.${normalizedEmoji}`] || 0) + 1;

                    updates.$push = {
                        reactionsBy: {
                            userId: actor,
                            side,
                            emoji: normalizedEmoji,
                            timestamp: new Date()
                        }
                    };
                }

                if (Object.keys(inc).length) {
                    updates.$inc = inc;
                }

                await Deliberate.updateOne({ _id: debateId }, updates);

                const updatedDeliberation = await Deliberate.findById(debateId);
                const aggregate = buildAggregateResponse(updatedDeliberation, actor);

                return res.status(200).json(aggregate);
            }

            if (!vote) {
                return res.status(400).json({ error: 'Missing vote' });
            }

            if (vote !== 'red' && vote !== 'blue') {
                return res.status(400).json({ error: 'Invalid vote type' });
            }

            const deliberation = await Deliberate.findById(debateId);
            if (!deliberation) {
                return res.status(404).json({ error: 'Deliberation not found' });
            }

            if (!deliberation.createdBy) {
                deliberation.createdBy = 'system';
            }

            deliberation.votedBy = deliberation.votedBy || [];

            if (deliberation.votedBy.some(v => v.userId === actor)) {
                return res.status(400).json({ error: 'You have already voted on this debate' });
            }

            if (vote === 'red') {
                deliberation.votesRed = (deliberation.votesRed || 0) + 1;
            } else if (vote === 'blue') {
                deliberation.votesBlue = (deliberation.votesBlue || 0) + 1;
            }

            deliberation.votedBy.push({
                userId: actor,
                vote: vote,
                timestamp: new Date()
            });

            const savedDeliberation = await deliberation.save();

            const backgroundTasks = [];

            if (actor !== 'anonymous') {
                backgroundTasks.push(updateUserActivity(actor, { pointsToAdd: 1 }));
                backgroundTasks.push(updateBadges(actor));
            }

            if (deliberation.createdBy && deliberation.createdBy !== actor) {
                backgroundTasks.push(
                    Notification.create({
                        userId: deliberation.createdBy,
                        message: `Your debate received a new ${vote} vote.`
                    })
                );
            }

            if (backgroundTasks.length > 0) {
                Promise.allSettled(backgroundTasks).catch(error => {
                    console.error('Background task error:', error);
                });
            }

            emitter.emit('vote', {
                debateId: savedDeliberation._id.toString(),
                votesRed: savedDeliberation.votesRed || 0,
                votesBlue: savedDeliberation.votesBlue || 0
            });

            const aggregate = buildAggregateResponse(savedDeliberation, actor);

            res.status(200).json(aggregate);
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
