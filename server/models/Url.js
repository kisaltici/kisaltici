import mongoose from 'mongoose';

/**
 * Mongoose Schema for Shortened URLs.
 * Maps directly to documents in the 'urls' MongoDB collection.
 */
const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true,
  },
  shortCode: {
    type: String,
    required: [true, 'Short code is required'],
    unique: true,
    trim: true,
    index: true,
  },
  userId: {
    type: String,
    index: true,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  clicks: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  qrSettings: {
    complexity: {
      type: String,
      enum: ['ultra-minimal', 'minimal', 'balanced', 'high'],
      default: 'minimal',
    },
    preset: {
      type: String,
      default: 'custom',
    },
    level: {
      type: String,
      enum: ['L', 'M', 'Q', 'H'],
      default: 'L',
    },
    fgColor: {
      type: String,
      default: '#080a11',
    },
    bgColor: {
      type: String,
      default: '#ffffff',
    },
    moduleShape: {
      type: String,
      enum: ['square', 'rounded', 'extra-rounded', 'dots', 'diamond'],
      default: 'square',
    },
    finderStyle: {
      type: String,
      enum: ['classic', 'square', 'rounded', 'soft', 'compact', 'dot', 'circle'],
      default: 'classic',
    },
    quietZone: {
      type: String,
      enum: ['compact', 'standard', 'generous'],
      default: 'standard',
    },
    centerImage: {
      src: { type: String, default: null },
      sizePercent: { type: Number, default: 22 },
      radius: { type: Number, default: 20 },
      padding: { type: Number, default: 4 },
      bgColor: { type: String, default: '#ffffff' },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
});

const Url = mongoose.models.Url || mongoose.model('Url', urlSchema);

export default Url;
