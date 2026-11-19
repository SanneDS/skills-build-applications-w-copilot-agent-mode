import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: { type: String, trim: true, required: true },
  focus: { type: String, trim: true, required: true },
  minutes: { type: Number, required: true },
  difficulty: { type: String, trim: true, required: true },
});

export const Workout = model('Workout', workoutSchema);
