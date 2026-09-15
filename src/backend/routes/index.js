const express = require('express');

const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const disruptionController = require('../controllers/disruptionController');
const shipmentController = require('../controllers/shipmentController');
const fleetController = require('../controllers/fleetController');
const coldChainController = require('../controllers/coldChainController');
const copilotController = require('../controllers/copilotController');
const recoveryController = require('../controllers/recoveryController');
const impactGraphController = require('../controllers/impactGraphController');

const router = express.Router();

// Health
router.get('/health', (req, res) => res.json({ success: true, data: { status: 'healthy' } }));

// Auth
router.post('/auth/login', authController.login);

// Dashboard
router.get('/dashboard/summary', dashboardController.getSummary);

// Disruptions
router.get('/disruptions', disruptionController.getDisruptions);
router.get('/disruptions/:id/impact-graph', impactGraphController.getImpactGraph);
router.get('/disruptions/:id', disruptionController.getDisruptionById);
router.post('/disruptions/:id/analyze', disruptionController.analyze);

// Shipments
router.get('/shipments', shipmentController.getShipments);
router.get('/shipments/:id/risk', shipmentController.getShipmentRisk);
router.get('/shipments/:id', shipmentController.getShipmentById);

// Fleet
router.get('/fleet', fleetController.getFleet);
router.get('/fleet/redeployment-candidates', fleetController.getRedeploymentCandidates);

// Cold Chain
router.get('/cold-chain/alerts', coldChainController.getAlerts);
router.get('/cold-chain/shipments/:id', coldChainController.getShipmentLogs);

router.get('/recovery-plans/summary', recoveryController.getSummary);
router.post('/recovery-plans', recoveryController.createPlan);
router.get('/recovery-plans', recoveryController.getPlans);
router.get('/recovery-plans/:id', recoveryController.getPlanById);
router.post('/recovery-plans/:id/simulate', recoveryController.simulatePlanImpact);
router.post('/recovery-plans/:id/apply', recoveryController.applyRecoveryOption);

// Copilot
router.post('/copilot/query', copilotController.query);

module.exports = router;
