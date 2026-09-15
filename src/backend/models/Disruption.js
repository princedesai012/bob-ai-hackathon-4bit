const mongoose = require('mongoose');

const disruptionSchema = new mongoose.Schema({
  disruptionId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true }, // e.g. Port Closure, Weather, Strike, Accident
  description: { type: String },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  location: { type: String, required: true },
  startTime: { type: Date, required: true },
  estimatedDurationHours: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Resolved', 'Upcoming'], default: 'Active' },
  affectedRouteIds: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Disruption', disruptionSchema);
