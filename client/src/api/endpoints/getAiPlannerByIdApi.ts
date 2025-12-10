import type { AxiosResponse } from "axios";
import { api } from "./globalApi";

const getAiPlannerById = async (id: string) => {
  try {
    const response: AxiosResponse = await api.get(
      `/aiplanner/get-plannerbyid/${id}`
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API request failed with status code ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching AI planner by ID:", error);
  }
};

export default getAiPlannerById;
