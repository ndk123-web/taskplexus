import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
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
import '../styles/pages/FlowchartViewNew.css';
import useWorkspaceStore, { type Todo, type FlowNode, type FlowEdge } from '../store/useWorkspaceStore';
import useUserStore from '../store/useUserInfo';
import updateWorkspaceLayoutApi from '../api/endpoints/updateWorkspaceLayoutApi';
// import { addPendingOperation } from '../store/indexDB/pendingOps/usePendingOps';
// import useRunBackgroundOps from '../hooks/useRunBackgroundOps';
import pendingOps from '../hooks/useRunBackgroundOps';
import SEO from '../components/SEO';

// Custom Node Component with better styling
const CustomTodoNode = ({ data }: { data: any }) => {
  const { todo, onToggle } = data;
  
  return (
    <div className={`todo-node ${todo.completed ? 'completed' : ''} priority-${todo.priority}`}>
      {/* Connection Handles - Top, Right, Bottom, Left */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="handle handle-top"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="handle handle-right"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="handle handle-bottom"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="handle handle-left"
      />
      
      <div className="todo-node-header">
        <button 
          className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(todo.id);
          }}
          title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed && <span className="checkmark">✓</span>}
        </button>
        <span className={`priority-badge priority-${todo.priority}`}>
          {todo.priority.toUpperCase()}
        </span>
      </div>
      <div className="todo-content">
        <span className={todo.completed ? 'completed-text' : ''}>{todo.text}</span>
      </div>
    </div>
  );
};

// Node types for ReactFlow
const nodeTypes = {
  todoNode: CustomTodoNode,
};

const FlowchartViewNew: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentWorkspace, 
    updateNodes, 
    updateEdges, 
    setCurrentWorkspace, 
    setWorkspace, 
    workspaces 
  } = useWorkspaceStore();
  
  // Run background operations every 10 seconds like in dashboard
//   useRunBackgroundOps();
  
  // UI State
  const [showHelp, setShowHelp] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  
  // Sync todos from workspace and ensure reactivity
  const [todos, setTodos] = useState<Todo[]>(currentWorkspace?.todos || []);
  
  // Sync todos when currentWorkspace changes
  useEffect(() => {
    if (currentWorkspace?.todos) {
      setTodos(currentWorkspace.todos);
      console.log('🔄 Synced todos from workspace:', currentWorkspace.todos.length);
    }
  }, [currentWorkspace?.todos]);

   useEffect(() => {
    const runPendingOps = async () => {
      await pendingOps();
      console.log("Running pending operations...");
    }

    // this will run every 10 seconds
    const id = setInterval(runPendingOps,10000)

    // this will run when the app comes online
    window.addEventListener("online",runPendingOps)

    // debug log for the useEffect
    console.log("Running UseEffect for pending ops");

    // useEffect returns a cleanup function 
    // if the component unmounts we need to cleanup the event listener and interval
    // if i dont clean them then they will keep running in background causing memory leaks
    return () => {
      window.removeEventListener("online",runPendingOps)
      clearInterval(id);
    }

  },[]);

  // Debounced save functions to prevent lag during drag operations
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const edgeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs to store current state to avoid stale closures
  const currentNodesRef = useRef<any[]>([]);
  const currentEdgesRef = useRef<any[]>([]);
  
  // We'll define these after nodes/edges are available
  const debouncedSaveNodes = useRef<((workspaceId: string, flowNodes: FlowNode[]) => void) | null>(null);
  const debouncedSaveEdges = useRef<((workspaceId: string, flowEdges: FlowEdge[]) => void) | null>(null);

  // Toggle todo completion with proper state updates
  const toggleTodoCompleted = useCallback(async (todoId: string) => {
    if (!currentWorkspace) return;

    // Update local todos state immediately
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    );

    // // Update workspace store - both currentWorkspace and workspaces array
    // const updatedTodos = currentWork``space.todos.map(todo =>
    //   todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    // );

    // // Update current workspace
    // setCurrentWorkspace({
    //   ...currentWorkspace,
    //   todos: updatedTodos,
    // });

    // // Update workspaces array
    // const updatedWorkspaces = workspaces.map(ws =>
    //   ws.id === currentWorkspace.id ? { ...ws, todos: updatedTodos } : ws
    // );
    // setWorkspace(updatedWorkspaces);

    // Get the current todo to determine toggle direction
    const toBeToggle = currentWorkspace.todos.find(t => t.id === todoId);
    if (!toBeToggle) {
      console.error("Todo not found");
      return;
    }

    // Get userId from user store
    const userId = useUserStore.getState().userInfo?.userId;
    if (!userId) {
      console.error("User not logged in");
      return;
    }

    // Determine toggle direction based on current state
    const toggleValue = toBeToggle.completed ? "not-started" : "completed";

    // Call the store's toggleTodoCompleted function with correct parameters
    await useWorkspaceStore.getState().toggleTodoCompleted(toggleValue, todoId, userId);
    
    console.log('✅ Todo toggled through store:', todoId);

  }, [currentWorkspace, workspaces, setCurrentWorkspace, setWorkspace]);

  // Initialize nodes and edges from workspace
  const initializeFlow = useCallback(() => {
    if (!currentWorkspace) {
      return { nodes: [], edges: [] };
    }
    
    const storedNodes = currentWorkspace.initialNodes || [];
    const storedEdges = currentWorkspace.initialEdges || [];
    const currentTodos = currentWorkspace.todos || [];
    
    console.log('🔍 InitializeFlow Debug:');
    console.log('- Workspace ID:', currentWorkspace.id);
    console.log('- Stored nodes count:', storedNodes.length);
    console.log('- Stored edges count:', storedEdges.length);
    console.log('- Current todos count:', currentTodos.length);
    console.log('- Stored nodes:', storedNodes);
    console.log('- Stored edges:', storedEdges);
    
    // Create nodes from current todos, preserving positions from stored nodes
    const newNodes = currentTodos.map((todo, index) => {
      const existingNode = storedNodes.find(n => n.id === todo.id);
      
      return {
        id: todo.id,
        type: 'todoNode',
        position: existingNode?.position || { x: 50 + (index % 3) * 350, y: 50 + Math.floor(index / 3) * 200 },
        data: { 
          todo,
          onToggle: toggleTodoCompleted,
        },
        dragHandle: '.todo-node',
      };
    });
    
    // Filter edges to only include those with valid source and target nodes
    const validEdges = storedEdges.filter(edge => 
      newNodes.some(node => node.id === edge.source) && 
      newNodes.some(node => node.id === edge.target)
    );
    
    console.log('- New nodes created:', newNodes.length);
    console.log('- Valid edges filtered:', validEdges.length);
    
    return {
      nodes: newNodes,
      edges: validEdges,
    };
  }, [currentWorkspace?.id, toggleTodoCompleted]);

  // Initialize flow state
  const { nodes: initialNodes, edges: initialEdges } = initializeFlow();
  
  // ReactFlow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update refs whenever nodes/edges change
  useEffect(() => {
    currentNodesRef.current = nodes;
  }, [nodes]);
  
  useEffect(() => {
    currentEdgesRef.current = edges;
  }, [edges]);

  // Initialize debounced functions after nodes/edges are available
  debouncedSaveNodes.current = useCallback((workspaceId: string, flowNodes: FlowNode[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      // Update IndexedDB first
      updateNodes(workspaceId, flowNodes);
      console.log('💾 Nodes saved to IndexedDB:', workspaceId, 'Count:', flowNodes.length);
      
      // Sync with backend - Use ref to get fresh edges
      try {
        const currentEdges = currentEdgesRef.current.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          animated: edge.animated || false,
          style: edge.style,
          type: edge.type,
        }));
        
        await updateWorkspaceLayoutApi({
          workspaceId,
          initialNodes: flowNodes,
          initialEdges: currentEdges
        });
        console.log('🌐 Nodes+Edges layout synced to backend successfully');
      } catch (error) {
        console.error('❌ Failed to sync layout to backend:', error);
      }
    }, 500);
  }, [updateNodes]);
  
  debouncedSaveEdges.current = useCallback((workspaceId: string, flowEdges: FlowEdge[]) => {
    if (edgeTimeoutRef.current) {
      clearTimeout(edgeTimeoutRef.current);
    }
    
    edgeTimeoutRef.current = setTimeout(async () => {
      // Update IndexedDB first
      updateEdges(workspaceId, flowEdges);
      console.log('🔗 Edges saved to IndexedDB:', workspaceId, 'Count:', flowEdges.length);
      
      // Sync with backend - Use ref to get fresh nodes
      try {
        const currentNodes = currentNodesRef.current.map((node: any) => ({
          id: node.id,
          type: node.type || 'todoNode',
          position: node.position,
          data: {
            todo: todos.find(t => t.id === node.id)
          },
        }));
        
        await updateWorkspaceLayoutApi({
          workspaceId,
          initialNodes: currentNodes,
          initialEdges: flowEdges
        });
        console.log('🌐 Edges+Nodes layout synced to backend successfully');
      } catch (error) {
        console.error('❌ Failed to sync layout to backend:', error);
      }
    }, 200);
  }, [updateEdges, todos]);

  // Only re-initialize when workspace ID actually changes (not on every render)
  const prevWorkspaceIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (currentWorkspace?.id && currentWorkspace.id !== prevWorkspaceIdRef.current) {
      prevWorkspaceIdRef.current = currentWorkspace.id;
      const { nodes: newNodes, edges: newEdges } = initializeFlow();
      setNodes(newNodes);
      setEdges(newEdges);
      console.log('🔄 Re-initialized flow for workspace:', currentWorkspace.id);
      console.log('📊 Initialized with nodes:', newNodes.length, 'edges:', newEdges.length);
      console.log('🔗 Edges:', newEdges);
    }
  }, [currentWorkspace?.id]);

  // Memoize flow nodes creation to prevent unnecessary recalculations
  const memoizedFlowNodes = useMemo(() => {
    return nodes.map(node => ({
      id: node.id,
      type: node.type || 'todoNode',
      position: node.position,
      data: {
        todo: todos.find(t => t.id === node.id)
      },
    }));
  }, [nodes, todos]);

  // Optimized auto-save nodes with debouncing
  useEffect(() => {
    if (currentWorkspace && nodes.length > 0 && debouncedSaveNodes.current) {
      debouncedSaveNodes.current(currentWorkspace.id, memoizedFlowNodes);
    }
    
    // Cleanup timeout on unmount or workspace change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentWorkspace?.id, memoizedFlowNodes, debouncedSaveNodes]);

  // Optimized auto-save edges with debouncing
  useEffect(() => {
    if (currentWorkspace && edges.length >= 0 && debouncedSaveEdges.current) { // Allow empty edges array
      const flowEdges: FlowEdge[] = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated || false,
        style: edge.style,
        type: edge.type,
      }));
      
      debouncedSaveEdges.current(currentWorkspace.id, flowEdges);
    }
    
    // Cleanup timeout on unmount or workspace change
    return () => {
      if (edgeTimeoutRef.current) {
        clearTimeout(edgeTimeoutRef.current);
      }
    };
  }, [currentWorkspace?.id, edges, debouncedSaveEdges]);

  // Optimized node data updates with minimal re-renders
  useEffect(() => {
    let hasChanges = false;
    
    setNodes(currentNodes => {
      const updatedNodes = currentNodes.map(node => {
        const todo = todos.find(t => t.id === node.id);
        if (!todo) return node;
        
        const currentTodo = node.data.todo;
        
        // Check if todo data actually changed
        if (
          currentTodo.completed !== todo.completed ||
          currentTodo.text !== todo.text ||
          currentTodo.priority !== todo.priority
        ) {
          hasChanges = true;
          return {
            ...node,
            data: {
              ...node.data,
              todo,
            }
          };
        }
        
        return node;
      });
      
      return hasChanges ? updatedNodes : currentNodes;
    });
  }, [todos, setNodes]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        animated: false,
        style: { stroke: '#667eea', strokeWidth: 3 },
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' },
      };
      setEdges(eds => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Navigation handlers
  const handleLogout = () => {
    useUserStore.getState().signOutUser();
    useWorkspaceStore.persist.clearStorage();
    navigate('/signin');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flowchart-container">
      <SEO 
        title="Flowchart View" 
        description="Visualize your tasks and dependencies in an interactive flowchart view."
      />
      {/* Header */}
      <header className="flowchart-header">
        <div className="flowchart-header-content">
          <div className="flowchart-header-left">
            <Link to="/" className="flowchart-logo">
              <img src="/TaskPlexus.png" alt="TaskPlexus" width={40} />
              <span style={{ marginLeft: '10px' }}>TaskPlexus</span>
            </Link>
            
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
            <button onClick={handleBackToDashboard} className="back-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dashboard
            </button>

            <div className="user-info">
                          <div className="user-profile-avatar" style={{
              background: useUserStore.getState().userInfo?.plan === 'PRO_MONTHLY' 
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: useUserStore.getState().userInfo?.plan === 'PRO_MONTHLY' ? '#000' : '#fff',
              boxShadow: useUserStore.getState().userInfo?.plan === 'PRO_MONTHLY' ? '0 0 15px rgba(255, 215, 0, 0.4)' : 'none',
              fontWeight: '800',
              fontSize: useUserStore.getState().userInfo?.plan === 'PRO_MONTHLY' ? '12px' : '14px',
              border: useUserStore.getState().userInfo?.plan === 'PRO_MONTHLY' ? '2px solid rgba(255,255,255,0.5)' : 'none'
            }}>
              {useUserStore.getState().userInfo?.plan === 'PRO_MONTHLY' ? 'PRO' : (useUserStore.getState().userInfo?.fullName?.charAt(0).toUpperCase() || 'U')}
            </div>
              <span className="user-name">{useUserStore.getState().userInfo?.fullName}</span>
            </div>

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
          key={currentWorkspace?.id} // Force re-render when workspace changes
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          minZoom={0.2}
          maxZoom={2}
          attributionPosition="bottom-left"
          deleteKeyCode={['Delete', 'Backspace']}
          connectionLineStyle={{ stroke: '#667eea', strokeWidth: 3 }}
          defaultEdgeOptions={{
            animated: false,
            style: { stroke: '#667eea', strokeWidth: 3 },
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
          
          {showMiniMap && (
            <MiniMap 
              nodeColor={(node) => {
                const todo = todos.find(t => t.id === node.id);
                if (todo?.completed) return '#22c55e';
                if (todo?.priority === 'high') return '#ef4444';
                if (todo?.priority === 'medium') return '#f59e0b';
                return '#667eea';
              }}
              maskColor="rgba(15, 15, 30, 0.8)"
              style={{
                background: 'rgba(15, 15, 30, 0.9)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '8px',
              }}
            />
          )}
          
          <Panel position="bottom-right">
            <button 
              className="panel-btn"
              onClick={() => setShowMiniMap(!showMiniMap)}
              title={showMiniMap ? 'Hide Map' : 'Show Map'}
            >
              {showMiniMap ? '📍' : '🗺️'}
            </button>
          </Panel>

          <Panel position="top-left">
            <button 
              className="panel-btn"
              onClick={() => setShowHelp(!showHelp)}
              title="Toggle Help"
            >
              ❓
            </button>
            
            {showHelp && (
              <div className="help-panel">
                <h3>🔗 Flowchart Controls</h3>
                <ul>
                  <li><strong>Drag</strong> nodes to reposition</li>
                  <li><strong>Scroll</strong> to zoom in/out</li>
                  <li><strong>Connect</strong> by dragging from node edges</li>
                  <li><strong>Delete:</strong> Select and press <kbd>Delete</kbd></li>
                  <li><strong>Click checkbox</strong> to toggle completion</li>
                </ul>
              </div>
            )}
          </Panel>

          <Panel position="top-right">
            <div className="stats-panel">
              <div className="stat">
                <span className="stat-value">{todos.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat">
                <span className="stat-value">{todos.filter(t => t.completed).length}</span>
                <span className="stat-label">Done</span>
              </div>
              <div className="stat">
                <span className="stat-value">{edges.length}</span>
                <span className="stat-label">Links</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </main>

      {/* Animated background */}
      <div className="flowchart-background">
        <div className="flowchart-blob flowchart-blob-1"></div>
        <div className="flowchart-blob flowchart-blob-2"></div>
        <div className="flowchart-blob flowchart-blob-3"></div>
      </div>
    </div>
  );
};

export default FlowchartViewNew;