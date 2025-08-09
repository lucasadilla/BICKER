const badgeRules = [
    {
        name: 'First Debate',
        condition: (stats) => stats.debates >= 1
    },
    {
        name: 'First Instigate',
        condition: (stats) => stats.instigates >= 1
    },
    {
        name: '10 Points',
        condition: (stats) => stats.points >= 10
    },
    {
        name: '5-Day Streak',
        condition: (stats) => stats.streak >= 5
    }
];

export default badgeRules;
