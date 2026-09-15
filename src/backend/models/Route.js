const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  distanceKm: { type: Number, required: true },
  estimatedDurationHours: { type: Number, required: true },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  disruptionExposure: { type: Boolean, default: false },
  alternativeRouteIds: [{ type: String }],
});

module.exports = mongoose.model('Route', routeSchema);
