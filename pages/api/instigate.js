import dbConnect from '../../lib/dbConnect';
import Instigate from '../../models/Instigate';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import updateBadges from '../../lib/badges';
import Busboy from 'busboy';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const config = {
    api: { bodyParser: false }
};

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'POST') {
        const session = await getServerSession(req, res, authOptions);
        const creator = session?.user?.email || 'anonymous';

        const { fields, files, error } = await parseForm(req);
        if (error) {
            return res.status(error.status || 500).json({ error: error.message });
        }

        const text = fields.text || '';
        const audioFile = files.audio;

        if (!text && !audioFile) {
            return res.status(400).json({ error: 'Text or audio is required.' });
        }
        if (text && text.length > 200) {
            return res.status(400).json({ error: 'Text must be under 200 characters.' });
        }
        if (audioFile && !session) {
            return res.status(401).json({ error: 'Authentication required for audio instigate.' });
        }

        try {
            let audioUrl;
            if (audioFile) {
                audioUrl = await saveFile(audioFile);
            }
            const newInstigate = await Instigate.create({
                text: text || undefined,
                audioUrl,
                createdBy: creator
            });
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

function parseForm(req) {
    return new Promise((resolve) => {
        const bb = Busboy({ headers: req.headers, limits: { fileSize: 1024 * 1024 } });
        const fields = {};
        const files = {};
        let error;

        bb.on('field', (name, val) => {
            fields[name] = val;
        });

        bb.on('file', (name, file, info) => {
            const chunks = [];
            file.on('data', (data) => chunks.push(data));
            file.on('limit', () => {
                error = { status: 400, message: 'File too large' };
                file.truncate();
            });
            file.on('end', () => {
                const buffer = Buffer.concat(chunks);
                files[name] = { buffer, filename: info.filename }; 
            });
        });

        bb.on('error', (err) => {
            error = { status: 500, message: err.message };
        });

        bb.on('finish', () => {
            resolve({ fields, files, error });
        });

        req.pipe(bb);
    });
}

async function saveFile(file) {
    const uploadDir = path.join(process.cwd(), 'public', 'voice');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    const ext = path.extname(file.filename) || '.webm';
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);
    return `/voice/${filename}`;
}
