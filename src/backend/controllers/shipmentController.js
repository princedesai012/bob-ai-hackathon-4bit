// shipmentController.js
const store = require('../data/store');
const { calculateRisk } = require('../services/riskService');
const { getRecoveryOptions } = require('../services/recoveryService');

const getShipments = (req, res) => {
  try {
    const shipments = store.find('shipments');
    const activeDisruptions = store.find('disruptions', d => d.status === 'Active');

    const enriched = shipments.map(s => {
      const disruption = activeDisruptions.find(d => d.affectedRouteIds.includes(s.routeId)) || null;
      const latestLog = s.coldChainRequired
        ? store.find('temperatureLogs', t => t.shipmentId === s.shipmentId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
        : null;
      const currentTemp = latestLog ? latestLog.temperature : null;
      return { ...s, risk: calculateRisk(s, disruption, currentTemp) };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const getShipmentById = (req, res) => {
  try {
    const shipment = store.findOne('shipments', s => s.shipmentId === req.params.id);
    if (!shipment) return res.status(404).json({ success: false, error: { message: 'Shipment not found' } });

    const activeDisruptions = store.find('disruptions', d => d.status === 'Active');
    const disruption = activeDisruptions.find(d => d.affectedRouteIds.includes(shipment.routeId)) || null;

    const logs = store.find('temperatureLogs', t => t.shipmentId === shipment.shipmentId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const currentTemp = logs.length ? logs[logs.length - 1].temperature : null;

    const risk = calculateRisk(shipment, disruption, currentTemp);
    const recoveryOptions = getRecoveryOptions(shipment, disruption);

    res.json({ success: true, data: { ...shipment, risk, recoveryOptions, temperatureLogs: logs } });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const getShipmentRisk = (req, res) => {
  try {
    const shipment = store.findOne('shipments', s => s.shipmentId === req.params.id);
    if (!shipment) return res.status(404).json({ success: false, error: { message: 'Shipment not found' } });
    const activeDisruptions = store.find('disruptions', d => d.status === 'Active');
    const disruption = activeDisruptions.find(d => d.affectedRouteIds.includes(shipment.routeId)) || null;
    const logs = store.find('temperatureLogs', t => t.shipmentId === shipment.shipmentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const currentTemp = logs.length ? logs[0].temperature : null;
    const risk = calculateRisk(shipment, disruption, currentTemp);
    res.json({ success: true, data: risk });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

module.exports = { getShipments, getShipmentById, getShipmentRisk };
