// recoveryService.js — uses in-memory store
const store = require('../data/store');

const getRecoveryOptions = (shipment, disruption) => {
  const options = [];
  if (!shipment) return options;

  // 1. Alternative route
  const currentRoute = store.findOne('routes', r => r.routeId === shipment.routeId);
  if (currentRoute && currentRoute.alternativeRouteIds && currentRoute.alternativeRouteIds.length > 0) {
    const altRoute = store.find('routes', r => currentRoute.alternativeRouteIds.includes(r.routeId))[0];
    if (altRoute) {
      options.push({
        option: 'Alternative Route',
        route: altRoute.routeId,
        carrier: shipment.carrierId,
        estimatedDelay: Math.max(0, altRoute.estimatedDurationHours - currentRoute.estimatedDurationHours),
        estimatedCost: 'Medium',
        confidence: 'High',
        reason: `Reroute via ${altRoute.routeId} (${altRoute.origin} → ${altRoute.destination}) to bypass the disruption.`,
        tradeoffs: 'Longer distance. Additional transit time.',
      });
    }
  }

  // 2. Alternative carrier
  const altCarrier = store.find('carriers', c => c.carrierId !== shipment.carrierId && c.status === 'Active' && c.reliabilityScore > 80)[0];
  if (altCarrier) {
    options.push({
      option: 'Transfer to Alternative Carrier',
      route: shipment.routeId,
      carrier: altCarrier.name,
      estimatedDelay: 4,
      estimatedCost: altCarrier.costIndex > 3 ? 'High' : 'Medium',
      confidence: 'Medium',
      reason: `Transfer to ${altCarrier.name} (reliability: ${altCarrier.reliabilityScore}%) which is not affected by the disruption.`,
      tradeoffs: 'Cargo transfer at nearest hub adds ~4 hours.',
    });
  }

  // 3. Available internal fleet
  const vehicle = store.find('fleet', f =>
    f.status === 'Available' &&
    (!shipment.coldChainRequired || f.temperatureControlled)
  )[0];
  if (vehicle) {
    options.push({
      option: 'Internal Fleet Redeployment',
      route: 'Direct',
      carrier: 'Internal',
      estimatedDelay: 2,
      estimatedCost: 'Low',
      confidence: 'High',
      reason: `Redeploy ${vehicle.vehicleId} (${vehicle.vehicleType}) currently available at ${vehicle.currentLocation}.`,
      tradeoffs: 'Consumes available fleet buffer.',
    });
  }

  return options;
};

module.exports = { getRecoveryOptions };
