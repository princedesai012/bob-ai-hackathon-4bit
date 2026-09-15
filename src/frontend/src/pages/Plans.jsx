import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRecoveryPlanById } from '../services/allApis';
import { StatusBadge, SeverityBadge } from '../components/Common/Badges';
import {
  CheckCircle, Shield, Package, AlertTriangle,
  ChevronRight, Clock, RefreshCw, Activity
} from 'lucide-react';

const actionPriorityColor = {
  P1: 'bg-red-100 text-red-700 border-red-200',
  P2: 'bg-orange-100 text-orange-700 border-orange-200',
  P3: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low: 'bg-green-100 text-green-700 border-green-200',
};

const Plans = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id === 'recent') {
      navigate('/disruptions', { replace: true });
      return;
    }
    const fetch = async () => {
      try {
        const res = await getRecoveryPlanById(id);
        if (res.data.success) {
          setPlan(res.data.data);
        } else {
          setError('Recovery plan not found.');
        }
      } catch (err) {
        console.error('Failed to load plan', err);
        setError('Unable to load recovery plan. Please try again.');
      }
      setLoading(false);
    };
    fetch();
  }, [id, navigate]);

  if (loading) return (
    <div className="flex items-center gap-3 p-8 text-gray-500">
      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
      Loading recovery plan…
    </div>
  );

  if (error || !plan) return (
    <div className="max-w-xl mx-auto p-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800 mb-1">Plan Not Found</p>
          <p className="text-sm text-red-700">{error || 'Recovery plan could not be loaded.'}</p>
          <Link to="/plans" className="inline-flex items-center gap-1 mt-3 text-sm text-red-700 font-semibold hover:text-red-900">
            ← Back to Recovery Plans
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-300" />
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Recovery Plan</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{plan.summary}</h1>
              <p className="text-gray-400 text-sm">{plan.planId}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={plan.status} />
              {plan.priority && <SeverityBadge severity={plan.priority} />}
              <p className="text-xs text-gray-500 mt-1">
                Created {new Date(plan.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions bar */}
        <div className="px-8 py-4 border-t border-gray-700 bg-gray-800 flex flex-wrap items-center gap-3">
          <Link
            to={`/recovery/${plan.disruptionId}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Simulate Recovery Impact
          </Link>
          <Link
            to="/plans"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← All Plans
          </Link>
        </div>
      </div>

      {/* ── Critical Shipments ───────────────────────────────────────────────── */}
      {plan.criticalShipments?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-semibold text-gray-900">Critical Shipments Addressed</h2>
            <span className="text-xs text-gray-400 ml-auto">{plan.criticalShipments.length} shipment(s)</span>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {plan.criticalShipments.map(sid => (
                <Link
                  key={sid}
                  to={`/shipments/${sid}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                  <Package className="w-3.5 h-3.5" />
                  {sid}
                  <ChevronRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────────────── */}
      {plan.actions?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <h2 className="text-sm font-semibold text-gray-900">Executed Actions</h2>
            <span className="text-xs text-gray-400 ml-auto">{plan.actions.length} action(s)</span>
          </div>
          <div className="divide-y divide-gray-50">
            {plan.actions.map((action, idx) => (
              <div key={idx} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                    action.status === 'Completed'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {action.status === 'Completed' ? '✓' : idx + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {action.shipmentId && (
                      <Link
                        to={`/shipments/${action.shipmentId}`}
                        className="font-semibold text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {action.shipmentId}
                      </Link>
                    )}
                    {action.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${actionPriorityColor[action.priority] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {action.priority}
                      </span>
                    )}
                    {action.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        action.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        action.status === 'recommended' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {action.status === 'recommended' ? 'Recommended' : action.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{action.action}</p>
                  {action.reason && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{action.reason}</p>
                  )}
                  {action.expectedImpact && (
                    <p className="text-xs text-green-700 font-medium mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {action.expectedImpact}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Cold chain notes ─────────────────────────────────────────────────── */}
      {plan.coldChainActions?.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            ❄ Cold-Chain Monitoring Notes
          </h3>
          <ul className="space-y-1">
            {plan.coldChainActions.map((note, i) => (
              <li key={i} className="text-xs text-blue-800 flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">•</span>{note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Route changes ────────────────────────────────────────────────────── */}
      {plan.routeChanges?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Affected Routes</h3>
          <div className="flex flex-wrap gap-2">
            {plan.routeChanges.map((r, i) => (
              <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-2">
        <Link to="/plans" className="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1">
          ← Back to All Plans
        </Link>
        <Link
          to={`/recovery/${plan.disruptionId}`}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Activity className="w-4 h-4" />
          Run Recovery Simulation
        </Link>
      </div>
    </div>
  );
};

export default Plans;
