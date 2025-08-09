import User from '../models/User';
import Debate from '../models/Debate';
import Instigate from '../models/Instigate';
import Deliberate from '../models/Deliberate';

/**
 * Available badges and their conditions:
 * - First Debate: user has created at least one debate.
 * - First Instigate: user has created at least one instigate.
 * - 5 Instigates: user has created at least five instigates.
 * - 10 Instigates: user has created at least ten instigates.
 * - 50% Win Rate: user has a win rate of 50% or higher.
 * - 75% Win Rate: user has a win rate of 75% or higher.
 * - Perfect Record: user has a 100% win rate.
 * - 10 Points: user has earned at least ten points.
 * - 5-Day Streak: user has a streak of at least five days.
 */
const badgeRules = [
  { name: 'First Debate', condition: s => s.debates >= 1 },
  { name: 'First Instigate', condition: s => s.instigates >= 1 },
  { name: '5 Instigates', condition: s => s.instigates >= 5 },
  { name: '10 Instigates', condition: s => s.instigates >= 10 },
  { name: '50% Win Rate', condition: s => s.winRate >= 50 },
  { name: '75% Win Rate', condition: s => s.winRate >= 75 },
  { name: 'Perfect Record', condition: s => s.winRate === 100 },
  { name: '10 Points', condition: s => s.points >= 10 },
  { name: '5-Day Streak', condition: s => s.streak >= 5 }
];

function applyRules(user, stats) {
  const badges = new Set(user.badges || []);
  badgeRules.forEach(rule => {
    if (rule.condition(stats)) badges.add(rule.name);
  });
  return Array.from(badges);
}

export default async function updateBadges(userOrEmail, winRate = 0, instigateCount = 0, debateCount = 0) {
  if (!userOrEmail) return [];

  // Called with email: fetch stats and persist badges
  if (typeof userOrEmail === 'string') {
    const email = userOrEmail;
    if (email === 'anonymous') return [];

    const user = await User.findOne({ email });
    if (!user) return [];

    const [debates, instigates, deliberations] = await Promise.all([
      Debate.countDocuments({ createdBy: email }),
      Instigate.countDocuments({ createdBy: email }),
      Deliberate.find({
        $or: [{ createdBy: email }, { instigatedBy: email }]
      }).lean()
    ]);

    const wins = deliberations.reduce((sum, d) => {
      const winningSide = d.votesRed === d.votesBlue ? null : (d.votesRed > d.votesBlue ? 'red' : 'blue');
      if (winningSide === 'blue' && d.createdBy === email) return sum + 1;
      if (winningSide === 'red' && d.instigatedBy === email) return sum + 1;
      return sum;
    }, 0);

    const total = deliberations.length;
    const stats = {
      points: user.points || 0,
      streak: user.streak || 0,
      debates,
      instigates,
      winRate: total ? Math.round((wins / total) * 100) : 0
    };

    const updated = applyRules(user, stats);
    if ((user.badges || []).length !== updated.length) {
      user.badges = updated;
      await user.save();
    }
    return updated;
  }

  // Called with user object and precalculated stats (does not persist)
  const user = userOrEmail;
  const stats = {
    points: user.points || 0,
    streak: user.streak || 0,
    debates: debateCount,
    instigates: instigateCount,
    winRate
  };
  return applyRules(user, stats);
}

export { badgeRules };
