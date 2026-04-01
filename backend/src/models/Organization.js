import mongoose from 'mongoose';
import Counter from './Counter.js';

const organizationSchema = new mongoose.Schema({
  _id: { type: String }, // e.g., OG0001
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

organizationSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'orgId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = `OG${counter.seq.toString().padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Organization', organizationSchema);