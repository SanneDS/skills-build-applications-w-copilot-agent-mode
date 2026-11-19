import { isObjectIdOrHexString, Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function readInput(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw httpError(400, 'Expected a JSON object');
  }
  return input as Record<string, unknown>;
}

function isNonBlank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && isObjectIdOrHexString(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const { userId, teamId, type, minutes } = readInput(input);
  if (!isId(userId) || !isId(teamId)) {
    throw httpError(400, 'Valid userId and teamId are required');
  }
  if (!isNonBlank(type) || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw httpError(400, 'An activity type and positive minutes are required');
  }

  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user || !team) throw httpError(404, 'User or team not found');

  return Activity.create({ user: user._id, team: team._id, type, minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const { name, mascot, members = [] } = readInput(input);
  if (!isNonBlank(name) || !isNonBlank(mascot)) {
    throw httpError(400, 'Team name and mascot are required');
  }
  if (!Array.isArray(members) || !members.every(isId)) {
    throw httpError(400, 'Members must be an array of user IDs');
  }
  return Team.create({ name, mascot, members });
}

export async function getLeaderboard() {
  const [teams, scores] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
      { $match: { team: { $type: 'objectId' } } },
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(scores.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map(({ _id, name }) => ({ teamName: name, totalPoints: pointsByTeam.get(_id.toString()) ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints || (a.teamName ?? '').localeCompare(b.teamName ?? ''))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

const focusByActivity = new Map([
  ['run', 'endurance'],
  ['walk', 'endurance'],
  ['cycle', 'endurance'],
  ['strength', 'strength'],
  ['mobility', 'mobility'],
]);

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw httpError(404, 'User not found');

  const goal = user.fitnessGoal?.toLowerCase();
  if (goal) {
    const goalWorkouts = await Workout.find({ focus: goal }).sort({ title: 1 }).lean();
    if (goalWorkouts.length) {
      return goalWorkouts.map(workout => ({ ...workout, reason: `Matches your ${goal} fitness goal.` }));
    }
  }

  const recent = await Activity.findOne({ user: user._id, type: { $in: [...focusByActivity.keys()] } })
    .sort({ occurredAt: -1 }).lean();
  if (!recent) return [];

  const focus = focusByActivity.get(recent.type);
  const workouts = await Workout.find({ focus }).sort({ title: 1 }).lean();
  return workouts.map(workout => ({ ...workout, reason: `Matches your recent ${recent.type} activity.` }));
}

export { User };
