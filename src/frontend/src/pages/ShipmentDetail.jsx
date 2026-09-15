import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getShipmentById } from '../services/allApis';
import { SeverityBadge, StatusBadge } from '../components/Common/Badges';
import {
  Package, MapPin, Clock, AlertTriangle, Snowflake,
  Shield, Activity, ChevronRight, DollarSign, Thermometer
} from 'lucide-react';

const riskBarColor = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-yellow-500', Low: 'bg-green-500' };
const riskTextColor = { Critical: 'text-red-700', High: 'text-orange-700', Medium: 'text-yellow-700', Low: 'text-green-700' };
const riskBgColor  = { Critical: 'bg-red-50 border-red-200', High: 'bg-orange-50 border-orange-200', Medium: 'bg-yellow-50 border-yellow-200', Low: 'bg-green-50 border-green-200' };

const fmt = (n) => {
  if (!n) return '—';
  if (n >= 1_000_000) return `₹${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
    <dt className="text-sm text-gray-500">{label}</dt>
    <dd className="text-sm font-semibold text-gray-900 text-right">{value}</dd>
  </div>
);

const ShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getShipmentById(id);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError('Shipment not found.');
        }
      } catch (err) {
        console.error('Failed to load shipment', err);
        setError('Unable to load shipment. Please try again.');
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="flex items-center gap-3 p-8 text-gray-500">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      Loading shipment details…
    </div>
  );

  if (error || !data) return (
    <div className="p-8 flex items-center gap-2 text-red-600">
      <AlertTriangle className="w-5 h-5" /> {error || 'Shipment not found.'}
    </div>
  );

  const riskLevel = data.risk?.level || 'Low';
  const riskScore = data.risk?.score ?? 0;
  const hoursLeft = data.deliveryDeadline
    ? Math.round((new Date(data.deliveryDeadline) - new Date()) / (1000 * 60 * 60))
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl flex-shrink-0">
              <Package className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{data.shipmentId}</h1>
                {data.coldChainRequired && (
                  <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    <Snowflake className="w-3 h-3" /> Cold Chain
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">{data.customer} · {data.cargoType} · {fmt(data.cargoValue)}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <SeverityBadge severity={data.priority} />
                <StatusBadge status={data.status} />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${riskBgColor[riskLevel]} ${riskTextColor[riskLevel]}`}>
                  Risk: {riskScore}/100 — {riskLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Demo flow CTA */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link
              to={`/disruptions`}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors text-center justify-center"
            >
              <Activity className="w-4 h-4" />
              Analyze Impact &amp; Recover
            </Link>
            <Link
              to="/plans"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors text-center justify-center"
            >
              <Shield className="w-4 h-4" />
              Recovery Plans
            </Link>
          </div>
        </div>

        {/* Deadline urgency bar */}
        {hoursLeft !== null && hoursLeft < 120 && (
          <div className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border ${
            hoursLeft < 24 ? 'bg-red-50 border-red-200 text-red-700' :
            hoursLeft < 48 ? 'bg-orange-50 border-orange-200 text-orange-700' :
            'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}>
            <Clock className="w-4 h-4 flex-shrink-0" />
            {hoursLeft < 0
              ? `⚠ Delivery deadline has passed by ${Math.abs(hoursLeft)}h`
              : `Delivery deadline in ${hoursLeft}h — ${new Date(data.deliveryDeadline).toLocaleString()}`
            }
          </div>
        )}
      </div>

      {/* ── Detail cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Shipment Overview */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
            Shipment Details
          </h3>
          <dl className="space-y-1">
            <DetailRow label="Origin"       value={data.origin} />
            <DetailRow label="Destination"  value={data.destination} />
            <DetailRow label="Current Location" value={data.currentLocation || '—'} />
            <DetailRow label="Route ID"     value={data.routeId} />
            <DetailRow label="Carrier"      value={data.carrierId} />
            <DetailRow label="Cargo Type"   value={data.cargoType} />
            <DetailRow label="Cargo Value"  value={fmt(data.cargoValue)} />
            <DetailRow label="Priority"     value={data.priority} />
            <DetailRow label="Cold Chain"   value={data.coldChainRequired ? 'Required ❄' : 'Not Required'} />
          </dl>
        </div>

        {/* Timeline */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
            Timeline
          </h3>
          <div className="relative space-y-5">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-blue-100" />
            {[
              { label: 'Booked', sub: data.origin, done: true },
              { label: `Departed ${data.origin}`, sub: `Currently: ${data.currentLocation || '—'}`, done: data.status !== 'Booked' },
              { label: `Planned ETA — ${data.destination}`, sub: data.plannedETA ? new Date(data.plannedETA).toLocaleString() : '—', done: false },
              { label: 'Delivery Deadline', sub: data.deliveryDeadline ? new Date(data.deliveryDeadline).toLocaleString() : '—', done: false, alert: hoursLeft !== null && hoursLeft < 48 },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 relative z-10">
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white shadow-sm ${
                  step.alert ? 'bg-red-500' : step.done ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  {step.done && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${step.alert ? 'text-red-700' : step.done ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${step.alert ? 'text-red-500 font-medium' : 'text-gray-400'}`}>{step.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Profile */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
            Risk Profile
          </h3>

          {/* Score dial */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className={`text-5xl font-black ${riskTextColor[riskLevel]}`}>{riskScore}</span>
              <span className="text-gray-400 text-lg font-normal">/100</span>
            </div>
            <div className={`text-right px-3 py-1.5 rounded-xl border ${riskBgColor[riskLevel]}`}>
              <div className={`text-lg font-bold ${riskTextColor[riskLevel]}`}>{riskLevel}</div>
              <div className="text-xs text-gray-500">Risk Level</div>
            </div>
          </div>

          {/* Risk bar */}
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${riskBarColor[riskLevel]}`}
              style={{ width: `${riskScore}%` }}
            />
          </div>

          {/* Risk explanation */}
          {data.risk?.explanation && (
            <p className="text-xs text-gray-600 mb-4 italic leading-relaxed">{data.risk.explanation}</p>
          )}

          {/* Risk factors */}
          <div className="space-y-2">
            {data.risk?.factors?.length > 0 ? (
              data.risk.factors.map((f, i) => (
                <div key={i} className={`text-xs p-2.5 rounded-lg flex items-start gap-2 border ${
                  f.impact === 'high' ? 'bg-red-50 border-red-200 text-red-800' :
                  f.impact === 'medium' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                  'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">{f.factor}</span>
                    <span className="leading-relaxed">{f.reason}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No significant risk factors detected.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Cold chain section ────────────────────────────────────────────────── */}
      {data.coldChainRequired && data.temperatureLogs?.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Thermometer className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Cold Chain Monitoring</h3>
            <span className="text-xs text-gray-500">
              Required range: {data.requiredTemperatureMin}°C – {data.requiredTemperatureMax}°C
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.temperatureLogs.slice(-6).map((log, i) => {
              const isExcursion = log.temperature > data.requiredTemperatureMax || log.temperature < data.requiredTemperatureMin;
              return (
                <div key={i} className={`px-3 py-2 rounded-lg border text-xs ${
                  isExcursion ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                  <div className="font-bold text-base">{log.temperature}°C</div>
                  <div className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  {isExcursion && <div className="font-semibold mt-0.5">⚠ Excursion</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recovery options ──────────────────────────────────────────────────── */}
      {data.recoveryOptions?.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Recovery Options</h3>
            </div>
            <Link
              to="/disruptions"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Run Full Recovery Simulation <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.recoveryOptions.map((opt, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">{opt.option}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    opt.confidence === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{opt.confidence}</span>
                </div>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">{opt.reason}</p>
                <div className="flex gap-2 flex-wrap text-xs">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    ~{opt.estimatedDelay}h delay
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    Cost: {opt.estimatedCost}
                  </span>
                </div>
                {opt.tradeoffs && (
                  <p className="text-xs text-gray-400 mt-2 italic">{opt.tradeoffs}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentDetail;
