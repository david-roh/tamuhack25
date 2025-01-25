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

export default mongoose.models.Seat || mongoose.model('Seat', seatSchema); 