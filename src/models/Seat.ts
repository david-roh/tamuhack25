import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true,
  },
  seatNumber: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
  },
});

seatSchema.index({ flight: 1, seatNumber: 1 });
seatSchema.index({ customerEmail: 1 });

export default mongoose.models.Seat || mongoose.model('Seat', seatSchema); 