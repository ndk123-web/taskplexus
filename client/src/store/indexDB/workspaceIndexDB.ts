import { openDB } from "idb";

const DB_NAME = "workspaceDB";
const STORE_NAME = "workspacesStore";

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

// Generic functions to interact with IndexedDB
// On App Render getIteme is called to get the data from IndexDB by zustand persist middleware
export async function getItem<T>(key: string): Promise<T | undefined> {
  try {
    // Get the DB instance
    const db = await getDB();
    // Get the item from the store
    const result = await db.get(STORE_NAME, key);
    // Return the result
    return result;
  } catch (error) {
    console.error("Error getting item from IndexedDB:", error);
    return undefined;
  }
}

// Set an item in the IndexedDB store
// whenever we do any changes related to set / update of the store this function is called by zustand persist middleware
export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    // Put the item in the store 
    // if already exists it updates else creates new
    await db.put(STORE_NAME, value, key);
  } catch (error) {
    console.error("Error setting item in IndexedDB:", error);
  }
}

// Delete an item from the IndexedDB store
// when we delete the store this function is called by zustand persist middleware
export async function deleteItem(key: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, key);
}
