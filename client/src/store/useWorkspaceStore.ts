import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getItem, setItem, deleteItem } from "./indexDB/indexDBStorage";
import type { PersistStorage } from "zustand/middleware";

// Todo interface
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  workspaceId: string;
}

// Goal interface
export interface Goal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  workspaceId: string;
}

// ReactFlow Node interface
export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  style?: any;
  sourcePosition?: any;
  targetPosition?: any;
}

// ReactFlow Edge interface
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: any;
  type?: string;
}

// Workspace interface with todos, goals, nodes, edges
export interface Workspace {
  id: string;
  name: string;
  createdAt: Date;
  isDefault?: boolean;
  todos: Todo[];
  goals: Goal[];
  initialNodes: FlowNode[];
  initialEdges: FlowEdge[];
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;

  // Workspace Actions
  addWorkspace: (name: string) => Promise<void>;
  editWorkspace: (id: string, name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace) => void;
  initializeDefaultWorkspace: () => void;

  // Todo Actions - Optimistic Updates with API calls
  addTodo: (workspaceId: string, todo: Omit<Todo, 'id' | 'createdAt' | 'workspaceId'>) => Promise<void>;
  updateTodo: (workspaceId: string, todoId: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (workspaceId: string, todoId: string) => Promise<void>;
  toggleTodoCompleted: (workspaceId: string, todoId: string) => Promise<void>;

  // Goal Actions - Optimistic Updates with API calls
  addGoal: (workspaceId: string, goal: Omit<Goal, 'id' | 'createdAt' | 'workspaceId'>) => Promise<void>;
  updateGoal: (workspaceId: string, goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (workspaceId: string, goalId: string) => Promise<void>;
  toggleGoalCompleted: (workspaceId: string, goalId: string) => Promise<void>;

  // ReactFlow Actions - No API needed, just local state
  updateNodes: (workspaceId: string, nodes: FlowNode[]) => void;
  updateEdges: (workspaceId: string, edges: FlowEdge[]) => void;
}

// Custom IndexedDB storage implementation for zustand persist middleware
// persist middleware needs an object with getItem, setItem, removeItem methods for any storage implementation
// like localStorage, sessionStorage or custom storage like IndexedDB
const indexedDBStorage: PersistStorage<WorkspaceState> = {
  // this function is called by zustand persist middleware to get the data from IndexedDB
  // we use the getItem , setItem, deleteItem functions defined in indexDBStorage.ts which interacts with IndexedDB

  // Custom storage implementation for IndexedDB
  getItem: async (name) => {
    const value = await getItem<string>(name);
    if (!value) return null;
    const parsed = JSON.parse(value);

    // Convert Date strings back to Date objects
    if (parsed.state?.workspaces) {
      parsed.state.workspaces = parsed.state.workspaces.map((ws: any) => ({
        ...ws,
        createdAt: new Date(ws.createdAt),
        todos: ws.todos?.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })) || [],
        goals: ws.goals?.map((g: any) => ({ ...g, createdAt: new Date(g.createdAt) })) || [],
        initialNodes: ws.initialNodes || [],
        initialEdges: ws.initialEdges || [],
      }));
    }
    if (parsed.state?.currentWorkspace) {
      parsed.state.currentWorkspace = {
        ...parsed.state.currentWorkspace,
        createdAt: new Date(parsed.state.currentWorkspace.createdAt),
        todos: parsed.state.currentWorkspace.todos?.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })) || [],
        goals: parsed.state.currentWorkspace.goals?.map((g: any) => ({ ...g, createdAt: new Date(g.createdAt) })) || [],
        initialNodes: parsed.state.currentWorkspace.initialNodes || [],
        initialEdges: parsed.state.currentWorkspace.initialEdges || [],
      };
    }

    return parsed;
  },
  setItem: async (name, value) => {
    // stringify the value before storing because IndexedDB works with strings
    await setItem(name, JSON.stringify(value));
  },
  removeItem: async (name) => {
    // delete the item from IndexedDB store
    await deleteItem(name);
  },
};

// how internally zustand persist middleware works structure
/*
function persist(fn,config){
    console.log("Fn",fn)
    data = fn()
    console.log("Fn that has all variables datas\n",data)
    console.log("storage configs: ",config)
}

persist((set,get) => ({count: 0, incr: (count)=>count+1}),
{name:"key" , storage:"indexedDB"})

*/

const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspace: null,

      // WORKSPACE ACTIONS 
      addWorkspace: async (name: string) => {
        const tempId = `workspace_${Date.now()}`;
        const newWorkspace: Workspace = {
          id: tempId,
          name,
          createdAt: new Date(),
          isDefault: false,
          todos: [],
          goals: [],
          initialNodes: [],
          initialEdges: [],
        };

        // Optimistic update - UI instantly updates
        set({ workspaces: [...get().workspaces, newWorkspace] });

        try {
          // API call in background
          // const response = await createWorkspaceAPI({ workspaceName: name, userId: 'user_id' });
          // Update with real ID from server
          // set({ workspaces: get().workspaces.map(ws => ws.id === tempId ? { ...ws, id: response.id } : ws) });
          console.log('✅ Workspace created:', name);
        } catch (error) {
          console.error('❌ Failed to create workspace:', error);
          // Rollback on error
          set({ workspaces: get().workspaces.filter(ws => ws.id !== tempId) });
          alert('Failed to create workspace. Please try again.');
        }
      },

      editWorkspace: async (id: string, name: string) => {
        const oldWorkspaces = get().workspaces;
        
        // Optimistic update
        set({
          workspaces: oldWorkspaces.map((ws) =>
            ws.id === id ? { ...ws, name } : ws
          ),
        });

        if (get().currentWorkspace?.id === id) {
          set({ currentWorkspace: { ...get().currentWorkspace!, name } });
        }

        try {
          // API call
          // await updateWorkspaceAPI({ workspaceId: id, workspaceName: name });
          console.log('✅ Workspace updated:', name);
        } catch (error) {
          console.error('❌ Failed to update workspace:', error);
          // Rollback
          set({ workspaces: oldWorkspaces });
          alert('Failed to update workspace. Please try again.');
        }
      },

      deleteWorkspace: async (id: string) => {
        const workspace = get().workspaces.find((ws) => ws.id === id);

        if (workspace?.isDefault) {
          alert('Cannot delete default workspace');
          return;
        }

        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({ workspaces: oldWorkspaces.filter((ws) => ws.id !== id) });

        if (get().currentWorkspace?.id === id) {
          const defaultWorkspace = get().workspaces.find((ws) => ws.isDefault);
          if (defaultWorkspace) {
            set({ currentWorkspace: defaultWorkspace });
          }
        }

        try {
          // API call
          // await deleteWorkspaceAPI({ workspaceId: id });
          console.log('✅ Workspace deleted');
        } catch (error) {
          console.error('❌ Failed to delete workspace:', error);
          // Rollback
          set({ workspaces: oldWorkspaces });
          alert('Failed to delete workspace. Please try again.');
        }
      },

      setCurrentWorkspace: (workspace: Workspace) => {
        set({ currentWorkspace: workspace });
      },

      initializeDefaultWorkspace: () => {
        const existingDefault = get().workspaces.find((ws) => ws.isDefault);

        if (!existingDefault) {
          const defaultWorkspace: Workspace = {
            id: "workspace_default",
            name: "Personal",
            createdAt: new Date(),
            isDefault: true,
            todos: [],
            goals: [],
            initialNodes: [],
            initialEdges: [],
          };

          set({
            workspaces: [defaultWorkspace],
            currentWorkspace: defaultWorkspace,
          });
        } else if (!get().currentWorkspace) {
          set({ currentWorkspace: existingDefault });
        }
      },

      // ============= TODO ACTIONS =============
      addTodo: async (workspaceId: string, todo: Omit<Todo, 'id' | 'createdAt' | 'workspaceId'>) => {
        const tempId = `todo_${Date.now()}`;
        const newTodo: Todo = {
          ...todo,
          id: tempId,
          workspaceId,
          createdAt: new Date(),
        };

        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map(ws =>
            ws.id === workspaceId ? { ...ws, todos: [...ws.todos, newTodo] } : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          set({ currentWorkspace: { ...get().currentWorkspace!, todos: [...get().currentWorkspace!.todos, newTodo] } });
        }

        try {
          // API call
          // const response = await createTodoAPI({ ...newTodo, workspaceId });
          console.log('✅ Todo created:', todo.text);
        } catch (error) {
          console.error('❌ Failed to create todo:', error);
          set({ workspaces: oldWorkspaces });
          alert('Failed to create todo. Please try again.');
        }
      },

      updateTodo: async (workspaceId: string, todoId: string, updates: Partial<Todo>) => {
        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map(ws =>
            ws.id === workspaceId
              ? { ...ws, todos: ws.todos.map(t => t.id === todoId ? { ...t, ...updates } : t) }
              : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(ws => ws.id === workspaceId);
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          // API call
          // await updateTodoAPI({ todoId, ...updates });
          console.log('✅ Todo updated');
        } catch (error) {
          console.error('❌ Failed to update todo:', error);
          set({ workspaces: oldWorkspaces });
          alert('Failed to update todo. Please try again.');
        }
      },

      deleteTodo: async (workspaceId: string, todoId: string) => {
        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map(ws =>
            ws.id === workspaceId ? { ...ws, todos: ws.todos.filter(t => t.id !== todoId) } : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(ws => ws.id === workspaceId);
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          // API call
          // await deleteTodoAPI({ todoId });
          console.log('✅ Todo deleted');
        } catch (error) {
          console.error('❌ Failed to delete todo:', error);
          set({ workspaces: oldWorkspaces });
          alert('Failed to delete todo. Please try again.');
        }
      },

      toggleTodoCompleted: async (workspaceId: string, todoId: string) => {
        const workspace = get().workspaces.find(ws => ws.id === workspaceId);
        const todo = workspace?.todos.find(t => t.id === todoId);
        if (!todo) return;

        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map(ws =>
            ws.id === workspaceId
              ? { ...ws, todos: ws.todos.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t) }
              : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(ws => ws.id === workspaceId);
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          // API call
          // await updateTodoAPI({ todoId, completed: !todo.completed });
          console.log('✅ Todo toggled');
        } catch (error) {
          console.error('❌ Failed to toggle todo:', error);
          set({ workspaces: oldWorkspaces });
          alert('Failed to toggle todo. Please try again.');
        }
      },

      // ============= GOAL ACTIONS =============
      addGoal: async (workspaceId: string, goal: Omit<Goal, 'id' | 'createdAt' | 'workspaceId'>) => {
        const tempId = `goal_${Date.now()}`;
        const newGoal: Goal = {
          ...goal,
          id: tempId,
          workspaceId,
          createdAt: new Date(),
        };

        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map(ws =>
            ws.id === workspaceId ? { ...ws, goals: [...ws.goals, newGoal] } : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          set({ currentWorkspace: { ...get().currentWorkspace!, goals: [...get().currentWorkspace!.goals, newGoal] } });
        }

        try {
          // API call
          // const response = await createGoalAPI({ ...newGoal, workspaceId });
          console.log('✅ Goal created:', goal.title);
        } catch (error) {
          console.error('❌ Failed to create goal:', error);
          set({ workspaces: oldWorkspaces });
          alert('Failed to create goal. Please try again.');
        }
      },

      updateGoal: async (workspaceId: string, goalId: string, updates: Partial<Goal>) => {
        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map(ws =>
            ws.id === workspaceId
              ? { ...ws, goals: ws.goals.map(g => g.id === goalId ? { ...g, ...updates } : g) }
              : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(ws => ws.id === workspaceId);
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          // API call
          // await updateGoalAPI({ goalId, ...updates });
          console.log('✅ Goal updated');
        } catch (error) {
          console.error('❌ Failed to update goal:', error);
          set({ workspaces: oldWorkspaces });
          alert('Failed to update goal. Please try again.');
        }
      },

      deleteGoal: async (workspaceId: string, goalId: string) => {
        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map(ws =>
            ws.id === workspaceId ? { ...ws, goals: ws.goals.filter(g => g.id !== goalId) } : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(ws => ws.id === workspaceId);
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          // API call
          // await deleteGoalAPI({ goalId });
          console.log('✅ Goal deleted');
        } catch (error) {
          console.error('❌ Failed to delete goal:', error);
          set({ workspaces: oldWorkspaces });
          alert('Failed to delete goal. Please try again.');
        }
      },

      toggleGoalCompleted: async (workspaceId: string, goalId: string) => {
        const workspace = get().workspaces.find(ws => ws.id === workspaceId);
        const goal = workspace?.goals.find(g => g.id === goalId);
        if (!goal) return;

        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map(ws =>
            ws.id === workspaceId
              ? { ...ws, goals: ws.goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g) }
              : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(ws => ws.id === workspaceId);
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          // API call
          // await updateGoalAPI({ goalId, completed: !goal.completed });
          console.log('✅ Goal toggled');
        } catch (error) {
          console.error('❌ Failed to toggle goal:', error);
          set({ workspaces: oldWorkspaces });
          alert('Failed to toggle goal. Please try again.');
        }
      },

      // ============= REACTFLOW ACTIONS (No API, just local state) =============
      updateNodes: (workspaceId: string, nodes: FlowNode[]) => {
        set({
          workspaces: get().workspaces.map(ws =>
            ws.id === workspaceId ? { ...ws, initialNodes: nodes } : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          set({ currentWorkspace: { ...get().currentWorkspace!, initialNodes: nodes } });
        }
      },

      updateEdges: (workspaceId: string, edges: FlowEdge[]) => {
        set({
          workspaces: get().workspaces.map(ws =>
            ws.id === workspaceId ? { ...ws, initialEdges: edges } : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          set({ currentWorkspace: { ...get().currentWorkspace!, initialEdges: edges } });
        }
      },
    }),

    {
      name: "workspace-storage",
      storage: indexedDBStorage,
    }
  )
);

export default useWorkspaceStore;
