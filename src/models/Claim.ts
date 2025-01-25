import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostItem',
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  claimMethod: {
    type: String,
    enum: ['in-person', 'shipped'],
    required: true,
  },
  shippingAddress: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Claim || mongoose.model('Claim', claimSchema);
