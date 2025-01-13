import dbConnect from '../../lib/dbConnect';
import Instigate from '../../models/Instigate';

export default async function handler(req, res) {
    try {
        // Ensure database is connected
        await dbConnect();

        if (req.method === 'POST') {
            const { text } = req.body;

            // Validate input
            if (!text || text.length > 200) {
                return res.status(400).json({ error: 'Text is required and must be under 200 characters.' });
            }

            // Save instigate to the database
            const newInstigate = await Instigate.create({ text });
            return res.status(201).json(newInstigate);
        } else if (req.method === 'GET') {
            // Fetch all instigates
            const instigates = await Instigate.find({});
            return res.status(200).json(instigates);
        } else {
            // Handle unsupported HTTP methods
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        // Log the error to the server console
        console.error('Error in /api/instigate:', error);

        // Respond with a generic error message
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
