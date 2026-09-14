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
});

const Url = mongoose.models.Url || mongoose.model('Url', urlSchema);

export default Url;
