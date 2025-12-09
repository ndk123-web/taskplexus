import { getPendingOperations, addPendingOperation, removePendingOperation } from "../store/indexDB/pendingOps/usePendingOps";
import createWorkspaceAPI from "../api/endpoints/createWorkspaceApi";
import updateWorkspaceAPI from "../api/endpoints/updateWorkspaceApi";
import useWorkspaceStore from "../store/useWorkspaceStore";
import deleteWorkspaceAPI from "../api/endpoints/deleteWorkspaceApi";
import createTaskApi from "../api/endpoints/createTaskApi";
import toggleTodoApi from "../api/endpoints/toggleTaskApi";
import updateTaskApi from "../api/endpoints/updateTaskApi";
import deleteTaskApi from "../api/endpoints/deleteTaskApi";
import addGoalApi from "../api/endpoints/addGoalApi";
import incrementGoalApi from "../api/endpoints/incrementGoalApi";
import decrementGoalApi from "../api/endpoints/decrementGoalApi";
import editGoalApi from "../api/endpoints/editGoalApi";



const pendingOps = async () => {
    const ops = await getPendingOperations();
    console.log("Pending Operations fetched:", ops);

    for (let op = 0 ; op < ops.length; op++) {
        if (ops[op].type === "CREATE_WORKSPACE" && ops[op].status === "PENDING") {
            // call create workspace API
            try {
                const response: any = await createWorkspaceAPI(ops[op].payload);
                
                if (response?.response.success !== "true") {
                    throw new Error("Failed to create workspace on server");
                }

                // Extract the workspace ID from server response
                const workspaceIdFromServer = response.response.workspaceId;
                console.log("Response from createWorkspaceAPI:", response);

                // Update workspace ID with the one from server and set status to SUCCESS
                const currentWorkspaces = useWorkspaceStore.getState().workspaces;
                const updatedWorkspaces = currentWorkspaces.map((ws) =>
                    ws.id === ops[op].payload.tempId
                        ? { ...ws, id: workspaceIdFromServer, status: "SUCCESS" }
                        : ws
                );

                // Update the store with new workspace ID and status
                useWorkspaceStore.setState({ workspaces: updatedWorkspaces });

                // If this was the current workspace, update it too
                const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
                if (currentWorkspace?.id === ops[op].payload.tempId) {
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
                await removePendingOperation(ops[op].id);
                
            } catch(error) {
                console.error("Error processing pending operation:", error);
                
                // Increment retry count
                ops[op].retryCount += 1;
                
                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (ops[op].retryCount >= 3) {
                    console.error("Max retry count reached for operation:", ops[op].id);
                    
                    // Update workspace status to FAILED in store
                    const currentWorkspaces = useWorkspaceStore.getState().workspaces;
                    const updatedWorkspaces = currentWorkspaces.map((ws) =>
                        ws.id === ops[op].payload.tempId
                            ? { ...ws, status: "FAILED" }
                            : ws
                    );
                    useWorkspaceStore.setState({ workspaces: updatedWorkspaces });
                    
                    // Remove from pending operations
                    await removePendingOperation(ops[op].id);
                } else {
                    // Update the retry count in pending operations
                    await addPendingOperation(ops[op]);
                }
                continue; // skip to next operation
            }
        }   
        else if (ops[op].type === "UPDATE_WORKSPACE" && ops[op].status === "PENDING") {
            try {
                const response: any = await updateWorkspaceAPI(ops[op].payload);
                console.log("Update Workspace API response:", response?.response);

                if (response?.response !== "Success") {
                    // if not success status change to failed
                    throw new Error("Failed to update workspace on server");
                }

                console.log("Response from updateWorkspaceAPI:", response);

                // if success update status to success
                const currentWorkspaces = useWorkspaceStore.getState().workspaces;
                const updatedWorkspaces = currentWorkspaces.map((ws) =>
                    ws.id === ops[op].id
                        ? { ...ws, name: ops[op].payload.updatedWorkspaceName, status: "SUCCESS" }
                        : ws
                );

                // Update the store with new workspace name and status
                useWorkspaceStore.getState().setWorkspace(updatedWorkspaces);

                // If this was the current workspace, update it too
                const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
                if (currentWorkspace?.id === ops[op].id) {
                    const updatedCurrentWorkspace = updatedWorkspaces.find(
                        (ws) => ws.id === ops[op].id
                    );
                    if (updatedCurrentWorkspace) {
                        useWorkspaceStore.setState({
                            currentWorkspace: updatedCurrentWorkspace,
                        });
                    }
                }

                // Remove from pending operations after success
                await removePendingOperation(ops[op].id);
            }
           catch(error) {
                console.error("Error processing pending operation:", error);
                
                // Increment retry count
                ops[op].retryCount += 1;
                
                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (ops[op].retryCount >= 3) {
                    console.error("Max retry count reached for operation:", ops[op].id);
                    
                    // Update workspace status to FAILED in store
                    const currentWorkspaces = useWorkspaceStore.getState().workspaces;
                    const updatedWorkspaces = currentWorkspaces.map((ws) =>
                        ws.id === ops[op].id
                            ? { ...ws, status: "FAILED" }
                            : ws
                    );
                    useWorkspaceStore.setState({ workspaces: updatedWorkspaces });
                    
                    // Remove from pending operations
                    await removePendingOperation(ops[op].id);
                } else {
                    // Update the retry count in pending operations
                    await addPendingOperation(ops[op]);
                }
                continue; // skip to next operation
            }
        }
        else if (ops[op].type === "DELETE_WORKSPACE" && ops[op].status === "PENDING") {
            try {
                const response: any = await deleteWorkspaceAPI(ops[op].payload);
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
                ops[op].retryCount += 1;

                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (ops[op].retryCount >= 3) {
                    console.error("Max retry count reached for operation:", ops[op].id);
                    // Remove from pending operations
                    await removePendingOperation(ops[op].id);
                } else {
                    // Update the retry count in pending operations
                    await addPendingOperation(ops[op]);
                }

                continue; // skip to next operation
            }
        }
        else if (ops[op].type === "CREATE_TODO" && ops[op].status === "PENDING") {
            try {
                const response: any = await createTaskApi(ops[op].payload);
                console.log("Create Task API response:", response);

                if (response?.success !== "true") {
                    throw new Error("Failed to create task on server");
                }

                const serverTodo = response.response;
                const newId = serverTodo?._id;
                const workspaceId = ops[op].payload.workspaceId;
                const tempId = ops[op].payload.id; // we stored optimistic todo under this id

                // Update workspaces array (replace tempId with server id and dedupe by id)
                const allWorkspaces = useWorkspaceStore.getState().workspaces;
                const updatedWorkspaces = allWorkspaces.map(ws => {
                    if (ws.id !== workspaceId) return ws;
                    const replaced = ws.todos.map(t =>
                        t.id === tempId ? { ...t, id: newId || t.id, status: "SUCCESS" } : t
                    );
                    const seen = new Set<string>();
                    const deduped = replaced.filter(t => {
                        const key = String(t.id);
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });
                    return { ...ws, todos: deduped };
                });
                useWorkspaceStore.setState({ workspaces: updatedWorkspaces });

                // Update currentWorkspace if applicable
                const cw = useWorkspaceStore.getState().currentWorkspace;
                if (cw?.id === workspaceId) {
                    const updatedCw = updatedWorkspaces.find(w => w.id === workspaceId);
                    if (updatedCw) {
                        useWorkspaceStore.setState({ currentWorkspace: updatedCw });
                    }
                }

                await removePendingOperation(ops[op].id);
            } catch (error) {
                console.error("Error processing pending operation:", error);
                ops[op].retryCount += 1;
                if (ops[op].retryCount >= 3) {
                    console.error("Max retry count reached for operation:", ops[op].id);

                    const workspaceId = ops[op].payload.workspaceId;
                    const tempId = ops[op].payload.id;
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

                    await removePendingOperation(ops[op].id);
                } else {
                    await addPendingOperation(ops[op]);
                }
            }
        }
        else if (ops[op].type === "TOGGLE_TODO" && ops[op].status === "PENDING") {
            try {
                const apiRes: any = await toggleTodoApi(ops[op].payload);
                // Backend returns { response: "true" } on success
    
                if (apiRes?.response !== "true") {
                    throw new Error("Failed to toggle todo on server");
                }
    
                console.log("✅ Todo toggled");
                
                // if success remove from pending operations
                await removePendingOperation(ops[op].id);
            }
            catch(error) {
                console.error("Error processing pending operation:", error);
                ops[op].retryCount += 1;
                if (ops[op].retryCount >= 3) {
                    console.error("Max retry count reached for operation:", ops[op].id);
                    await removePendingOperation(ops[op].id);
                } else {
                    await addPendingOperation(ops[op]);
                }
                continue; // skip to next operation
            }
        }
        else if (ops[op].type === "UPDATE_TODO" && ops[op].status === "PENDING") {
            try {
                 // API call
                const response: any = await updateTaskApi(ops[op].payload)
                console.log("Update Task API response:", response);

                if (response.success !== "true") {
                    throw new Error("Failed to update task on server");
                }
                console.log("Response from updateTaskApi:", response);

                // if success remove from pending operations
                await removePendingOperation(ops[op].id);
            }
            catch(error) {
                console.error("Error processing pending operation:", error);
                // Increment retry count
                ops[op].retryCount += 1;
                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (ops[op].retryCount >= 3) {
                    console.error("Max retry count reached for operation:", ops[op].id);
                    // Remove from pending operations
                    await removePendingOperation(ops[op].id);
                } else {
                    // Update the retry count in pending operations
                    await addPendingOperation(ops[op]);
                }
            }        
        }
        else if (ops[op].type === "DELETE_TODO" && ops[op].status === "PENDING") {
            try {
                const response: any = await deleteTaskApi(ops[op].payload);
                console.log("Response from deleteTaskApi:", response);

                if (response?.success !== "true") {
                    throw new Error("Failed to delete todo on server");
                }
                // if success remove from pending operations
                await removePendingOperation(ops[op].id);
            }
            catch(error) {
                console.error("Error processing pending operation:", error);
                // Increment retry count
                ops[op].retryCount += 1;
                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (ops[op].retryCount >= 3) {
                    console.error("Max retry count reached for operation:", ops[op].id);
                    // Remove from pending operations
                    await removePendingOperation(ops[op].id);
                } else {
                    // Update the retry count in pending operations
                    await addPendingOperation(ops[op]);
                }
            }
        }
        else if (ops[op].type === "ADD_GOAL" && ops[op].status === "PENDING") {
            try {
                const response: any = await addGoalApi(ops[op].payload)
                
                console.log("Response from addGoalApi:", response);
                
                if (response?.success !== "true") {
                    throw new Error("Failed to add goal on server");
                }
                console.log("✅ Goal added");
                
                // if success remove from pending operations
                await removePendingOperation(ops[op].id);

                // replace id with server id and update status to success in store
                const newId = response?.response?._id;
                const workspaceId = ops[op].payload.workspaceId;
                const tempId = ops[op].payload.id; // we stored optimistic goal under this id
                const allWorkspaces = useWorkspaceStore.getState().workspaces;
                const updatedWorkspaces = allWorkspaces.map(ws => {
                    if (ws.id !== workspaceId) return ws;
                    const replaced = ws.goals.map(g =>
                        g.id === tempId ? { ...g, id: newId || g.id, status: "SUCCESS" } : g
                    );
                    const seen = new Set<string>();
                    const deduped = replaced.filter(g => {
                        const key = String(g.id);
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });
                    return { ...ws, goals: deduped };
                });
                useWorkspaceStore.setState({ workspaces: updatedWorkspaces });

                // Update currentWorkspace if applicable
                const cw = useWorkspaceStore.getState().currentWorkspace;
                if (cw?.id === workspaceId) {
                    const updatedCw = updatedWorkspaces.find(w => w.id === workspaceId);
                    if (updatedCw) {
                        useWorkspaceStore.setState({ currentWorkspace: updatedCw });
                    }
                }
            }
            catch(error){
                console.error("Error processing pending operation:", error);
                // Increment retry count
                ops[op].retryCount += 1;
                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (ops[op].retryCount >= 3) {
                    console.error("Max retry count reached for operation:", ops[op].id);
                    // Remove from pending operations
                    await removePendingOperation(ops[op].id);
                } else {
                    // Update the retry count in pending operations
                    await addPendingOperation(ops[op]);
                }
            }
        }
        else if (ops[op].type === "INCREMENT_GOAL" && ops[op].status === "PENDING") {
            console.log("Processing INCREMENT_GOAL operation for goalId:", ops[op].payload.goalId);

            // Count all remaining increment operations for the same goalId
            let batchCount = 1; // Current operation
            let opsToRemove = [ops[op].id]; // IDs to remove after successful batch
            
            // Look for more operations with the same goalId after current index
            for (let i = op + 1; i < ops.length; i++) {
                if (ops[i].type === "INCREMENT_GOAL" && 
                    ops[i].status === "PENDING" && 
                    ops[i].payload.goalId === ops[op].payload.goalId) {
                    batchCount++;
                    opsToRemove.push(ops[i].id);
                }
            }

            console.log(`Batching ${batchCount} increment operations for goalId: ${ops[op].payload.goalId}`);

            try {
                const response : any = await incrementGoalApi({
                    goalId: ops[op].payload.goalId, 
                    count: String(batchCount)
                });
                console.log("Response from incrementGoalApi:", response);
                console.log("Batch Count:", batchCount);
                
                if (response?.success !== "true") {
                    console.error("Failed to increment goal on server");
                    continue; // skip to next operation
                }

                console.log("✅ Goal incremented successfully");
                
                // Remove all batched operations from pending
                for (const opId of opsToRemove) {
                    await removePendingOperation(opId);
                }
                
                // Skip processed operations in the loop
                let skipCount = 0;
                for (let i = op + 1; i < ops.length; i++) {
                    if (ops[i].type === "INCREMENT_GOAL" && 
                        ops[i].status === "PENDING" && 
                        ops[i].payload.goalId === ops[op].payload.goalId) {
                        skipCount++;
                    } else {
                        break;
                    }
                }
                op += skipCount; // Skip the processed operations
                
            }
            catch(error) {
                console.error("Error processing pending operation:", error);
                // Increment retry count
                ops[op].retryCount += 1;
                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (ops[op].retryCount >= 3) {
                    console.error("Max retry count reached for operation:", ops[op].id);
                    // Remove from pending operations
                    await removePendingOperation(ops[op].id);
                } else {
                    // Update the retry count in pending operations
                    await addPendingOperation(ops[op]);
                }
            }

        }
        else if (ops[op].type === "DECREMENT_GOAL" && ops[op].status === "PENDING") {
            console.log("Processing DECREMENT_GOAL operation for goalId:", ops[op].payload.goalId);

            // Count all remaining decrement operations for the same goalId
            let batchCount = 1; // Current operation
            let opsToRemove = [ops[op].id]; // IDs to remove after successful batch
            
            // Look for more operations with the same goalId after current index
            for (let i = op + 1; i < ops.length; i++) {
                if (ops[i].type === "DECREMENT_GOAL" && 
                    ops[i].status === "PENDING" && 
                    ops[i].payload.goalId === ops[op].payload.goalId) {
                    batchCount++;
                    opsToRemove.push(ops[i].id);
                }
            }

            console.log(`Batching ${batchCount} decrement operations for goalId: ${ops[op].payload.goalId}`);

            try {
                const response : any = await decrementGoalApi({
                    goalId: ops[op].payload.goalId, 
                    count: String(batchCount)
                });
                console.log("Response from decrementGoalApi:", response);
                console.log("Batch Count:", batchCount);

                if (response?.success !== "true") {
                    console.error("Failed to decrement goal on server");
                    continue; // skip to next operation
                }
                console.log("✅ Goal decremented successfully");
                
                // Remove all batched operations from pending
                for (const opId of opsToRemove) {
                    await removePendingOperation(opId);
                }
                
                // Skip processed operations in the loop
                let skipCount = 0;
                for (let i = op + 1; i < ops.length; i++) {
                    if (ops[i].type === "DECREMENT_GOAL" && 
                        ops[i].status === "PENDING" && 
                        ops[i].payload.goalId === ops[op].payload.goalId) {
                        skipCount++;
                    } else {
                        break;
                    }
                }
                op += skipCount; // Skip the processed operations
                
            }
            catch(error) {
                console.error("Error processing pending operation:", error);
                // Increment retry count
                ops[op].retryCount += 1;
                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (ops[op].retryCount >= 3) {
                    console.error("Max retry count reached for operation:", ops[op].id);
                    // Remove from pending operations
                    await removePendingOperation(ops[op].id);
                } else {
                    // Update the retry count in pending operations
                    await addPendingOperation(ops[op]);
                }
            }
        }
        else if (ops[op].type === "EDIT_GOAL" && ops[op].status === "PENDING") {
            try {
                const response: any = await editGoalApi(ops[op].payload);
                console.log("Response from editGoalApi:", response);

                if (response?.success !== "true") {
                    throw new Error("Failed to edit goal on server");
                }
                
                // Remove from pending operations after successful API call
                await removePendingOperation(ops[op].id);
                console.log("✅ Goal edited");
            }
            catch(error) {
                console.error("Error processing pending operation:", error);
                // Increment retry count
                ops[op].retryCount += 1;
                // If retry count exceeds limit (e.g., 3), mark as FAILED
                if (ops[op].retryCount >= 3) {
                    console.error("Max retry count reached for operation:", ops[op].id);
                    // Remove from pending operations
                    await removePendingOperation(ops[op].id);
                }
                else {
                    // Update the retry count in pending operations
                    await addPendingOperation(ops[op]);
                }
            }
        }
    }
}

// Background operations processing completed

export default pendingOps;