import dbConnect from '../../../lib/dbConnect';
import Deliberate from '../../../models/Deliberate';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

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

const sumReactionValues = (counts = {}) =>
  Object.values(counts || {}).reduce((total, value) => total + (typeof value === 'number' ? value : 0), 0);

const buildReactionTotals = (countsBySide = {}) => {
  const redCounts = countsBySide.red || {};
  const blueCounts = countsBySide.blue || {};

  return {
    red: sumReactionValues(redCounts),
    blue: sumReactionValues(blueCounts)
  };
};

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

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const deliberationDoc = await Deliberate.findById(id).lean();
      if (!deliberationDoc) {
        return res.status(404).json({ error: 'Deliberation not found' });
      }

      const session = await getServerSession(req, res, authOptions);
      const currentUser = session?.user?.email || null;

      const emails = [deliberationDoc.createdBy, deliberationDoc.instigatedBy].filter(
        email => email && email !== 'anonymous'
      );

      let creator = null;
      let instigator = null;
      if (emails.length) {
        const users = await User.find({ email: { $in: emails } }).lean();
        const map = users.reduce((acc, u) => {
          acc[u.email] = {
            username: u.username || u.email,
            profilePicture: u.profilePicture || ''
          };
          return acc;
        }, {});
        creator = map[deliberationDoc.createdBy] || null;
        instigator = map[deliberationDoc.instigatedBy] || null;
      }

      const {
        _id,
        createdBy: _createdBy,
        instigatedBy: _instigatedBy,
        votedBy = [],
        reactions = {},
        reactionsBy = [],
        ...rest
      } = deliberationDoc;

      const { votes: sanitizedVotes, myVote } = sanitizeVotes(votedBy, currentUser);

      const reactionsByEmoji = formatReactionTotals(reactions);
      const reactionCounts = {
        red: { ...reactionsByEmoji.red },
        blue: { ...reactionsByEmoji.blue }
      };
      const reactionTotalsBySide = buildReactionTotals(reactionsByEmoji);
      const myReactions = extractMyReactions(reactionsBy, currentUser);

      return res.status(200).json({
        ...rest,
        _id: _id.toString(),
        creator,
        instigator,
        votesRed: deliberationDoc.votesRed || 0,
        votesBlue: deliberationDoc.votesBlue || 0,
        votedBy: sanitizedVotes,
        myVote,
        reactions: reactionsByEmoji,
        reactionCounts,
        reactionTotals: reactionTotalsBySide,
        totalReactions: reactionTotalsBySide.red + reactionTotalsBySide.blue,
        myReactions
      });
    } catch (error) {
      console.error('Error fetching deliberation:', error);
      return res.status(500).json({ error: 'Failed to fetch deliberation' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
