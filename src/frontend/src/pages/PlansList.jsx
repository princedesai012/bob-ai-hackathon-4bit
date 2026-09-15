import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecoveryPlansSummary, getRecoveryPlans } from '../services/allApis';
import { StatusBadge } from '../components/Common/Badges';

// Simple KPI card component – mirrors the style used in Dashboard
const KpiCard = ({ title, value, colorClass }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  </div>
);

const PlansList = () => {
  const [summary, setSummary] = useState({ totalPlans: 0, activePlans: 0, pendingActions: 0, completedPlans: 0 });
  const [plans, setPlans] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Fetch KPI summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getRecoveryPlansSummary();
        if (res.data.success) {
          setSummary(res.data.data);
        }
      } catch (err) {
        setError('Failed to load summary');
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, []);

  // Fetch plan list
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await getRecoveryPlans();
        if (res.data.success) {
          setPlans(res.data.data);
        }
      } catch (err) {
        setError('Failed to load recovery plans');
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.planId.toLowerCase().includes(search.toLowerCase()) || (plan.disruptionId && plan.disruptionId.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? plan.status === statusFilter : true;
    const matchesPriority = priorityFilter ? plan.priority === priorityFilter : true;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pageSize = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredPlans.length / pageSize);
  const paginatedPlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, priorityFilter]);

  if (loadingSummary || loadingPlans) {
    return <div className="p-8">Loading recovery plans...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">Recovery Plans</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Plans" value={summary.totalPlans} colorClass="bg-blue-50 text-blue-600" />
        <KpiCard title="Active Plans" value={summary.activePlans} colorClass="bg-green-50 text-green-600" />
        <KpiCard title="Pending Actions" value={summary.pendingActions} colorClass="bg-yellow-50 text-yellow-600" />
        <KpiCard title="Completed Plans" value={summary.completedPlans} colorClass="bg-gray-50 text-gray-600" />
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search by plan or disruption…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
            <option value="Implemented">Implemented</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <Link
          to="/disruptions"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          + Create Recovery Plan
        </Link>
      </div>

      {/* Table */}
      {filteredPlans.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No recovery plans yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Plan ID</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Disruption</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Priority</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Affected Shipments</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Critical Shipments</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Actions</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Created Date</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">View</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlans.map((plan) => (
                <tr key={plan.planId} className="border-t">
                  <td className="px-4 py-2">{plan.planId}</td>
                  <td className="px-4 py-2">{plan.disruptionId}</td>
                  <td className="px-4 py-2">{plan.priority}</td>
                  <td className="px-4 py-2">{plan.affectedShipments ? plan.affectedShipments.length : 0}</td>
                  <td className="px-4 py-2">{plan.criticalShipments ? plan.criticalShipments.length : 0}</td>
                  <td className="px-4 py-2">{plan.actions ? plan.actions.length : 0}</td>
                  <td className="px-4 py-2"><StatusBadge status={plan.status} /></td>
                  <td className="px-4 py-2">{new Date(plan.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2"><Link to={`/plans/${plan.planId}`} className="text-blue-600 hover:underline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-4">
              <button onClick={goToPrev} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 text-gray-800 rounded disabled:opacity-50">
                Previous
              </button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <button onClick={goToNext} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 text-gray-800 rounded disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlansList;
