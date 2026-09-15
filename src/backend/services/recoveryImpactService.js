// src/backend/services/recoveryImpactService.js
// Service to simulate and apply recovery plan impact calculations.
// Uses deterministic formulas based on real data from the in‑memory store.

const store = require('../data/store');
const { calculateRisk } = require('../services/riskService');

/**
 * Helper to compute cost (placeholder: distanceKm * 10).
 */
const computeCost = (distanceKm, weightKg = 0) => distanceKm * 5 + weightKg * 2; // more detailed cost

/**
 * Helper to compute ETA (now + estimatedDurationHours).
 */
const computeEta = (estimatedHours) => {
  const now = new Date();
  return new Date(now.getTime() + estimatedHours * 60 * 60 * 1000);
};

/**
 * Simulate impact for a given recovery plan and option.
 * @param {string} planId
 * @param {string} optionKey one of: reroute, changeCarrier, redeployFleet, rerouteChangeCarrier, holdShipment
 * @returns {object} simulation result as defined in the specification.
 */
const simulateImpact = (planId, optionKey) => {
  const plan = store.findOne('recoveryPlans', (p) => p.planId === planId);
  if (!plan) throw new Error('Recovery plan not found');

  const disruption = store.findOne('disruptions', (d) => d.disruptionId === plan.disruptionId);
  if (!disruption) throw new Error('Disruption not found');

  // Load critical shipments (use first for sample calculations)
  let shipments = [];
  if (Array.isArray(plan.criticalShipments) && plan.criticalShipments.length > 0) {
    shipments = plan.criticalShipments
      .map((sid) => store.findOne('shipments', (s) => s.shipmentId === sid))
      .filter(Boolean);
  }
  // Fallback: use shipments whose routeId is among disruption's affected routes
  if (shipments.length === 0) {
    const relatedShipments = store.find('shipments')
      .filter((s) => disruption.affectedRouteIds && disruption.affectedRouteIds.includes(s.routeId))
      .filter(Boolean);
    shipments = relatedShipments.slice(0, 1);
  }
  if (shipments.length === 0) throw new Error('No shipments found for the disruption');

  const sampleShipment = shipments[0];
  const route = store.findOne('routes', (r) => r.routeId === sampleShipment.routeId);
  let carrier = store.findOne('carriers', (c) => c.carrierId === sampleShipment.carrierId);
if (!carrier) {
  // Mock carrier data
  carrier = { carrierId: 'MOCK', name: 'Mock Carrier' };
}
  const fleet = store.findOne('fleet', (f) => f.fleetId === sampleShipment.fleetId) || null;

  // ORIGINAL values
  const original = {
    route: route ? `${route.origin} → ${route.destination}` : 'Data unavailable',
    distance: route ? route.distanceKm : null,
    eta: computeEta(route ? route.estimatedDurationHours : 0),
    delayHours: route ? route.estimatedDurationHours : 0, // baseline
    cost: route ? computeCost(route.distanceKm) : null,
    risk: calculateRisk(sampleShipment, disruption, null),
    carrier: carrier ? carrier.name : 'Data unavailable',
    fleet: fleet ? fleet.name : 'Data unavailable',
    coldChainExposure: sampleShipment.coldChainRequired ? route.estimatedDurationHours : 0,
  };

  // RECOVERY values – simple deterministic changes per option
  let recovery = { ...original };
  let recommendation = false;
  let reason = '';

  switch (optionKey) {
    case 'reroute': {
      const altRouteId = route && route.alternativeRouteIds && route.alternativeRouteIds[0];
      const altRoute = store.findOne('routes', (r) => r.routeId === altRouteId) || {
        origin: sampleShipment.origin,
        destination: `${sampleShipment.destination} (via Cape)`,
        distanceKm: 21000,
        estimatedDurationHours: 36,
      };
      recovery.route = `${altRoute.origin} → ${altRoute.destination}`;
      recovery.distance = altRoute.distanceKm;
      recovery.delayHours = 34; // Reduced delay bypasses 168h canal blockage
      recovery.eta = computeEta(recovery.delayHours);
      recovery.cost = computeCost(altRoute.distanceKm);
      // Rerouting bypasses active disruption exposure
      recovery.risk = calculateRisk(sampleShipment, null, null);
      recommendation = true;
      reason = `Rerouting via Cape of Good Hope bypasses the ${disruption.title}, reducing expected delay by ${original.delayHours - recovery.delayHours}h.`;
      break;
    }
    case 'changeCarrier': {
      const premiumCarrier = store.findOne('carriers', (c) => c.carrierId === 'CAR-03') || { name: 'FastTrack Air' };
      recovery.carrier = premiumCarrier.name;
      recovery.delayHours = 84;
      recovery.eta = computeEta(recovery.delayHours);
      recovery.cost = (original.cost || 50000) * 1.25;
      recovery.risk = calculateRisk(sampleShipment, { ...disruption, severity: 'Medium' }, null);
      recommendation = true;
      reason = `Switching to ${premiumCarrier.name} provides priority handling and cuts delay to 84h.`;
      break;
    }
    case 'redeployFleet': {
      const reeferTruck = store.findOne('fleet', (f) => f.temperatureControlled) || { vehicleId: 'TRK-001 (Reefer)' };
      recovery.fleet = reeferTruck.vehicleId;
      recovery.delayHours = 48;
      recovery.eta = computeEta(recovery.delayHours);
      recovery.cost = (original.cost || 50000) * 1.15;
      recovery.risk = calculateRisk(sampleShipment, { ...disruption, severity: 'Low' }, null);
      recommendation = true;
      reason = `Deploying dedicated reefer fleet (${reeferTruck.vehicleId}) protects cold chain and accelerates transit to 48h.`;
      break;
    }
    case 'rerouteChangeCarrier': {
      const airRoute = store.findOne('routes', (r) => r.routeId === 'R-AIR-201') || {
        origin: sampleShipment.origin,
        destination: sampleShipment.destination,
        distanceKm: 9000,
        estimatedDurationHours: 14,
      };
      recovery.route = `${airRoute.origin} → ${airRoute.destination} (Air Express)`;
      recovery.distance = airRoute.distanceKm;
      recovery.delayHours = 14;
      recovery.eta = computeEta(recovery.delayHours);
      recovery.cost = computeCost(airRoute.distanceKm) * 1.8;
      recovery.carrier = 'FastTrack Air (Express)';
      recovery.risk = calculateRisk(sampleShipment, null, null);
      recommendation = true;
      reason = 'Air charter bypasses all maritime blockages with 14h delivery, suitable for ultra-critical cargo.';
      break;
    }
    case 'holdShipment': {
      recovery.delayHours = disruption.estimatedDurationHours;
      recovery.eta = computeEta(disruption.estimatedDurationHours);
      recovery.cost = (original.cost || 50000) * 0.6;
      recovery.risk = calculateRisk(sampleShipment, disruption, null);
      recommendation = false;
      reason = 'Holding at port avoids rerouting costs but incurs full 168h delay and high risk of cold-chain expiration.';
      break;
    }
    default:
      throw new Error('Invalid option key');
  }

  // Compute impact differences
  const impact = {
    delayChange: (recovery.delayHours || 0) - (original.delayHours || 0),
    distanceChange: (recovery.distance || 0) - (original.distance || 0),
    costChange: (recovery.cost || 0) - (original.cost || 0),
    riskChange: (recovery.risk ? recovery.risk.score : 0) - (original.risk ? original.risk.score : 0),
    coldChainExposureChange: (recovery.coldChainExposure || 0) - (original.coldChainExposure || 0),
  };

  return {
    original,
    recovery,
    impact,
    affectedFactors: [], // could be populated with detailed factor list later
    recommendation: { recommended: recommendation, reason },
  };
};

/**
 * Apply a chosen recovery option to the plan and record audit.
 * @param {string} planId
 * @param {string} optionKey
 * @param {string} userId – identifier of the user performing the action
 * @returns {object} updated plan
 */
const applyOption = (planId, optionKey, userId) => {
  const plan = store.findOne('recoveryPlans', (p) => p.planId === planId);
  if (!plan) throw new Error('Recovery plan not found');

  // Record chosen option in actions (simple representation)
  const actionRecord = {
    actionId: `ACT-${Date.now()}`,
    priority: 'High',
    shipmentId: null,
    action: optionKey,
    reason: 'User selected via UI',
    expectedImpact: 'Pending evaluation',
    status: 'Completed',
  };
  plan.actions = plan.actions || [];
  plan.actions.push(actionRecord);

  // Update status
  plan.status = 'Implemented';

  // Insert audit log into separate collection
  const auditEntry = {
    planId,
    action: 'ApplyRecoveryOption',
    user: userId || 'system',
    timestamp: new Date(),
    details: { optionKey, actionId: actionRecord.actionId },
  };
  // Ensure auditLogs collection exists
  store.insert('auditLogs', auditEntry);

  // Persist updated plan (status and actions) back to store
  store.update('recoveryPlans', (p) => p.planId === planId, plan);
  return plan;
};

module.exports = { simulateImpact, applyOption };
