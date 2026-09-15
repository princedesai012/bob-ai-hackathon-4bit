// impactGraphController.js
// Builds a complete node/edge graph for a given disruption using real store data.

const store = require('../data/store');
const { calculateRisk } = require('../services/riskService');

const getImpactGraph = (req, res) => {
  try {
    const disruptionId = req.params.id;

    const disruption = store.findOne('disruptions', d => d.disruptionId === disruptionId);
    if (!disruption) {
      return res.status(404).json({ success: false, error: { message: 'Disruption not found' } });
    }

    const nodes = [];
    const edges = [];

    // ── Disruption node ─────────────────────────────────────────────────────────
    nodes.push({
      id: disruption.disruptionId,
      type: 'disruption',
      label: disruption.title,
      data: {
        disruptionId: disruption.disruptionId,
        severity: disruption.severity,
        location: disruption.location,
        type: disruption.type,
        status: disruption.status,
        estimatedDurationHours: disruption.estimatedDurationHours,
      },
    });

    const affectedRouteIds = disruption.affectedRouteIds || [];

    // Track summaries
    const affectedCarrierIds = new Set();
    const affectedFleetIds = new Set();
    let affectedShipmentCount = 0;
    let criticalShipmentCount = 0;
    let totalCargoValueAtRisk = 0;
    let highestRiskPath = null;
    let highestRiskScore = -1;

    // ── Route nodes ──────────────────────────────────────────────────────────────
    for (const routeId of affectedRouteIds) {
      const route = store.findOne('routes', r => r.routeId === routeId);
      if (!route) continue;

      nodes.push({
        id: route.routeId,
        type: 'route',
        label: `${route.origin} → ${route.destination}`,
        data: {
          routeId: route.routeId,
          origin: route.origin,
          destination: route.destination,
          distanceKm: route.distanceKm,
          estimatedDurationHours: route.estimatedDurationHours,
          riskLevel: route.riskLevel,
          estimatedDelayHours: disruption.estimatedDurationHours,
          alternativeRouteIds: route.alternativeRouteIds || [],
        },
      });

      edges.push({
        id: `${disruption.disruptionId}--${route.routeId}`,
        source: disruption.disruptionId,
        target: route.routeId,
        label: 'affects',
      });

      // ── Shipment nodes on this route ─────────────────────────────────────────
      const shipments = store.find('shipments', s =>
        s.routeId === routeId &&
        ['Booked', 'In Transit', 'Delayed'].includes(s.status)
      );

      for (const shipment of shipments) {
        // Risk calculation
        const logs = store.find('temperatureLogs', t => t.shipmentId === shipment.shipmentId)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const currentTemp = logs.length ? logs[0].temperature : null;
        const risk = calculateRisk(shipment, disruption, currentTemp);

        affectedShipmentCount++;
        if (risk.level === 'Critical') criticalShipmentCount++;
        if (risk.level !== 'Low') totalCargoValueAtRisk += (shipment.cargoValue || 0);

        nodes.push({
          id: shipment.shipmentId,
          type: 'shipment',
          label: shipment.shipmentId,
          data: {
            shipmentId: shipment.shipmentId,
            customer: shipment.customer,
            origin: shipment.origin,
            destination: shipment.destination,
            cargoType: shipment.cargoType,
            cargoValue: shipment.cargoValue,
            priority: shipment.priority,
            status: shipment.status,
            plannedETA: shipment.plannedETA,
            coldChainRequired: shipment.coldChainRequired,
            carrierId: shipment.carrierId,
            fleetId: shipment.fleetId,
            riskScore: risk.score,
            riskLevel: risk.level,
            riskExplanation: risk.explanation,
          },
        });

        edges.push({
          id: `${route.routeId}--${shipment.shipmentId}`,
          source: route.routeId,
          target: shipment.shipmentId,
          label: 'carries',
        });

        // Track highest-risk path
        if (risk.score > highestRiskScore) {
          highestRiskScore = risk.score;
          highestRiskPath = {
            disruption: disruption.title,
            route: `${route.origin} → ${route.destination}`,
            shipment: shipment.shipmentId,
            riskScore: risk.score,
            riskLevel: risk.level,
            cargoValue: shipment.cargoValue,
            customer: shipment.customer,
          };
        }

        // ── Carrier node ───────────────────────────────────────────────────────
        if (shipment.carrierId && !affectedCarrierIds.has(shipment.carrierId)) {
          const carrier = store.findOne('carriers', c => c.carrierId === shipment.carrierId);
          if (carrier) {
            affectedCarrierIds.add(carrier.carrierId);
            // Only push carrier node if not already added
            if (!nodes.find(n => n.id === carrier.carrierId)) {
              nodes.push({
                id: carrier.carrierId,
                type: 'carrier',
                label: carrier.name,
                data: {
                  carrierId: carrier.carrierId,
                  name: carrier.name,
                  reliabilityScore: carrier.reliabilityScore,
                  availableCapacity: carrier.availableCapacity,
                  status: carrier.status,
                },
              });
            }
            edges.push({
              id: `${shipment.shipmentId}--${carrier.carrierId}`,
              source: shipment.shipmentId,
              target: carrier.carrierId,
              label: 'assigned to',
            });
          }
        }

        // ── Fleet node ─────────────────────────────────────────────────────────
        if (shipment.fleetId) {
          const vehicle = store.findOne('fleet', f => f.vehicleId === shipment.fleetId);
          if (vehicle && !affectedFleetIds.has(vehicle.vehicleId)) {
            affectedFleetIds.add(vehicle.vehicleId);
            if (!nodes.find(n => n.id === vehicle.vehicleId)) {
              nodes.push({
                id: vehicle.vehicleId,
                type: 'fleet',
                label: vehicle.vehicleId,
                data: {
                  vehicleId: vehicle.vehicleId,
                  vehicleType: vehicle.vehicleType,
                  currentLocation: vehicle.currentLocation,
                  status: vehicle.status,
                  capacity: vehicle.capacity,
                  temperatureControlled: vehicle.temperatureControlled,
                },
              });
            }
            edges.push({
              id: `${shipment.carrierId || 'CARRIER'}--${vehicle.vehicleId}`,
              source: shipment.carrierId || shipment.shipmentId,
              target: vehicle.vehicleId,
              label: 'operates',
            });
          }
        }
      }
    }

    // ── No relationships found ──────────────────────────────────────────────────
    if (nodes.length <= 1 && edges.length === 0) {
      return res.json({
        success: true,
        data: {
          insufficient: true,
          message: 'Insufficient relationship data for this disruption.',
          nodes: [],
          edges: [],
          summary: {},
          highestRiskPath: null,
        },
      });
    }

    const summary = {
      affectedRoutes: affectedRouteIds.length,
      affectedShipments: affectedShipmentCount,
      criticalShipments: criticalShipmentCount,
      affectedCarriers: affectedCarrierIds.size,
      fleetAssetsAffected: affectedFleetIds.size,
      cargoValueAtRisk: totalCargoValueAtRisk,
    };

    res.json({
      success: true,
      data: { nodes, edges, summary, highestRiskPath, insufficient: false },
    });
  } catch (err) {
    console.error('Impact graph error:', err);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

module.exports = { getImpactGraph };
