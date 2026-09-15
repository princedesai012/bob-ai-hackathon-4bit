import React, { useState, useEffect } from 'react';
import { getColdChainAlerts } from '../services/allApis';
import { Link } from 'react-router-dom';
import { Snowflake, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

const ColdChain = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock chart data for visualization
  const mockChartData = Array.from({length: 12}).map((_, i) => ({
    time: `${i*2}h ago`,
    temp: 2 + Math.random() * 8, // some excursions
  }));

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getColdChainAlerts();
        if (res.data.success) {
          setAlerts(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load alerts");
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="p-8">Loading cold chain...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Cold Chain Monitoring</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Alerts List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-900">Active Excursion Alerts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.length === 0 ? (
               <div className="p-6 text-center text-gray-500">No active alerts.</div>
            ) : (
              alerts.map(a => (
                <div key={a._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <Link to={`/shipments/${a.shipmentId}`} className="font-medium text-blue-600 hover:underline">{a.shipmentId}</Link>
                    <span className="text-sm text-red-600 font-bold">{a.temperature}°C</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Status: {a.sensorStatus} • {new Date(a.timestamp).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Temperature Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-6">
          <div className="flex items-center mb-4">
            <Snowflake className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Latest Critical Shipment (SHP-1024)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[-5, 15]} />
                <Tooltip />
                <ReferenceArea y1={2} y2={8} strokeOpacity={0.3} fill="green" fillOpacity={0.1} />
                <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            Green zone indicates required temperature range (2°C - 8°C).
          </div>
        </div>

      </div>
    </div>
  );
};

export default ColdChain;
