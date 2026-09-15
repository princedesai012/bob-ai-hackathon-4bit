import React, { useState, useEffect } from 'react';
import { getFleet, getRedeploymentCandidates } from '../services/allApis';
import { StatusBadge } from '../components/Common/Badges';
import { Truck, Snowflake } from 'lucide-react';

const Fleet = () => {
  const [fleet, setFleet] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getFleet();
        if (res.data.success) {
          setFleet(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load fleet");
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleFindCandidates = async () => {
    setFinding(true);
    try {
      const res = await getRedeploymentCandidates();
      if (res.data.success) {
        setCandidates(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load candidates");
    }
    setFinding(false);
  };

  if (loading) return <div className="p-8">Loading fleet...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Fleet Operations</h1>
        <button
          onClick={handleFindCandidates}
          disabled={finding}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {finding ? 'Searching...' : 'Find Redeployment Candidates'}
        </button>
      </div>

      {candidates.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-4">Redeployment Candidates Found</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map(c => (
              <div key={c.vehicleId} className="bg-white p-4 rounded border border-green-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-900">{c.vehicleId}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-sm text-gray-600 mb-1">{c.vehicleType}</p>
                <p className="text-xs text-green-700">{c.suitabilityReason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fleet.map(f => (
                <tr key={f.vehicleId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-gray-400" />
                    {f.vehicleId}
                    {f.temperatureControlled && <Snowflake className="w-4 h-4 ml-2 text-blue-400" />}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.vehicleType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.currentLocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.capacity} units</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={f.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Fleet;
