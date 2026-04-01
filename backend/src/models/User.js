import mongoose from 'mongoose';
import Counter from './Counter.js';

const userSchema = new mongoose.Schema({
  _id: { type: String }, // e.g., U0000001
  organizationId: { type: String, ref: 'Organization' },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = `U${counter.seq.toString().padStart(7, '0')}`;
  }
  next();
});

export default mongoose.model('User', userSchema);