import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  analyzeDisruption, createRecoveryPlan,
  simulateRecoveryImpact, applyRecoveryPlan
} from '../services/allApis';
import { SeverityBadge } from '../components/Common/Badges';
import {
  ShieldAlert, Play, CheckCircle, AlertTriangle,
  ArrowRight, Clock, DollarSign, TrendingDown, TrendingUp,
  Package, Zap, ChevronRight, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Option Definitions ───────────────────────────────────────────────────────

const OPTION_ICONS = { reroute: '🛣️', changeCarrier: '🚢', redeployFleet: '🚛', rerouteChangeCarrier: '🔀', holdShipment: '⏸️' };

const optionDefinitions = [
  { key: 'reroute',              name: 'Reroute Shipment',        description: 'Use an alternate route to bypass the disrupted segment.' },
  { key: 'changeCarrier',        name: 'Change Carrier',          description: 'Switch to a premium carrier for higher reliability.' },
  { key: 'redeployFleet',        name: 'Redeploy Fleet',          description: 'Allocate additional internal fleet to speed delivery.' },
  { key: 'rerouteChangeCarrier', name: 'Reroute + Change Carrier', description: 'Combine alternate route with premium carrier (comprehensive).' },
  { key: 'holdShipment',         name: 'Hold Shipment',           description: 'Pause until disruption clears — lower cost, higher delay.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => {
  if (n == null) return '—';
  if (typeof n === 'string') return n;
  return Math.round(n).toLocaleString();
};

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleString(); } catch { return '—'; }
};

const riskColors = {
  Critical: { text: 'text-red-700', bg: 'bg-red-50 border-red-200', bar: 'bg-red-500' },
  High:     { text: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', bar: 'bg-orange-500' },
  Medium:   { text: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', bar: 'bg-yellow-500' },
  Low:      { text: 'text-green-700', bg: 'bg-green-50 border-green-200', bar: 'bg-green-500' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const RiskPill = ({ level, score }) => {
  const c = riskColors[level] || riskColors.Low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.bar}`} />
      {score}/100 — {level}
    </span>
  );
};

const Metric = ({ label, value, sub, highlight }) => (
  <div className={`rounded-xl p-4 border ${highlight ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
    <div className="text-xs text-gray-500 mb-1 font-medium">{label}</div>
    <div className={`text-base font-bold ${highlight ? 'text-blue-800' : 'text-gray-800'}`}>{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

// ─── Loading step indicator ───────────────────────────────────────────────────

const Step = ({ n, label, active, done }) => (
  <div className={`flex items-center gap-2 text-sm ${done ? 'text-green-700' : active ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
      done ? 'bg-green-100 text-green-700' : active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
    }`}>
      {done ? '✓' : n}
    </div>
    {label}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Recovery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [planId, setPlanId]           = useState(null);
  const [analysis, setAnalysis]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [loadingStep, setLoadingStep] = useState('Analyzing disruption…');
  const [selectedOption, setSelectedOption] = useState(null);
  const [simulating, setSimulating]   = useState(false);
  const [impact, setImpact]           = useState(null);
  const [applying, setApplying]       = useState(false);
  const [applied, setApplied]         = useState(false);
  const [error, setError]             = useState(null);

  // Step 1: Fetch disruption analysis
  useEffect(() => {
    const run = async () => {
      setLoadingStep('Analyzing disruption…');
      try {
        const res = await analyzeDisruption(id);
        if (res.data.success) {
          setAnalysis(res.data.data);
        } else {
          setError('Unable to analyze this disruption. Please try again.');
        }
      } catch (err) {
        console.error(err);
        setError('Unable to connect to the analysis service. Please ensure the backend is running.');
      }
      setLoading(false);
    };
    run();
  }, [id]);

  // Step 2: Auto-create recovery plan once analysis is ready
  useEffect(() => {
    if (!analysis || planId) return;
    const create = async () => {
      try {
        const res = await createRecoveryPlan(analysis.disruption.disruptionId);
        if (res.data.success) {
          setPlanId(res.data.data.planId);
        } else {
          setError('Unable to create recovery plan. Please try again.');
        }
      } catch (e) {
        console.error(e);
        setError('Unable to create recovery plan. Please try again.');
      }
    };
    create();
  }, [analysis, planId]);

  // Step 3: Select recovery option + auto-simulate
  const handleOptionSelect = async (opt) => {
    if (!planId) {
      setError('Recovery plan is not ready yet. Please wait a moment.');
      return;
    }
    setSelectedOption(opt);
    setImpact(null);
    setError(null);
    setSimulating(true);
    try {
      const res = await simulateRecoveryImpact(planId, opt.key);
      if (res.data.success) {
        setImpact(res.data.data);
      } else {
        setError('Unable to calculate recovery impact. Please try a different option.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to calculate recovery impact. Please try again.');
    }
    setSimulating(false);
  };

  // Step 4: Apply selected option
  const handleApply = async () => {
    if (!selectedOption || !planId) return;
    setApplying(true);
    setError(null);
    try {
      const res = await applyRecoveryPlan(planId, selectedOption.key, user?.email || 'ops@supplyshield.ai');
      if (res.data.success) {
        setApplied(true);
        setTimeout(() => navigate('/plans'), 2000);
      } else {
        setError('Unable to apply recovery plan. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to apply recovery plan. Please try again.');
    }
    setApplying(false);
  };

  // ── States ──────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
          <h2 className="text-lg font-semibold text-gray-900">Building Recovery Workspace</h2>
        </div>
        <div className="space-y-3">
          <Step n={1} label="Analyzing disruption impact…" active done={false} />
          <Step n={2} label="Identifying affected shipments" active={false} done={false} />
          <Step n={3} label="Generating recovery options" active={false} done={false} />
        </div>
        <p className="text-xs text-gray-400 mt-6">{loadingStep}</p>
      </div>
    </div>
  );

  if (error && !analysis) return (
    <div className="max-w-xl mx-auto p-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800 mb-1">Analysis Failed</p>
          <p className="text-sm text-red-700">{error}</p>
          <Link to="/disruptions" className="inline-flex items-center gap-1 mt-3 text-sm text-red-700 font-semibold hover:text-red-900">
            ← Back to Disruptions
          </Link>
        </div>
      </div>
    </div>
  );

  if (applied) return (
    <div className="max-w-xl mx-auto p-8">
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-green-800 mb-2">Recovery Plan Applied</h2>
        <p className="text-green-700 text-sm">
          Option "{selectedOption?.name}" has been applied. Redirecting to Recovery Plans…
        </p>
      </div>
    </div>
  );

  const { disruption, criticalShipments, affectedShipmentCount } = analysis;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl flex-shrink-0">
              <ShieldAlert className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-gray-900">Recovery Workspace</h1>
                {planId && (
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium border border-green-200">
                    Plan Ready · {planId}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{disruption.title}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <SeverityBadge severity={disruption.severity} />
                <span className="text-xs text-gray-500">{disruption.location}</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ~{disruption.estimatedDurationHours}h expected duration
                </span>
              </div>
            </div>
          </div>
          <Link
            to={`/disruptions/${disruption.disruptionId}`}
            className="flex-shrink-0 text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
          >
            View Disruption Detail <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Impact summary */}
        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Metric label="Affected Shipments" value={affectedShipmentCount} />
          <Metric label="Critical / High Risk" value={criticalShipments.length} />
          <Metric label="Disruption ID" value={disruption.disruptionId} />
        </div>
      </div>

      {/* ── Critical Shipments ───────────────────────────────────────────────── */}
      {criticalShipments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-semibold text-gray-900">Critical & High-Risk Shipments</h2>
            <span className="text-xs text-gray-400 ml-auto">Select an option below to simulate recovery</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm divide-y divide-gray-50">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Shipment</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Destination</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Risk Score</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Risk Level</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Priority</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Cold Chain</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {criticalShipments.map(s => (
                  <tr key={s.shipmentId} className={`hover:bg-gray-50 ${s.riskLevel === 'Critical' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-3 font-semibold text-gray-900">{s.shipmentId}</td>
                    <td className="px-5 py-3 text-gray-600">{s.destination}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`font-bold text-base ${riskColors[s.riskLevel]?.text || 'text-gray-700'}`}>{s.riskScore}</span>
                    </td>
                    <td className="px-5 py-3 text-center"><SeverityBadge severity={s.riskLevel} /></td>
                    <td className="px-5 py-3 text-center"><SeverityBadge severity={s.priority} /></td>
                    <td className="px-5 py-3 text-center text-xs">{s.coldChain ? '❄ Yes' : '—'}</td>
                    <td className="px-5 py-3 text-center">
                      <Link
                        to={`/shipments/${s.shipmentId}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Risk →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recovery Option Selector ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
          <Zap className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900">Select Recovery Strategy</h2>
          <span className="text-xs text-gray-400 ml-auto">Click to simulate impact instantly</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {optionDefinitions.map(opt => {
            const isSelected = selectedOption?.key === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => handleOptionSelect(opt)}
                disabled={simulating}
                className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-sm disabled:opacity-60 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-lg">{OPTION_ICONS[opt.key]}</span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </div>
                <h3 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-800' : 'text-gray-900'}`}>
                  {opt.name}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Simulation Loading ───────────────────────────────────────────────── */}
      {simulating && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
          <div>
            <p className="text-blue-800 font-semibold text-sm">Calculating recovery impact…</p>
            <p className="text-blue-600 text-xs mt-0.5">Running risk engine simulation for "{selectedOption?.name}"</p>
          </div>
        </div>
      )}

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── Impact Simulation — Before vs After ─────────────────────────────── */}
      {impact && selectedOption && !simulating && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Impact Simulation — {selectedOption.name}</h2>
            {impact.recommendation?.recommended ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                ✓ Recommended
              </span>
            ) : (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">
                Consider Alternatives
              </span>
            )}
          </div>

          {/* Before / After panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BEFORE */}
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-100 border-b border-gray-200 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm font-bold text-gray-700">BEFORE Recovery</span>
                <span className="text-xs text-gray-500 ml-auto">Current situation</span>
              </div>
              <div className="p-5 space-y-3">
                {impact.original.risk && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-medium">RISK SCORE</div>
                    <RiskPill level={impact.original.risk.level} score={impact.original.risk.score} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Metric label="Route"    value={impact.original.route?.length > 25 ? impact.original.route.slice(0, 24) + '…' : (impact.original.route || '—')} />
                  <Metric label="Distance" value={impact.original.distance ? `${fmt(impact.original.distance)} km` : '—'} />
                  <Metric label="Est. Delay" value={impact.original.delayHours != null ? `${fmt(impact.original.delayHours)}h` : '—'} />
                  <Metric label="Est. Cost" value={impact.original.cost ? `₹${fmt(impact.original.cost)}` : '—'} />
                  <Metric label="Carrier"  value={impact.original.carrier || '—'} />
                  <Metric label="Cold-Chain Exposure" value={`${impact.original.coldChainExposure ?? 0}h`} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1 font-medium">ETA</div>
                  <div className="text-sm font-semibold text-gray-800">{fmtDate(impact.original.eta)}</div>
                </div>
              </div>
            </div>

            {/* AFTER */}
            <div className="bg-white rounded-xl border-2 border-blue-300 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-blue-600 border-b border-blue-700 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white" />
                <span className="text-sm font-bold text-white">AFTER Recovery</span>
                <span className="text-xs text-blue-200 ml-auto">{selectedOption.name}</span>
              </div>
              <div className="p-5 space-y-3">
                {impact.recovery.risk && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-medium">RISK SCORE</div>
                    <RiskPill level={impact.recovery.risk.level} score={impact.recovery.risk.score} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Metric label="Route"    value={impact.recovery.route?.length > 25 ? impact.recovery.route.slice(0, 24) + '…' : (impact.recovery.route || '—')} highlight />
                  <Metric label="Distance" value={impact.recovery.distance ? `${fmt(impact.recovery.distance)} km` : '—'} highlight />
                  <Metric label="Est. Delay" value={impact.recovery.delayHours != null ? `${fmt(impact.recovery.delayHours)}h` : '—'} highlight />
                  <Metric label="Est. Cost" value={impact.recovery.cost ? `₹${fmt(impact.recovery.cost)}` : '—'} highlight />
                  <Metric label="Carrier"  value={impact.recovery.carrier || '—'} highlight />
                  <Metric label="Cold-Chain Exposure" value={`${impact.recovery.coldChainExposure ?? 0}h`} highlight />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1 font-medium">NEW ETA</div>
                  <div className="text-sm font-semibold text-blue-800">{fmtDate(impact.recovery.eta)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Delta summary */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Impact Delta</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: 'Delay Change',
                  value: impact.impact.delayChange,
                  unit: 'h',
                  better: impact.impact.delayChange < 0,
                },
                {
                  label: 'Cost Change',
                  value: impact.impact.costChange != null ? Math.round(impact.impact.costChange) : null,
                  unit: '₹',
                  prefix: true,
                  better: impact.impact.costChange <= 0,
                },
                {
                  label: 'Risk Change',
                  value: impact.impact.riskChange,
                  unit: ' pts',
                  better: impact.impact.riskChange < 0,
                },
                {
                  label: 'Cold-Chain Δ',
                  value: impact.impact.coldChainExposureChange,
                  unit: 'h',
                  better: impact.impact.coldChainExposureChange <= 0,
                },
              ].map(m => {
                const sign = m.value > 0 ? '+' : '';
                const val  = m.value != null ? `${sign}${m.prefix ? '₹' : ''}${m.value}${m.unit}` : '—';
                return (
                  <div key={m.label} className={`rounded-lg p-3 border text-center ${
                    m.value == null ? 'bg-gray-100 border-gray-200' :
                    m.better ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`text-lg font-bold ${
                      m.value == null ? 'text-gray-500' :
                      m.better ? 'text-green-700' : 'text-red-700'
                    }`}>{val}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
                    {m.value != null && (
                      <div className="mt-1">
                        {m.better
                          ? <TrendingDown className="w-3.5 h-3.5 text-green-600 mx-auto" />
                          : <TrendingUp className="w-3.5 h-3.5 text-red-600 mx-auto" />
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recommendation reasoning */}
            {impact.recommendation?.reason && (
              <div className={`mt-4 px-4 py-3 rounded-lg border text-sm ${
                impact.recommendation.recommended
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                <strong>{impact.recommendation.recommended ? '✓ Recommended:' : '⚠ Note:'}</strong>{' '}
                {impact.recommendation.reason}
              </div>
            )}
          </div>

          {/* Apply button */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleApply}
              disabled={applying}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm"
            >
              {applying ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Applying Recovery Plan…</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Apply Recovery Plan</>
              )}
            </button>
            <button
              onClick={() => { setSelectedOption(null); setImpact(null); }}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Choose Different Option
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recovery;
