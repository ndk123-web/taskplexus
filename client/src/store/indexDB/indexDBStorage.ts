import { openDB } from "idb";

const DB_NAME = "workspaceDB";
const STORE_NAME = "zustandStore";

// it returns the indexDB store where DB_NAME as INDEXDB DB_NAME
// and inside that there is store STORE_NAME
export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function getItem<T>(key: string): Promise<T | undefined> {
  try {
    const db = await getDB();
    const result = await db.get(STORE_NAME, key);
    return result;
  } catch (error) {
    console.error("Error getting item from IndexedDB:", error);
    return undefined;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, value, key);
  } catch (error) {
    console.error("Error setting item in IndexedDB:", error);
  }
}

export async function deleteItem(key: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, key);
}
