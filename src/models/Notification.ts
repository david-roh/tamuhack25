import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  customerEmail: {
    type: String,
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostItem',
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
