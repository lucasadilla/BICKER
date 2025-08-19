import { getServerSession } from 'next-auth/next';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const email = session.user.email;
  if (req.method === 'GET') {
    const user = await User.findOne({ email });
    return res.json(user);
  }
  if (req.method === 'POST') {
    const { username, bio, profilePicture, selectedBadge, colorScheme } = req.body;
    const update = { username, bio, profilePicture, selectedBadge, colorScheme };
    const user = await User.findOneAndUpdate(
      { email },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.json(user);
  }
  res.status(405).end();
}
