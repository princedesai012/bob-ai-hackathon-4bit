const mongoose = require('mongoose');

const fleetSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true },
  vehicleType: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentLocation: { type: String, required: true },
  status: { type: String, enum: ['Available', 'In Transit', 'Assigned', 'Maintenance', 'Offline'], default: 'Available' },
  utilization: { type: Number, default: 0 }, // percentage 0-100
  availableFrom: { type: Date },
  temperatureControlled: { type: Boolean, default: false },
});

module.exports = mongoose.model('Fleet', fleetSchema);
