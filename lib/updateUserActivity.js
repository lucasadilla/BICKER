import User from '../models/User';

const STREAK_WINDOW_MS = 24 * 60 * 60 * 1000;

export default async function updateUserActivity(email, { pointsToAdd = 0 } = {}) {
  if (!email || email === 'anonymous') {
    return null;
  }

  const now = new Date();
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      points: pointsToAdd,
      streak: 1,
      lastActivityAt: now,
    });
    return user;
  }

  const lastActivityAt = user.lastActivityAt ? new Date(user.lastActivityAt) : null;
  const withinWindow = lastActivityAt && now - lastActivityAt <= STREAK_WINDOW_MS;
  const newStreak = withinWindow ? (user.streak || 0) + 1 : 1;

  const update = {
    $set: {
      streak: newStreak,
      lastActivityAt: now,
    },
  };

  if (pointsToAdd) {
    update.$inc = { points: pointsToAdd };
  }

  await User.updateOne({ email }, update);

  return {
    ...user.toObject(),
    streak: newStreak,
    lastActivityAt: now,
    points: (user.points || 0) + pointsToAdd,
  };
}

export { STREAK_WINDOW_MS };
