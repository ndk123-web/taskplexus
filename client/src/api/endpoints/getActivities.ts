import { api } from "./globalApi";
import type { GetActivities } from "../../types/activityType";
import type { AxiosResponse } from "axios";

const getActivitiesApi = async (data: GetActivities) => {
  try {
    const response: AxiosResponse = await api.get(
      `/activity/get-activities?page=${data.page}&limit=${data.limit}&workspaceId=${data.workspaceId}&filter=${data.filter}}`
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to fetch activities");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
  }
};

export default getActivitiesApi;
