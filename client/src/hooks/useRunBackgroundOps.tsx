import { getPendingOperations, addPendingOperation, removePendingOperation } from "../store/indexDB/pendingOps/usePendingOps";
import createWorkspaceAPI from "../api/createWorkspaceApi";
import updateWorkspaceAPI from "../api/updateWorkspaceApi";
import useWorkspaceStore from "../store/useWorkspaceStore";
import deleteWorkspaceAPI from "../api/deleteWorkspaceApi";
import createTaskApi from "../api/createTaskApi";

const pendingOps = async () => {
    const ops = await getPendingOperations();
    console.log("Pending Operations fetched:", ops);

    for (let op of ops) {
        if (op.type === "CREATE_WORKSPACE" && op.status === "PENDING") {
            // call create workspace API
            try {
                const response: any = await createWorkspaceAPI(op.payload);
                
                if (response?.response.success !== "true") {
                    throw new Error("Failed to create workspace on server");
                }

                // Extract the workspace ID from server response
                const workspaceIdFromServer = response.response.workspaceId;
                console.log("Response from createWorkspaceAPI:", response);

                // Update workspace ID with the one from server and set status to SUCCESS
                const currentWorkspaces = useWorkspaceStore.getState().workspaces;
                const updatedWorkspaces = currentWorkspaces.map((ws) =>
                    ws.id === op.payload.tempId
                        ? { ...ws, id: workspaceIdFromServer, status: "SUCCESS" }
                        : ws
                );

                // Update the store with new workspace ID and status
                useWorkspaceStore.setState({ workspaces: updatedWorkspaces });

                // If this was the current workspace, update it too
                const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
                if (currentWorkspace?.id === op.payload.tempId) {
                    const updatedCurrentWorkspace = updatedWorkspaces.find(
                        (ws) => ws.id === workspaceIdFromServer
                    );
                    if (updatedCurrentWorkspace) {
                        useWorkspaceStore.setState({
                            currentWorkspace: updatedCurrentWorkspace,
                        });
                    }
                }

                // If successful, remove from pending operations
                await removePendingOperation(op.id);
                
            } catch(error) {
                console.error("Error processing pending operation:", error);
                
                // Increment retry count
                op.retryCount += 1;
                
                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (op.retryCount >= 3) {
                    console.error("Max retry count reached for operation:", op.id);
                    
                    // Update workspace status to FAILED in store
                    const currentWorkspaces = useWorkspaceStore.getState().workspaces;
                    const updatedWorkspaces = currentWorkspaces.map((ws) =>
                        ws.id === op.payload.tempId
                            ? { ...ws, status: "FAILED" }
                            : ws
                    );
                    useWorkspaceStore.setState({ workspaces: updatedWorkspaces });
                    
                    // Remove from pending operations
                    await removePendingOperation(op.id);
                } else {
                    // Update the retry count in pending operations
                    await addPendingOperation(op);
                }
                continue; // skip to next operation
            }
        }   
        else if (op.type === "UPDATE_WORKSPACE" && op.status === "PENDING") {
            try {
                const response: any = await updateWorkspaceAPI(op.payload);
                console.log("Update Workspace API response:", response?.response);

                if (response?.response !== "Success") {
                    // if not success status change to failed
                    throw new Error("Failed to update workspace on server");
                }

                console.log("Response from updateWorkspaceAPI:", response);

                // if success update status to success
                const currentWorkspaces = useWorkspaceStore.getState().workspaces;
                const updatedWorkspaces = currentWorkspaces.map((ws) =>
                    ws.id === op.id
                        ? { ...ws, name: op.payload.updatedWorkspaceName, status: "SUCCESS" }
                        : ws
                );

                // Update the store with new workspace name and status
                useWorkspaceStore.getState().setWorkspace(updatedWorkspaces);

                // If this was the current workspace, update it too
                const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
                if (currentWorkspace?.id === op.id) {
                    const updatedCurrentWorkspace = updatedWorkspaces.find(
                        (ws) => ws.id === op.id
                    );
                    if (updatedCurrentWorkspace) {
                        useWorkspaceStore.setState({
                            currentWorkspace: updatedCurrentWorkspace,
                        });
                    }
                }

                // Remove from pending operations after success
                await removePendingOperation(op.id);
            }
           catch(error) {
                console.error("Error processing pending operation:", error);
                
                // Increment retry count
                op.retryCount += 1;
                
                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (op.retryCount >= 3) {
                    console.error("Max retry count reached for operation:", op.id);
                    
                    // Update workspace status to FAILED in store
                    const currentWorkspaces = useWorkspaceStore.getState().workspaces;
                    const updatedWorkspaces = currentWorkspaces.map((ws) =>
                        ws.id === op.id
                            ? { ...ws, status: "FAILED" }
                            : ws
                    );
                    useWorkspaceStore.setState({ workspaces: updatedWorkspaces });
                    
                    // Remove from pending operations
                    await removePendingOperation(op.id);
                } else {
                    // Update the retry count in pending operations
                    await addPendingOperation(op);
                }
                continue; // skip to next operation
            }
        }
        else if (op.type === "DELETE_WORKSPACE" && op.status === "PENDING") {
            try {
                const response: any = await deleteWorkspaceAPI(op.payload);
                console.log("Delete Workspace API response:", response);

                if (response?.response !== "Success") {
                    throw new Error("Failed to delete workspace on server");
                }

                console.log("Response from deleteWorkspaceAPI:", response);
                // if success remove workspace from store 
            }
            catch(error) {
                console.error("Error processing pending operation:", error);
                // Increment retry count
                op.retryCount += 1;

                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (op.retryCount >= 3) {
                    console.error("Max retry count reached for operation:", op.id);
                    // Remove from pending operations
                    await removePendingOperation(op.id);
                } else {
                    // Update the retry count in pending operations
                    await addPendingOperation(op);
                }

                continue; // skip to next operation
            }
        }
        else if (op.type === "CREATE_TODO" && op.status === "PENDING") {
            try {
                const response: any = await createTaskApi(op.payload);
                console.log("Create Task API response:", response);

                if (response?.success !== "true") {
                    throw new Error("Failed to create task on server");
                }

                const serverTodo = response.response;
                const newId = serverTodo?._id;
                const workspaceId = op.payload.workspaceId;
                const tempId = op.payload.id; // we stored optimistic todo under this id

                // Update workspaces array
                const allWorkspaces = useWorkspaceStore.getState().workspaces;
                const updatedWorkspaces = allWorkspaces.map(ws => ws.id === workspaceId ? {
                    ...ws,
                    todos: ws.todos.map(t => t.id === tempId ? { ...t, id: newId || t.id, status: "SUCCESS" } : t)
                } : ws);
                useWorkspaceStore.setState({ workspaces: updatedWorkspaces });

                // Update currentWorkspace if applicable
                const cw = useWorkspaceStore.getState().currentWorkspace;
                if (cw?.id === workspaceId) {
                    const updatedCw = updatedWorkspaces.find(w => w.id === workspaceId);
                    if (updatedCw) {
                        useWorkspaceStore.setState({ currentWorkspace: updatedCw });
                    }
                }

                await removePendingOperation(op.id);
            } catch (error) {
                console.error("Error processing pending operation:", error);
                op.retryCount += 1;
                if (op.retryCount >= 3) {
                    console.error("Max retry count reached for operation:", op.id);

                    const workspaceId = op.payload.workspaceId;
                    const tempId = op.payload.id;
                    const allWorkspaces = useWorkspaceStore.getState().workspaces;
                    const updatedWorkspaces = allWorkspaces.map(ws => ws.id === workspaceId ? {
                        ...ws,
                        todos: ws.todos.map(t => t.id === tempId ? { ...t, status: "FAILED" } : t)
                    } : ws);
                    useWorkspaceStore.setState({ workspaces: updatedWorkspaces });
                    const cw = useWorkspaceStore.getState().currentWorkspace;
                    if (cw?.id === workspaceId) {
                        const updatedCw = updatedWorkspaces.find(w => w.id === workspaceId);
                        if (updatedCw) useWorkspaceStore.setState({ currentWorkspace: updatedCw });
                    }

                    await removePendingOperation(op.id);
                } else {
                    await addPendingOperation(op);
                }
            }
        }
    }
}

export default pendingOps;