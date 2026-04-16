import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  MarkerType,
  type Edge,
  type Node
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: 'seeker',
    type: 'input',
    data: { label: '👤 House Seeker' },
    position: { x: 50, y: 150 },
    style: { background: 'var(--primary-container)', color: 'var(--on-primary-container)', borderRadius: '12px', border: 'none', fontWeight: 'bold' }
  },
  {
    id: 'payment',
    data: { label: '💳 M-Pesa / Stripe Gateway' },
    position: { x: 300, y: 150 },
    style: { background: 'var(--secondary-container)', borderRadius: '12px', border: 'none' }
  },
  {
    id: 'outbox',
    data: { label: '📦 Transactional Outbox' },
    position: { x: 600, y: 150 },
    style: { background: '#1e293b', color: 'white', borderRadius: '12px', border: '2px solid #3b82f6', padding: '10px' }
  },
  {
    id: 'db',
    data: { label: '🗄️ Postgres Ledger' },
    position: { x: 600, y: 300 },
    style: { background: '#f1f5f9', borderRadius: '12px', border: '1px solid #cbd5e1' }
  },
  {
    id: 'worker',
    data: { label: '🤖 Background Worker' },
    position: { x: 900, y: 150 },
    style: { background: '#0f172a', color: '#38bdf8', borderRadius: '12px', border: '1px solid #38bdf8' }
  },
  {
    id: 'throttle',
    data: { label: '🚦 Adaptive Throttler' },
    position: { x: 1200, y: 150 },
    style: { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', border: '1px solid #ef4444' }
  },
  {
    id: 'kra',
    type: 'output',
    data: { label: '🏛️ KRA eTIMS Node' },
    position: { x: 1500, y: 150 },
    style: { background: '#064e3b', color: '#10b981', borderRadius: '12px', border: '1px solid #10b981', fontWeight: 'bold' }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'seeker', target: 'payment', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-3', source: 'payment', target: 'outbox', label: 'Webhook Success', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-4', source: 'outbox', target: 'db', animated: true, label: 'ACID Atomic Commit', style: { stroke: '#3b82f6' } },
  { id: 'e3-5', source: 'outbox', target: 'worker', label: 'Job Enqueued', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e5-6', source: 'worker', target: 'throttle', animated: true, label: 'Rate-Limit Check' },
  { id: 'e6-7', source: 'throttle', target: 'kra', animated: true, label: 'eTIMS Transmission', style: { stroke: '#10b981' } }
];

export default function ArchitectureMap() {
  return (
    <div style={{ width: '100%', height: '500px', background: '#f8fafc', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
      >
        <Background gap={20} color="#e2e8f0" />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
    </div>
  );
}
