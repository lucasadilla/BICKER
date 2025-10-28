import { getServerSession } from 'next-auth/next';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import { authOptions } from './auth/[...nextauth]';

const withSupportCounts = (userDoc) => {
  if (!userDoc) {
    return {
      supporters: [],
      supports: [],
      supporterCount: 0,
      supportsCount: 0,
    };
  }

  const user = typeof userDoc.toObject === 'function' ? userDoc.toObject() : { ...userDoc };
  const supporters = Array.isArray(user.supporters) ? user.supporters : [];
  const supports = Array.isArray(user.supports) ? user.supports : [];

  return {
    ...user,
    supporters,
    supports,
    supporterCount: supporters.length,
    supportsCount: supports.length,
  };
};

export default async function handler(req, res) {
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const email = session.user.email;
  if (req.method === 'GET') {
    const user = await User.findOne({ email });
    return res.json(withSupportCounts(user));
  }
  if (req.method === 'POST') {
    const { username, bio, profilePicture, selectedBadge, colorScheme } = req.body;
    const normalizedScheme = colorScheme === 'light' ? 'default' : colorScheme;
    const allowedSchemes = ['default', 'dark'];
    const sanitizedColorScheme = allowedSchemes.includes(normalizedScheme) ? normalizedScheme : 'default';
    const update = { username, bio, profilePicture, selectedBadge, colorScheme: sanitizedColorScheme };
    const user = await User.findOneAndUpdate(
      { email },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.json(withSupportCounts(user));
  }
  res.status(405).end();
}
