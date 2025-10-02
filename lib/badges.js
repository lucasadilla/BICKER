import User from '../models/User';
import Debate from '../models/Debate';
import Instigate from '../models/Instigate';
import Deliberate from '../models/Deliberate';


const badgeRules = [
  { name: 'First Debate', condition: s => s.debates >= 1 },
  { name: '5 Debates', condition: s => s.debates >= 5 },
  { name: '10 Debates', condition: s => s.debates >= 10 },
  { name: '25 Debates', condition: s => s.debates >= 25 },
  { name: '50 Debates', condition: s => s.debates >= 50 },
  { name: '100 Debates', condition: s => s.debates >= 100 },
  { name: '1000 Debates', condition: s => s.debates >= 1000 },
  { name: 'First Instigate', condition: s => s.instigates >= 1 },
  { name: '5 Instigates', condition: s => s.instigates >= 5 },
  { name: '10 Instigates', condition: s => s.instigates >= 10 },
  { name: '25 Instigates', condition: s => s.instigates >= 25 },
  { name: '50 Instigates', condition: s => s.instigates >= 50 },
  { name: '100 Instigates', condition: s => s.instigates >= 100 },
  { name: '1000 Instigates', condition: s => s.instigates >= 1000 },
  { name: '50% Win Rate', condition: s => s.winRate >= 50 },
  { name: '75% Win Rate', condition: s => s.winRate >= 75 },
  { name: 'Perfect Record', condition: s => s.winRate === 100 },
  { name: '10 Points', condition: s => s.points >= 10 },
  { name: '5-Day Streak', condition: s => s.streak >= 5 },
  { name: '10-Day Streak', condition: s => s.streak >= 10 },
  { name: 'Month Streak', condition: s => s.streak >= 30 },
  { name: '3 Months Streak', condition: s => s.streak >= 90 },
  { name: '6 Months Streak', condition: s => s.streak >= 182 },
  { name: '1 Year Streak', condition: s => s.streak >= 365 }
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
