// services/ai/fallbackProvider.js — uses in-memory store
const store = require('../../data/store');
const { calculateRisk } = require('../riskService');

const queryDatabase = (question) => {
  const q = question.toLowerCase();

  // Most at risk
  if (q.includes('most at risk') || q.includes('highest risk') || q.includes('at risk')) {
    const activeDisruptions = store.find('disruptions', d => d.status === 'Active');
    const affectedRouteIds = activeDisruptions.flatMap(d => d.affectedRouteIds);
    const shipments = store.find('shipments', s => affectedRouteIds.includes(s.routeId) && s.status !== 'Delivered');

    const ranked = shipments.map(s => {
      const disruption = activeDisruptions.find(d => d.affectedRouteIds.includes(s.routeId));
      const logs = store.find('temperatureLogs', t => t.shipmentId === s.shipmentId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const temp = logs[0]?.temperature ?? null;
      return { shipment: s, risk: calculateRisk(s, disruption, temp) };
    }).sort((a, b) => b.risk.score - a.risk.score);

    const critical = ranked.filter(r => r.risk.level === 'Critical');
    const high = ranked.filter(r => r.risk.level === 'High');

    return `📊 **At-Risk Shipments Analysis**\n\n` +
      `There are **${ranked.length}** shipments exposed to active disruptions.\n\n` +
      `🔴 **Critical (${critical.length}):** ${critical.map(r => r.shipment.shipmentId).join(', ') || 'None'}\n` +
      `🟠 **High Risk (${high.length}):** ${high.map(r => r.shipment.shipmentId).join(', ') || 'None'}\n\n` +
      `**Top Priority Shipment:** ${ranked[0]?.shipment.shipmentId} (Score: ${ranked[0]?.risk.score}/100) — ${ranked[0]?.risk.explanation}`;
  }

  // Cold chain
  if (q.includes('cold-chain') || q.includes('cold chain') || q.includes('temperature')) {
    const activeDisruptions = store.find('disruptions', d => d.status === 'Active');
    const affectedRouteIds = activeDisruptions.flatMap(d => d.affectedRouteIds);
    const coldShipments = store.find('shipments', s => s.coldChainRequired && affectedRouteIds.includes(s.routeId));

    const excursions = coldShipments.filter(s => {
      const logs = store.find('temperatureLogs', t => t.shipmentId === s.shipmentId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const temp = logs[0]?.temperature;
      return temp !== undefined && (temp > s.requiredTemperatureMax || temp < s.requiredTemperatureMin);
    });

    return `❄️ **Cold Chain Status**\n\n` +
      `**${coldShipments.length}** cold-chain shipments are on disrupted routes.\n` +
      `**${excursions.length}** have active temperature excursions.\n\n` +
      (excursions.length > 0
        ? `⚠️ **Excursion Shipments:** ${excursions.map(s => `${s.shipmentId} (${s.cargoType})`).join(', ')}\n\nImmediate intervention is recommended to preserve cargo integrity.`
        : '✅ All cold-chain shipments are within temperature range.');
  }

  // Fleet
  if (q.includes('vehicle') || q.includes('fleet') || q.includes('redeployment') || q.includes('available')) {
    const available = store.find('fleet', f => f.status === 'Available');
    const tempControlled = available.filter(f => f.temperatureControlled);
    return `🚛 **Fleet Availability**\n\n` +
      `**${available.length}** vehicles are currently available for redeployment:\n\n` +
      available.map(v => `• **${v.vehicleId}** — ${v.vehicleType} at ${v.currentLocation} (${v.capacity} units${v.temperatureControlled ? ', ❄️ temp-controlled' : ''})`).join('\n') +
      `\n\n${tempControlled.length} vehicles are temperature-controlled and suitable for cold-chain cargo.`;
  }

  // Port disruption / impact
  if (q.includes('port') || q.includes('disruption') || q.includes('impact') || q.includes('analyze')) {
    const disruptions = store.find('disruptions', d => d.status === 'Active');
    const summary = disruptions.map(d => {
      const affectedShipments = store.find('shipments', s => d.affectedRouteIds.includes(s.routeId) && s.status !== 'Delivered');
      return `• **${d.title}** (${d.severity}) — ${d.location}\n  ${affectedShipments.length} shipments affected, ${d.estimatedDurationHours}h expected duration`;
    }).join('\n\n');

    return `🚨 **Active Disruption Impact Summary**\n\n${disruptions.length} active disruption(s):\n\n${summary}`;
  }

  // Recovery plan
  if (q.includes('recovery plan') || q.includes('create a plan')) {
    const disruptions = store.find('disruptions', d => d.status === 'Active');
    if (disruptions.length === 0) return 'No active disruptions found to create a recovery plan for.';
    const main = disruptions[0];
    return `📋 **Recovery Plan Recommendation for: ${main.title}**\n\n` +
      `To generate an official recovery plan:\n` +
      `1. Open the **Disruptions** page\n` +
      `2. Click on **${main.title}**\n` +
      `3. Click **Analyze Impact**\n` +
      `4. In the Recovery Workspace, click **Generate Recovery Plan**\n\n` +
      `The AI engine will analyze all ${main.affectedRouteIds.length} affected routes, identify critical shipments, find available fleet, and create a prioritized action plan.`;
  }

  return `I've analyzed your query. We currently have **${store.find('disruptions', d => d.status === 'Active').length}** active disruptions affecting **${store.find('shipments', s => s.status !== 'Delivered').length}** shipments. Could you be more specific? You can ask about:\n• At-risk shipments\n• Cold chain exposure\n• Fleet availability\n• Disruption impact\n• Recovery plans`;
};

module.exports = { queryDatabase };
