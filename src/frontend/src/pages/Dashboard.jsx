import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertOctagon, Package, Truck, Snowflake, Shield, TrendingUp,
  CheckCircle, AlertTriangle, ArrowRight, RefreshCw, Activity,
  Clock, DollarSign, Zap, BarChart2, Target, ChevronRight,
  XCircle, Info
} from 'lucide-react';
import { getDashboardSummary } from '../services/allApis';
import { SeverityBadge, StatusBadge } from '../components/Common/Badges';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) => {
  if (n >= 1_000_000) return `₹${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
};

const fmtHours = (h) => {
  if (!h) return '—';
  if (h >= 24) return `+${Math.round(h / 24)}d`;
  return `+${Math.round(h)}h`;
};

const riskColors = {
  Critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  High:     { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  Medium:   { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  Low:      { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
};

const sevColors = { Critical: '#dc2626', High: '#ea580c', Medium: '#d97706', Low: '#16a34a' };

const RiskBadge = ({ level }) => {
  const c = riskColors[level] || riskColors.Low;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {level}
    </span>
  );
};

// ─── KPI Card ────────────────────────────────────────────────────────────────

const KpiCard = ({ title, value, sub, icon: Icon, accent, trend, trendUp }) => (
  <div className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow ${accent?.border || 'border-gray-200'}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
        <p className={`text-3xl font-bold ${accent?.text || 'text-gray-900'}`}>{value}</p>
      </div>
      <div className={`p-2.5 rounded-lg ${accent?.bg || 'bg-gray-100'}`}>
        <Icon className={`w-5 h-5 ${accent?.text || 'text-gray-600'}`} />
      </div>
    </div>
    {(sub || trend) && (
      <div className="flex items-center justify-between">
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-red-600' : 'text-green-600'}`}>
            {trend}
          </span>
        )}
      </div>
    )}
  </div>
);

// ─── Section Header ──────────────────────────────────────────────────────────

const SectionHeader = ({ title, sub, linkTo, linkLabel, icon: Icon }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
    {linkTo && (
      <Link to={linkTo} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
        {linkLabel || 'View All'}
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    )}
  </div>
);

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
        <p className="font-semibold mb-0.5">{label || payload[0].name}</p>
        <p>{payload[0].value} {payload[0].name === 'count' ? 'shipments' : ''}</p>
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getDashboardSummary();
      if (res.data.success) {
        setData(res.data.data);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const timer = setInterval(() => fetchDashboard(true), 60000);
    return () => clearInterval(timer);
  }, [fetchDashboard]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-gray-500">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="font-medium">Loading Command Center…</span>
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-8 text-red-500 flex items-center gap-2">
      <XCircle className="w-5 h-5" />
      Could not connect to backend. Ensure the backend server is running.
    </div>
  );

  const { kpis, systemStatus, operationalAlert, enrichedActiveDisruptions,
          priorityShipments, recoveryActions, riskDistribution,
          disruptionsBySeverity, fleetStatusData, recentPlans } = data;

  const isAttention = systemStatus === 'Attention Required';

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Supply Chain Command Center</h1>
          </div>
          <p className="text-sm text-gray-500">Real-time visibility into disruptions, shipment risk, and recovery actions.</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* System status pill */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
            isAttention
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isAttention ? 'bg-red-500' : 'bg-green-500'}`} />
            {systemStatus}
          </div>
          {/* Refresh */}
          <button
            onClick={() => fetchDashboard(true)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {lastRefresh.toLocaleTimeString()}
          </button>
        </div>
      </div>

      {/* ── Operational Alert ────────────────────────────────────────────────── */}
      {operationalAlert.hasCritical ? (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 mb-1">
                ⚠ {operationalAlert.message}
              </p>
              <ul className="space-y-0.5">
                {operationalAlert.details.map((d, i) => (
                  <li key={i} className="text-xs text-red-700 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/disruptions" className="text-xs font-semibold text-red-700 hover:text-red-900 flex items-center gap-0.5 flex-shrink-0">
              Take Action <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-medium">✓ No immediate operational action required.</p>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          title="Active Disruptions"
          value={kpis.activeDisruptions}
          sub={`${kpis.inactiveDisruptions} resolved`}
          icon={AlertOctagon}
          accent={kpis.activeDisruptions > 0 ? { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' } : { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }}
        />
        <KpiCard
          title="Critical Shipments"
          value={kpis.criticalShipments}
          sub="Highest risk level"
          icon={Shield}
          accent={kpis.criticalShipments > 0 ? { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' } : { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }}
        />
        <KpiCard
          title="Shipments At Risk"
          value={kpis.atRiskShipments}
          sub={`of ${kpis.totalShipments} total`}
          icon={Package}
          accent={{ bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' }}
        />
        <KpiCard
          title="Cargo Value At Risk"
          value={fmt(kpis.cargoValueAtRisk)}
          sub="Medium–Critical risk"
          icon={DollarSign}
          accent={{ bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' }}
        />
        <KpiCard
          title="Fleet Utilization"
          value={`${kpis.fleetUtilization}%`}
          sub={`${kpis.availableFleet} vehicles available`}
          icon={Truck}
          accent={{ bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' }}
        />
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'View Disruptions', to: '/disruptions', icon: AlertOctagon, color: 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' },
          { label: 'Critical Shipments', to: '/shipments', icon: Package, color: 'text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100' },
          { label: 'Recovery Plans', to: '/plans', icon: Shield, color: 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100' },
          { label: 'Fleet', to: '/fleet', icon: Truck, color: 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100' },
          { label: 'Cold Chain', to: '/cold-chain', icon: Snowflake, color: 'text-cyan-600 border-cyan-200 bg-cyan-50 hover:bg-cyan-100' },
        ].map(({ label, to, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Link>
        ))}
      </div>

      {/* ── Active Disruptions Table ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <SectionHeader
            title="Active Disruptions"
            sub="Sorted by severity and operational impact"
            linkTo="/disruptions"
            icon={AlertOctagon}
          />
        </div>
        {enrichedActiveDisruptions.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500 flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <span>No active disruptions. All routes are clear.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold">Disruption</th>
                  <th className="px-4 py-3 text-left font-semibold">Location</th>
                  <th className="px-4 py-3 text-center font-semibold">Severity</th>
                  <th className="px-4 py-3 text-center font-semibold">Affected</th>
                  <th className="px-4 py-3 text-center font-semibold">Critical</th>
                  <th className="px-4 py-3 text-center font-semibold">Est. Delay</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enrichedActiveDisruptions.map(d => (
                  <tr
                    key={d.disruptionId}
                    className={`hover:bg-gray-50 transition-colors ${d.severity === 'Critical' ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 leading-snug">{d.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{d.type}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{d.location}</td>
                    <td className="px-4 py-3 text-center">
                      <SeverityBadge severity={d.severity} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-gray-800">{d.affectedShipmentCount}</span>
                      <div className="text-xs text-gray-400">shipments</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${d.criticalShipmentCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {d.criticalShipmentCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-orange-600">{fmtHours(d.estimatedDelayHours)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/disruptions/${d.disruptionId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Analyze <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Priority Shipments ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <SectionHeader
            title="Priority Shipments"
            sub="Highest-risk shipments from the Risk Engine — Critical → High → Medium → Low"
            linkTo="/shipments"
            icon={Package}
          />
        </div>
        {priorityShipments.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500 flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <span>No at-risk shipments detected.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold">Shipment</th>
                  <th className="px-4 py-3 text-left font-semibold">Route</th>
                  <th className="px-4 py-3 text-center font-semibold">Risk Score</th>
                  <th className="px-4 py-3 text-center font-semibold">Risk Level</th>
                  <th className="px-4 py-3 text-left font-semibold">Disruption</th>
                  <th className="px-4 py-3 text-center font-semibold">ETA</th>
                  <th className="px-4 py-3 text-center font-semibold">Exp. Delay</th>
                  <th className="px-4 py-3 text-center font-semibold">Priority</th>
                  <th className="px-4 py-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {priorityShipments.map(s => {
                  const rc = riskColors[s.risk.level] || riskColors.Low;
                  return (
                    <tr
                      key={s.shipmentId}
                      className={`hover:bg-gray-50 transition-colors ${s.risk.level === 'Critical' ? 'bg-red-50/40' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{s.shipmentId}</div>
                        <div className="text-xs text-gray-400">{s.customer}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-700">{s.origin}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-0.5">
                          <ArrowRight className="w-2.5 h-2.5" /> {s.destination}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-lg font-bold ${rc.text}`}>{s.risk.score}</span>
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${rc.dot}`}
                              style={{ width: `${s.risk.score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <RiskBadge level={s.risk.level} />
                      </td>
                      <td className="px-4 py-3">
                        {s.disruptionTitle ? (
                          <span className="text-xs text-orange-700 font-medium">{s.disruptionTitle}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600">
                        {s.plannedETA ? new Date(s.plannedETA).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {s.expectedDelayHours > 0 ? (
                          <span className="font-semibold text-orange-600">{fmtHours(s.expectedDelayHours)}</span>
                        ) : (
                          <span className="text-gray-400 text-xs">On time</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          s.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                          s.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                          s.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {s.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          to={`/shipments/${s.shipmentId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Recovery Actions + Charts Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recovery Actions */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <SectionHeader
              title="Recovery Actions"
              sub="Plans requiring attention — based on real recovery plan data"
              linkTo="/plans"
              icon={Shield}
            />
          </div>
          {recoveryActions.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-500 flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span>No pending recovery actions.</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recoveryActions.map((ra, i) => (
                <div key={ra.planId} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{ra.firstShipmentId || '—'}</span>
                        <span className="text-xs text-gray-400">via</span>
                        <span className="text-xs text-orange-700 font-medium truncate">{ra.disruptionTitle}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-1">{ra.recommendedAction}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        {ra.originalRisk && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-gray-500">Current Risk:</span>
                            <RiskBadge level={ra.originalRisk.level} />
                            <span className="font-semibold text-gray-700">{ra.originalRisk.score}</span>
                          </div>
                        )}
                        {ra.expectedDelayReduction > 0 && (
                          <div className="flex items-center gap-1 text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            Saves ~{fmtHours(ra.expectedDelayReduction)} delay
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StatusBadge status={ra.status} />
                      <Link
                        to={`/plans/${ra.planId}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                      >
                        View Plan <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Plans List (if no recovery actions) */}
          {recoveryActions.length === 0 && recentPlans.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <SectionHeader title="Recent Recovery Plans" icon={Shield} linkTo="/plans" />
              </div>
              <div className="divide-y divide-gray-50">
                {recentPlans.map(p => (
                  <div key={p.planId} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <Link to={`/plans/${p.planId}`} className="text-sm font-medium text-blue-600 hover:underline">{p.summary}</Link>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(p.createdAt).toLocaleDateString()} · {p.criticalShipments.length} shipments
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Charts Column */}
        <div className="flex flex-col gap-6">

          {/* Risk Distribution Pie */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <SectionHeader title="Risk Distribution" sub="Across all shipments" icon={BarChart2} />
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={riskDistribution.filter(d => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {riskDistribution.filter(d => d.count > 0).map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
              {riskDistribution.map(d => (
                <div key={d.level} className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                  {d.level}: <span className="font-semibold">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disruptions by Severity Bar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <SectionHeader title="Disruptions by Severity" icon={AlertOctagon} />
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={disruptionsBySeverity} barSize={20}>
                <XAxis dataKey="severity" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {disruptionsBySeverity.map((entry, index) => (
                    <Cell key={index} fill={sevColors[entry.severity] || '#9ca3af'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fleet Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <SectionHeader title="Fleet Status" sub={`${kpis.fleetUtilization}% utilization`} icon={Truck} />
            <div className="space-y-3 mt-2">
              {fleetStatusData.map(f => (
                <div key={f.status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{f.status}</span>
                    <span className="font-bold text-gray-800">{f.count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round((f.count / (fleetStatusData.reduce((s, x) => s + x.count, 0) || 1)) * 100)}%`,
                        background: f.fill,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
