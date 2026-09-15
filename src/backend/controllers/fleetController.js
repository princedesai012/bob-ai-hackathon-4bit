// fleetController.js
const store = require('../data/store');

const getFleet = (req, res) => {
  try {
    res.json({ success: true, data: store.find('fleet') });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const getRedeploymentCandidates = (req, res) => {
  try {
    const candidates = store.find('fleet', f => f.status === 'Available');
    const enriched = candidates.map(v => ({
      ...v,
      suitabilityReason: `Available at ${v.currentLocation} with ${v.capacity} unit capacity${v.temperatureControlled ? ' — temperature-controlled' : ''}.`,
    }));
    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

module.exports = { getFleet, getRedeploymentCandidates };
