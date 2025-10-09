import dbConnect from '../../../lib/dbConnect';
import Deliberate from '../../../models/Deliberate';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const sanitizeVotes = (votes = []) =>
  votes.map(({ vote, timestamp }) => ({ vote, timestamp }));

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

      if (
        currentUser &&
        (deliberationDoc.votedBy || []).some(vote => vote.userId === currentUser)
      ) {
        return res.status(404).json({ error: 'Deliberation not found' });
      }

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

      const { _id, createdBy, instigatedBy, votedBy = [], ...rest } = deliberationDoc;

      return res.status(200).json({
        ...rest,
        _id: _id.toString(),
        creator,
        instigator,
        votesRed: deliberationDoc.votesRed || 0,
        votesBlue: deliberationDoc.votesBlue || 0,
        votedBy: sanitizeVotes(votedBy)
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
