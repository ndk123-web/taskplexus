import { getDB } from "./chatIndexDB";

const STORE_NAME: string = "userChatsStore";

interface Message {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
}

interface WorkspaceBasedChat {
  chatId: string;
  workspaceId: string;
  userId: string;
  messages: Array<Message>;
  timestamp: Date;
}

export async function addChat(chat: WorkspaceBasedChat) {
  const db = await getDB();
  return db.put(STORE_NAME, chat);
}

export async function getChat(workspaceId: string) {
  const db = await getDB();
  // const allChats = await db.getAll(STORE_NAME);

  // const workspaceChat = allChats.find(
  //   (chat) => chat.workspaceId === workspaceId && chat.userId === userId
  // );

  // return workspaceChat || null;

  const tx = db.transaction(STORE_NAME, "readonly");
  const index = tx.store.index("workspaceId");
  const chats = await index.getAll(workspaceId);

  return chats[0] || [];
}

export async function deleteWorkspaceChat(workspaceId: string) {
  const db = await getDB();
  const allChats = await db.getAll(STORE_NAME);

  // Find and delete the specific workspace chat
  const chatToDelete = allChats.find(
    (chat) => chat.workspaceId === workspaceId
  );

  if (chatToDelete && chatToDelete.chatId) {
    await db.delete(STORE_NAME, chatToDelete.chatId);
    console.log("✅ Workspace chat deleted:", workspaceId);
  }
}

export async function clearAllWorkspace() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
