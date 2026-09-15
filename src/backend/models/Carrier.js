const mongoose = require('mongoose');

const carrierSchema = new mongoose.Schema({
  carrierId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  reliabilityScore: { type: Number, required: true }, // 0 to 100
  availableCapacity: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Suspended', 'Inactive'], default: 'Active' },
  costIndex: { type: Number, required: true }, // 1 to 5 (1 being cheap, 5 being very expensive)
});

module.exports = mongoose.model('Carrier', carrierSchema);
