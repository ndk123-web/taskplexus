import { api } from './globalApi';

interface SendMessageRequest {
  workspaceId: string;
  prompt: string;
  userId: string;
}

interface SendMessageResponse {
  success: string;
  response?: string;
  Error?: string;
}

const sendAiMessage = async (data: SendMessageRequest): Promise<SendMessageResponse> => {
  try {
    const response = await api.post('/chat/ai-message', data);
    return response.data;
  } catch (error: any) {
    console.error('Error sending AI message:', error);
    throw error.response?.data || { success: 'false', Error: 'Network error' };
  }
};

export default sendAiMessage;
