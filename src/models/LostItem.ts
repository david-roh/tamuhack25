import mongoose from 'mongoose';
import { generateClaimToken } from '@/lib/qrcode';

const shippingDetailsSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  trackingNumber: String,
  paymentIntentId: String
});

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
    required: true,
  },
  collectionCode: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
  },
  claimedAt: {
    type: Date,
  },
  shippingDetails: shippingDetailsSchema,
  shippedAt: Date,
}, {
  timestamps: true,
});

// Create indexes
lostItemSchema.index({ status: 1 });
lostItemSchema.index({ flight: 1, status: 1 });

// Add an index for faster token lookups
lostItemSchema.index({ claimToken: 1 }, { unique: true });

export default mongoose.models.LostItem || mongoose.model('LostItem', lostItemSchema); 