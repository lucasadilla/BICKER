export default function updateBadges(user, winRate, instigateCount) {
    if (!user) return [];

    const badges = new Set(user.badges || []);

    // Win rate based badges
    if (winRate === 100 && !badges.has('Perfect Record')) {
        badges.add('Perfect Record');
    } else {
        if (winRate >= 75 && !badges.has('75% Win Rate')) {
            badges.add('75% Win Rate');
        }
        if (winRate >= 50 && !badges.has('50% Win Rate')) {
            badges.add('50% Win Rate');
        }
    }

    // Instigate count based badges
    if (instigateCount >= 5 && !badges.has('5 Instigates')) {
        badges.add('5 Instigates');
    }
    if (instigateCount >= 10 && !badges.has('10 Instigates')) {
        badges.add('10 Instigates');
    }

    return Array.from(badges);
}
