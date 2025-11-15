import { getPendingOperations, addPendingOperation, removePendingOperation } from "../store/indexDB/pendingOps/usePendingOps";
import createWorkspaceAPI from "../api/createWorkspaceApi";
import useWorkspaceStore from "../store/useWorkspaceStore";

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
    }
}

export default pendingOps;