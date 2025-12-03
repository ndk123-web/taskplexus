import { openDB } from "idb";

const DATABASE_NAME: string = "userChatsDB";
const STORE_NAME: string = "userChatsStore";

export async function getDB() {
  return openDB(DATABASE_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "chatId" });
      }
    },
  });
}
