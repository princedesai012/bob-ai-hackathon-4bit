// riskService.js — deterministic risk scoring using in-memory store

const calculateRisk = (shipment, disruption = null, currentTemp = null) => {
  let score = 0;
  const factors = [];

  // 1. Priority
  if (shipment.priority === 'Critical') {
    score += 20;
    factors.push({ factor: 'Cargo Priority', impact: 'high', reason: 'Shipment is marked as Critical priority.' });
  } else if (shipment.priority === 'High') {
    score += 10;
    factors.push({ factor: 'Cargo Priority', impact: 'medium', reason: 'Shipment is marked as High priority.' });
  }

  // 2. Disruption exposure
  if (disruption) {
    const impacts = { Critical: 40, High: 30, Medium: 15, Low: 5 };
    const add = impacts[disruption.severity] || 0;
    score += add;
    factors.push({
      factor: 'Active Disruption',
      impact: disruption.severity === 'Critical' || disruption.severity === 'High' ? 'high' : 'medium',
      reason: `Route exposed to "${disruption.title}" (${disruption.severity} — ${disruption.estimatedDurationHours}h expected).`,
    });
  }

  // 3. Delivery deadline proximity
  const now = new Date();
  const deadline = new Date(shipment.deliveryDeadline);
  const hoursLeft = (deadline - now) / (1000 * 60 * 60);
  if (hoursLeft < 12) {
    score += 30;
    factors.push({ factor: 'Delivery Deadline', impact: 'high', reason: `Only ${Math.max(0, Math.round(hoursLeft))}h remain before the delivery deadline.` });
  } else if (hoursLeft < 24) {
    score += 15;
    factors.push({ factor: 'Delivery Deadline', impact: 'medium', reason: 'Less than 24 hours until delivery deadline.' });
  }

  // 4. Cold chain excursion
  if (shipment.coldChainRequired && currentTemp !== null) {
    if (currentTemp > shipment.requiredTemperatureMax || currentTemp < shipment.requiredTemperatureMin) {
      score += 40;
      factors.push({
        factor: 'Cold Chain Excursion',
        impact: 'high',
        reason: `Current temperature ${currentTemp}°C is outside required range [${shipment.requiredTemperatureMin}°C, ${shipment.requiredTemperatureMax}°C].`,
      });
    }
  }

  score = Math.min(score, 100);
  let level = 'Low';
  if (score >= 80) level = 'Critical';
  else if (score >= 60) level = 'High';
  else if (score >= 30) level = 'Medium';

  return {
    score,
    level,
    factors,
    explanation: factors.length
      ? `Risk is ${level} due to ${factors.length} identified factor(s): ${factors.map(f => f.factor).join(', ')}.`
      : 'No significant risk factors detected.',
  };
};

module.exports = { calculateRisk };
