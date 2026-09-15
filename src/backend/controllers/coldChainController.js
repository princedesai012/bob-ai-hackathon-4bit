// coldChainController.js
const store = require('../data/store');

const getAlerts = (req, res) => {
  try {
    const faultyLogs = store.find('temperatureLogs', t => t.sensorStatus === 'Faulty')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Enrich with shipment info
    const enriched = faultyLogs.map(log => {
      const shipment = store.findOne('shipments', s => s.shipmentId === log.shipmentId);
      return {
        ...log,
        customer: shipment?.customer,
        destination: shipment?.destination,
        requiredTemperatureMin: shipment?.requiredTemperatureMin,
        requiredTemperatureMax: shipment?.requiredTemperatureMax,
        priority: shipment?.priority,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const getShipmentLogs = (req, res) => {
  try {
    const logs = store.find('temperatureLogs', t => t.shipmentId === req.params.id)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

module.exports = { getAlerts, getShipmentLogs };
