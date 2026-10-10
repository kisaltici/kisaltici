import mongoose from 'mongoose';

/**
 * A checkout attempt. Created as 'pending' before the PayTR iFrame is shown, flipped to
 * 'paid' / 'failed' only by the verified PayTR notification (never by the browser redirect).
 *
 * Index (create with `npm run db:indexes`, autoIndex is off): unique { orderId }.
 */
const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true }, // merchant_oid sent to PayTR
    userId: { type: String, required: true, index: true },
    plan: { type: String, enum: ['starter', 'pro', 'business'], required: true },
    period: { type: String, enum: ['monthly', 'yearly'], required: true },
    amountKurus: { type: Number, required: true },
    currency: { type: String, default: 'TL' },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    testMode: { type: Boolean, default: false },
    email: { type: String, default: '' },
    fullName: { type: String, default: '' },
    paidAt: { type: Date, default: null },
    paytrTotalAmount: { type: Number, default: null },
    paytrPaymentType: { type: String, default: null },
    failedReasonCode: { type: String, default: null },
    failedReasonMsg: { type: String, default: null },
    activatedUntil: { type: Date, default: null },
    termsAcceptedAt: { type: Date, default: null },
    termsVersion: { type: String, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ orderId: 1 }, { unique: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
