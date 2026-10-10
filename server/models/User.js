import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      default: '',
      trim: true,
    },
    username: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    photoURL: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    membershipPlan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'business'],
      default: 'free',
    },
    // Paid subscription period. null planExpiresAt on a paid plan = no expiry (set manually / grandfathered)
    planExpiresAt: { type: Date, default: null },
    billingPeriod: { type: String, enum: ['monthly', 'yearly', null], default: null },
    subscriptionStartedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
