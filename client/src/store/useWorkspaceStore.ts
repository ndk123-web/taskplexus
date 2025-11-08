import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Workspace {
  id: string;
  name: string;
  createdAt: Date;
  isDefault?: boolean;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  
  // Actions
  addWorkspace: (name: string) => void;
  editWorkspace: (id: string, name: string) => void;
  deleteWorkspace: (id: string) => void;
  setCurrentWorkspace: (workspace: Workspace) => void;
  initializeDefaultWorkspace: () => void;
}

const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspace: null,

      addWorkspace: (name: string) => {
        const newWorkspace: Workspace = {
          id: `workspace_${Date.now()}`,
          name,
          createdAt: new Date(),
          isDefault: false,
        };
        set({ workspaces: [...get().workspaces, newWorkspace] });
      },

      editWorkspace: (id: string, name: string) => {
        set({
          workspaces: get().workspaces.map((ws) =>
            ws.id === id ? { ...ws, name } : ws
          ),
        });
        
        // Update current workspace if it's being edited
        if (get().currentWorkspace?.id === id) {
          set({ currentWorkspace: { ...get().currentWorkspace!, name } });
        }
      },

      deleteWorkspace: (id: string) => {
        const workspace = get().workspaces.find(ws => ws.id === id);
        
        // Don't delete default workspace
        if (workspace?.isDefault) {
          return;
        }
        
        set({ workspaces: get().workspaces.filter((ws) => ws.id !== id) });
        
        // If deleted workspace was current, switch to default
        if (get().currentWorkspace?.id === id) {
          const defaultWorkspace = get().workspaces.find(ws => ws.isDefault);
          if (defaultWorkspace) {
            set({ currentWorkspace: defaultWorkspace });
          }
        }
      },

      setCurrentWorkspace: (workspace: Workspace) => {
        set({ currentWorkspace: workspace });
      },

      initializeDefaultWorkspace: () => {
        const existingDefault = get().workspaces.find(ws => ws.isDefault);
        
        if (!existingDefault) {
          const defaultWorkspace: Workspace = {
            id: 'workspace_default',
            name: 'Personal',
            createdAt: new Date(),
            isDefault: true,
          };
          
          set({ 
            workspaces: [defaultWorkspace, ...get().workspaces],
            currentWorkspace: defaultWorkspace 
          });
        } else if (!get().currentWorkspace) {
          set({ currentWorkspace: existingDefault });
        }
      },
    }),
    {
      name: "workspace-storage",
    }
  )
);

export default useWorkspaceStore;
