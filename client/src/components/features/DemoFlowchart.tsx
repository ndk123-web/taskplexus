import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel,
  MarkerType,
  Handle,
  Position,
  type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../styles/pages/DemoFlowchart.css';

// Demo Node Component
const DemoTodoNode = ({ data }: { data: any }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onDelete(data.id);
  };

  return (
    <div className={`demo-todo-node priority-${data.priority}`}>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="demo-handle demo-handle-top"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="demo-handle demo-handle-right"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="demo-handle demo-handle-bottom"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="demo-handle demo-handle-left"
      />

      <div className="demo-node-header">
        <span className={`demo-priority-badge priority-${data.priority}`}>
          {data.priority.toUpperCase()}
        </span>
        <button className="demo-delete-btn" onClick={handleDelete} title="Delete node">
          ✕
        </button>
      </div>
      <div className="demo-node-content">
        <span>{data.label}</span>
      </div>
    </div>
  );
};

const nodeTypes = {
  demoNode: DemoTodoNode,
};

interface DemoFlowchartProps {
  onClose?: () => void;
  isModal?: boolean;
}

const DemoFlowchart: React.FC<DemoFlowchartProps> = ({ onClose, isModal = false }) => {
  const [nodeCounter, setNodeCounter] = useState(3);

  // Initial demo nodes
  const initialNodes = [
    {
      id: '1',
      type: 'demoNode',
      position: { x: 100, y: 100 },
      data: {
        label: 'Project Kickoff',
        priority: 'high',
        id: '1',
        onDelete: () => {},
      },
    },
    {
      id: '2',
      type: 'demoNode',
      position: { x: 400, y: 100 },
      data: {
        label: 'Research & Planning',
        priority: 'high',
        id: '2',
        onDelete: () => {},
      },
    },
    {
      id: '3',
      type: 'demoNode',
      position: { x: 250, y: 250 },
      data: {
        label: 'Design Phase',
        priority: 'medium',
        id: '3',
        onDelete: () => {},
      },
    },
  ];

  const initialEdges = [
    {
      id: 'edge-1-3',
      source: '1',
      target: '3',
      animated: false,
      style: { stroke: '#667eea', strokeWidth: 2 },
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' },
    },
    {
      id: 'edge-2-3',
      source: '2',
      target: '3',
      animated: false,
      style: { stroke: '#667eea', strokeWidth: 2 },
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showHelp, setShowHelp] = useState(true);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
  }, [setNodes, setEdges]);

  // Update nodes with onDelete callback
  const updatedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onDelete: deleteNode,
      },
    }));
  }, [nodes, deleteNode]);

  // Add new node
  const addNode = useCallback(() => {
    const newId = String(nodeCounter);
    setNodeCounter((prev) => prev + 1);

    const newNode = {
      id: newId,
      type: 'demoNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `Task ${newId}`,
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        id: newId,
        onDelete: deleteNode,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodeCounter, setNodes, deleteNode]);

  // Clear all
  const clearAll = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setNodeCounter(3);
  }, [setNodes, setEdges]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        animated: false,
        style: { stroke: '#667eea', strokeWidth: 2 },
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  return (
    <div className={`demo-flowchart-container ${isModal ? 'modal-mode' : ''}`}>
      {isModal && onClose && (
        <button className="demo-close-btn" onClick={onClose}>
          ✕
        </button>
      )}

      <div className="demo-flowchart-wrapper">
        <ReactFlow
          nodes={updatedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          minZoom={0.1}
          maxZoom={2}
          deleteKeyCode={['Delete', 'Backspace']}
          connectionLineStyle={{ stroke: '#667eea', strokeWidth: 2 }}
          defaultEdgeOptions={{
            animated: false,
            style: { stroke: '#667eea', strokeWidth: 2 },
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' },
          }}
          snapToGrid={true}
          snapGrid={[15, 15]}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          multiSelectionKeyCode={'Meta'}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnDoubleClick={false}
        >
          <Background
            variant={BackgroundVariant.Lines}
            gap={20}
            size={1}
            color="#667eea"
            style={{ opacity: 0.1 }}
          />

          <Controls
            style={{
              background: 'rgba(15, 15, 30, 0.9)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
            }}
          />

          <Panel position="bottom-right">
            <div className="demo-controls">
              <button className="demo-control-btn add-btn" onClick={addNode} title="Add new task">
                ➕ Add Task
              </button>
              <button className="demo-control-btn clear-btn" onClick={clearAll} title="Reset demo">
                🔄 Reset
              </button>
            </div>
          </Panel>

          <Panel position="top-left">
            {showHelp && (
              <div className="demo-help-panel">
                <h3>🎮 Try It Out!</h3>
                <ul>
                  <li>🖱️ <strong>Drag</strong> nodes to move them</li>
                  <li>🔗 <strong>Drag from edge</strong> of a node to connect</li>
                  <li>➕ <strong>Add Task</strong> to create new nodes</li>
                  <li>🗑️ <strong>Click ✕</strong> to delete a node</li>
                  <li>⌫ <strong>Press Delete</strong> key to remove selected node</li>
                  <li>🔄 <strong>Reset</strong> to start over</li>
                  <li>🖲️ <strong>Scroll</strong> to zoom in/out</li>
                </ul>
              </div>
            )}
            <button
              className="demo-help-toggle"
              onClick={() => setShowHelp(!showHelp)}
              title="Toggle help"
            >
              {showHelp ? '✕' : '❓'}
            </button>
          </Panel>

          <Panel position="top-right">
            <div className="demo-stats-panel">
              <div className="demo-stat">
                <span className="demo-stat-value">{updatedNodes.length}</span>
                <span className="demo-stat-label">Tasks</span>
              </div>
              <div className="demo-stat">
                <span className="demo-stat-value">{edges.length}</span>
                <span className="demo-stat-label">Links</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {!isModal && (
        <div className="demo-info-banner">
          <p>💡 <strong>Demo Mode:</strong> This is a preview of our flowchart features. Your changes are not saved.</p>
        </div>
      )}
    </div>
  );
};

export default DemoFlowchart;
