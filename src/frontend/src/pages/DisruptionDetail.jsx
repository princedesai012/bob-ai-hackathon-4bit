import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDisruptionById, analyzeDisruption } from '../services/allApis';
import { SeverityBadge, StatusBadge } from '../components/Common/Badges';
import { AlertOctagon, Activity, GitBranch, RefreshCw, AlertTriangle } from 'lucide-react';
import DisruptionImpactGraph from '../components/Dashboard/DisruptionImpactGraph';

const DisruptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDisruptionById(id);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError('Disruption not found.');
        }
      } catch (err) {
        console.error('Failed to load disruption', err);
        setError('Unable to load disruption. Please ensure the backend is running.');
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeDisruption(id);
    } catch (err) {
      console.error('Analysis failed', err);
    }
    navigate(`/recovery/${id}`);
    setAnalyzing(false);
  };

  if (loading) return (
    <div className="flex items-center gap-3 p-8 text-gray-500">
      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
      Loading disruption details…
    </div>
  );
  if (error || !data) return (
    <div className="p-8 flex items-center gap-2 text-red-600">
      <AlertTriangle className="w-5 h-5" /> {error || 'Disruption not found.'}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Disruption Header ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertOctagon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
                <SeverityBadge severity={data.severity} />
                <StatusBadge status={data.status} />
              </div>
              <p className="text-gray-500">{data.disruptionId} • {data.location} • {data.type}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</>
            ) : (
              <><Activity className="w-4 h-4 mr-2" /> Analyze Impact &amp; Create Recovery Plan</>
            )}
          </button>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
          <p className="text-gray-700">{data.description}</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Start Time</p>
              <p className="mt-1 text-gray-900">{new Date(data.startTime).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Expected Duration</p>
              <p className="mt-1 text-gray-900">{data.estimatedDurationHours} Hours</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Affected Routes</p>
              <p className="mt-1 text-gray-900">{data.affectedRouteIds?.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Disruption Impact Graph ───────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <GitBranch className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">Impact Propagation</span>
        </div>
        <DisruptionImpactGraph disruptionId={id} />
      </div>
    </div>
  );
};

export default DisruptionDetail;
