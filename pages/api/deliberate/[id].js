import dbConnect from '../../../lib/dbConnect';
import Deliberate from '../../../models/Deliberate';
import User from '../../../models/User';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const deliberationDoc = await Deliberate.findById(id).lean();
      if (!deliberationDoc) {
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

      return res.status(200).json({
        ...deliberationDoc,
        _id: deliberationDoc._id.toString(),
        creator,
        instigator
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
