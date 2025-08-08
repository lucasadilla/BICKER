import dbConnect from '../../lib/dbConnect';
import Instigate from '../../models/Instigate';

export default async function handler(req, res) {
  await dbConnect();
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days
    const trending = await Instigate.aggregate([
      { $match: { createdAt: { $gte: since }, tags: { $exists: true, $ne: [] } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    return res.status(200).json(trending);
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    return res.status(500).json({ error: 'Failed to fetch trending tags.' });
  }
}
