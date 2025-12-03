import { getDB } from "./chatIndexDB";

const STORE_NAME: string = "userChatsStore";

interface Chat {
  id: string;
  workspaceId: string;
  userId: string;
  messages: Array<any>;
  timestamp: Date;
}

export async function addChat(chat: Chat) {
  const db = await getDB();
  return db.put(STORE_NAME, chat);
}

export async function getChat(workspaceId: string, userId: string) {
  const db = await getDB();
  const allChats = await db.getAll(STORE_NAME);

  const workspaceChat =
    allChats.find(
      (chat) => chat.workspaceId === workspaceId && chat.userId === userId
    ) || [];

  return workspaceChat;
}

export async function deleteWorkspaceChat(workspaceId: string) {
  const db = await getDB();
  const allChats = await db.getAll(STORE_NAME);

  const filteredChats = allChats.filter(
    (chat) => chat.workspaceId !== workspaceId
  );

  // clear the store
  await db.clear(STORE_NAME);

  // re-add the filtered chats
  await db.put(STORE_NAME, filteredChats);
}

export async function clearAllWorkspace() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
