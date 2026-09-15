// dashboardController.js
const store = require('../data/store');
const { calculateRisk } = require('../services/riskService');

/**
 * Compute and return dashboard summary KPIs.
 */
const getSummary = (req, res) => {
  try {
    // ── Disruptions ──────────────────────────────────────────────────────────────
    const allDisruptions = store.find('disruptions');
    const activeDisruptions = allDisruptions.filter(d => d.status === 'Active');
    const inactiveDisruptions = allDisruptions.filter(d => d.status !== 'Active');

    // ── Shipments ────────────────────────────────────────────────────────────────
    const shipments = store.find('shipments');

    // Build a map of active disruptions keyed by routeId for fast lookup
    const activeDisruptionsByRouteId = {};
    activeDisruptions.forEach(d => {
      (d.affectedRouteIds || []).forEach(rid => {
        if (!activeDisruptionsByRouteId[rid]) activeDisruptionsByRouteId[rid] = [];
        activeDisruptionsByRouteId[rid].push(d);
      });
    });

    // For each disruption, compute affected shipment counts
    const enrichedActiveDisruptions = activeDisruptions
      .map(d => {
        const affected = shipments.filter(s => (d.affectedRouteIds || []).includes(s.routeId));
        const critical = affected.filter(s => s.priority === 'Critical');
        // Estimate delay hours from disruption duration
        const delayHours = d.estimatedDurationHours || 0;
        return {
          disruptionId: d.disruptionId,
          title: d.title,
          description: d.description,
          severity: d.severity,
          location: d.location,
          type: d.type,
          status: d.status,
          affectedRouteIds: d.affectedRouteIds || [],
          affectedShipmentCount: affected.length,
          criticalShipmentCount: critical.length,
          estimatedDelayHours: delayHours,
          startTime: d.startTime,
          estimatedDurationHours: d.estimatedDurationHours,
        };
      })
      .sort((a, b) => {
        const sev = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return (sev[b.severity] || 0) - (sev[a.severity] || 0);
      });

    // ── Risk scoring for all shipments ───────────────────────────────────────────
    const temperatureLogs = store.find('temperatureLogs');

    const shipmentRisks = shipments.map(s => {
      const disruptions = activeDisruptionsByRouteId[s.routeId] || [];
      const worstDisruption = disruptions.sort((a, b) => {
        const sev = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return (sev[b.severity] || 0) - (sev[a.severity] || 0);
      })[0] || null;

      // Get latest temperature log for this shipment
      const logs = temperatureLogs
        .filter(t => t.shipmentId === s.shipmentId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const currentTemp = logs.length ? logs[0].temperature : null;

      const risk = calculateRisk(s, worstDisruption, currentTemp);

      // Compute expected delay from linked disruption
      const delayHours = worstDisruption ? (worstDisruption.estimatedDurationHours || 0) : 0;

      return {
        shipmentId: s.shipmentId,
        customer: s.customer,
        origin: s.origin,
        destination: s.destination,
        status: s.status,
        priority: s.priority,
        cargoType: s.cargoType,
        cargoValue: s.cargoValue,
        plannedETA: s.plannedETA,
        deliveryDeadline: s.deliveryDeadline,
        coldChainRequired: s.coldChainRequired,
        risk,
        expectedDelayHours: delayHours,
        disruptionTitle: worstDisruption ? worstDisruption.title : null,
      };
    });

    // Priority shipments: sort Critical → High → Medium → Low
    const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    const priorityShipments = [...shipmentRisks]
      .sort((a, b) => (priorityOrder[b.risk.level] || 0) - (priorityOrder[a.risk.level] || 0))
      .slice(0, 8);

    // ── KPIs ─────────────────────────────────────────────────────────────────────
    const atRiskShipments = shipmentRisks.filter(s => s.risk.level !== 'Low').length;
    const criticalShipments = shipmentRisks.filter(s => s.risk.level === 'Critical').length;
    const highRiskShipments = shipmentRisks.filter(s => s.risk.level === 'High').length;

    // Cargo value at risk: sum of cargoValue for at-risk shipments
    const cargoValueAtRisk = shipmentRisks
      .filter(s => s.risk.level !== 'Low')
      .reduce((sum, s) => sum + (s.cargoValue || 0), 0);

    // Fleet utilization
    const fleet = store.find('fleet');
    const fleetUtilization = fleet.length
      ? Math.round(fleet.reduce((sum, f) => sum + (f.utilization || 0), 0) / fleet.length)
      : 0;
    const availableFleet = fleet.filter(f => f.status === 'Available').length;
    const inTransitFleet = fleet.filter(f => f.status === 'In Transit').length;

    // Cold chain alerts
    const coldChainAlerts = temperatureLogs.filter(t => t.sensorStatus !== 'Active').length;

    // Delayed shipments
    const delayedShipments = shipments.filter(s => s.status === 'Delayed').length;

    // ── System status ────────────────────────────────────────────────────────────
    const systemStatus = (activeDisruptions.length > 0 || criticalShipments > 0)
      ? 'Attention Required'
      : 'Operational';

    // ── Operational alert ────────────────────────────────────────────────────────
    const criticalItems = shipmentRisks.filter(s => s.risk.level === 'Critical');
    const deadlineShipments = shipmentRisks.filter(s => {
      const hoursLeft = (new Date(s.deliveryDeadline) - new Date()) / (1000 * 60 * 60);
      return hoursLeft < 48 && hoursLeft > 0;
    });
    const coldChainExcursionShipments = temperatureLogs.filter(t => t.sensorStatus !== 'Active')
      .map(t => t.shipmentId)
      .filter((v, i, a) => a.indexOf(v) === i); // unique

    const operationalAlert = {
      hasCritical: criticalItems.length > 0,
      criticalCount: criticalItems.length,
      deadlineCount: deadlineShipments.length,
      coldChainExcursionCount: coldChainExcursionShipments.length,
      message: criticalItems.length > 0
        ? `${criticalItems.length} shipment${criticalItems.length > 1 ? 's' : ''} require immediate attention.`
        : 'No immediate operational action required.',
      details: [
        deadlineShipments.length > 0
          ? `${deadlineShipments.length} shipment${deadlineShipments.length > 1 ? 's' : ''} approaching delivery deadline within 48h.`
          : null,
        coldChainExcursionShipments.length > 0
          ? `${coldChainExcursionShipments.length} cold-chain shipment${coldChainExcursionShipments.length > 1 ? 's' : ''} with sensor excursion.`
          : null,
        activeDisruptions.length > 0
          ? `${activeDisruptions.length} active disruption${activeDisruptions.length > 1 ? 's' : ''} currently impacting routes.`
          : null,
      ].filter(Boolean),
    };

    // ── Recovery actions ─────────────────────────────────────────────────────────
    const recoveryPlans = store.find('recoveryPlans');
    const recoveryActions = recoveryPlans
      .filter(p => p.status !== 'Implemented')
      .slice(0, 5)
      .map(p => {
        const disruption = allDisruptions.find(d => d.disruptionId === p.disruptionId);
        // For each plan, find the first critical shipment to show risk change
        const firstShipmentId = p.criticalShipments && p.criticalShipments[0];
        const shipment = firstShipmentId ? shipments.find(s => s.shipmentId === firstShipmentId) : null;
        const originalRisk = shipment
          ? calculateRisk(shipment, disruption || null, null)
          : null;
        const firstAction = p.actions && p.actions[0];
        return {
          planId: p.planId,
          summary: p.summary,
          status: p.status,
          createdAt: p.createdAt,
          disruptionTitle: disruption ? disruption.title : 'Unknown',
          firstShipmentId,
          originalRisk,
          recommendedAction: firstAction ? firstAction.action : p.summary,
          expectedDelayReduction: disruption
            ? Math.round((disruption.estimatedDurationHours || 0) * 0.5)
            : 0,
        };
      });

    // ── Chart data ───────────────────────────────────────────────────────────────
    // Shipment risk distribution
    const riskDistribution = [
      { level: 'Critical', count: shipmentRisks.filter(s => s.risk.level === 'Critical').length, fill: '#dc2626' },
      { level: 'High',     count: shipmentRisks.filter(s => s.risk.level === 'High').length,     fill: '#ea580c' },
      { level: 'Medium',   count: shipmentRisks.filter(s => s.risk.level === 'Medium').length,   fill: '#d97706' },
      { level: 'Low',      count: shipmentRisks.filter(s => s.risk.level === 'Low').length,      fill: '#16a34a' },
    ];

    // Disruptions by severity
    const disruptionsBySeverity = [
      { severity: 'Critical', count: allDisruptions.filter(d => d.severity === 'Critical').length },
      { severity: 'High',     count: allDisruptions.filter(d => d.severity === 'High').length },
      { severity: 'Medium',   count: allDisruptions.filter(d => d.severity === 'Medium').length },
      { severity: 'Low',      count: allDisruptions.filter(d => d.severity === 'Low').length },
    ];

    // Fleet status breakdown
    const fleetStatusData = [
      { status: 'Available',   count: availableFleet,   fill: '#16a34a' },
      { status: 'In Transit',  count: inTransitFleet,   fill: '#2563eb' },
      { status: 'Maintenance', count: fleet.filter(f => f.status === 'Maintenance').length, fill: '#d97706' },
    ];

    // Recent plans for dashboard list
    const recentPlans = recoveryPlans
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(p => ({
        planId: p.planId,
        summary: p.summary,
        status: p.status,
        createdAt: p.createdAt,
        criticalShipments: p.criticalShipments || [],
      }));

    const recentDisruptions = allDisruptions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(d => ({
        disruptionId: d.disruptionId,
        title: d.title,
        description: d.description,
        severity: d.severity,
        location: d.location,
        type: d.type,
        status: d.status,
        affectedRouteIds: d.affectedRouteIds || [],
      }));

    const summary = {
      systemStatus,
      kpis: {
        activeDisruptions: activeDisruptions.length,
        inactiveDisruptions: inactiveDisruptions.length,
        atRiskShipments,
        criticalShipments,
        highRiskShipments,
        fleetUtilization,
        coldChainAlerts,
        delayedShipments,
        cargoValueAtRisk,
        totalShipments: shipments.length,
        availableFleet,
      },
      operationalAlert,
      enrichedActiveDisruptions,
      priorityShipments,
      recoveryActions,
      riskDistribution,
      disruptionsBySeverity,
      fleetStatusData,
      recentDisruptions,
      recentPlans,
      recentInactiveDisruptions: recentDisruptions.filter(d => d.status !== 'Active'),
    };

    res.json({ success: true, data: summary });
  } catch (err) {
    console.error('Dashboard getSummary error:', err);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

module.exports = { getSummary };
