import mongoose from 'mongoose';
import Counter from './Counter.js';

const sessionSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: String, ref: 'User' },
  refreshTokenHash: { type: String, required: true },
  ipAddress: { type: String },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false }
});

sessionSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate({ _id: 'sessionId' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
    this._id = `S${counter.seq.toString().padStart(7, '0')}`;
  }
  next();
});
export const Session = mongoose.model('Session', sessionSchema);
