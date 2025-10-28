import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import Notification from '../../../models/Notification';
import { authOptions } from '../auth/[...nextauth]';

const normalizeIdentifier = (value) => {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim();
};

const buildProfileUrl = (user) => {
    if (!user) {
        return null;
    }
    const identifier = user.username && user.username.trim() !== ''
        ? user.username.trim()
        : user.email;
    if (!identifier) {
        return null;
    }
    return `/user/${encodeURIComponent(identifier)}`;
};

const loadUserSummaries = async (emails) => {
    if (!Array.isArray(emails) || emails.length === 0) {
        return [];
    }

    const users = await User.find(
        { email: { $in: emails } },
        { email: 1, username: 1, profilePicture: 1 }
    ).lean();

    const userMap = new Map(
        users.map((user) => [user.email, user])
    );

    return emails.map((email) => {
        const match = userMap.get(email) || {};
        const username = typeof match.username === 'string' && match.username.trim() !== ''
            ? match.username.trim()
            : '';
        const displayIdentifier = username || email;

        return {
            email,
            username,
            displayName: displayIdentifier,
            profilePicture: match.profilePicture || '',
            profilePath: `/user/${encodeURIComponent(displayIdentifier)}`
        };
    });
};

export default async function handler(req, res) {
    await dbConnect();
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const viewerEmail = session.user.email;

    const identifierSource = req.method === 'GET' ? req.query : req.body;
    const identifierRaw = identifierSource?.identifier || identifierSource?.user || identifierSource?.email || identifierSource?.username;
    const identifier = normalizeIdentifier(identifierRaw);

    if (!identifier) {
        return res.status(400).json({ error: 'Missing identifier' });
    }

    const targetUser = await User.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    });

    if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    const targetEmail = targetUser.email;
    const isSelf = targetEmail === viewerEmail;

    if (req.method === 'GET') {
        const supporters = targetUser.supporters || [];
        const supports = targetUser.supports || [];
        const viewerUser = isSelf
            ? targetUser
            : await User.findOne({ email: viewerEmail }, { supports: 1 }).lean();
        const viewerSupports = viewerUser?.supports || [];

        const [supporterSummaries, supportSummaries, viewerSupportSummaries] = await Promise.all([
            loadUserSummaries(supporters),
            loadUserSummaries(supports),
            loadUserSummaries(viewerSupports)
        ]);

        return res.status(200).json({
            supporters,
            supports,
            supporterCount: supporters.length,
            supportsCount: supports.length,
            isSupporting: supporters.includes(viewerEmail),
            isSelf,
            viewerSupports,
            viewerSupportsCount: viewerSupports.length,
            supporterSummaries,
            supportSummaries,
            viewerSupportSummaries
        });
    }

    if (req.method === 'POST' || req.method === 'PATCH') {
        if (isSelf) {
            return res.status(400).json({ error: 'You cannot support yourself' });
        }

        const viewerUser = await User.findOne({ email: viewerEmail });
        if (!viewerUser) {
            return res.status(404).json({ error: 'Viewer account not found' });
        }

        const alreadySupporting = Array.isArray(targetUser.supporters)
            ? targetUser.supporters.includes(viewerEmail)
            : false;

        if (alreadySupporting) {
            await Promise.all([
                User.updateOne({ email: viewerEmail }, { $pull: { supports: targetEmail } }),
                User.updateOne({ email: targetEmail }, { $pull: { supporters: viewerEmail } })
            ]);
        } else {
            await Promise.all([
                User.updateOne({ email: viewerEmail }, { $addToSet: { supports: targetEmail } }),
                User.updateOne({ email: targetEmail }, { $addToSet: { supporters: viewerEmail } })
            ]);

            const profileUrl = buildProfileUrl(viewerUser);
            try {
                await Notification.create({
                    userId: targetEmail,
                    message: 'You have a new supporter',
                    type: 'supporter',
                    link: profileUrl
                });
            } catch (error) {
                // Swallow notification errors so they do not block the follow action
            }
        }

        const [updatedTarget, updatedViewer] = await Promise.all([
            User.findOne({ email: targetEmail }).lean(),
            User.findOne({ email: viewerEmail }).lean()
        ]);

        const supporters = updatedTarget?.supporters || [];
        const supports = updatedTarget?.supports || [];
        const viewerSupports = updatedViewer?.supports || [];

        const [supporterSummaries, supportSummaries, viewerSupportSummaries] = await Promise.all([
            loadUserSummaries(supporters),
            loadUserSummaries(supports),
            loadUserSummaries(viewerSupports)
        ]);

        return res.status(200).json({
            supporters,
            supports,
            supporterCount: supporters.length,
            supportsCount: supports.length,
            isSupporting: supporters.includes(viewerEmail),
            viewerSupports,
            viewerSupportsCount: viewerSupports.length,
            supporterSummaries,
            supportSummaries,
            viewerSupportSummaries,
            isSelf
        });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
