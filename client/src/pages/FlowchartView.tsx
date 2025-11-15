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
import useWorkspaceStore from '../store/useWorkspaceStore';
import { userInfo } from 'os';
import useUserStore from '../store/useUserInfo';

// Todo interface - same as Dashboard
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

const FlowchartView = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaceStore();
  
  // Initialize default workspace on mount
  // useEffect(() => {
  //   initializeDefaultWorkspace();
  // }, [initializeDefaultWorkspace]);
  
  // Help panel toggle state
  const [showHelp, setShowHelp] = useState(false);
  
  // MiniMap toggle state
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Demo todos - editable state
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Complete project documentation', completed: true, priority: 'high' },
    { id: 2, text: 'Review pull requests', completed: false, priority: 'medium' },
    { id: 3, text: 'Team meeting at 3 PM', completed: false, priority: 'high' },
    { id: 4, text: 'Update portfolio website anda', completed: false, priority: 'low' },
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
        <div className={`custom-node ${todo.completed ? 'completed' : ''}`}>
          <div className="node-main">
            <button 
              className="node-checkbox"
              onClick={() => toggleTodoCompleted(todo.id)}
              title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {todo.completed && <span>✓</span>}
            </button>
            <div className="node-content">{todo.text}</div>
          </div>
          <span className={`node-priority priority-${todo.priority}`}>
            {todo.priority}
          </span>
        </div>
      )
    },
    style: {
      background: 'rgba(255, 255, 255, 0.04)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '18px 20px',
      width: 320,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
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
          <div className={`custom-node ${todo.completed ? 'completed' : ''}`}>
            <div className="node-main">
              <button 
                className="node-checkbox"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTodoCompleted(todo.id);
                }}
                title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {todo.completed && <span>✓</span>}
              </button>
              <div className="node-content">{todo.text}</div>
            </div>
            <span className={`node-priority priority-${todo.priority}`}>
              {todo.priority}
            </span>
          </div>
        )
      },
      style: {
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '18px 20px',
        width: 320,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      },
      sourcePosition: 'right' as any,
      targetPosition: 'left' as any,
    }));
    setNodes(updatedNodes);

    // for debugging 
    console.log("Debug Nodes: ", nodes);
    console.log("Debug Edges: ", edges)
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
          <div className="flowchart-header-left">
            <Link to="/" className="flowchart-logo">
              <img src="/TaskPlexus.png" alt="TaskPlexus" width={40} />
              <span style={{ marginLeft: '10px' }}>TaskPlexus</span>
            </Link>
            
            {/* Current Workspace Display */}
            <div className="flowchart-workspace-display">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2.25 5.25C2.25 4.83579 2.41462 4.43855 2.70765 4.14549C3.00067 3.85243 3.39782 3.6875 3.8125 3.6875H6.75L8.25 6H14.1875C14.6022 6 14.9994 6.16462 15.2924 6.45765C15.5855 6.75067 15.75 7.14782 15.75 7.5625V12.75C15.75 13.1647 15.5855 13.5619 15.2924 13.8549C14.9994 14.148 14.6022 14.3125 14.1875 14.3125H3.8125C3.39782 14.3125 3.00067 14.148 2.70765 13.8549C2.41462 13.5619 2.25 13.1647 2.25 12.75V5.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="flowchart-workspace-info">
                <span className="flowchart-workspace-label">Workspace</span>
                <span className="flowchart-workspace-name">{currentWorkspace?.name || 'Personal'}</span>
              </div>
            </div>
          </div>
          
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
              <div className="user-avatar">✨</div>
              <span className="user-name">{useUserStore.getState().userInfo?.fullName}</span>
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
              nodeColor={() => '#667eea'}
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
