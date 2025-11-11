import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import Deliberate from '../../../models/Deliberate';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const identifier = decodeURIComponent(username);
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const debatesDocs = await Deliberate.find({
      $or: [
        { createdBy: user.email },
        { instigatedBy: user.email }
      ]
    }).sort({ createdAt: -1 }).lean();

    const debates = debatesDocs.map((d) => ({
      _id: d._id.toString(),
      instigateText: d.instigateText,
      debateText: d.debateText,
      votesRed: d.votesRed || 0,
      votesBlue: d.votesBlue || 0,
      createdAt: d.createdAt ? d.createdAt.toISOString() : null,
      updatedAt: d.updatedAt ? d.updatedAt.toISOString() : null,
    }));

    return res.json({
      user: {
        _id: user._id.toString(),
        email: user.email,
        username: user.username || user.email,
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
        badges: user.badges || [],
        selectedBadge: user.selectedBadge || '',
        points: user.points || 0,
        streak: user.streak || 0,
        supporters: user.supporters || [],
        supports: user.supports || [],
        colorScheme: user.colorScheme || 'default',
      },
      debates,
      requestedIdentifier: identifier,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

