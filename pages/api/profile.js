import { getSession } from 'next-auth/react';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  await dbConnect();
  const email = session.user.email;
  if (req.method === 'GET') {
    const user = await User.findOne({ email });
    return res.json(user);
  }
  if (req.method === 'POST') {
    const { username, bio, avatar, selectedBadge } = req.body;
    const update = { username, bio, avatar, selectedBadge };
    const user = await User.findOneAndUpdate({ email }, update, { new: true });
    return res.json(user);
  }
  res.status(405).end();
}
