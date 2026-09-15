const mongoose = require('mongoose');

const temperatureLogSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  temperature: { type: Number, required: true },
  sensorStatus: { type: String, enum: ['Active', 'Faulty', 'Offline'], default: 'Active' },
});

module.exports = mongoose.model('TemperatureLog', temperatureLogSchema);
