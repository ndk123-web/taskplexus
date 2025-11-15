import { openDB } from "idb";

const DATABASE_NAME: string = "pendingOperationsDB";
const STORE_NAME: string = "pendingOperationsStore";

export async function getDB() {
  return openDB(DATABASE_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}
