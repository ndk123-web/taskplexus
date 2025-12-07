export interface GetActivities {
  limit: number;
  page: number;
  workspaceId: string | undefined;
  filter: string;
}
