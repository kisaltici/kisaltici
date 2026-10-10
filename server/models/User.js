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
    // none | trialing | active (paid) | canceled (auto-renew off, access until planExpiresAt) | past_due (charge failed)
    subscriptionStatus: {
      type: String,
      enum: ['none', 'trialing', 'active', 'canceled', 'past_due'],
      default: 'none',
    },
    autoRenew: { type: Boolean, default: false },
    // Currency of the subscription (set at checkout): renewals are charged in it
    billingCurrency: { type: String, enum: ['TRY', 'USD'], default: 'TRY' },
    trialUsedAt: { type: Date, default: null },
    canceledAt: { type: Date, default: null },
    lastRenewalAttemptAt: { type: Date, default: null },
    // PayTR card-storage tokens for off-session charges. Never selected by default, never sent to the client.
    paytrUtoken: { type: String, select: false, default: null },
    paytrCtoken: { type: String, select: false, default: null },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
