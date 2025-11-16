export interface CreateTaskReq {
  id: string;
  userId: string;
  workspaceId: string;
  text: string;
  priority: "high" | "medium" | "low";
  status: string;
  createdAt?: Date;
  completed?: boolean;  
}
