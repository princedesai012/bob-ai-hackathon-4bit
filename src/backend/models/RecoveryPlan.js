const mongoose = require('mongoose');

const recoveryPlanSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true },
  disruptionId: { type: String, required: true },
  summary: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  criticalShipments: [{ type: String }], // Array of shipment IDs
  actions: [{
    actionId: { type: String },
    priority: { type: String },
    shipmentId: { type: String },
    action: { type: String },
    reason: { type: String },
    expectedImpact: { type: String },
    status: { type: String }
  }],
  fleetAssignments: [{ type: String }],
  routeChanges: [{ type: String }],
  carrierChanges: [{ type: String }],
  coldChainActions: [{ type: String }],
  auditLog: [{ action: String, user: String, timestamp: Date, details: Object }],
}, { timestamps: true });

module.exports = mongoose.model('RecoveryPlan', recoveryPlanSchema);
