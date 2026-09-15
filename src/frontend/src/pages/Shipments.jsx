import React, { useState, useEffect } from 'react';
import { getShipments } from '../services/allApis';
import { SeverityBadge, StatusBadge } from '../components/Common/Badges';
import { Link } from 'react-router-dom';
import { Snowflake, Package, AlertTriangle, ChevronRight } from 'lucide-react';

const riskColors = {
  Critical: 'text-red-700 bg-red-50 border border-red-200',
  High:     'text-orange-700 bg-orange-50 border border-orange-200',
  Medium:   'text-yellow-700 bg-yellow-50 border border-yellow-200',
  Low:      'text-green-700 bg-green-50 border border-green-200',
};

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getShipments();
        if (res.data.success) {
          // Sort by risk level descending
          const order = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          const sorted = res.data.data.sort(
            (a, b) => (order[b.risk?.level] || 0) - (order[a.risk?.level] || 0)
          );
          setShipments(sorted);
        } else {
          setError('Failed to load shipments.');
        }
      } catch (err) {
        console.error('Failed to load shipments', err);
        setError('Unable to connect to backend. Please ensure the server is running.');
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex items-center gap-3 p-8 text-gray-500">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      Loading shipments…
    </div>
  );

  if (error) return (
    <div className="p-8 flex items-center gap-2 text-red-600">
      <AlertTriangle className="w-5 h-5" /> {error}
    </div>
  );

  const critical = shipments.filter(s => s.risk?.level === 'Critical').length;
  const atRisk   = shipments.filter(s => s.risk?.level !== 'Low').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {shipments.length} total · <span className="text-red-600 font-medium">{critical} critical</span> · {atRisk} at risk
          </p>
        </div>
        <Link
          to="/disruptions"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" /> View Active Disruptions
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipment</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Score</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shipments.map(s => {
                const riskLevel = s.risk?.level || 'Low';
                const riskScore = s.risk?.score ?? '—';
                const isCritical = riskLevel === 'Critical';
                return (
                  <tr
                    key={s.shipmentId}
                    className={`hover:bg-gray-50 transition-colors ${isCritical ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/shipments/${s.shipmentId}`} className="font-semibold text-blue-600 hover:text-blue-800 text-sm">
                          {s.shipmentId}
                        </Link>
                        {s.coldChainRequired && (
                          <Snowflake className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" title="Cold Chain Required" />
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.cargoType}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{s.customer}</td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-gray-600">{s.origin}</div>
                      <div className="text-xs text-gray-400">→ {s.destination}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <SeverityBadge severity={s.priority} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-sm font-bold ${riskColors[riskLevel] || ''}`}>
                        {riskScore}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <SeverityBadge severity={riskLevel} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Link
                        to={`/shipments/${s.shipmentId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View Risk <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Shipments;
