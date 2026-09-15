// recoveryController.js
const store = require('../data/store');
const { analyzeDisruption } = require('../services/disruptionAnalysisService');

const createPlan = (req, res) => {
  try {
    const { disruptionId } = req.body;
    if (!disruptionId) return res.status(400).json({ success: false, error: { message: 'disruptionId required' } });

    const analysis = analyzeDisruption(disruptionId);
    if (!analysis) return res.status(404).json({ success: false, error: { message: 'Disruption not found' } });

    const planId = store.nextId('PLN');
    const plan = store.insert('recoveryPlans', {
      planId,
      disruptionId,
      summary: `Recovery Plan for: ${analysis.disruption.title}`,
      priority: analysis.disruption.severity,
      criticalShipments: analysis.criticalShipments.map(s => s.shipmentId),
      actions: analysis.recommendations,
      fleetAssignments: analysis.availableFleet,
      routeChanges: analysis.affectedRoutes,
      carrierChanges: [],
      coldChainActions: analysis.coldChainExposure.map(c => `Monitor ${c.shipmentId} — temp at ${c.currentTemp}°C`),
      status: 'Draft',
    });

    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const getPlanById = (req, res) => {
  try {
    const plan = store.findOne('recoveryPlans', p => p.planId === req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: { message: 'Plan not found' } });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const getPlans = (req, res) => {
  try {
    const plans = store.find('recoveryPlans')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

// Summary endpoint
const getSummary = (req, res) => {
  try {
    const plans = store.find('recoveryPlans');
    const total = plans.length;
    const active = plans.filter(p => p.status === 'Draft' || p.status === 'Approved').length;
    const pending = plans.filter(p => p.actions && p.actions.some(a => a.status !== 'Completed')).length;
    const completed = plans.filter(p => p.status === 'Implemented').length;
    res.json({ success: true, data: { totalPlans: total, activePlans: active, pendingActions: pending, completedPlans: completed } });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

const { simulateImpact, applyOption } = require('../services/recoveryImpactService');

// Simulate impact for a recovery plan option
const simulatePlanImpact = async (req, res) => {
  try {
    const { optionKey } = req.body; // option identifier
    const result = simulateImpact(req.params.id, optionKey);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// Apply selected recovery option
const applyRecoveryOption = async (req, res) => {
  try {
    const { optionKey, userId } = req.body;
    const updatedPlan = applyOption(req.params.id, optionKey, userId);
    res.json({ success: true, data: updatedPlan });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

module.exports = { createPlan, getPlanById, getPlans, getSummary, simulatePlanImpact, applyRecoveryOption };
