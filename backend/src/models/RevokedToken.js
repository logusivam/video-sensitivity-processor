import mongoose from 'mongoose';
import Counter from './Counter.js';

const revokedTokenSchema = new mongoose.Schema({
  _id: { type: String }, // jti
  userId: { type: String, ref: 'User' },
  revokedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  reason: { type: String }
});
revokedTokenSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate({ _id: 'revokedId' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
    this._id = `RAT${counter.seq.toString().padStart(8, '0')}`;
  }
  next();
});
export const RevokedToken = mongoose.model('RevokedToken', revokedTokenSchema);