import { api } from "./globalApi";

interface AnalyticsResponse {
  month: string;
  completed: number;
  label: string;
}

const getAnalyticsApi = async (
  userId: string,
  year: string,
  workspaceId?: string
): Promise<AnalyticsResponse[]> => {
  try {
    const response: any = await api.post(
      `/analytics/${userId}/year/${year}`,
      { year, workspaceId }
    );

    console.log("Analytics API Request:", { userId, year, workspaceId });
    console.log("Analytics API Response:", response);

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to fetch analytics data");
    }

    if (response.data.success === "false") {
      throw new Error(
        response.data.Error || "Error fetching analytics"
      );
    }
    
    // Handle different response formats
    let data = response.data.response || response.data || [];
    
    // If the data is a string, try to parse it
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (parseError) {
        console.error("Failed to parse response data string:", parseError);
        return []; // Return empty array on parse failure
      }
    }
    
    // Double check that it's actually an array
    if (!Array.isArray(data)) {
      console.warn("Analytics API returned non-array data:", data);
      return []; // Return empty array as fallback
    }
    
    return data;
  } catch (error) {
    console.error("Analytics API Error:", error);
    // Return empty array on any error
    return [];
  }
};

export default getAnalyticsApi;