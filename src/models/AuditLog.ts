import mongoose from 'mongoose';

const shippingDetailsSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  paymentIntentId: String
});

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['item_viewed', 'verification_failed', 'item_claimed', 'item_shipped', 'shipping_requested']
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostItem',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  verificationCode: String,
  shippingDetails: shippingDetailsSchema,
  timestamp: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema); 