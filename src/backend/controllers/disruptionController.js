// disruptionController.js
const store = require('../data/store');
const { analyzeDisruption } = require('../services/disruptionAnalysisService');

const getDisruptions = (req, res) => {
  try {
    const { severity, type, status } = req.query;
    let results = store.find('disruptions');
    if (severity) results = results.filter(d => d.severity === severity);
    if (type)     results = results.filter(d => d.type === type);
    if (status)   results = results.filter(d => d.status === status);
    results.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const getDisruptionById = (req, res) => {
  try {
    const disruption = store.findOne('disruptions', d => d.disruptionId === req.params.id);
    if (!disruption) return res.status(404).json({ success: false, error: { message: 'Disruption not found' } });
    res.json({ success: true, data: disruption });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const analyze = (req, res) => {
  try {
    const analysis = analyzeDisruption(req.params.id);
    if (!analysis) return res.status(404).json({ success: false, error: { message: 'Disruption not found' } });
    res.json({ success: true, data: analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

module.exports = { getDisruptions, getDisruptionById, analyze };
