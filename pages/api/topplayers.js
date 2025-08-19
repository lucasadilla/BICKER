import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import Deliberate from '../../models/Deliberate';

export default async function handler(req, res) {
  await dbConnect();
  try {
    const users = await User.find({}).lean();
    const debates = await Deliberate.find({}).lean();

    const statsMap = {};
    users.forEach(u => {
      const key = u.email;
      statsMap[key] = {
        username: u.username || u.email,
        wins: 0,
        votes: 0,
        debates: 0,
      };
    });

    debates.forEach(d => {
      const { instigatedBy, createdBy, votesRed = 0, votesBlue = 0 } = d;
      if (statsMap[instigatedBy]) {
        const stat = statsMap[instigatedBy];
        stat.debates += 1;
        stat.votes += votesRed;
        if (votesRed > votesBlue) stat.wins += 1;
      }
      if (statsMap[createdBy]) {
        const stat = statsMap[createdBy];
        stat.debates += 1;
        stat.votes += votesBlue;
        if (votesBlue > votesRed) stat.wins += 1;
      }
    });

    const statsArr = Object.values(statsMap).map(s => ({
      username: s.username,
      winRate: s.debates ? s.wins / s.debates : 0,
      votes: s.votes,
      debates: s.debates,
    })).filter(s => s.debates > 0);

    const highestWinRate = [...statsArr].sort((a, b) => b.winRate - a.winRate).slice(0, 10);
    const mostVotes = [...statsArr].sort((a, b) => b.votes - a.votes).slice(0, 10);
    const mostDebates = [...statsArr].sort((a, b) => b.debates - a.debates).slice(0, 10);
    const lowestWinRate = [...statsArr].sort((a, b) => a.winRate - b.winRate).slice(0, 10);

    res.status(200).json({ highestWinRate, mostVotes, mostDebates, lowestWinRate });
  } catch (e) {
    console.error('Error fetching top players:', e);
    res.status(500).json({ error: 'Failed to fetch top players' });
  }
}
