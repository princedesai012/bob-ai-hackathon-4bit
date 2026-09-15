const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  cargoType: { type: String, required: true },
  cargoValue: { type: Number, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  routeId: { type: String, required: true },
  carrierId: { type: String, required: true },
  fleetId: { type: String },
  status: { type: String, enum: ['Booked', 'In Transit', 'Delayed', 'Delivered', 'Cancelled'], default: 'Booked' },
  currentLocation: { type: String },
  plannedETA: { type: Date, required: true },
  deliveryDeadline: { type: Date, required: true },
  coldChainRequired: { type: Boolean, default: false },
  requiredTemperatureMin: { type: Number },
  requiredTemperatureMax: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
