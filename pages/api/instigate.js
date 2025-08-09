import dbConnect from '../../lib/dbConnect';
import Instigate from '../../models/Instigate';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import updateBadges from '../../lib/badgeHelper';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'POST') {
        const { text } = req.body;
        const session = await getServerSession(req, res, authOptions);
        const creator = session?.user?.email || 'anonymous';
        if (!text || text.length > 200) {
            return res
                .status(400)
                .json({ error: 'Text is required and must be under 200 characters.' });
        }
            try {
            const newInstigate = await Instigate.create({ text, createdBy: creator });
            await updateBadges(creator);
            return res.status(201).json(newInstigate);
        } catch (error) {
            console.error('Error creating instigate:', error);
            return res.status(500).json({ error: 'Failed to create instigate.' });
        }

    } else if (req.method === 'GET') {
        try {
            const { search } = req.query;
            let filter = {};

            // If there's a search query, filter by partial match (case-insensitive)
            if (search) {
                filter = { text: { $regex: search, $options: 'i' } };
            }

            // Fetch either all instigates or those matching the search
            const instigates = await Instigate.find(filter);
            return res.status(200).json(instigates);

        } catch (error) {
            console.error('Error fetching instigates:', error);
            return res.status(500).json({ error: 'Failed to fetch instigates.' });
        }

    } else if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) {
            return res
                .status(400)
                .json({ error: 'Instigate ID is required (use ?id=... ).' });
        }
        try {
            await Instigate.findByIdAndDelete(id);
            return res.status(200).json({ message: 'Instigate deleted successfully.' });
        } catch (error) {
            console.error('Error deleting instigate:', error);
            return res.status(500).json({ error: 'Failed to delete instigate.' });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
