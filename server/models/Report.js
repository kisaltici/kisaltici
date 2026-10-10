import mongoose from 'mongoose';

/** An abuse report about a short link (phishing, malware, illegal content). Reviewed manually: `npm run reports`. */
const reportSchema = new mongoose.Schema(
  {
    reportedUrl: { type: String, required: true, maxlength: 2048 },
    shortCode: { type: String, default: null },
    reason: {
      type: String,
      enum: ['phishing', 'malware', 'illegal', 'copyright', 'other'],
      required: true,
    },
    details: { type: String, default: '', maxlength: 2000 },
    reporterEmail: { type: String, default: '', maxlength: 200 },
    reporterIpHash: { type: String, default: '' },
    status: { type: String, enum: ['new', 'reviewed', 'actioned', 'dismissed'], default: 'new' },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

export default Report;
