import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './FlowchartView.css';

// Todo interface - same as Dashboard
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

const FlowchartView = () => {
  const navigate = useNavigate();
  
  // Help panel toggle state
  const [showHelp, setShowHelp] = useState(false);
  
  // MiniMap toggle state
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Demo todos - editable state
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Complete project documentation', completed: true, priority: 'high' },
    { id: 2, text: 'Review pull requests', completed: false, priority: 'medium' },
    { id: 3, text: 'Team meeting at 3 PM', completed: false, priority: 'high' },
    { id: 4, text: 'Update portfolio website', completed: false, priority: 'low' },
    { id: 5, text: 'Morning workout', completed: true, priority: 'medium' },
  ]);

  // Toggle todo completed status
  const toggleTodoCompleted = (todoId: number) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Convert todos to React Flow nodes
  const initialNodes: Node[] = todos.map((todo, index) => ({
    id: `todo-${todo.id}`,
    type: 'default',
    position: { x: 250, y: index * 120 }, // Vertical layout
    data: { 
      label: (
        <div className="custom-node">
          <div className={`node-header priority-${todo.priority}`}>
            <span className="node-priority">{todo.priority}</span>
            <button 
              className="node-toggle-btn"
              onClick={() => toggleTodoCompleted(todo.id)}
              title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {todo.completed ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
          </div>
          <div className="node-content">{todo.text}</div>
        </div>
      )
    },
    style: {
      background: 'transparent',
      border: 'none',
      borderRadius: '16px',
      padding: 0,
      width: 280,
    },
    // Enable connection handles on all 4 sides (top, right, bottom, left)
    sourcePosition: 'right' as any,
    targetPosition: 'left' as any,
  }));

  // Initial connections (sequential flow)
  const initialEdges: Edge[] = todos.slice(0, -1).map((todo, index) => ({
    id: `edge-${todo.id}-${todos[index + 1].id}`,
    source: `todo-${todo.id}`,
    target: `todo-${todos[index + 1].id}`,
    animated: false,
    style: { stroke: '#667eea', strokeWidth: 3 },
    type: 'smoothstep',
  }));

  // React Flow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes whenever todos change (for completed toggle)
  useEffect(() => {
    const updatedNodes = todos.map((todo, index) => ({
      id: `todo-${todo.id}`,
      type: 'default',
      position: nodes.find(n => n.id === `todo-${todo.id}`)?.position || { x: 250, y: index * 120 },
      data: { 
        label: (
          <div className="custom-node">
            <div className={`node-header priority-${todo.priority}`}>
              <span className="node-priority">{todo.priority}</span>
              <button 
                className="node-toggle-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTodoCompleted(todo.id);
                }}
                title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {todo.completed ? (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2.5"/>
                  </svg>
                )}
              </button>
            </div>
            <div className="node-content">{todo.text}</div>
          </div>
        )
      },
      style: {
        background: 'transparent',
        border: 'none',
        borderRadius: '16px',
        padding: 0,
        width: 300,
      },
      sourcePosition: 'right' as any,
      targetPosition: 'left' as any,
    }));
    setNodes(updatedNodes);
  }, [todos, setNodes]);

  // Handle new connections when user drags from one node to another
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Logout handler
  const handleLogout = () => {
    navigate('/');
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flowchart-container">
      {/* Header - same style as Dashboard */}
      <header className="flowchart-header">
        <div className="flowchart-header-content">
          <Link to="/" className="flowchart-logo">
            <span className="flowchart-logo-icon">⚡</span>
            TaskPlexus
          </Link>
          
          <div className="flowchart-header-right">
            {/* Back to Dashboard button */}
            <button onClick={handleBackToDashboard} className="back-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dashboard
            </button>

            {/* User info */}
            <div className="user-info">
              <div className="user-avatar">JD</div>
              <span className="user-name">John Doe</span>
            </div>

            {/* Logout button */}
            <button onClick={handleLogout} className="logout-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.3333 14.1667L17.5 10L13.3333 5.83334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5 10H7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Flowchart Area */}
      <main className="flowchart-main">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          minZoom={0.1}
          maxZoom={4}
          attributionPosition="bottom-left"
          deleteKeyCode={['Delete', 'Backspace']}
          connectionLineStyle={{ stroke: '#667eea', strokeWidth: 4 }}
          defaultEdgeOptions={{
            animated: false,
            style: { stroke: '#667eea', strokeWidth: 4 },
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' },
          }}
        >
          {/* Grid background with lines - visible grid pattern */}
          <Background 
            variant={BackgroundVariant.Lines} 
            gap={30} 
            size={1}
            color="#667eea"
            style={{ opacity: 0.12 }}
          />
          
          {/* Zoom and fit controls */}
          <Controls 
            style={{
              background: 'rgba(15, 15, 30, 0.8)',
              border: '1.2px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
            }}
          />
          
          {/* Mini overview map - toggleable */}
          {showMiniMap && (
            <MiniMap 
              nodeColor={(node) => '#667eea'}
              maskColor="rgba(15, 15, 30, 0.8)"
              style={{
                background: 'rgba(15, 15, 30, 0.8)',
                border: '1px solid rgba(0, 162, 255, 0.3)',
                borderRadius: '8px',
              }}
            />
          )}
          
          {/* MiniMap Toggle Button */}
          <Panel position="bottom-right">
            <button 
              className="minimap-toggle-btn"
              onClick={() => setShowMiniMap(!showMiniMap)}
              title={showMiniMap ? 'Hide Map' : 'Show Map'}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                {showMiniMap ? (
                  <path d="M3 3L17 17M17 3L3 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                ) : (
                  <path d="M2 3L7 6L13 2L18 5V17L13 14L7 18L2 15V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                )}
              </svg>
            </button>
          </Panel>

          {/* Help Toggle Button & Instructions Panel */}
          <Panel position="top-left">
            <button 
              className="help-toggle-btn"
              onClick={() => setShowHelp(!showHelp)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 14V14.5M10 6C8.89543 6 8 6.89543 8 8C8 8 8 8.5 10 8.5C12 8.5 12 9 12 10C12 11.1046 11.1046 12 10 12V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Help
            </button>
            
            {showHelp && (
              <div className="flowchart-instructions">
                <h3>📊 Todo Flowchart View</h3>
                <p>
                  <strong>• Drag</strong> nodes to move  <pre></pre>
                  <strong>• Scroll</strong> to zoom <pre></pre>
                  <strong>• Connect</strong> by dragging from edge<pre></pre>
                  <strong>• Delete:</strong> Select node/edge and press
                </p>
                <p className="delete-instructions">
                   <kbd>Delete</kbd> or <kbd>Backspace</kbd>
                </p>
              </div>
            )}
          </Panel>
        </ReactFlow>
      </main>

      {/* Animated background - same as Dashboard */}
      <div className="flowchart-background">
        <div className="flowchart-blob flowchart-blob-1"></div>
        <div className="flowchart-blob flowchart-blob-2"></div>
        <div className="flowchart-blob flowchart-blob-3"></div>
      </div>
    </div>
  );
};

export default FlowchartView;
