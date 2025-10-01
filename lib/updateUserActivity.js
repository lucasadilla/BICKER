import User from '../models/User';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfUTCDate(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getDayDifference(lastActivityAt, now = new Date()) {
  if (!lastActivityAt) {
    return null;
  }

  const lastActivity = startOfUTCDate(new Date(lastActivityAt));
  const currentDay = startOfUTCDate(now);

  return Math.round((currentDay - lastActivity) / MS_PER_DAY);
}

function calculateUpdatedStreak(lastActivityAt, currentStreak = 0, now = new Date()) {
  const dayDifference = getDayDifference(lastActivityAt, now);

  if (dayDifference === null) {
    return 1;
  }

  if (dayDifference <= 0) {
    return currentStreak || 1;
  }

  if (dayDifference === 1) {
    return (currentStreak || 0) + 1;
  }

  return 1;
}

function isStreakBroken(lastActivityAt, now = new Date()) {
  const dayDifference = getDayDifference(lastActivityAt, now);

  return dayDifference !== null && dayDifference > 1;
}

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

  const newStreak = calculateUpdatedStreak(user.lastActivityAt, user.streak, now);

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

export { MS_PER_DAY, getDayDifference, calculateUpdatedStreak, isStreakBroken };
