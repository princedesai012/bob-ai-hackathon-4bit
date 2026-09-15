import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDisruptions } from '../services/allApis';
import { SeverityBadge, StatusBadge } from '../components/Common/Badges';
import { AlertOctagon, Activity, ChevronRight, Clock } from 'lucide-react';

const Disruptions = () => {
  const [disruptions, setDisruptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDisruptions();
        if (res.data.success) {
          setDisruptions(res.data.data);
        } else {
          setError('Failed to load disruptions.');
        }
      } catch (err) {
        console.error('Failed to load disruptions', err);
        setError('Unable to connect to backend. Please ensure the server is running.');
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex items-center gap-3 p-8 text-gray-500">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      Loading disruptions…
    </div>
  );

  if (error) return (
    <div className="p-8 flex items-center gap-2 text-red-600">
      <AlertOctagon className="w-5 h-5" /> {error}
    </div>
  );

  const active = disruptions.filter(d => d.status === 'Active');
  const resolved = disruptions.filter(d => d.status !== 'Active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disruptions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {active.length} active · {resolved.length} resolved
          </p>
        </div>
      </div>

      {/* Active disruptions */}
      {active.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Active Disruptions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Disruption</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {active.map(d => (
                  <tr key={d.disruptionId} className={`hover:bg-gray-50 transition-colors ${d.severity === 'Critical' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm">{d.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{d.disruptionId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{d.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SeverityBadge severity={d.severity} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                        <Clock className="w-3 h-3" />
                        {d.estimatedDurationHours}h expected
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/disruptions/${d.disruptionId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/recovery/${d.disruptionId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Activity className="w-3 h-3" />
                          Analyze Impact
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resolved disruptions */}
      {resolved.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Resolved / Inactive</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Disruption</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {resolved.map(d => (
                  <tr key={d.disruptionId} className="hover:bg-gray-50 transition-colors opacity-75">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-700 text-sm">{d.title}</div>
                      <div className="text-xs text-gray-400">{d.disruptionId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{d.type}</td>
                    <td className="px-6 py-4"><SeverityBadge severity={d.severity} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{d.location}</td>
                    <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/disruptions/${d.disruptionId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {disruptions.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          No disruptions found. All routes are operating normally.
        </div>
      )}
    </div>
  );
};

export default Disruptions;
