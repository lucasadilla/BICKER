import dbConnect from '../../lib/dbConnect';
import Banner from '../../models/Banner';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

function isAdmin(email) {
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map(a => a.trim());
    return email && admins.includes(email);
}

export default async function handler(req, res) {
    await dbConnect();
    const session = await getServerSession(req, res, authOptions);

    if (req.method === 'GET') {
        const banner = await Banner.findOne({});
        return res.status(200).json({ imageUrl: banner ? banner.imageUrl : '' });
    }

    if (req.method === 'POST') {
        if (!session || !isAdmin(session.user.email)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ error: 'Missing imageUrl' });
        }
        let banner = await Banner.findOne({});
        if (banner) {
            banner.imageUrl = imageUrl;
            await banner.save();
        } else {
            banner = await Banner.create({ imageUrl });
        }
        return res.status(200).json({ imageUrl: banner.imageUrl });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
