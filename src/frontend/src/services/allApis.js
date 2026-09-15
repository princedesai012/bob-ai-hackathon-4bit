import api from './api';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getDisruptions = (params) => api.get('/disruptions', { params });
export const getDisruptionById = (id) => api.get(`/disruptions/${id}`);
export const analyzeDisruption = (id) => api.post(`/disruptions/${id}/analyze`);
export const getDisruptionImpactGraph = (id) => api.get(`/disruptions/${id}/impact-graph`);
export const getShipments = (params) => api.get('/shipments', { params });
export const getShipmentById = (id) => api.get(`/shipments/${id}`);
export const getShipmentRisk = (id) => api.get(`/shipments/${id}/risk`);
export const getFleet = () => api.get('/fleet');
export const getRedeploymentCandidates = () => api.get('/fleet/redeployment-candidates');
export const getColdChainAlerts = () => api.get('/cold-chain/alerts');
export const getColdChainLogs = (id) => api.get(`/cold-chain/shipments/${id}`);
export const createRecoveryPlan = (disruptionId) => api.post('/recovery-plans', { disruptionId });
export const getRecoveryPlansSummary = () => api.get('/recovery-plans/summary');
export const getRecoveryPlans = () => api.get('/recovery-plans');
export const getRecoveryPlanById = (id) => api.get(`/recovery-plans/${id}`);

export const simulateRecoveryImpact = (planId, optionKey) => api.post(`/recovery-plans/${planId}/simulate`, { optionKey });
export const applyRecoveryPlan = (planId, optionKey, userId) => api.post(`/recovery-plans/${planId}/apply`, { optionKey, userId });

export const queryCopilot = (message) => api.post('/copilot/query', { message });
