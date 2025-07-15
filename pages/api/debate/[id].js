import dbConnect from '../../../lib/dbConnect';
import Debate from '../../../models/Debate';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const debate = await Debate.findById(id);
      if (!debate) {
        return res.status(404).json({ error: 'Debate not found' });
      }
      return res.status(200).json(debate);
    } catch (error) {
      console.error('Error fetching debate:', error);
      return res.status(500).json({ error: 'Failed to fetch debate' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
