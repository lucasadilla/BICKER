import dbConnect from '../../../lib/dbConnect';
import Deliberate from '../../../models/Deliberate';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const deliberation = await Deliberate.findById(id);
      if (!deliberation) {
        return res.status(404).json({ error: 'Deliberation not found' });
      }
      return res.status(200).json(deliberation);
    } catch (error) {
      console.error('Error fetching deliberation:', error);
      return res.status(500).json({ error: 'Failed to fetch deliberation' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
