import { getDB } from "../workspaceIndexDB";

const STORE_NAME: string = "pendingOperationsStore";

interface PendingOperation {
  id: string;
  type: string;
  status: string;
  payload: any;
  timestamp: any;
}

export async function addPendingOperation(op: PendingOperation) {
  const db = await getDB();
  return db.put(STORE_NAME, op);
}

export async function getPendingOperations() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function removePendingOperation(id: any) {
  const db = await getDB();
  return db.delete(STORE_NAME, id);
}
