// disruptionAnalysisService.js — uses in-memory store
const store = require('../data/store');
const { calculateRisk } = require('./riskService');
const { getRecoveryOptions } = require('./recoveryService');

const analyzeDisruption = (disruptionId) => {
  const disruption = store.findOne('disruptions', d => d.disruptionId === disruptionId);
  if (!disruption) return null;

  // Affected routes
  const affectedRoutes = disruption.affectedRouteIds;

  // Affected active shipments
  const affectedShipments = store.find('shipments', s =>
    affectedRoutes.includes(s.routeId) && ['Booked', 'In Transit', 'Delayed'].includes(s.status)
  );

  const criticalShipments = [];
  const coldChainExposure = [];

  const analyzed = affectedShipments.map(shipment => {
    const logs = store.find('temperatureLogs', t => t.shipmentId === shipment.shipmentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const currentTemp = logs.length ? logs[0].temperature : null;

    const risk = calculateRisk(shipment, disruption, currentTemp);

    if (risk.level === 'Critical' || risk.level === 'High') {
      criticalShipments.push({
        shipmentId: shipment.shipmentId,
        destination: shipment.destination,
        deadline: shipment.deliveryDeadline,
        riskLevel: risk.level,
        riskScore: risk.score,
        priority: shipment.priority,
        coldChain: shipment.coldChainRequired,
      });
    }

    if (shipment.coldChainRequired) {
      coldChainExposure.push({
        shipmentId: shipment.shipmentId,
        currentTemp,
        requiredMin: shipment.requiredTemperatureMin,
        requiredMax: shipment.requiredTemperatureMax,
        riskLevel: risk.level,
        excursion: currentTemp !== null && (currentTemp > shipment.requiredTemperatureMax || currentTemp < shipment.requiredTemperatureMin),
      });
    }

    return { shipment, risk };
  });

  // Sort critical by risk score descending
  criticalShipments.sort((a, b) => b.riskScore - a.riskScore);

  // Available fleet
  const availableFleet = store.find('fleet', f => f.status === 'Available').map(f => f.vehicleId);

  // Generate recommendations for top critical shipments
  const recommendations = criticalShipments.slice(0, 5).map((cs, i) => {
    const shipment = store.findOne('shipments', s => s.shipmentId === cs.shipmentId);
    const options = getRecoveryOptions(shipment, disruption);
    const best = options[0];
    return {
      actionId: `ACT-${i + 1}`,
      priority: i === 0 ? 'P1' : i === 1 ? 'P2' : 'P3',
      shipmentId: cs.shipmentId,
      action: best ? best.option : 'Escalate to operations team',
      reason: best ? best.reason : 'No automated recovery option available.',
      expectedImpact: best ? `Reduce delay by ~${best.estimatedDelay}h` : 'Manual review required.',
      status: 'recommended',
    };
  });

  return {
    disruption,
    affectedRoutes,
    affectedShipmentCount: affectedShipments.length,
    criticalShipments,
    coldChainExposure,
    availableFleet,
    recommendations,
  };
};

module.exports = { analyzeDisruption };
