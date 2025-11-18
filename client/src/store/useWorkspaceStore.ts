import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getItem, setItem, deleteItem } from "./indexDB/workspaceIndexDB";
import type { PersistStorage } from "zustand/middleware";
import useUserStore from "./useUserInfo";
import { addPendingOperation } from "./indexDB/pendingOps/usePendingOps";
import type { CreateTaskReq } from "../types/createTaskType";
import toggleTodoApi from "../api/toggleTaskApi";
import updateTaskApi from "../api/updateTaskApi";
import { todo } from "node:test";
import deleteTaskApi from "../api/deleteTaskApi";

// Todo interface
export interface Todo {
  id: string;
  text?: string;
  completed?: boolean;
  priority: "low" | "medium" | "high";
  createdAt?: Date;
  workspaceId: string;
  status: string;
}

// Goal interface
export interface Goal {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date;
  workspaceId: string;
  status: string;
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
  status: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;

  // Workspace Actions
  addWorkspace: (name: string) => Promise<void>;
  editWorkspace: (id: string, name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace) => void;
  setWorkspace: (workspaces: Workspace[]) => void;
  initializeDefaultWorkspace: () => void;

  // Todo Actions - Optimistic Updates with API calls
  addTodo: (data: CreateTaskReq) => Promise<void>;
  updateTodo: (
    workspaceId: string,
    todoId: string,
    updates: Partial<Todo>
  ) => Promise<void>;
  deleteTodo: (workspaceId: string, todoId: string) => Promise<void>;
  toggleTodoCompleted: (
    toggle: string,
    todoId: string,
    userId: string
  ) => Promise<void>;

  // Goal Actions - Optimistic Updates with API calls
  addGoal: (
    workspaceId: string,
    goal: Omit<Goal, "id" | "createdAt" | "workspaceId">
  ) => Promise<void>;
  updateGoal: (
    workspaceId: string,
    goalId: string,
    updates: Partial<Goal>
  ) => Promise<void>;
  deleteGoal: (workspaceId: string, goalId: string) => Promise<void>;
  toggleGoalCompleted: (workspaceId: string, goalId: string) => Promise<void>;

  // ReactFlow Actions - No API needed, just local state
  updateNodes: (workspaceId: string, nodes: FlowNode[]) => void;
  updateEdges: (workspaceId: string, edges: FlowEdge[]) => void;
  clearWorkspace: () => void;
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
        todos:
          ws.todos?.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
          })) || [],
        goals:
          ws.goals?.map((g: any) => ({
            ...g,
            createdAt: new Date(g.createdAt),
          })) || [],
        initialNodes: ws.initialNodes || [],
        initialEdges: ws.initialEdges || [],
      }));
    }
    if (parsed.state?.currentWorkspace) {
      parsed.state.currentWorkspace = {
        ...parsed.state.currentWorkspace,
        createdAt: new Date(parsed.state.currentWorkspace.createdAt),
        todos:
          parsed.state.currentWorkspace.todos?.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
          })) || [],
        goals:
          parsed.state.currentWorkspace.goals?.map((g: any) => ({
            ...g,
            createdAt: new Date(g.createdAt),
          })) || [],
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

      clearWorkspace: async () => {
        // Clear state in memory
        set({ workspaces: [], currentWorkspace: null });
      },

      setWorkspace: (workspaces: Workspace[]) => {
        set({ workspaces });
      },

      addWorkspace: async (name: string) => {
        // need to check for duplicate names ?
        if (get().workspaces.find((ws) => ws.name === name)) {
          alert("Workspace with this name already exists.");
          return;
        }

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
          status: "PENDING",
        };

        // Optimistic update - UI instantly updates
        set({ workspaces: [...get().workspaces, newWorkspace] });

        // Add to pending operations for background processing
        const userId = useUserStore.getState().userInfo?.userId;
        if (!userId) {
          console.error("User not logged in");
          alert("User not logged in");
          return;
        }

        await addPendingOperation({
          id: `create_workspace_${tempId}`,
          type: "CREATE_WORKSPACE",
          status: "PENDING",
          payload: {
            workspaceName: name,
            userId: userId,
            tempId: tempId,
          },
          timestamp: Date.now(),
          retryCount: 0,
        });

        console.log("✅ Workspace creation queued:", name);
      },

      editWorkspace: async (id: string, name: string) => {
        const oldWorkspaces = get().workspaces;

        // Update Pending status
        const workspaceToEdit = oldWorkspaces.find((ws) => ws.id === id);
        if (!workspaceToEdit) {
          alert("Workspace not found");
          return;
        }

        const oldWorkspaceName = workspaceToEdit.name;

        // Optimistic update with PENDING status
        set({
          workspaces: oldWorkspaces.map((ws) =>
            ws.id === id ? { ...ws, name, status: "PENDING" } : ws
          ),
        });

        if (get().currentWorkspace?.id === id) {
          set({
            currentWorkspace: {
              ...get().currentWorkspace!,
              name,
              status: "PENDING",
            },
          });
        }

        try {
          // // API call
          const userId = useUserStore.getState().userInfo?.userId;
          if (!userId) throw new Error("User not logged in");

          // const response: any = await updateWorkspaceAPI({
          //   workspaceName: oldWorkspaceName,
          //   updatedWorkspaceName: name,
          //   userId: userId,
          // });

          await addPendingOperation({
            id: id,
            type: "UPDATE_WORKSPACE",
            status: "PENDING",
            payload: {
              workspaceName: oldWorkspaceName,
              updatedWorkspaceName: name,
              userId: userId,
            },
            timestamp: Date.now(),
            retryCount: 0,
          });

          // console.log("Response from updateWorkspaceAPI:", response);

          // // Update status to SUCCESS
          // set({
          //   workspaces: get().workspaces.map((ws) =>
          //     ws.id === id ? { ...ws, status: "SUCCESS" } : ws
          //   ),
          // });

          // if (get().currentWorkspace?.id === id) {
          //   set({
          //     currentWorkspace: {
          //       ...get().currentWorkspace!,
          //       status: "SUCCESS",
          //     },
          //   });
          // }

          console.log("✅ Workspace updated:", name);
        } catch (error) {
          console.error("❌ Failed to update workspace:", error);

          // Rollback with FAILED status
          set({
            workspaces: oldWorkspaces.map((ws) =>
              ws.id === id ? { ...ws, status: "FAILED" } : ws
            ),
          });

          if (get().currentWorkspace?.id === id) {
            set({
              currentWorkspace: {
                ...get().currentWorkspace!,
                status: "FAILED",
              },
            });
          }

          alert("Failed to update workspace. Please try again.");
        }
      },

      deleteWorkspace: async (id: string) => {
        const workspace = get().workspaces.find((ws) => ws.id === id);

        if (workspace?.isDefault) {
          alert("Cannot delete default workspace");
          return;
        }

        const oldWorkspaces = get().workspaces;

        const ToBeDeleteWorkspace: Workspace | undefined = oldWorkspaces.find(
          (ws) => ws.id === id
        );
        if (!ToBeDeleteWorkspace) {
          alert("Workspace not found");
          return;
        }

        // Set status to PENDING for potential UI indication of deletion in progress
        ToBeDeleteWorkspace.status = "PENDING";

        // Optimistic update (change UI instantly)
        set({ workspaces: oldWorkspaces.filter((ws) => ws.id !== id) });

        // If the deleted workspace is the current one, switch to default workspace
        if (get().currentWorkspace?.id === id) {
          const defaultWorkspace = get().workspaces.find((ws) => ws.isDefault);
          if (defaultWorkspace) {
            set({ currentWorkspace: defaultWorkspace });
          }
        }

        try {
          const userId = useUserStore.getState().userInfo?.userId;
          if (!userId) throw new Error("User not logged in");

          // // API call
          // const response: any = await deleteWorkspaceAPI({
          //   workspaceName: ToBeDeleteWorkspace.name,
          //   userId: userId,
          // });
          // console.log("Response from deleteWorkspaceAPI:", response);

          // // Check if response indicates success
          // if (response.response !== "Success") {
          //   throw new Error("Failed to delete workspace on server");
          // }

          await addPendingOperation({
            id: id,
            type: "DELETE_WORKSPACE",
            status: "PENDING",
            payload: {
              userId: userId,
              workspaceName: ToBeDeleteWorkspace.name,
            },
            timestamp: Date.now(),
            retryCount: 0,
          });

          console.log("✅ Workspace deleted");
        } catch (error) {
          console.error("❌ Failed to delete workspace:", error);

          // Rollback on error - restore old workspaces
          set({ workspaces: oldWorkspaces });

          // Update status to FAILED for error indication
          ToBeDeleteWorkspace.status = "FAILED";
          alert("Failed to delete workspace. Please try again.");
        }
      },

      setCurrentWorkspace: (workspace: Workspace) => {
        set({ currentWorkspace: workspace });
      },

      initializeDefaultWorkspace: async () => {
        const existingDefault = get().workspaces.find((ws) => ws.isDefault);

        if (!existingDefault) {
          const defaultWorkspace: Workspace = {
            id: "workspace_default",
            name: "Default",
            createdAt: new Date(),
            isDefault: true,
            todos: [],
            goals: [],
            initialNodes: [],
            initialEdges: [],
            status: "PENDING",
          };
          set({
            workspaces: [defaultWorkspace],
            currentWorkspace: defaultWorkspace,
          });

          // API call to create default workspace on server
          try {
            const userId = useUserStore.getState().userInfo?.userId;
            if (!userId) {
              console.error("User not logged in");
              return;
            }

            // const response: any = await createWorkspaceAPI({
            //   workspaceName: "Default",
            //   userId: userId,
            // });

            // console.log("Response from createWorkspaceAPI:", response);

            // if (response?.success === "true") {

            //   // Update with server-generated ID
            //   const serverId = response.workspaceId || defaultWorkspace.id;
            //   set({
            //     workspaces: [
            //       { ...defaultWorkspace, id: serverId, status: "SUCCESS" },
            //     ],
            //     currentWorkspace: {
            //       ...defaultWorkspace,
            //       id: serverId,
            //       status: "SUCCESS",
            //     },
            //   });

            //   console.log("✅ Default workspace created on server");
            // } else if (response?.response?.includes("already exists")) {
            //   // Workspace already exists on server, fetch it
            //   console.log("Workspace already exists, fetching from server...");
            //   try {
            //     const getUserWorkspaceApi = (
            //       await import("../api/getUserWorkspaceApi")
            //     ).default;
            //     const workspacesResponse: any = await getUserWorkspaceApi(
            //       userId
            //     );
            //     if (workspacesResponse && workspacesResponse.length > 0) {
            //       const serverWorkspaces = workspacesResponse.map(
            //         (ws: any) => ({
            //           id: ws._id,
            //           name: ws.workspaceName,
            //           status: "SUCCESS",
            //           isDefault: ws.workspaceName === "Default Workspace",
            //           createdAt: new Date(ws.createdAt || Date.now()),
            //           todos: ws.todos || [],
            //           goals: ws.goals || [],
            //           initialNodes: ws.initialNodes || [],
            //           initialEdges: ws.initialEdges || [],
            //         })
            //       );

            //       set({ workspaces: serverWorkspaces });
            //       const defaultWs = serverWorkspaces.find(
            //         (ws: Workspace) => ws.isDefault
            //       );
            //       set({ currentWorkspace: defaultWs || serverWorkspaces[0] });
            //       console.log("✅ Fetched existing workspaces from server");
            //     }
            //   } catch (fetchError) {
            //     console.error(
            //       "Failed to fetch existing workspaces:",
            //       fetchError
            //     );
            //   }
            // }

            await addPendingOperation({
              id: `create_workspace_${Date.now()}`,
              type: "CREATE_WORKSPACE",
              status: "PENDING",
              payload: {
                workspaceName: "Default",
                userId: userId,
                tempId: defaultWorkspace.id,
              },
              timestamp: Date.now(),
              retryCount: 0,
            });

            console.log("✅ Default workspace creation queued");
          } catch (error) {
            console.error("❌ Failed to create default workspace:", error);
            // Keep the optimistic update even if API fails
            set({
              workspaces: [{ ...defaultWorkspace, status: "FAILED" }],
              currentWorkspace: { ...defaultWorkspace, status: "FAILED" },
            });
          }
        } else if (!get().currentWorkspace) {
          set({ currentWorkspace: existingDefault });
        }
      },

      // ============= TODO ACTIONS =============
      addTodo: async (data: CreateTaskReq) => {
        // const tempId = `todo_${Date.now()}`;
        // const newTodo: Todo = {
        //   ...todo,
        //   id: tempId,
        //   workspaceId,
        //   createdAt: new Date(),
        // };

        // const oldWorkspaces = get().workspaces;

        // // Optimistic update
        // set({
        //   workspaces: oldWorkspaces.map((ws) =>
        //     ws.id === workspaceId
        //       ? { ...ws, todos: [...ws.todos, newTodo] }
        //       : ws
        //   ),
        // });

        // if (get().currentWorkspace?.id === workspaceId) {
        //   set({
        //     currentWorkspace: {
        //       ...get().currentWorkspace!,
        //       todos: [...get().currentWorkspace!.todos, newTodo],
        //     },
        //   });
        // }

        // need to change the current workspace's insides todo
        // need to change the workspaces array's inside todo array
        const workspaceId = data.workspaceId;
        const taskName = data.text;
        const priority = data?.priority;
        const tempId = `todo_${Date.now()}`;
        const userId = data.userId;

        const todo: CreateTaskReq = {
          id: tempId,
          text: taskName,
          priority: priority,
          createdAt: new Date(),
          workspaceId: workspaceId,
          userId: userId,
          status: "PENDING",
        };

        // Optimistic update (immutable) — update both workspaces and currentWorkspace once
        set((state) => {
          const updatedWorkspaces = state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? { ...ws, todos: [...(ws.todos || []), todo] }
              : ws
          );

          const updatedCurrent =
            state.currentWorkspace?.id === workspaceId
              ? {
                  ...state.currentWorkspace!,
                  todos: [...(state.currentWorkspace!.todos || []), todo],
                }
              : state.currentWorkspace;

          return {
            workspaces: updatedWorkspaces,
            currentWorkspace: updatedCurrent,
          };
        });

        await addPendingOperation({
          id: `CREATE_TODO_${tempId}`,
          type: "CREATE_TODO",
          status: "PENDING",
          payload: {
            ...todo,
          },
          timestamp: Date.now(),
          retryCount: 0,
        });

        // try {
        //   // API call
        //   // const response = await createTodoAPI({ ...newTodo, workspaceId });
        //   console.log("✅ Todo created:", todo.text);
        // } catch (error) {
        //   console.error("❌ Failed to create todo:", error);
        //   set({ workspaces: oldWorkspaces });
        //   alert("Failed to create todo. Please try again.");
        // }
      },

      updateTodo: async (
        workspaceId: string,
        todoId: string,
        updates: Partial<Todo>
      ) => {
        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  todos: ws.todos.map((t) =>
                    t.id === todoId ? { ...t, ...updates } : t
                  ),
                }
              : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(
            (ws) => ws.id === workspaceId
          );
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          const task = updates.text || "";
          if (!task) throw new Error("Task text cannot be empty");
          const priority = updates.priority || "low";
          if (!priority) throw new Error("Priority cannot be empty");
          if (!todoId) throw new Error("Todo ID is required");

          // Add to pending operations for background processing
          await addPendingOperation({
            id: `UPDATE_TODO_${Date.now()}`,
            type: "UPDATE_TODO",
            status: "PENDING",
            payload: {
              id: todoId,
              task,
              priority,
            },
            timestamp: Date.now(),
            retryCount: 0,
          });
          // all good

          console.log("✅ Todo updated");
        } catch (error) {
          console.error("❌ Failed to update todo:", error);
          set({ workspaces: oldWorkspaces });
          alert("Failed to update todo. Please try again.");
        }
      },

      deleteTodo: async (workspaceId: string, todoId: string) => {
        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map((ws) =>
            ws.id === workspaceId
              ? { ...ws, todos: ws.todos.filter((t) => t.id !== todoId) }
              : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(
            (ws) => ws.id === workspaceId
          );
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          // API call
          // await deleteTodoAPI({ todoId });
          await addPendingOperation({
            id: `DELETE_TODO_${Date.now()}`,
            type: "DELETE_TODO",
            status: "PENDING",
            payload: {
              id: todoId,
            },
            timestamp: Date.now(),
            retryCount: 0,
          });

          // else all good

          console.log("✅ Todo deleted");
        } catch (error) {
          console.error("❌ Failed to delete todo:", error);
          set({ workspaces: oldWorkspaces });
          alert("Failed to delete todo. Please try again.");
        }
      },

      toggleTodoCompleted: async (
        toggle: string,
        todoId: string,
        userId: string
      ) => {
        const oldWorkspaces = get().workspaces;

        // Find the workspace containing this todo
        const foundWs = oldWorkspaces.find((ws) =>
          ws.todos.some((t) => t.id === todoId)
        );
        const workspaceId = foundWs?.id;
        if (!workspaceId) {
          console.error("Workspace not found for todo", todoId);
          return;
        }

        // Determine new completed/status based on toggle string
        const willComplete = toggle === "completed";

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  todos: ws.todos.map((t) =>
                    t.id === todoId
                      ? {
                          ...t,
                          completed: willComplete,
                          status: willComplete ? "completed" : "not-started",
                        }
                      : t
                  ),
                }
              : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(
            (ws) => ws.id === workspaceId
          );
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          // const apiRes: any = await toggleTodoApi({ id: todoId, toggle, userId });
          // // Backend returns { response: "true" } on success
          // if (apiRes?.response !== "true") {
          //   throw new Error("Failed to toggle todo on server");
          // }
          // console.log("✅ Todo toggled");

          await addPendingOperation({
            id: `toggle_todo_${Date.now}`,
            type: "TOGGLE_TODO",
            status: "PENDING",
            payload: {
              id: todoId,
              toggle,
              userId,
            },
            timestamp: Date.now(),
            retryCount: 0,
          });
          console.log("✅ Todo toggle queued");
        } catch (error) {
          console.error("❌ Failed to toggle todo:", error);
          // Rollback
          set({ workspaces: oldWorkspaces });
          if (get().currentWorkspace?.id === workspaceId) {
            const original = oldWorkspaces.find((ws) => ws.id === workspaceId);
            if (original) set({ currentWorkspace: original });
          }
          alert("Failed to toggle todo. Please try again.");
        }
      },

      // ============= GOAL ACTIONS =============
      addGoal: async (
        workspaceId: string,
        goal: Omit<Goal, "id" | "createdAt" | "workspaceId">
      ) => {
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
          workspaces: oldWorkspaces.map((ws) =>
            ws.id === workspaceId
              ? { ...ws, goals: [...ws.goals, newGoal] }
              : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          set({
            currentWorkspace: {
              ...get().currentWorkspace!,
              goals: [...get().currentWorkspace!.goals, newGoal],
            },
          });
        }

        try {
          // API call
          // const response = await createGoalAPI({ ...newGoal, workspaceId });
          console.log("✅ Goal created:", goal.title);
        } catch (error) {
          console.error("❌ Failed to create goal:", error);
          set({ workspaces: oldWorkspaces });
          alert("Failed to create goal. Please try again.");
        }
      },

      updateGoal: async (
        workspaceId: string,
        goalId: string,
        updates: Partial<Goal>
      ) => {
        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  goals: ws.goals.map((g) =>
                    g.id === goalId ? { ...g, ...updates } : g
                  ),
                }
              : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(
            (ws) => ws.id === workspaceId
          );
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          // API call
          // await updateGoalAPI({ goalId, ...updates });
          console.log("✅ Goal updated");
        } catch (error) {
          console.error("❌ Failed to update goal:", error);
          set({ workspaces: oldWorkspaces });
          alert("Failed to update goal. Please try again.");
        }
      },

      deleteGoal: async (workspaceId: string, goalId: string) => {
        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map((ws) =>
            ws.id === workspaceId
              ? { ...ws, goals: ws.goals.filter((g) => g.id !== goalId) }
              : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(
            (ws) => ws.id === workspaceId
          );
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          // API call
          // await deleteGoalAPI({ goalId });
          console.log("✅ Goal deleted");
        } catch (error) {
          console.error("❌ Failed to delete goal:", error);
          set({ workspaces: oldWorkspaces });
          alert("Failed to delete goal. Please try again.");
        }
      },

      toggleGoalCompleted: async (workspaceId: string, goalId: string) => {
        const workspace = get().workspaces.find((ws) => ws.id === workspaceId);
        const goal = workspace?.goals.find((g) => g.id === goalId);
        if (!goal) return;

        const oldWorkspaces = get().workspaces;

        // Optimistic update
        set({
          workspaces: oldWorkspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  goals: ws.goals.map((g) =>
                    g.id === goalId ? { ...g, completed: !g.completed } : g
                  ),
                }
              : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          const updatedWorkspace = get().workspaces.find(
            (ws) => ws.id === workspaceId
          );
          if (updatedWorkspace) set({ currentWorkspace: updatedWorkspace });
        }

        try {
          // API call
          // await updateGoalAPI({ goalId, completed: !goal.completed });
          console.log("✅ Goal toggled");
        } catch (error) {
          console.error("❌ Failed to toggle goal:", error);
          set({ workspaces: oldWorkspaces });
          alert("Failed to toggle goal. Please try again.");
        }
      },

      // ============= REACTFLOW ACTIONS (No API, just local state) =============
      updateNodes: (workspaceId: string, nodes: FlowNode[]) => {
        set({
          workspaces: get().workspaces.map((ws) =>
            ws.id === workspaceId ? { ...ws, initialNodes: nodes } : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          set({
            currentWorkspace: {
              ...get().currentWorkspace!,
              initialNodes: nodes,
            },
          });
        }
      },

      updateEdges: (workspaceId: string, edges: FlowEdge[]) => {
        set({
          workspaces: get().workspaces.map((ws) =>
            ws.id === workspaceId ? { ...ws, initialEdges: edges } : ws
          ),
        });

        if (get().currentWorkspace?.id === workspaceId) {
          set({
            currentWorkspace: {
              ...get().currentWorkspace!,
              initialEdges: edges,
            },
          });
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
