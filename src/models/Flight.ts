import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
  },
  originCode: {
    type: String,
    required: true,
  },
  destinationCode: {
    type: String,
    required: true,
  },
  departureTime: {
    type: Date,
    required: true,
  },
  arrivalTime: {
    type: Date,
    required: true,
  },
});

export default mongoose.models.Flight || mongoose.model('Flight', flightSchema); 