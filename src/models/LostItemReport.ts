import mongoose from 'mongoose';

const lostItemReportSchema = new mongoose.Schema({
  customerEmail: {
    type: String,
    required: true,
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true,
  },
  itemDescription: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'unmatched'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

export default mongoose.models.LostItemReport || mongoose.model('LostItemReport', lostItemReportSchema);
