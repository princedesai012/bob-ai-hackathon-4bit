import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDisruptionImpactGraph } from '../../services/allApis';
import {
  AlertOctagon, Package, Truck, Users, GitBranch,
  AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
  TrendingUp, Info, X, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const NODE_CONFIG = {
  disruption: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', icon: AlertOctagon,  w: 160, h: 72 },
  route:      { color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', icon: GitBranch,      w: 150, h: 68 },
  shipment:   { color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd', icon: Package,       w: 144, h: 76 },
  carrier:    { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: Users,         w: 140, h: 64 },
  fleet:      { color: '#047857', bg: '#f0fdf4', border: '#86efac', icon: Truck,         w: 140, h: 64 },
};

const RISK_COLORS = {
  Critical: { text: 'text-red-700',    bg: 'bg-red-100',    dot: '#dc2626' },
  High:     { text: 'text-orange-700', bg: 'bg-orange-100', dot: '#ea580c' },
  Medium:   { text: 'text-yellow-700', bg: 'bg-yellow-100', dot: '#d97706' },
  Low:      { text: 'text-green-700',  bg: 'bg-green-100',  dot: '#16a34a' },
};

const fmt = (n) => {
  if (!n) return '—';
  if (n >= 1_000_000) return `₹${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
};

// ─── Layout engine (column-based DAG layout) ─────────────────────────────────

const buildLayout = (nodes, edges) => {
  // Assign columns by node type
  const typeOrder = { disruption: 0, route: 1, shipment: 2, carrier: 3, fleet: 4 };
  const columns = {};

  nodes.forEach(n => {
    const col = typeOrder[n.type] ?? 2;
    if (!columns[col]) columns[col] = [];
    columns[col].push(n);
  });

  const colGapX = 220;
  const rowGapY = 110;
  const startX = 40;
  const startY = 40;

  const positioned = {};

  Object.entries(columns).forEach(([col, colNodes]) => {
    const x = startX + parseInt(col) * colGapX;
    const totalH = colNodes.length * rowGapY;
    const offsetY = startY + Math.max(0, 200 - totalH / 2);
    colNodes.forEach((n, i) => {
      const cfg = NODE_CONFIG[n.type] || NODE_CONFIG.shipment;
      positioned[n.id] = {
        ...n,
        x,
        y: offsetY + i * rowGapY,
        w: cfg.w,
        h: cfg.h,
      };
    });
  });

  // Canvas size
  const maxCol = Math.max(...Object.keys(columns).map(Number));
  const maxRows = Math.max(...Object.values(columns).map(c => c.length));
  const canvasW = startX * 2 + (maxCol + 1) * colGapX + 160;
  const canvasH = startY * 2 + maxRows * rowGapY + 80;

  return { positioned, canvasW, canvasH };
};

// ─── Edge path between two nodes ─────────────────────────────────────────────

const EdgePath = ({ src, tgt, label }) => {
  const x1 = src.x + src.w;
  const y1 = src.y + src.h / 2;
  const x2 = tgt.x;
  const y2 = tgt.y + tgt.h / 2;
  const mx = (x1 + x2) / 2;

  const d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  const midX = mx;
  const midY = (y1 + y2) / 2;

  return (
    <g>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeDasharray={label === 'affects' ? '6,3' : 'none'}
        markerEnd="url(#arrow)"
        opacity={0.8}
      />
      {label && (
        <text x={midX} y={midY - 5} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Inter, sans-serif">
          {label}
        </text>
      )}
    </g>
  );
};

// ─── Individual Node ──────────────────────────────────────────────────────────

const GraphNode = ({ node, onClick, isHighlighted }) => {
  const cfg = NODE_CONFIG[node.type] || NODE_CONFIG.shipment;
  const IconComp = cfg.icon;
  const { x, y, w, h, data } = node;

  // Risk ring for shipments
  const riskDot = data.riskLevel ? RISK_COLORS[data.riskLevel]?.dot : null;

  return (
    <g
      className="cursor-pointer"
      onClick={() => onClick(node)}
      style={{ filter: isHighlighted ? 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' : undefined }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={cfg.bg}
        stroke={isHighlighted ? '#3b82f6' : cfg.border}
        strokeWidth={isHighlighted ? 2.5 : 1.5}
      />

      {/* Icon */}
      <foreignObject x={x + 8} y={y + h / 2 - 10} width={20} height={20}>
        <IconComp size={14} color={cfg.color} />
      </foreignObject>

      {/* Type label */}
      <text
        x={x + 30}
        y={y + 14}
        fontSize="8"
        fontWeight="700"
        fill={cfg.color}
        textAnchor="start"
        fontFamily="Inter, sans-serif"
        textTransform="uppercase"
      >
        {node.type.toUpperCase()}
      </text>

      {/* Main label */}
      <text
        x={x + 10}
        y={y + 30}
        fontSize="11"
        fontWeight="600"
        fill="#111827"
        textAnchor="start"
        fontFamily="Inter, sans-serif"
      >
        {node.label.length > 20 ? node.label.slice(0, 19) + '…' : node.label}
      </text>

      {/* Sub-labels by type */}
      {node.type === 'disruption' && (
        <>
          <text x={x + 10} y={y + 44} fontSize="9" fill="#6b7280" fontFamily="Inter, sans-serif">
            {data.severity} · {data.location?.slice(0, 22)}
          </text>
          <text x={x + 10} y={y + 57} fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif">
            ~{data.estimatedDurationHours}h expected
          </text>
        </>
      )}
      {node.type === 'route' && (
        <>
          <text x={x + 10} y={y + 44} fontSize="9" fill="#6b7280" fontFamily="Inter, sans-serif">
            {data.distanceKm} km
          </text>
          <text x={x + 10} y={y + 57} fontSize="9" fill="#f97316" fontFamily="Inter, sans-serif" fontWeight="600">
            +{data.estimatedDelayHours}h delay
          </text>
        </>
      )}
      {node.type === 'shipment' && (
        <>
          {riskDot && (
            <circle cx={x + w - 10} cy={y + 10} r={5} fill={riskDot} />
          )}
          <text x={x + 10} y={y + 44} fontSize="9" fill="#6b7280" fontFamily="Inter, sans-serif">
            {data.riskLevel} · {data.riskScore}/100
          </text>
          <text x={x + 10} y={y + 57} fontSize="9" fill="#6b7280" fontFamily="Inter, sans-serif">
            {data.cargoType} · {fmt(data.cargoValue)}
          </text>
          <text x={x + 10} y={y + 69} fontSize="8" fill="#9ca3af" fontFamily="Inter, sans-serif">
            {data.customer}
          </text>
        </>
      )}
      {node.type === 'carrier' && (
        <text x={x + 10} y={y + 44} fontSize="9" fill="#6b7280" fontFamily="Inter, sans-serif">
          Reliability: {data.reliabilityScore}%
        </text>
      )}
      {node.type === 'fleet' && (
        <>
          <text x={x + 10} y={y + 44} fontSize="9" fill="#6b7280" fontFamily="Inter, sans-serif">
            {data.vehicleType}
          </text>
          <text x={x + 10} y={y + 57} fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif">
            {data.currentLocation} · {data.status}
          </text>
        </>
      )}
    </g>
  );
};

// ─── Tooltip / Info Panel ─────────────────────────────────────────────────────

const NodeInfoPanel = ({ node, onClose, navigate }) => {
  if (!node) return null;
  const { data, type } = node;
  const rc = data.riskLevel ? RISK_COLORS[data.riskLevel] : null;

  return (
    <div className="absolute top-4 right-4 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 capitalize">{type} Details</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-2 text-xs">
        {type === 'disruption' && (
          <>
            <div className="font-semibold text-gray-900">{data.disruptionId}</div>
            <div className="text-gray-600">{data.location} · {data.type}</div>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                data.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                data.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                'bg-yellow-100 text-yellow-700'}`}>{data.severity}</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{data.status}</span>
            </div>
            <div className="text-gray-500 mt-1">Duration: ~{data.estimatedDurationHours}h</div>
            <button
              onClick={() => navigate(`/disruptions/${data.disruptionId}`)}
              className="mt-3 w-full px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
            >
              Open Disruption Detail →
            </button>
          </>
        )}
        {type === 'route' && (
          <>
            <div className="font-semibold text-gray-900">{data.routeId}</div>
            <div className="text-gray-600">{data.origin} → {data.destination}</div>
            <div className="text-gray-500">{data.distanceKm} km · {data.estimatedDurationHours}h normal</div>
            <div className="text-orange-600 font-semibold">+{data.estimatedDelayHours}h estimated delay</div>
            {data.alternativeRouteIds?.length > 0 && (
              <div className="text-green-700 font-medium mt-1">
                ✓ {data.alternativeRouteIds.length} alternative route(s) available
              </div>
            )}
          </>
        )}
        {type === 'shipment' && (
          <>
            <div className="font-semibold text-gray-900">{data.shipmentId}</div>
            <div className="text-gray-600">{data.customer}</div>
            <div className="text-gray-500">{data.origin} → {data.destination}</div>
            <div className="text-gray-500">{data.cargoType} · {fmt(data.cargoValue)}</div>
            {rc && (
              <div className={`flex items-center gap-1.5 mt-1 px-2 py-1 rounded-lg ${rc.bg}`}>
                <span className={`font-bold ${rc.text}`}>{data.riskLevel}</span>
                <span className={`text-xs ${rc.text}`}>· {data.riskScore}/100</span>
              </div>
            )}
            <div className="text-gray-500 mt-1 italic text-xs">{data.riskExplanation}</div>
            {data.coldChainRequired && (
              <div className="text-blue-700 font-medium mt-1">❄ Cold chain required</div>
            )}
            <button
              onClick={() => navigate(`/shipments/${data.shipmentId}`)}
              className="mt-3 w-full px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Open Shipment Detail →
            </button>
          </>
        )}
        {type === 'carrier' && (
          <>
            <div className="font-semibold text-gray-900">{data.name}</div>
            <div className="text-gray-600">{data.carrierId}</div>
            <div className="text-gray-500">Reliability: {data.reliabilityScore}%</div>
            <div className="text-gray-500">Capacity: {data.availableCapacity} units</div>
            <div className={`mt-1 px-2 py-0.5 rounded-full inline-block font-medium ${
              data.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {data.status}
            </div>
          </>
        )}
        {type === 'fleet' && (
          <>
            <div className="font-semibold text-gray-900">{data.vehicleId}</div>
            <div className="text-gray-600">{data.vehicleType}</div>
            <div className="text-gray-500">Location: {data.currentLocation}</div>
            <div className="text-gray-500">Capacity: {data.capacity} units</div>
            {data.temperatureControlled && (
              <div className="text-blue-700 font-medium mt-1">❄ Temperature controlled</div>
            )}
            <div className={`mt-1 px-2 py-0.5 rounded-full inline-block font-medium ${
              data.status === 'Available' ? 'bg-green-100 text-green-700' :
              data.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'}`}>
              {data.status}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DisruptionImpactGraph = ({ disruptionId }) => {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [layout, setLayout] = useState(null);
  const [showPath, setShowPath] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDisruptionImpactGraph(disruptionId);
        if (res.data.success) {
          const data = res.data.data;
          setGraphData(data);
          if (!data.insufficient && data.nodes.length > 0) {
            const lyt = buildLayout(data.nodes, data.edges);
            setLayout(lyt);
          }
        } else {
          setError('Failed to load graph data.');
        }
      } catch (err) {
        setError('Failed to load impact graph.');
      }
      setLoading(false);
    };
    if (disruptionId) fetch();
  }, [disruptionId]);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  }, []);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.3));
  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = (e) => {
    if (e.target.closest('g[class*="cursor-pointer"]')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.min(3, Math.max(0.3, z - e.deltaY * 0.001)));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-500 gap-3">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      Loading impact graph…
    </div>
  );

  if (error || !graphData) return (
    <div className="flex items-center gap-2 py-8 text-red-600">
      <AlertTriangle className="w-4 h-4" /> {error || 'Unknown error.'}
    </div>
  );

  if (graphData.insufficient) return (
    <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
      <Info className="w-8 h-8 text-gray-300" />
      <p className="text-sm font-medium">{graphData.message}</p>
    </div>
  );

  const { nodes, edges, summary, highestRiskPath } = graphData;
  const positioned = layout?.positioned || {};
  const canvasW = layout?.canvasW || 900;
  const canvasH = layout?.canvasH || 500;

  return (
    <div className="space-y-4">
      {/* ── Section header ───────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-gray-900">Disruption Impact Graph</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Trace how this disruption affects routes, shipments, carriers, and fleet assets.
        </p>
      </div>

      {/* ── Impact Summary ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Affected Routes',   value: summary.affectedRoutes,       color: 'text-purple-700', bg: 'bg-purple-50' },
          { label: 'Affected Shipments',value: summary.affectedShipments,    color: 'text-blue-700',   bg: 'bg-blue-50' },
          { label: 'Critical Shipments',value: summary.criticalShipments,    color: 'text-red-700',    bg: 'bg-red-50' },
          { label: 'Affected Carriers', value: summary.affectedCarriers,     color: 'text-cyan-700',   bg: 'bg-cyan-50' },
          { label: 'Fleet Assets',      value: summary.fleetAssetsAffected,  color: 'text-green-700',  bg: 'bg-green-50' },
          { label: 'Cargo At Risk',     value: fmt(summary.cargoValueAtRisk),color: 'text-orange-700', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg p-3 border border-white/50`}>
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Highest Impact Path ──────────────────────────────────────────────── */}
      {highestRiskPath && (
        <div
          className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 cursor-pointer"
          onClick={() => setShowPath(p => !p)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-800">Highest Impact Path</span>
              <span className="text-xs text-red-600 px-2 py-0.5 bg-red-100 rounded-full">Risk {highestRiskPath.riskScore}/100</span>
            </div>
            {showPath ? <ChevronUp className="w-4 h-4 text-red-500" /> : <ChevronDown className="w-4 h-4 text-red-500" />}
          </div>
          {showPath && (
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              {[
                { label: highestRiskPath.disruption, color: 'bg-red-100 text-red-700 border border-red-200' },
                { label: '→', color: 'text-gray-400' },
                { label: highestRiskPath.route, color: 'bg-purple-100 text-purple-700 border border-purple-200' },
                { label: '→', color: 'text-gray-400' },
                { label: highestRiskPath.shipment, color: 'bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-200',
                  onClick: (e) => { e.stopPropagation(); navigate(`/shipments/${highestRiskPath.shipment}`); } },
                { label: '→', color: 'text-gray-400' },
                { label: `${highestRiskPath.riskLevel} ${highestRiskPath.riskScore}`, color: 'bg-orange-100 text-orange-700 border border-orange-200' },
                { label: '→', color: 'text-gray-400' },
                { label: fmt(highestRiskPath.cargoValue) + ' at risk', color: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
              ].map((item, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded-lg font-medium ${item.color}`}
                  onClick={item.onClick}
                >
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Legend ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
        {Object.entries(NODE_CONFIG).map(([type, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }} />
              <Icon size={11} color={cfg.color} />
              <span className="capitalize">{type}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 ml-auto text-gray-400">
          <Info size={11} /> Click nodes for details · Scroll to zoom · Drag to pan
        </div>
      </div>

      {/* ── Graph Canvas ─────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ height: 560, cursor: isPanning ? 'grabbing' : 'grab', userSelect: 'none', position: 'relative', overflow: 'hidden', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px' }}
      >
        {/* Zoom controls */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button
            onClick={handleResetView}
            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Maximize2 className="w-3 h-3 text-gray-600" />
          </button>
          <div className="mt-1 text-center text-xs text-gray-400 font-medium">{Math.round(zoom * 100)}%</div>
        </div>

        {/* SVG */}
        <svg
          ref={svgRef}
          width={canvasW}
          height={canvasH}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : 'transform 0.1s',
            display: 'block',
          }}
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={canvasW} height={canvasH} fill="url(#grid)" />

          {/* Edges */}
          <g>
            {edges.map(edge => {
              const src = positioned[edge.source];
              const tgt = positioned[edge.target];
              if (!src || !tgt) return null;
              return (
                <EdgePath
                  key={edge.id}
                  src={src}
                  tgt={tgt}
                  label={edge.label}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map(node => {
              const pNode = positioned[node.id];
              if (!pNode) return null;
              return (
                <GraphNode
                  key={node.id}
                  node={pNode}
                  onClick={handleNodeClick}
                  isHighlighted={selectedNode?.id === node.id || node.id === highestRiskPath?.shipment}
                />
              );
            })}
          </g>
        </svg>

        {/* Node Info Panel (absolute overlay) */}
        {selectedNode && (
          <NodeInfoPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            navigate={navigate}
          />
        )}
      </div>

      {/* ── Node count info ───────────────────────────────────────────────────── */}
      <div className="text-xs text-gray-400 text-right">
        {nodes.length} nodes · {edges.length} connections visualized
      </div>
    </div>
  );
};

export default DisruptionImpactGraph;
