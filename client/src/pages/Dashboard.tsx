import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useUserStore from '../store/useUserInfo';
import useWorkspaceStore , {type Workspace} from '../store/useWorkspaceStore';
import TrelloLogo from '../components/TrelloLogo';
import pendingOps from '../hooks/useRunBackgroundOps';
import './Dashboard.css';
import getUserWorkspaceApi from '../api/getUserWorkspaceApi';
import type { CreateTaskReq } from '../types/createTaskType';
import type { Todo } from '../store/useWorkspaceStore';
import createWorkspaceAPI from '../api/createWorkspaceApi';
import getAnalyticsApi from '../api/analyticsApi';
import { addPendingOperation, clearPendingOperations, getPendingOperations } from '../store/indexDB/pendingOps/usePendingOps';
import { useToast } from '../components/ToastProvider';

// Goal interface - defines structure for goal items
// Align Goal interface with store (id not _id)
interface Goal {
  id: string;
  title: string;
  target?: string; // original string (optional for UI)
  targetDays?: number;
  currentTarget?: number;
  category: string;
  status?: string;
  createdAt?: Date;
}


const Dashboard = () => {

  const navigate = useNavigate();
  const {userInfo, signOutUser} = useUserStore();
  const { workspaces, currentWorkspace, addWorkspace, editWorkspace, deleteWorkspace, setCurrentWorkspace, addTodo, toggleTodoCompleted, deleteTodo: storeDeleteTodo, updateTodo, addGoal } = useWorkspaceStore();
  // Flag to avoid re-hydration logic firing during logout (prevents default workspace recreation)
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Wait for hydration from IndexedDB
  const [isHydrated, setIsHydrated] = useState(false);
  const [workspacesFetched, setWorkspacesFetched] = useState(false);
  
  // Function to normalize malformed MongoDB Key-Value data
  const normalizeMongoData = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data) && data.length > 0) {
      // Check if it's malformed MongoDB format
      if (data[0] && typeof data[0] === 'object' && 'Key' in data[0] && 'Value' in data[0]) {
        // This is malformed MongoDB data, convert it
        return data.map((item: any) => {
          if (Array.isArray(item)) {
            // Handle array of Key-Value pairs
            const obj: any = {};
            item.forEach((kv: any) => {
              if (kv.Key && kv.Value !== undefined) {
                if (kv.Key === 'position' && Array.isArray(kv.Value)) {
                  // Special handling for position
                  const posObj: any = {};
                  kv.Value.forEach((pos: any) => {
                    if (pos.Key) posObj[pos.Key] = pos.Value;
                  });
                  obj[kv.Key] = posObj;
                } else if (kv.Key === 'data' && Array.isArray(kv.Value)) {
                  // Special handling for data
                  const dataObj: any = {};
                  kv.Value.forEach((dataItem: any) => {
                    if (dataItem.Key === 'todo' && Array.isArray(dataItem.Value)) {
                      const todoObj: any = {};
                      dataItem.Value.forEach((todoField: any) => {
                        if (todoField.Key) todoObj[todoField.Key] = todoField.Value;
                      });
                      dataObj[dataItem.Key] = todoObj;
                    } else if (dataItem.Key) {
                      dataObj[dataItem.Key] = dataItem.Value;
                    }
                  });
                  obj[kv.Key] = dataObj;
                } else if (kv.Key === 'style' && Array.isArray(kv.Value)) {
                  // Special handling for style
                  const styleObj: any = {};
                  kv.Value.forEach((style: any) => {
                    if (style.Key) styleObj[style.Key] = style.Value;
                  });
                  obj[kv.Key] = styleObj;
                } else {
                  obj[kv.Key] = kv.Value;
                }
              }
            });
            return obj;
          }
          return item;
        });
      }
    }
    return data;
  };
  
  // Fetch workspaces from server
  const fetchWorkspacesFromServer = async () => {
    try {
      const userId: any = userInfo?.userId;
      if (!userId) {
        console.error("User ID not found");
        return [];
      }

      const response: any = await getUserWorkspaceApi(userId);
      console.log("Fetched Workspaces from Server:", response);
      
      // Extract the response array from the response object
      const workspacesArray = response;

      if (workspacesArray === null || !workspacesArray){
        console.log("Workspaces array is null or undefined");
        return [];
      }

      const formattedWorkspaces = workspacesArray?.map((ws: any) => ({
        id: ws._id,
        name: ws.worskpaceName || ws.workspaceName, // Backend has typo: worskpaceName
        status: "SUCCESS",
        isDefault: (ws.worskpaceName || ws.workspaceName) === "Default",
        createdAt: new Date(ws.createdAt || Date.now()),
        todos: (ws.todos || []).map((t: any) => ({
          id: t._id,
          text: t.task,
          completed: t.done,
          priority: t.priority || 'medium',
          status: t.done ? 'completed' : 'not-started',
          workspaceId: ws._id,
          createdAt: t.createdAt ? new Date(t.createdAt) : undefined
        })),
        // Normalize server goals to have 'id'
        goals: (ws.goals || []).map((g: any) => {
          const rawTarget = g.targetDays ?? g.target ?? 0;
            const numericTarget = typeof rawTarget === 'number' ? rawTarget : parseInt(rawTarget, 10);
            const safeTargetDays = isNaN(numericTarget) || numericTarget <= 0 ? 1 : numericTarget;
            return {
              id: g._id,
              title: g.goalName || g.title || '',
              category: g.category || '',
              target: rawTarget?.toString?.() || safeTargetDays.toString(),
              targetDays: safeTargetDays,
              currentTarget: typeof g.currentTarget === 'number' ? g.currentTarget : 0,
              status: 'SUCCESS',
              createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
            } as Goal;
        }),
        initialNodes: (() => {
          const normalized = normalizeMongoData(ws.initialNodes);
          console.log(`🔄 Normalized nodes for workspace ${ws._id}:`, normalized);
          return normalized || [];
        })(),
        initialEdges: (() => {
          const normalized = normalizeMongoData(ws.initialEdges);
          console.log(`🔗 Normalized edges for workspace ${ws._id}:`, normalized);
          return normalized || [];
        })()
      }));

      return formattedWorkspaces;
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      return [];
    }
  };

  useEffect(() => {
    const mergeWorkspaces = (
      serverWorkspaces: any[],
      clientWorkspaces: any[]
    ) => {
      const serverById = new Map(serverWorkspaces.map((w) => [w.id, w]));
      const merged: any[] = [];

      // Start with server workspaces and merge client data into them
      for (const sw of serverWorkspaces) {

        // Try to find by ID first, then by name if it's a temp workspace
        let cw = clientWorkspaces.find((w) => w.id === sw.id);
        
        // If not found by ID, try matching by name for temp client workspaces (like temp IDs on creation)
        if (!cw) {
          cw = clientWorkspaces.find(w => w.name === sw.name && w.id.startsWith('workspace_'));
        }

        // if still not then client dont have this workspace so just push server workspace after date conversion
        if (!cw) {
          // Ensure createdAt and nested dates are Date objects
          merged.push({
            ...sw,
            createdAt: sw.createdAt ? new Date(sw.createdAt) : new Date(),
            todos: (sw.todos || []).map((t: any) => ({
              ...t,
              createdAt: t?.createdAt ? new Date(t.createdAt) : undefined,
            })),
            goals: (sw.goals || []).map((g: any) => ({
              ...g,
              createdAt: g?.createdAt ? new Date(g.createdAt) : undefined,
            })),
          });
          continue;
        }

        // Merge todos by id; keep client-only todos (e.g., PENDING with temp id)
        const serverTodos = sw.todos || [];       // all server todos that server knows about
        const serverTodoIds = new Set(serverTodos.map((t: any) => t.id)); // all server todo ids for faster lookpup 
        const clientOnlyTodos = (cw.todos || []).filter((t: any) => !serverTodoIds.has(t.id)); // todos that server does not know about
       
        // Now merge , here we convert createdAt to Date objects
        // dont confuse ... just converting [] of todos to object with date conversion 
        // in last we get array of todo objects with date conversion 
        const mergedTodos = [
          ...serverTodos.map((t: any) => ({
            ...t,
            createdAt: t?.createdAt ? new Date(t.createdAt) : undefined,
          })),
          ...clientOnlyTodos.map((t: any) => ({
            ...t,
            createdAt: t?.createdAt ? new Date(t.createdAt) : t.createdAt,
          })),
        ];

        // Merge goals (normalize id) and avoid duplicates
        const serverGoals = (sw.goals || []).map((g: any) => ({
          ...g,
          id: g.id || g._id, // ensure id
          createdAt: g?.createdAt ? new Date(g.createdAt) : undefined,
        }));
        const serverGoalIds = new Set(serverGoals.map((g: any) => g.id));
        const clientGoals = (cw.goals || []).map((g: any) => ({
          ...g,
          id: g.id || g._id, // normalize
        }));
        const clientOnlyGoals = clientGoals.filter((g: any) => !serverGoalIds.has(g.id));
        const mergedGoals = [...serverGoals, ...clientOnlyGoals];
        console.log("Merged Goals (deduped): ", mergedGoals);

        merged.push({
          ...sw,
          createdAt: sw.createdAt ? new Date(sw.createdAt) : cw.createdAt,
          todos: mergedTodos,
          goals: mergedGoals,
          initialNodes: sw.initialNodes || cw.initialNodes || [],
          initialEdges: sw.initialEdges || cw.initialEdges || [],
          status: sw.status || cw.status || "SUCCESS",
          isDefault: sw.isDefault ?? cw.isDefault,
        });

        // console.log("Total Merged: ",merged)
      }

      // Append client-only workspaces (e.g., offline-created with temp id)
      for (const cw of clientWorkspaces) {
        if (!serverById.has(cw.id)) {
          // Prevent duplicates: if we already have a workspace with this name (merged from server), skip it
          if (merged.some(mw => mw.name === cw.name)) continue;
          merged.push(cw);
        }
      }

      console.log("Total Merged: ",merged)

      // set updated currentWorkspace and workspaces array in store here if needed
      useWorkspaceStore.getState().setWorkspace(merged);

      return merged;
    };

    // const initializeWorkspaces = async () => {
    //   // Wait for hydration first
    //   const unsubHydrate = useWorkspaceStore.persist.onFinishHydration(async () => {
    //     setIsHydrated(true);
        
    //     // After hydration, fetch workspaces from server
    //     const serverWorkspaces = await fetchWorkspacesFromServer();
        
    //     if (serverWorkspaces.length > 0) {
    //       const clientWorkspaces = useWorkspaceStore.getState().workspaces || [];
    //       const merged = mergeWorkspaces(serverWorkspaces, clientWorkspaces);
    //       console.log("Merging server + client workspaces (on hydrate):", merged);
    //       useWorkspaceStore.getState().setWorkspace(merged);

    //       // Preserve current selection if possible
    //       const prevCurrent = useWorkspaceStore.getState().currentWorkspace;
    //       if (prevCurrent) {
    //         const next = merged.find((w) => w.id === prevCurrent.id) || merged[0];
    //         if (next) useWorkspaceStore.getState().setCurrentWorkspace(next);
    //       }
    //     } else {
    //       console.log("No server workspaces, initializing default (on hydrate)");
    //       await initializeDefaultWorkspace();
    //     }

    //     setWorkspacesFetched(true);
    //   });
      
    //   // If already hydrated, run immediately
    //   if (useWorkspaceStore.persist.hasHydrated()) {
    //     setIsHydrated(true);
        
    //     const serverWorkspaces = await fetchWorkspacesFromServer();
        
    //     if (serverWorkspaces.length > 0) {
    //       const clientWorkspaces = useWorkspaceStore.getState().workspaces || [];
    //       const merged = mergeWorkspaces(serverWorkspaces, clientWorkspaces);
    //       console.log("Merging server + client workspaces (already hydrated):", merged);
    //       useWorkspaceStore.getState().setWorkspace(merged);

    //       const prevCurrent = useWorkspaceStore.getState().currentWorkspace;
    //       const defaultWs = merged.find((ws: any) => ws.isDefault);
    //       const next = prevCurrent
    //         ? merged.find((w) => w.id === prevCurrent.id) || defaultWs || merged[0]
    //         : defaultWs || merged[0];
    //       if (next) useWorkspaceStore.getState().setCurrentWorkspace(next);
    //     } else {
    //       console.log("No server workspaces, initializing default (already hydrated)");
    //       await initializeDefaultWorkspace();
    //     }
        
    //     setWorkspacesFetched(true);
    //   }
      
    //   return () => unsubHydrate();
    // };

    const initializeWorkspaces = async () => {
  // Skip initialization if logging out or no user
  if (isLoggingOut || !userInfo?.userId) {
    return;
  }
  // 1. Hydration wait kare -> then run
  if (!useWorkspaceStore.persist.hasHydrated()) {
    await new Promise<void>((resolve) => {
      const unsub = useWorkspaceStore.persist.onFinishHydration(() => {
        unsub();
        resolve();
      });
    });
  }

  // 2. Mark hydrated
  setIsHydrated(true);

  // 3. Fetch from server
  let serverWorkspaces = await fetchWorkspacesFromServer();
  // Filter out server workspaces queued for delete in pending ops (avoid reappearing after refresh)
  try {
    const ops = await getPendingOperations();
    const toDeleteByName = new Set(
      ops
        .filter((op: any) => op.type === 'DELETE_WORKSPACE' && op.payload?.workspaceName)
        .map((op: any) => op.payload.workspaceName)
    );
    if (toDeleteByName.size > 0) {
      serverWorkspaces = serverWorkspaces.filter((sw: any) => !toDeleteByName.has(sw.name));
    }
  } catch (e) {
    console.warn('Pending ops check failed; proceeding without delete filter:', e);
  }
  const state = useWorkspaceStore.getState();

  if (serverWorkspaces.length > 0) {
    // Server pe workspaces exist karte hain, directly use karo
    const clientWorkspaces = state.workspaces || [];
    const merged = mergeWorkspaces(serverWorkspaces, clientWorkspaces);

    console.log("✅ Server workspaces found, using them:", merged);
    state.setWorkspace(merged);

    // Restore selection OR default
    const prev = state.currentWorkspace;
    const fallback =
      merged.find((w) => w.id === prev?.id) ||
      merged.find((w) => w.isDefault) ||
      merged[0];

    if (fallback) state.setCurrentWorkspace(fallback);
  } else {
    // Only create default workspace if server pe kuch bhi nahi hai
    console.log("⚠️ No server workspaces, creating default...");
    
    // Check if we already have a default workspace locally to avoid overwriting/duplicating
    const existingDefault = state.workspaces.find(w => w.name === "Default");
    if (existingDefault) {
       console.log("✅ Found existing local default workspace, using it.");
       state.setCurrentWorkspace(existingDefault);
       setWorkspacesFetched(true);
       return;
    }

    const defaultWorkspace: Workspace = {
      id: `workspace_${Date.now()}`, // Temporary ID
      name: "Default",
      createdAt: new Date(),
      isDefault: true,
      todos: [],
      goals: [],
      initialNodes: [],
      initialEdges: [],
      status: "PENDING",
    };

    state.setWorkspace([defaultWorkspace]);
    state.setCurrentWorkspace(defaultWorkspace);

    try {
      // Direct API call because background ops not running yet
      const response: any = await createWorkspaceAPI({
        userId: userInfo?.userId || '',
        workspaceName: 'Default',
      });

      if (response?.response?.success === "true") {
        // Update with server ID
        const serverWorkspaceId = response.response.workspaceId;
        const updatedWorkspace = {
          ...defaultWorkspace,
          id: serverWorkspaceId,
          status: "SUCCESS",
        };

        state.setWorkspace([updatedWorkspace]);
        state.setCurrentWorkspace(updatedWorkspace);
        console.log("✅ Default workspace created on server:", serverWorkspaceId);
      } else {
        throw new Error("Server returned non-success");
      }
    } catch (error) {
      console.error("❌ Error creating default workspace, queuing for background:", error);
      
      // Add to pending operations
      // await addPendingOperation({
      //   id: `create_workspace_${defaultWorkspace.id}`,
      //   type: "CREATE_WORKSPACE",
      //   status: "PENDING",
      //   payload: {
      //     workspaceName: 'Default',
      //     userId: userInfo?.userId || '',
      //     tempId: defaultWorkspace.id,
      //   },
      //   timestamp: Date.now(),
      //   retryCount: 0,
      // });
    }
  }

  setWorkspacesFetched(true);
};


    initializeWorkspaces();

    // // removing extra default workspace 
    // const isExistingDefault = workspaces.find((ws) => ws.isDefault);
    // if (isExistingDefault && workspaces.length > 1) {;
    //   const extraDefaults = workspaces.filter((ws) =>  ws.isDefault && ws.id.startsWith('workspace_'));
    //   extraDefaults.forEach((ws) => deleteWorkspace(ws.id));
    // }

  }, [userInfo?.userId]);

  // Sync Means at some time of iterations we need to run pending operations
  // now for this for 10 seconds the operations will run in background
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

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Workspace states
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState('');
  
  // Demo todos with different priorities and statuses
  // const [todos, setTodos] = useState<Todo[]>([
  //   // { id: 1, text: 'Complete project documentation', completed: true, priority: 'high', status: 'completed', createdAt: new Date(2025, 10, 5) },
  //   // { id: 2, text: 'Review pull requests', completed: false, priority: 'medium', status: 'in-progress', createdAt: new Date(2025, 10, 6) },
  //   // { id: 3, text: 'Team meeting at 3 PM', completed: false, priority: 'high', status: 'not-started', createdAt: new Date(2025, 10, 7) },
  //   // { id: 4, text: 'Update portfolio website', completed: false, priority: 'low', status: 'not-started', createdAt: new Date(2025, 10, 4) },
  //   // { id: 5, text: 'Morning workout', completed: true, priority: 'medium', status: 'completed', createdAt: new Date(2025, 10, 6) },
  //   // { id: 6, text: 'Code review for feature branch', completed: false, priority: 'high', status: 'in-progress', createdAt: new Date(2025, 10, 7) },
  //   // { id: 7, text: 'Write unit tests', completed: false, priority: 'medium', status: 'not-started', createdAt: new Date(2025, 10, 5) },
  //   // { id: 8, text: 'Fix production bug', completed: false, priority: 'high', status: 'in-progress', createdAt: new Date(2025, 10, 7) },
  // ]);

  const [todos, setTodos] = useState<Todo[]>(currentWorkspace?.todos ?? []);

  useEffect(() => {
    setTodos(currentWorkspace?.todos ?? []);
  }, [currentWorkspace]);

  // Demo goals with progress tracking
  const [goals, setGoals] = useState<any>(currentWorkspace?.goals ?? []);

  // Keep goals state in sync with store selection (like todos)
  useEffect(() => {
    setGoals(currentWorkspace?.goals ?? []);
  }, [currentWorkspace]);

  // States for adding new todos
  const [newTodo, setNewTodo] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAddTodo, setShowAddTodo] = useState(false);
  
  // States for adding new goals
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', category: '' });
  
  // States for editing todos
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editTodoText, setEditTodoText] = useState('');
  const [editTodoPriority, setEditTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  // States for editing goals
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editGoalData, setEditGoalData] = useState({ title: '', target: '', category: '', id: '' });
  
  // Layout view state - grid or list
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [goalsViewLayout, setGoalsViewLayout] = useState<'grid' | 'list'>('grid');
  
  // Show more/less state
  const [showAllTodos, setShowAllTodos] = useState(false);
  const [showAllGoals, setShowAllGoals] = useState(false);
  
  // Display limits
  const TODOS_DISPLAY_LIMIT = 6;
  const GOALS_DISPLAY_LIMIT = 6;
  
  // Analytics chart state
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Workspace transition animation state
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Generate year options from 2025 to current year
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2024 }, (_, i) => 2025 + i);
  
  // Fetch analytics data when year or user changes
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!userInfo?.userId || !currentWorkspace?.id) return;
      
      setAnalyticsLoading(true);
      try {
        let data: any = await getAnalyticsApi(userInfo.userId, selectedYear.toString(), currentWorkspace.id);
        // Don't parse here since the API already returns parsed data
        // If it's a string, try to parse it, otherwise use it directly
        let parsedData = data;
        if (typeof data === 'string') {
          try {
            parsedData = JSON.parse(data);
          } catch (parseError) {
            console.error('Failed to parse analytics data:', parseError);
            parsedData = [];
          }
        }
        // Ensure data is always an array
        const safeData = Array.isArray(parsedData) ? parsedData : [];
        setAnalyticsData(safeData);
        console.log('Analytics data fetched:', safeData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Fallback to mock data
        const mockData = [
          { month: 'Jan', completed: 0, label: 'January' },
          { month: 'Feb', completed: 0, label: 'February' },
          { month: 'Mar', completed: 0, label: 'March' },
          { month: 'Apr', completed: 0, label: 'April' },
          { month: 'May', completed: 0, label: 'May' },
          { month: 'Jun', completed: 0, label: 'June' },
          { month: 'Jul', completed: 0, label: 'July' },
          { month: 'Aug', completed: 0, label: 'August' },
          { month: 'Sep', completed: 0, label: 'September' },
          { month: 'Oct', completed: 0, label: 'October' },
          { month: 'Nov', completed: 0, label: 'November' },
          { month: 'Dec', completed: 0, label: 'December' },
        ];
        setAnalyticsData(mockData);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedYear, userInfo?.userId, currentWorkspace?.id]);
  

  
  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle adding new todo with selected priority
  const handleAddTodo =async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    
    if (currentWorkspace.todos.length >= 15) {
      showToast('You can create maximum 15 todos per workspace. Premium coming soon for unlimited todos!', 'warning');
      return;
    }
    
    if (newTodo.trim()) {
      let newtask: CreateTaskReq = {
        text: newTodo,
        priority: newTodoPriority,
        userId: userInfo?.userId || '',
        workspaceId: currentWorkspace.id,
        id: `todo_${Date.now()}`, // Temporary client id
        status: "PENDING",
      }
      await addTodo(newtask);

      setNewTodo('');
      setNewTodoPriority('medium');
      setShowAddTodo(false);
    }
  };

  // Handle adding new goal
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    
    if (currentWorkspace.goals.length >= 15) {
      showToast('You can create maximum 15 goals per workspace. Premium coming soon for unlimited goals!', 'warning');
      return;
    }
    
    if (newGoal.title.trim() && newGoal.target && newGoal.category.trim()) {
      // Delegate to store (store now normalizes targetDays/currentTarget)
      await addGoal(currentWorkspace?.id || '', newGoal.title, newGoal.category, newGoal.target);
      // Local state will sync via useEffect on currentWorkspace change
      setNewGoal({ title: '', target: '', category: '' });
      setShowAddGoal(false);
    }
  };

  // Toggle todo completion status via store
  const toggleTodo = async (id: string) => {
    if (!currentWorkspace) return;

    // Determine the new toggle status
    let toggle = "not-started";
    
    // Get userId
    const userId = userInfo?.userId || '';

    const newTodo = todos.filter((todo) => {
      if (todo.id === id) {
        todo.status = todo.status === 'completed' ? 'not-started' : 'completed';
        
        // Set the toggle value based on new status
        toggle = todo.status; 
      }
      return todo;
    });
    setTodos(newTodo);
    await toggleTodoCompleted(toggle , id, userId);
  };

  // Delete a todo via store
  const deleteTodo = async (id: string) => {
    if (!currentWorkspace) return;
    await storeDeleteTodo(currentWorkspace.id, id);
  };

  // Start editing a todo - set edit mode with current values
  const startEditTodo = (todo: Todo) => {
    setEditingTodo(todo.id);
    setEditTodoText(todo.text || '');
    setEditTodoPriority(todo.priority);
  };

  // Save edited todo with updated text and priority via store
  const saveEditTodo = async () => {
    if (editingTodo && editTodoText.trim() && currentWorkspace) {
      await updateTodo(currentWorkspace.id, editingTodo, { text: editTodoText, priority: editTodoPriority });
      setEditingTodo(null);
      setEditTodoText('');
      setEditTodoPriority('medium');
    }
  };

  // Cancel todo editing and reset states
  const cancelEditTodo = () => {
    setEditingTodo(null);
    setEditTodoText('');
    setEditTodoPriority('medium');
  };

  // Delete a goal
  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal: any) => goal.id !== id));
  };

  // Start editing a goal - set edit mode with current values
  const startEditGoal = (goal: Goal) => {
    setEditingGoal(goal.id);
    setEditGoalData({
      title: goal.title,
      target: goal.targetDays?.toString?.() || goal.target?.toString?.() || '',
      category: goal.category,
      id: goal.id
    });

    // after that add for background processs after for 2 seconds setTimeout(() => {

  };

  // Save edited goal with updated values
  const saveEditGoal = async () => {
    if (editingGoal && editGoalData.title.trim() && editGoalData.target && editGoalData.category.trim()) {
      const nextTarget = parseInt(editGoalData.target, 10);
      const safeTarget = isNaN(nextTarget) || nextTarget <= 0 ? 1 : nextTarget;
      setGoals(goals.map((goal: any) => 
        goal.id === editingGoal 
          ? { 
              ...goal, 
              title: editGoalData.title,
              targetDays: safeTarget,
              target: safeTarget.toString(),
              category: editGoalData.category,
              currentTarget: Math.min(goal.currentTarget ?? 0, safeTarget)
            }
          : goal
      ));

      // Edit Current Workspace Store Goals 
      const currentWS = useWorkspaceStore.getState().currentWorkspace;
      if (currentWS) {
        const updatedGoals = currentWS.goals.map((goal: any) => 
          goal.id === editingGoal 
            ? { 
                ...goal,
                title: editGoalData.title,
                targetDays: safeTarget,
                target: safeTarget.toString(),
                category: editGoalData.category,
                currentTarget: Math.min(goal.currentTarget ?? 0, safeTarget)
              }
            : goal
        );

        // Update current workspace with modified goals
        const updatedWorkspace = {
          ...currentWS,
          goals: updatedGoals
        };
        useWorkspaceStore.getState().setCurrentWorkspace(updatedWorkspace);
        
        // Update the full workspaces array with the modified workspace
        const allWorkspaces = useWorkspaceStore.getState().workspaces.map(ws => 
          ws.id === currentWS.id ? updatedWorkspace : ws
        );
        useWorkspaceStore.getState().setWorkspace(allWorkspaces);
      }

        // Debug log
        console.log("Id of editing goal:", editingGoal);

        await addPendingOperation({
          id: `edit_goal_${Date.now()}`,
          type: "EDIT_GOAL",
          status: "PENDING",
          payload: {
            goalId: editingGoal,
            updatedGoalName: editGoalData.title,
            updatedCategory: editGoalData.category,
            updatedTargetDays: String(safeTarget),
          },
          timestamp: Date.now(),
          retryCount: 0,
        });

      setEditingGoal(null);
      setEditGoalData({ title: '', target: '', category: '', id: '' });
    }
  };

  // Cancel goal editing and reset states
  const cancelEditGoal = () => {
    setEditingGoal(null);
    setEditGoalData({ title: '', target: '', category: '', id: '' });
  };

  // Increase goal progress by 1 (max = target)
  const incrementGoal = async (id: string) => {
    // 1. UPDATE GOALS (local state) - Immediate UI feedback
    const updatedGoals = goals?.map((goal: any) => 
      goal.id === id && goal.currentTarget < (goal.targetDays || 1)
        ? { ...goal, currentTarget: (goal.currentTarget || 0) + 1 }
        : goal
    );
    setGoals(updatedGoals);

    // 2. UPDATE WORKSPACE STORE - Get current workspace and update it properly
    const currentWS = useWorkspaceStore.getState().currentWorkspace;
    if (currentWS) {
      const updatedWorkspace = {
        ...currentWS,
        goals: updatedGoals
      };
      
      // Update the full workspaces array with the modified workspace
      const allWorkspaces = useWorkspaceStore.getState().workspaces.map(ws => 
        ws.id === currentWS.id ? updatedWorkspace : ws
      );
      
      useWorkspaceStore.getState().setWorkspace(allWorkspaces);
      useWorkspaceStore.getState().setCurrentWorkspace(updatedWorkspace);
    }

    // 3. ADD PENDING OPERATION - For server sync
    await addPendingOperation({
      id: `increament_goal_${Date.now()}`,
      type: "INCREAMENT_GOAL",
      status: "PENDING",
      payload: {
        goalId: id,
        count: 1
      },
      timestamp: Date.now(),
      retryCount: 0,
    });
  };

  // Decrease goal progress by 1 (min = 0)
  const decrementGoal = async (id: string) => {
     // 1. UPDATE GOALS (local state) - Immediate UI feedback
    const updatedGoals = goals?.map((goal: any) => 
      goal.id === id && goal.currentTarget < (goal.targetDays || 1)
        ? { ...goal, currentTarget: (goal.currentTarget || 0) - 1 }
        : goal
    );
    setGoals(updatedGoals);

    // 2. UPDATE WORKSPACE STORE - Get current workspace and update it properly
    const currentWS = useWorkspaceStore.getState().currentWorkspace;
    if (currentWS) {
      const updatedWorkspace = {
        ...currentWS,
        goals: updatedGoals
      };
      
      // Update the full workspaces array with the modified workspace
      const allWorkspaces = useWorkspaceStore.getState().workspaces.map(ws => 
        ws.id === currentWS.id ? updatedWorkspace : ws
      );
      
      useWorkspaceStore.getState().setWorkspace(allWorkspaces);
      useWorkspaceStore.getState().setCurrentWorkspace(updatedWorkspace);
    }

    // 3. ADD PENDING OPERATION - For server sync
    await addPendingOperation({
      id: `decreament_goal_${Date.now()}`,
      type: "DECREAMENT_GOAL",
      status: "PENDING",
      payload: {
        goalId: id,
        count: 1
      },
      timestamp: Date.now(),
      retryCount: 0,
    });
  };

  // Workspace handlers
  const { showToast } = useToast();
  
  const handleAddWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (workspaces.length >= 5) {
      showToast('You can create maximum 5 workspaces. Premium coming soon for unlimited workspaces!', 'warning');
      return;
    }
    if(useWorkspaceStore.getState().workspaces.some(v => v.name === newWorkspaceName)) {
      showToast('You Can not create Duplicate Workspace!', 'warning');
      return 
    }
    console.log("Workspace NAme: ",newWorkspaceName)
    if (newWorkspaceName.trim()) {
      addWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setShowAddWorkspace(false);
    }
  };

  const handleEditWorkspace = (id: string, currentName: string) => {
    setEditingWorkspaceId(id);
    setEditingWorkspaceName(currentName);
    setShowWorkspaceMenu(null);
  };

  const handleSaveEditWorkspace = () => {
    if (editingWorkspaceId && editingWorkspaceName.trim()) {
      editWorkspace(editingWorkspaceId, editingWorkspaceName.trim());
      setEditingWorkspaceId(null);
      setEditingWorkspaceName('');
    }
  };

  const handleDeleteWorkspace = (id: string) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      deleteWorkspace(id);
      setShowWorkspaceMenu(null);
    }
  };

  const handleWorkspaceClick = (workspace: typeof workspaces[0]) => {
    if (currentWorkspace?.id === workspace.id) return; // No transition if same workspace
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentWorkspace(workspace);
      setIsTransitioning(false);
    }, 150);
  };

  const handleMenuClick = (workspaceId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.top - 90, // Position above the button
      left: rect.left - 140 + rect.width
    });
    setShowWorkspaceMenu(showWorkspaceMenu === workspaceId ? null : workspaceId);
  };

  // Proper logout: clear in-memory state, persisted key, pending ops DB, then navigate
  const handleLogout = async () => {
    setIsLoggingOut(true);
    const store = useWorkspaceStore.getState();
    // Clear in-memory state first
    store.clearWorkspace();
    // Sign out & navigate quickly to unmount Dashboard (closes active IndexedDB usage)
    signOutUser();
    navigate('/');

    // Defer heavy cleanup to next tick to avoid race with component effects
    setTimeout(async () => {
      try {
        await useWorkspaceStore.persist.clearStorage();
        console.log('✅ Persist storage cleared');
      } catch (e) {
        console.warn('⚠️ Failed clearing persist storage', e);
      }
      try {
        const req = indexedDB.deleteDatabase('workspaceDB');
        req.onsuccess = () => console.log('✅ workspaceDB deleted');
        req.onerror = (ev) => console.warn('⚠️ workspaceDB delete error', ev);
        req.onblocked = () => console.warn('⚠️ workspaceDB delete blocked (another open connection)');
      } catch (e) {
        console.warn('⚠️ deleteDatabase threw synchronously', e);
      }
      await clearPendingOperations();
      console.log('✅ Pending operations cleared');
    }, 1000);
  };

  // Calculate comprehensive statistics for stat cards
  const completedTodos = todos.filter(t => t.status === 'completed').length;
  const inProgressTodos = todos.filter(t => t.status === 'in-progress').length;
  const notStartedTodos = todos.filter(t => t.status === 'not-started' || t.status === 'todo').length;
  const totalTodos = todos.length;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
  
  // Recent tasks (last 5)
  const recentTasks = [...todos]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  // Show loading until hydrated and workspaces fetched
  if (!isHydrated || !workspacesFetched) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ marginBottom: '20px' }}><TrelloLogo size={60} /></div>
          <div style={{ fontSize: '18px', opacity: 0.7 }}>
            {!isHydrated ? 'Loading...' : 'Fetching workspaces...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="mobile-logo">
          <img src="/TaskPlexus.png" alt="TaskPlexus" width={32} />
          <span>TaskPlexus</span>
        </div>
        <div className="mobile-user">
          {/* <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.email}`} alt="Profile" className="mobile-user-avatar" /> */}
          ✨
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-menu-logo">
                <img src="/TaskPlexus.png" alt="TaskPlexus" width={32} />
                <span>TaskPlexus</span>
              </div>
              <button 
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="mobile-menu-nav">
              <button 
                className={`mobile-nav-item ${activeSection === 'overview' ? 'active' : ''}`}
                onClick={() => { setActiveSection('overview'); setMobileMenuOpen(false); }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5H16.5C17.6046 5 18.5 5.89543 18.5 7V15C18.5 16.1046 17.6046 17 16.5 17H7.5C6.39543 17 5.5 16.1046 5.5 15V7C5.5 5.89543 6.39543 5 7.5 5Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5.5 8.5L1.5 8.5C1.5 6.29086 3.29086 4.5 5.5 4.5L5.5 8.5Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>Overview</span>
              </button>
              <button 
                className={`mobile-nav-item ${activeSection === 'tasks' ? 'active' : ''}`}
                onClick={() => { 
                  setActiveSection('tasks'); 
                  setMobileMenuOpen(false); 
                  setTimeout(() => scrollToSection('tasks-section'), 300);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16.5 3.5H3.5C2.94772 3.5 2.5 3.94772 2.5 4.5V15.5C2.5 16.0523 2.94772 16.5 3.5 16.5H16.5C17.0523 16.5 17.5 16.0523 17.5 15.5V4.5C17.5 3.94772 17.0523 3.5 16.5 3.5Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6.5 8.5L8.5 10.5L13.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Tasks</span>
              </button>
              <button 
                className={`mobile-nav-item ${activeSection === 'goals' ? 'active' : ''}`}
                onClick={() => { 
                  setActiveSection('goals'); 
                  setMobileMenuOpen(false); 
                  setTimeout(() => scrollToSection('goals-section'), 300);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>Goals</span>
              </button>
              <button 
                className={`mobile-nav-item ${activeSection === 'flowchart' ? 'active' : ''}`}
                onClick={() => { 
                  setMobileMenuOpen(false); 
                  navigate('/flowchart');
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2.5" y="2.5" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="11.5" y="2.5" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="7" y="13.5" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5.5 6.5V9.5C5.5 10.0523 5.94772 10.5 6.5 10.5H13.5C14.0523 10.5 14.5 10.0523 14.5 9.5V6.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 10.5V13.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>Flowchart</span>
              </button>
              <button 
                className={`mobile-nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
                onClick={() => { setActiveSection('analytics'); setMobileMenuOpen(false); }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 15.5L6.5 11.5L9.5 14.5L17.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.5 6.5H17.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Analytics</span>
              </button>
              <button 
                className="mobile-nav-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/settings');
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.39 2.3a2 2 0 013.22 0l.77 1.05c.18.24.46.4.77.43l1.28.14a2 2 0 012.28 2.28l-.14 1.28a1.2 1.2 0 00.43.77l1.05.77a2 2 0 010 3.22l-1.05.77c-.24.18-.4.46-.43.77l-.14 1.28a2 2 0 01-2.28 2.28l-1.28-.14a1.2 1.2 0 00-.77.43l-.77 1.05a2 2 0 01-3.22 0l-.77-1.05a1.2 1.2 0 00-.77-.43l-1.28.14a2 2 0 01-2.28-2.28l.14-1.28a1.2 1.2 0 00-.43-.77L2.3 11.61a2 2 0 010-3.22l1.05-.77c.24-.18.4-.46.43-.77L3.92 5.57a2 2 0 012.28-2.28l1.28.14c.31.03.59-.19.77-.43L8.39 2.3zM10 14a4 4 0 100-8 4 4 0 000 8z" fill="currentColor"/>
                </svg>
                <span>Settings</span>
              </button>

              {/* Mobile Workspaces List */}
              <div className="mobile-workspaces">
                <div className="mobile-workspaces-header">Workspaces</div>
                
                {/* Mobile Add Workspace Form */}
                {showAddWorkspace && (
                  <form className="mobile-workspace-add-form" onSubmit={handleAddWorkspace}>
                    <input
                      type="text"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="Workspace name"
                      className="mobile-workspace-input"
                      autoFocus
                    />
                    <div className="mobile-workspace-form-actions">
                      <button type="submit" className="mobile-workspace-submit-btn-text">
                        Add
                      </button>
                      <button 
                        type="button" 
                        className="mobile-workspace-cancel-btn"
                        onClick={() => {
                          setShowAddWorkspace(false);
                          setNewWorkspaceName('');
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </form>
                )}
                
                <div className="mobile-workspaces-list">
                  {workspaces.length === 0 && (
                    <div className="mobile-workspace-empty">No workspaces yet</div>
                  )}
                  {workspaces.map((ws) => (
                    <div key={ws.id} className={`mobile-workspace-item-container ${currentWorkspace?.id === ws.id ? 'active' : ''}`}>
                      {editingWorkspaceId === ws.id ? (
                        <div className="mobile-workspace-edit-form">
                          <input
                            type="text"
                            value={editingWorkspaceName}
                            onChange={(e) => setEditingWorkspaceName(e.target.value)}
                            className="mobile-workspace-input"
                            autoFocus
                          />
                          <div className="mobile-workspace-edit-actions">
                            <button onClick={handleSaveEditWorkspace} className="mobile-workspace-save-btn">Save</button>
                            <button onClick={() => { setEditingWorkspaceId(null); setEditingWorkspaceName(''); }} className="mobile-workspace-cancel-btn">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mobile-workspace-row">
                          <button
                            className="mobile-workspace-btn"
                            onClick={() => { setCurrentWorkspace(ws); setMobileMenuOpen(false); }}
                          >
                            <span className="mobile-workspace-name">{ws.name?.substring(0,20) || 'Untitled'}</span>
                            {ws.isDefault && <span className="mobile-workspace-badge">Default</span>}
                          </button>
                          {!ws.isDefault && (
                            <div className="mobile-workspace-actions">
                              <button onClick={() => handleEditWorkspace(ws.id, ws.name || '')} className="mobile-action-btn edit">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.2083 1.75004C10.3588 1.59958 10.5385 1.48061 10.7367 1.40024C10.9349 1.31986 11.1477 1.27954 11.3625 1.27954C11.5773 1.27954 11.7901 1.31986 11.9883 1.40024C12.1865 1.48061 12.3662 1.59958 12.5167 1.75004C12.6671 1.9005 12.7861 2.08019 12.8665 2.27839C12.9469 2.47659 12.9872 2.68938 12.9872 2.90421C12.9872 3.11903 12.9469 3.33182 12.8665 3.53002C12.7861 3.72822 12.6671 3.90791 12.5167 4.05837L4.66667 11.9084L1.75 12.6667L2.50833 9.75004L10.2083 1.75004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>
                              <button onClick={() => handleDeleteWorkspace(ws.id)} className="mobile-action-btn delete">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.75 3.5H12.25M11.0833 3.5V11.6667C11.0833 12.25 10.5 12.8333 9.91667 12.8333H4.08333C3.5 12.8333 2.91667 12.25 2.91667 11.6667V3.5M4.66667 3.5V2.33333C4.66667 1.75 5.25 1.16667 5.83333 1.16667H8.16667C8.75 1.16667 9.33333 1.75 9.33333 2.33333V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {!showAddWorkspace && (
                  <button
                    className="mobile-workspace-add"
                    onClick={() => setShowAddWorkspace(true)}
                  >
                    + Add Workspace
                  </button>
                )}
              </div>
            </div>
            
            <div className="mobile-menu-footer">
              <div className="mobile-user-info">
                {/* <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.email}`} alt="Profile" className="mobile-menu-avatar" /> */}
                ✨
                <div>
                  <div className="mobile-username">{userInfo?.fullName || 'User'}</div>
                  <div className="mobile-user-email">{userInfo?.email}</div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
           <img src="/TaskPlexus.png" alt="TaskPlexus" width={!sidebarCollapsed ? 40 : 36} />
            {!sidebarCollapsed && <span>TaskPlexus</span>}
          </Link>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 10H17M3 5H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 11H8V16H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11H17V16H12V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!sidebarCollapsed && <span>Overview</span>}
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeSection === 'tasks' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('tasks');
              scrollToSection('tasks-section');
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M16 4L7 13L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!sidebarCollapsed && <span>Tasks</span>}
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeSection === 'goals' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('goals');
              scrollToSection('goals-section');
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {!sidebarCollapsed && <span>Goals</span>}
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeSection === 'flowchart' ? 'active' : ''}`}
            onClick={() => navigate('/flowchart')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 6.5H12M10 9V11M10 11L3 11M10 11L17 11" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {!sidebarCollapsed && <span>Flowchart</span>}
          </button>
          
          {/* Workspaces Section */}
          {!sidebarCollapsed && (
            <div className="sidebar-workspaces">
              <div className="sidebar-workspaces-header">
                <span className="sidebar-workspaces-title">Workspaces</span>
                <button 
                  className="workspace-add-btn"
                  onClick={() => setShowAddWorkspace(true)}
                  title="Add Workspace"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              
              {/* Add Workspace Form */}
              {showAddWorkspace && (
                <form className="workspace-add-form" onSubmit={handleAddWorkspace}>
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Workspace name"
                    className="workspace-input"
                    autoFocus
                  />
                  <div className="workspace-form-actions">
                    <button type="submit" className="workspace-submit-btn">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      className="workspace-cancel-btn"
                      onClick={() => {
                        setShowAddWorkspace(false);
                        setNewWorkspaceName('');
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </form>
              )}
              
              {/* Workspaces List */}
              <div className="sidebar-workspaces-list">
                {workspaces.map((workspace) => (
                  <div 
                    key={workspace.id}
                    className={`workspace-item ${currentWorkspace?.id === workspace.id ? 'active' : ''}`}
                  >
                    {editingWorkspaceId === workspace.id ? (
                      <div className="workspace-edit-form">
                        <input
                          type="text"
                          value={editingWorkspaceName}
                          onChange={(e) => setEditingWorkspaceName(e.target.value)}
                          className="workspace-input"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEditWorkspace();
                            } else if (e.key === 'Escape') {
                              setEditingWorkspaceId(null);
                              setEditingWorkspaceName('');
                            }
                          }}
                        />
                        <div className="workspace-edit-actions">
                          <button 
                            className="workspace-save-btn"
                            onClick={handleSaveEditWorkspace}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            className="workspace-cancel-btn"
                            onClick={() => {
                              setEditingWorkspaceId(null);
                              setEditingWorkspaceName('');
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          className="workspace-name"
                          onClick={() => handleWorkspaceClick(workspace)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4.66667C2 4.31304 2.14048 3.97391 2.39052 3.72386C2.64057 3.47381 2.97971 3.33333 3.33333 3.33333H6L7.33333 5.33333H12.6667C13.0203 5.33333 13.3594 5.47381 13.6095 5.72386C13.8595 5.97391 14 6.31304 14 6.66667V11.3333C14 11.687 13.8595 12.0261 13.6095 12.2761C13.3594 12.5262 13.0203 12.6667 12.6667 12.6667H3.33333C2.97971 12.6667 2.64057 12.5262 2.39052 12.2761C2.14048 12.0261 2 11.687 2 11.3333V4.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {/* Name could be long because we cant trust users for destroying the app */}
                          <span className="workspace-name-text">{workspace.name?.substring(0,15) || 'Untitled'}</span>
                          {workspace.isDefault && <span className="workspace-badge">Default</span>}
                          {workspace.status === "FAILED" && <span className="workspace-badge-error">E</span>}
                          {workspace.status === "PENDING" && <span className="workspace-badge-pending">P</span>}
                          {workspace.status === "SUCCESS" && <span className="workspace-badge-success">S</span>}
                        </button>
                        {!workspace.isDefault && (
                          <div className="workspace-menu">
                            {workspace.status === "SUCCESS" && <button 
                              className="workspace-menu-btn"
                              onClick={(e) => handleMenuClick(workspace.id, e)}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="3" r="1" fill="currentColor"/>
                                <circle cx="8" cy="8" r="1" fill="currentColor"/>
                                <circle cx="8" cy="13" r="1" fill="currentColor"/>
                              </svg>
                            </button>}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>
        
        {/* Workspace Dropdown Menu Portal */}
        {showWorkspaceMenu && menuPosition && (
          <>
            <div 
              className="workspace-dropdown-overlay"
              onClick={() => setShowWorkspaceMenu(null)}
            />
            <div 
              className="workspace-dropdown"
              style={{
                position: 'fixed',
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              {workspaces.find(w => w.id === showWorkspaceMenu) && (
                <>
                  <button 
                    className="workspace-dropdown-item"
                    onClick={() => {
                      const workspace = workspaces.find(w => w.id === showWorkspaceMenu);
                      if (workspace) {
                        handleEditWorkspace(workspace.id, workspace.name);
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M10.2083 1.75004C10.3588 1.59958 10.5385 1.48061 10.7367 1.40024C10.9349 1.31986 11.1477 1.27954 11.3625 1.27954C11.5773 1.27954 11.7901 1.31986 11.9883 1.40024C12.1865 1.48061 12.3662 1.59958 12.5167 1.75004C12.6671 1.9005 12.7861 2.08019 12.8665 2.27839C12.9469 2.47659 12.9872 2.68938 12.9872 2.90421C12.9872 3.11903 12.9469 3.33182 12.8665 3.53002C12.7861 3.72822 12.6671 3.90791 12.5167 4.05837L4.66667 11.9084L1.75 12.6667L2.50833 9.75004L10.2083 1.75004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Edit
                  </button>
                  <button 
                    className="workspace-dropdown-item delete"
                    onClick={() => {
                      const workspace = workspaces.find(w => w.id === showWorkspaceMenu);
                      if (workspace) {
                        handleDeleteWorkspace(workspace.id);
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1.75 3.5H12.25M11.0833 3.5V11.6667C11.0833 12.25 10.5 12.8333 9.91667 12.8333H4.08333C3.5 12.8333 2.91667 12.25 2.91667 11.6667V3.5M4.66667 3.5V2.33333C4.66667 1.75 5.25 1.16667 5.83333 1.16667H8.16667C8.75 1.16667 9.33333 1.75 9.33333 2.33333V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-profile-avatar">✨</div>
            {!sidebarCollapsed && (
              <div className="user-profile-info">
                <div className="user-profile-name">{userInfo?.fullName}</div>
                <div className="user-profile-email">{userInfo?.email}</div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="sidebar-logout">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.3333 14.1667L17.5 10L13.3333 5.83334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.5 10H7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        {/* Dashboard Header */}
        <header className="dashboard-top-header">
          <div className="dashboard-top-header-left">
            {/* {/* <div className="dashboard-top-logo">
              <img src="/TaskPlexus.png" alt="TaskPlexus" width={40} />
              <span className="dashboard-top-logo-text">TaskPlexus</span>
            </div> */}
            <div className="dashboard-top-breadcrumb">
              <span className="breadcrumb-item">Dashboard</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">
                {activeSection === 'overview' && 'Overview'}
                {activeSection === 'tasks' && 'Tasks'}
                {activeSection === 'goals' && 'Goals'}
              </span>
            </div>
          </div>
          
          {/* Current Workspace Display */}
          <div className="dashboard-top-header-right">
            <button 
              className="settings-icon-btn"
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              <svg width="30" height="30" viewBox="0 0 20 20" fill="none">
                {/* <path d="M10 12.5C8.61929 12.5 7.5 11.3807 7.5 10C7.5 8.61929 8.61929 7.5 10 7.5C11.3807 7.5 12.5 8.61929 12.5 10C12.5 11.3807 11.3807 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> */}
                <path d="M10.9 1.5L11.2 2.8C11.5 2.9 11.8 3.1 12.1 3.3L13.4 2.9L14.3 4.6L13.3 5.4C13.4 5.8 13.4 6.2 13.3 6.6L14.3 7.4L13.4 9.1L12.1 8.7C11.8 8.9 11.5 9.1 11.2 9.2L10.9 10.5H9.1L8.8 9.2C8.5 9.1 8.2 8.9 7.9 8.7L6.6 9.1L5.7 7.4L6.7 6.6C6.6 6.2 6.6 5.8 6.7 5.4L5.7 4.6L6.6 2.9L7.9 3.3C8.2 3.1 8.5 2.9 8.8 2.8L9.1 1.5H10.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="current-workspace-display">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2.25 5.25C2.25 4.83579 2.41462 4.43855 2.70765 4.14549C3.00067 3.85243 3.39782 3.6875 3.8125 3.6875H6.75L8.25 6H14.1875C14.6022 6 14.9994 6.16462 15.2924 6.45765C15.5855 6.75067 15.75 7.14782 15.75 7.5625V12.75C15.75 13.1647 15.5855 13.5619 15.2924 13.8549C14.9994 14.148 14.6022 14.3125 14.1875 14.3125H3.8125C3.39782 14.3125 3.00067 14.148 2.70765 13.8549C2.41462 13.5619 2.25 13.1647 2.25 12.75V5.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="current-workspace-info">
                <span className="current-workspace-label">Workspace</span>
                <span className="current-workspace-name">{currentWorkspace?.name?.substring(0,15) || 'Personal'}</span>
              </div>
            </div>
          </div>
         
        </header>
        
        <div className={`dashboard-content ${isTransitioning ? 'workspace-transitioning' : ''}`}>
          {/* Top Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card-pro">
              <div className="stat-card-pro-header">
                <div className="stat-card-pro-icon total">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5C15 5.53043 14.7893 6.03914 14.4142 6.41421C14.0391 6.78929 13.5304 7 13 7H11C10.4696 7 9.96086 6.78929 9.58579 6.41421C9.21071 6.03914 9 5.53043 9 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="stat-card-pro-label">Total Tasks</span>
              </div>
              <div className="stat-card-pro-value">{totalTodos}</div>
              <div className="stat-card-pro-trend positive">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 6L8 2L4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>+12% from last week</span>
              </div>
            </div>
            
            <div className="stat-card-pro">
              <div className="stat-card-pro-header">
                <div className="stat-card-pro-icon progress">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="stat-card-pro-label">In Progress</span>
              </div>
              <div className="stat-card-pro-value">{inProgressTodos}</div>
              <div className="stat-card-pro-trend neutral">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Same as yesterday</span>
              </div>
            </div>
            
            <div className="stat-card-pro">
              <div className="stat-card-pro-header">
                <div className="stat-card-pro-icon completed">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="stat-card-pro-label">Completed</span>
              </div>
              <div className="stat-card-pro-value">{completedTodos}</div>
              <div className="stat-card-pro-trend positive">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 6L8 2L4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>+{completionRate}% completion rate</span>
              </div>
            </div>
            
            <div className="stat-card-pro">
              <div className="stat-card-pro-header">
                <div className="stat-card-pro-icon pending">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  </svg>
                </div>
                <span className="stat-card-pro-label">Not Started</span>
              </div>
              <div className="stat-card-pro-value">{notStartedTodos}</div>
              <div className="stat-card-pro-trend neutral">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Yet to begin</span>
              </div>
            </div>
          </div>

          {/* Analytics and Recent Tasks Row */}
          <div className="analytics-row">
            {/* Analytics Chart */}
            <div className="analytics-card">
              <div className="analytics-header">
                <div className="analytics-title">
                  <h3>Task Analytics</h3>
                  <p>Monthly performance for {selectedYear}</p>
                </div>
                <div className="analytics-controls">
                  <select 
                    className="year-selector"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="analytics-chart-container">
                {analyticsLoading ? (
                  <div className="analytics-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading analytics...</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Chart */}
                    <div className="wave-analytics-chart desktop-chart">
                      {Array.isArray(analyticsData) && analyticsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={analyticsData}
                            margin={{
                              top: 10,
                              right: 30,
                              left: 0,
                              bottom: 0,
                            }}
                          >
                            <defs>
                              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis 
                              dataKey="month" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                              dy={10}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                              domain={[0, 15]}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'rgba(20, 20, 35, 0.9)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                              itemStyle={{ color: '#fff' }}
                              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="completed" 
                              stroke="#667eea" 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorCompleted)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="wave-chart-empty">
                          <div className="empty-icon">📊</div>
                          <p>No data available for {selectedYear}</p>
                          <span>Complete some tasks to see analytics</span>
                        </div>
                      )}
                    </div>

                    {/* Mobile Chart - Bar Chart */}
                    <div className="mobile-analytics-chart">
                      {Array.isArray(analyticsData) && analyticsData.length > 0 ? (
                        <div className="mobile-chart-bars">
                          {analyticsData.map((data, index) => {
                            const maxValue = 15; // Set max to 15 tasks
                            const heightPercent = Math.min((data.completed / maxValue) * 100, 100);
                            return (
                              <div key={index} className="mobile-bar-item">
                                <div className="mobile-bar-wrapper">
                                  <div 
                                    className="mobile-bar-fill"
                                    style={{ height: `${heightPercent}%` }}
                                  >
                                    <span className="mobile-bar-value">{data.completed}</span>
                                  </div>
                                </div>
                                <span className="mobile-bar-label">{data.month}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="wave-chart-empty">
                          <div className="empty-icon">📊</div>
                          <p>No data available for {selectedYear}</p>
                          <span>Complete some tasks to see analytics</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Recent Tasks */}
            <div className="recent-tasks-card">
              <div className="recent-tasks-header">
                <h3>Recent Tasks</h3>
                <button className="view-all-btn" onClick={() => setActiveSection('tasks')}>View All</button>
              </div>
              <div className="recent-tasks-list">
                {recentTasks?.slice(0,5)?.map(task => (
                  <div key={task.id} className="recent-task-item">
                    <div className={`recent-task-status status-${task.status}`}></div>
                    <div className="recent-task-content">
                      <span className="recent-task-text">{task.text}</span>
                      <span className="recent-task-meta">
                        <span className={`priority-dot priority-${task.priority}`}></span>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Welcome Section with stats */}
          <div className="welcome-section">
            <div>
              <h1 className="dashboard-title">Your Tasks & Goals</h1>
              <p className="dashboard-subtitle">Here's what's happening with your tasks today.</p>
            </div>
            <div className="welcome-actions">
              {/* Layout Toggle Button */}
              <button 
                className="layout-toggle-btn"
                onClick={() => setViewLayout(viewLayout === 'grid' ? 'list' : 'grid')}
                title={viewLayout === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
              >
                {viewLayout === 'grid' ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M3 4H17M3 10H17M3 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    List View
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 11H8V16H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 11H17V16H12V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Grid View
                  </>
                )}
              </button>
              
              {/* Flowchart View button */}
              <button 
                className="flowchart-view-btn"
                onClick={() => navigate('/flowchart')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 11H8V16H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11H17V16H12V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Flowchart View
              </button>
              
              {/* Quick statistics cards */}
              <div className="quick-stats">
                <div className="stat-card">
                  <div className="stat-icon">✓</div>
                  <div className="stat-info">
                    <div className="stat-value">{completedTodos}/{totalTodos}</div>
                    <div className="stat-label">Tasks Done</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <div className="stat-value">{completionRate}%</div>
                    <div className="stat-label">Completion Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid - Todos and Goals sections */}
          <div className="dashboard-grid">
            {/* Todos Section */}
            <div id="tasks-section" className="dashboard-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Today's Tasks</h2>
                  <p className="section-subtitle">
                    {totalTodos - completedTodos} tasks remaining
                    {todos.length > TODOS_DISPLAY_LIMIT && (
                      <span className="item-count"> • Showing {showAllTodos ? todos.length : Math.min(TODOS_DISPLAY_LIMIT, todos.length)} of {todos.length}</span>
                    )}
                  </p>
                </div>
                <div className="section-header-actions">
                  {/* Layout toggle for todos */}
                  <button 
                    className="layout-toggle-sm"
                    onClick={() => setViewLayout(viewLayout === 'grid' ? 'list' : 'grid')}
                    title={viewLayout === 'grid' ? 'List View' : 'Grid View'}
                  >
                    {viewLayout === 'grid' ? (
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M3 4H17M3 10H17M3 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 11H8V16H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11H17V16H12V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  {/* Button to show add todo form */}
                  <button 
                    className="add-btn"
                    onClick={() => setShowAddTodo(!showAddTodo)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add Task
                  </button>
                </div>
              </div>

              {/* Add Todo Form - shows when "Add Task" is clicked */}
              {showAddTodo && (
                <form className="add-form" onSubmit={handleAddTodo}>
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="What needs to be done?"
                    className="add-input"
                    autoFocus
                  />
                  {/* Priority selector buttons */}
                  <div className="priority-selector">
                    <label className="priority-label">Priority:</label>
                    <div className="priority-options">
                      <button
                        type="button"
                        className={`priority-option ${newTodoPriority === 'low' ? 'active' : ''} priority-low`}
                        onClick={() => setNewTodoPriority('low')}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        className={`priority-option ${newTodoPriority === 'medium' ? 'active' : ''} priority-medium`}
                        onClick={() => setNewTodoPriority('medium')}
                      >
                        Medium
                      </button>
                      <button
                        type="button"
                        className={`priority-option ${newTodoPriority === 'high' ? 'active' : ''} priority-high`}
                        onClick={() => setNewTodoPriority('high')}
                      >
                        High
                      </button>
                    </div>
                  </div>
                  {/* Form action buttons */}
                  <div className="add-form-actions">
                    <button type="submit" className="submit-btn">Add Task</button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setShowAddTodo(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Todos List - displays all todos */}
              <div className={`todos-list ${viewLayout === 'list' ? 'list-view' : ''}`}>
                {(showAllTodos ? todos : todos.slice(0, TODOS_DISPLAY_LIMIT)).map(todo => (
                  <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                    {/* Edit mode - shows when pencil icon is clicked */}
                    {editingTodo === todo.id ? (
                      <div className="todo-edit-form">
                        <input
                          type="text"
                          value={editTodoText}
                          onChange={(e) => setEditTodoText(e.target.value)}
                          className="todo-edit-input"
                          autoFocus
                        />
                        {/* Priority selector in edit mode */}
                        <div className="priority-selector">
                          <label className="priority-label">Priority:</label>
                          <div className="priority-options">
                            <button
                              type="button"
                              className={`priority-option ${editTodoPriority === 'low' ? 'active' : ''} priority-low`}
                              onClick={() => setEditTodoPriority('low')}
                            >
                              Low
                            </button>
                            <button
                              type="button"
                              className={`priority-option ${editTodoPriority === 'medium' ? 'active' : ''} priority-medium`}
                              onClick={() => setEditTodoPriority('medium')}
                            >
                              Medium
                            </button>
                            <button
                              type="button"
                              className={`priority-option ${editTodoPriority === 'high' ? 'active' : ''} priority-high`}
                              onClick={() => setEditTodoPriority('high')}
                            >
                              High
                            </button>
                          </div>
                        </div>
                        {/* Save and cancel buttons for edit mode */}
                        <div className="todo-edit-actions">
                          <button 
                            className="todo-save-btn"
                            onClick={saveEditTodo}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            className="todo-cancel-btn"
                            onClick={cancelEditTodo}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Normal display mode */}
                        <div className="todo-main">
                          {/* Checkbox to toggle completion */}
                          <button 
                            className="todo-checkbox"
                            onClick={() => toggleTodo(todo.id)}
                          >
                            {todo.completed && <span>✓</span>}
                          </button>
                          <span className="todo-text">{todo.text}</span>
                          {/* Priority badge */}
                          <span className={`todo-priority priority-${todo.priority}`}>
                            {todo.priority}
                          </span>
                        </div>
                        {/* Edit and delete buttons */}
                        <div className="todo-actions">
                          <button 
                            className="todo-edit"
                            onClick={() => startEditTodo(todo)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M11.3333 2.00004C11.5084 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4188 1.44775 12.6667 1.44775C12.9145 1.44775 13.1599 1.49653 13.3886 1.59129C13.6174 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.38272 14.4088 2.61146C14.5036 2.84019 14.5523 3.08555 14.5523 3.33337C14.5523 3.58119 14.5036 3.82655 14.4088 4.05529C14.314 4.28402 14.1751 4.49161 14 4.66671L5 13.6667L1.33333 14.6667L2.33333 11L11.3333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            className="todo-delete"
                            onClick={() => deleteTodo(todo.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Show More/Less Button for Todos */}
              {todos.length > TODOS_DISPLAY_LIMIT && (
                <button 
                  className="show-more-btn"
                  onClick={() => setShowAllTodos(!showAllTodos)}
                >
                  {showAllTodos ? (
                    <>
                      Show Less
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 10L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      Show More ({todos.length - TODOS_DISPLAY_LIMIT} more)
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Goals Section */}
            <div id="goals-section" className="dashboard-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Goals</h2>
                  <p className="section-subtitle">
                    Track your progress
                    {goals.length > GOALS_DISPLAY_LIMIT && (
                      <span className="item-count"> • Showing {showAllGoals ? goals.length : Math.min(GOALS_DISPLAY_LIMIT, goals.length)} of {goals.length}</span>
                    )}
                  </p>
                </div>
                <div className="section-header-actions">
                  {/* Layout toggle for goals */}
                  <button 
                    className="layout-toggle-sm"
                    onClick={() => setGoalsViewLayout(goalsViewLayout === 'grid' ? 'list' : 'grid')}
                    title={goalsViewLayout === 'grid' ? 'List View' : 'Grid View'}
                  >
                    {goalsViewLayout === 'grid' ? (
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M3 4H17M3 10H17M3 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 11H8V16H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11H17V16H12V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  {/* Button to show add goal form */}
                  <button 
                    className="add-btn"
                    onClick={() => setShowAddGoal(!showAddGoal)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add Goal
                  </button>
                </div>
              </div>

              {/* Add Goal Form - shows when "Add Goal" is clicked */}
              {showAddGoal && (
                <form className="add-form goal-form" onSubmit={handleAddGoal}>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="Goal title"
                    className="add-input"
                  />
                  <div className="goal-form-row">
                    <input
                      type="number"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                      placeholder="Target"
                      className="add-input"
                      min="1"
                    />
                    <input
                      type="text"
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                      placeholder="Category"
                      className="add-input"
                    />
                  </div>
                  <div className="add-form-actions">
                    <button type="submit" className="submit-btn">Add Goal</button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setShowAddGoal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Goals List - displays all goals */}
              <div className={`goals-list ${goalsViewLayout === 'list' ? 'list-view' : ''}`}>
                {(showAllGoals ? goals : goals.slice(0, GOALS_DISPLAY_LIMIT)).map((goal: any) => {
                  const rawTarget = goal.targetDays ?? goal.target ?? 0;
                  const numericTarget = typeof rawTarget === 'number' ? rawTarget : parseInt(rawTarget, 10);
                  const safeTarget = isNaN(numericTarget) || numericTarget <= 0 ? 1 : numericTarget;
                  const current = typeof goal.currentTarget === 'number' ? goal.currentTarget : 0;
                  const percentage = Math.min(100, Math.max(0, Math.round((current / safeTarget) * 100)));
                  console.log("Goals List Rendering: ", goals);
                  return (
                    <div key={goal._id || goal.id} className={`goal-card ${editingGoal === goal.id ? 'editing' : ''}`}>
                      {/* Edit mode - shows when pencil icon is clicked */}
                      {editingGoal === goal.id ? (
                        <div className="goal-edit-form">
                          <input
                            type="text"
                            value={editGoalData.title}
                            onChange={(e) => setEditGoalData({...editGoalData, title: e.target.value})}
                            placeholder="Goal title"
                            className="goal-edit-input"
                            autoFocus
                          />
                          <div className="goal-edit-row">
                            <input
                              type="number"
                              value={editGoalData.target}
                              onChange={(e) => setEditGoalData({...editGoalData, target: e.target.value})}
                              placeholder="Target"
                              className="goal-edit-input"
                              min="1"
                            />
                            <input
                              type="text"
                              value={editGoalData.category}
                              onChange={(e) => setEditGoalData({...editGoalData, category: e.target.value})}
                              placeholder="Category"
                              className="goal-edit-input"
                            />
                          </div>
                          <div className="goal-edit-actions">
                            <button 
                              className="goal-save-btn"
                              onClick={saveEditGoal}
                            >
                              Save Changes
                            </button>
                            <button 
                              className="goal-cancel-btn"
                              onClick={cancelEditGoal}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Normal display mode */}
                          <div className="goal-header">
                            <div>
                              <h3 className="goal-title">{goal.title}</h3>
                              <span className="goal-category">{goal.category}</span>
                            </div>
                            <div className="goal-header-actions">
                              {/* Progress percentage */}
                              <div className="goal-percentage">{percentage}%</div>
                              {/* Edit button */}
                              <button 
                                className="goal-edit-icon"
                                onClick={() => startEditGoal(goal)}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M11.3333 2.00004C11.5084 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4188 1.44775 12.6667 1.44775C12.9145 1.44775 13.1599 1.49653 13.3886 1.59129C13.6174 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.38272 14.4088 2.61146C14.5036 2.84019 14.5523 3.08555 14.5523 3.33337C14.5523 3.58119 14.5036 3.82655 14.4088 4.05529C14.314 4.28402 14.1751 4.49161 14 4.66671L5 13.6667L1.33333 14.6667L2.33333 11L11.3333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              {/* Delete button */}
                              <button 
                                className="goal-delete-icon"
                                onClick={() => deleteGoal(goal._id)}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="goal-progress">
                            <div 
                              className="goal-progress-bar"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          {/* Progress stats and increment/decrement buttons */}
                          <div className="goal-stats">
                            <span className="goal-stat">{goal.currentTarget} / {goal.targetDays}</span>
                            <div className="goal-actions">
                              {/* Decrement button */}
                              <button 
                                className="goal-action-btn"
                                onClick={() => decrementGoal(goal.id)}
                                disabled={goal.currentTarget === 0}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </button>
                              {/* Increment button */}
                              <button 
                                className="goal-action-btn primary"
                                onClick={() => incrementGoal(goal.id)}
                                disabled={goal.currentTarget >= goal.targetDays}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Show More/Less Button for Goals */}
              {goals.length > GOALS_DISPLAY_LIMIT && (
                <button 
                  className="show-more-btn"
                  onClick={() => setShowAllGoals(!showAllGoals)}
                >
                  {showAllGoals ? (
                    <>
                      Show Less
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 10L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      Show More ({goals.length - GOALS_DISPLAY_LIMIT} more)
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
     </main>

      {/* Animated background elements */}
      <div className="dashboard-background">
        <div className="dashboard-bg-circle dashboard-bg-circle-1"></div>
        <div className="dashboard-bg-circle dashboard-bg-circle-2"></div>
      </div>
    </div>
  );
};

export default Dashboard;