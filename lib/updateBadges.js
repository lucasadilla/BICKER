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

    // instigateCount parameter is reserved for future badge rules
    void instigateCount;

    return Array.from(badges);
}
