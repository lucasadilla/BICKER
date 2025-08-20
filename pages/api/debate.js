import dbConnect from '../../lib/dbConnect';
import Debate from '../../models/Debate';
import Instigate from '../../models/Instigate';
import Deliberate from '../../models/Deliberate';
import Notification from '../../models/Notification';
import User from '../../models/User';
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

    if (req.method === 'GET') {
        try {
            const debates = await Debate.find({}).sort({ createdAt: -1 });
            return res.status(200).json(debates);
        } catch (error) {
            console.error('Error fetching debates:', error);
            return res.status(500).json({ error: 'Failed to fetch debates' });
        }
    } else if (req.method === 'POST') {
        let fields = {};
        let files = {};
        if (req.headers['content-type']?.includes('multipart/form-data')) {
            ({ fields, files } = await parseForm(req));
        } else {
            const body = await parseJson(req);
            fields = body || {};
        }

        // Check if this is a reset request
        if (fields.reset) {
            try {
                await Deliberate.collection.drop();
                return res.status(200).json({ success: true, message: 'Deliberate collection reset' });
            } catch (error) {
                console.error('Error resetting collection:', error);
                return res.status(500).json({ error: 'Failed to reset collection' });
            }
        }

        const instigateId = fields.instigateId;
        const debateText = fields.debateText || '';
        const audioFile = files.audio;

        if (!instigateId || (!debateText && !audioFile)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (debateText && debateText.length > 200) {
            return res.status(400).json({ error: 'Debate text must be 200 characters or less' });
        }

        try {
            const instigate = await Instigate.findById(instigateId);
            if (!instigate) {
                return res.status(404).json({ error: 'Instigate not found' });
            }

            const session = await getServerSession(req, res, authOptions);
            const creator = session?.user?.email || 'anonymous';
            const instigator = instigate.createdBy || 'anonymous';

            if (audioFile && !session) {
                return res.status(401).json({ error: 'Authentication required for audio debate.' });
            }

            let debateAudioUrl;
            if (audioFile) {
                debateAudioUrl = await saveFile(audioFile);
            }

            const newDebate = await Debate.create({
                instigateText: instigate.text,
                instigateAudioUrl: instigate.audioUrl,
                debateText: debateText ? debateText.trim() : undefined,
                debateAudioUrl,
                createdBy: creator,
                instigatedBy: instigator
            });

            if (creator !== 'anonymous') {
                await User.findOneAndUpdate(
                    { email: creator },
                    { $inc: { points: 1, streak: 1 } }
                );
                await updateBadges(creator);
            }

            await Notification.create({
                userId: creator,
                message: 'Your debate has been created.'
            });

            await Deliberate.create({
                _id: newDebate._id,
                instigateText: instigate.text,
                instigateAudioUrl: instigate.audioUrl,
                debateText: debateText ? debateText.trim() : undefined,
                debateAudioUrl,
                createdBy: creator,
                instigatedBy: instigator,
                votesRed: 0,
                votesBlue: 0,
                votedBy: []
            });

            await Instigate.findByIdAndDelete(instigateId);

            return res.status(201).json({ success: true, debate: newDebate });
        } catch (error) {
            console.error('Error creating debate:', error);
            return res.status(500).json({ error: error.message || 'Failed to create debate' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

function parseForm(req) {
    return new Promise((resolve) => {
        const bb = Busboy({ headers: req.headers, limits: { fileSize: 1024 * 1024 } });
        const fields = {};
        const files = {};

        bb.on('field', (name, val) => {
            fields[name] = val;
        });

        bb.on('file', (name, file, info) => {
            const chunks = [];
            file.on('data', (data) => chunks.push(data));
            file.on('limit', () => {
                file.truncate();
            });
            file.on('end', () => {
                const buffer = Buffer.concat(chunks);
                files[name] = { buffer, filename: info.filename };
            });
        });

        bb.on('finish', () => {
            resolve({ fields, files });
        });

        req.pipe(bb);
    });
}

function parseJson(req) {
    return new Promise((resolve) => {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(data || '{}'));
            } catch (err) {
                resolve({});
            }
        });
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
