import mongoose from 'mongoose';
import { generateClaimToken } from '@/lib/qrcode';

const lostItemSchema = new mongoose.Schema({
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true,
  },
  seat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  itemDescription: {
    type: String,
  },
  itemImageUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['unclaimed', 'claimed', 'shipped'],
    default: 'unclaimed',
  },
  qrCodeUrl: {
    type: String,
  },
  claimToken: {
    type: String,
    default: generateClaimToken,
  },
  collectionCode: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
  },
  claimedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Create indexes
lostItemSchema.index({ status: 1 });
lostItemSchema.index({ flight: 1, status: 1 });

export default mongoose.models.LostItem || mongoose.model('LostItem', lostItemSchema); 