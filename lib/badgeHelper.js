import User from '../models/User';
import Debate from '../models/Debate';
import Instigate from '../models/Instigate';
import badgeRules from './badgeRules';

export default async function updateBadges(email) {
    if (!email || email === 'anonymous') return [];

    const user = await User.findOne({ email });
    if (!user) return [];

    const [debates, instigates] = await Promise.all([
        Debate.countDocuments({ createdBy: email }),
        Instigate.countDocuments({ createdBy: email })
    ]);

    const stats = {
        points: user.points || 0,
        streak: user.streak || 0,
        debates,
        instigates
    };

    const earned = badgeRules
        .filter(rule => rule.condition(stats))
        .map(rule => rule.name);

    const newBadges = earned.filter(name => !user.badges.includes(name));

    if (newBadges.length) {
        user.badges = [...user.badges, ...newBadges];
        await user.save();
    }

    return newBadges;
}
