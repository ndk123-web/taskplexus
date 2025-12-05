import React, { useState, useRef, useEffect } from 'react';
import '../../styles/components/AiChat.css';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import useUserStore from '../../store/useUserInfo';
import { getChat, addChat, deleteWorkspaceChat } from '../../store/indexDB/chats/chatMethods';
import {sendAiMessageApi} from '../../api/';
import { formatAiResponsePlain } from '../../utils/aiResponseFormatter';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

interface AiChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiChat: React.FC<AiChatProps> = ({ isOpen, onClose }) => {
  const { currentWorkspace } = useWorkspaceStore();
  const { userInfo } = useUserStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Load workspace-specific messages from IndexedDB
  useEffect(() => {
    const loadChatHistory = async () => {
      if (currentWorkspace?.id && userInfo?.userId) {
        try {
          const workspaceChat: any = await getChat(currentWorkspace.id);
          
          if (workspaceChat && workspaceChat.messages && workspaceChat.messages.length > 0) {
            // Convert stored messages to UI Message format
            const uiMessages: Message[] = [];
            workspaceChat.messages.forEach((msg: any) => {
              // Add user message (prompt)
              uiMessages.push({
                id: `${msg.id}_user`,
                text: msg.prompt,
                sender: 'user',
                timestamp: new Date(msg.timestamp)
              });
              // Add AI response - extract text from object if needed
              if (msg.response) {
                const responseText = typeof msg.response === 'string' 
                  ? msg.response 
                  : msg.response?.response || JSON.stringify(msg.response);
                
                uiMessages.push({
                  id: `${msg.id}_ai`,
                  text: responseText,
                  sender: 'ai',
                  timestamp: new Date(msg.timestamp)
                });
              }
            });
            setMessages(uiMessages);
          } else {
            // Welcome message for new workspace chat
            setMessages([{
              id: `welcome_${Date.now()}`,
              text: `Hello! 👋 I'm your AI assistant for the "${currentWorkspace.name}" workspace. I can help you organize tasks, set goals, and answer questions. How can I assist you today?`,
              sender: 'ai',
              timestamp: new Date()
            }]);
          }
        } catch (error) {
          console.error('Error loading chat history:', error);
          // Show welcome message on error
          setMessages([{
            id: `welcome_${Date.now()}`,
            text: `Hello! 👋 I'm your AI assistant. How can I assist you today?`,
            sender: 'ai',
            timestamp: new Date()
          }]);
        }
      }
    };
    
    loadChatHistory();
  }, [currentWorkspace?.id, userInfo?.userId]);

  // Note: Messages are now saved to IndexedDB directly when sent/received

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !currentWorkspace?.id || !userInfo?.userId) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add loading message
    const loadingId = `loading_${Date.now()}`;
    setMessages(prev => [...prev, {
      id: loadingId,
      text: '',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true
    }]);

    try {
      const data: any = await sendAiMessageApi({
        workspaceId: currentWorkspace.id,
        prompt: inputMessage.trim(),
        userId: userInfo.userId
      });
      
      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== loadingId));

      if (data.success === 'true' && data.response) {
        // Extract and format the actual response text
        const rawResponseText = typeof data.response === 'string' 
          ? data.response 
          : data.response?.response || JSON.stringify(data.response);
          
        // Format the response to clean up markdown-like formatting
        const formattedResponseText = formatAiResponsePlain(rawResponseText);
        
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          text: formattedResponseText,  // ✅ Cleaned and formatted text
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Save to IndexedDB with your Chat structure
        try {
          // Get existing chat or create new one
          const existingChat: any = await getChat(currentWorkspace.id);
          
          const newMessage = {
            id: `msg_${Date.now()}`,
            prompt: userMessage.text,
            response: rawResponseText,  // ✅ Save as string
            timestamp: new Date()
          };
          
          if (existingChat && existingChat.messages) {
            // Update existing chat with new message
            existingChat.messages.push(newMessage);
            await addChat(existingChat);
          } else {
            // Create new chat
            const newChat = {
              id: `${currentWorkspace.id}_${userInfo.userId}`,
              chatId: `${currentWorkspace.id}_${userInfo.userId}`,
              workspaceId: currentWorkspace.id,
              userId: userInfo.userId,
              messages: [newMessage],
              timestamp: new Date()
            };
            await addChat(newChat);
          }
          console.log('✅ Message saved to IndexedDB');
        } catch (saveError) {
          console.error('❌ Error saving message to IndexedDB:', saveError);
        }
      } else {
        throw new Error(data.Error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      
      // Add error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear this chat history?')) {
      const welcomeMessage: Message = {
        id: `welcome_${Date.now()}`,
        text: `Chat cleared! How can I help you with "${currentWorkspace?.name}"?`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Clear from IndexedDB
      if (currentWorkspace?.id) {
        try {
          await deleteWorkspaceChat(currentWorkspace.id);
          console.log('✅ Chat history cleared from IndexedDB');
        } catch (error) {
          console.error('❌ Error clearing chat from IndexedDB:', error);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`ai-chat-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`ai-chat-container ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-left">
            <div className="ai-chat-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="ai-chat-title">
              <h3>AI Assistant</h3>
              <span className="ai-chat-workspace">{currentWorkspace?.name}</span>
            </div>
          </div>
          <div className="ai-chat-header-actions">
            <button 
              className="ai-chat-clear-btn"
              onClick={handleClearChat}
              title="Clear chat history"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 5H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8.33333 8.33333V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M11.6667 8.33333V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M3.33333 5L4.16667 16.6667C4.16667 17.5833 4.91667 18.3333 5.83333 18.3333H14.1667C15.0833 18.3333 15.8333 17.5833 15.8333 16.6667L16.6667 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M7.5 5V3.33333C7.5 2.41667 8.25 1.66667 9.16667 1.66667H10.8333C11.75 1.66667 12.5 2.41667 12.5 3.33333V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button 
              className="ai-chat-close-btn"
              onClick={onClose}
              title="Close chat"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`ai-chat-message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="ai-chat-message-avatar">
                {message.sender === 'user' ? (
                  <span>👤</span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L2 6L10 10L18 6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 14L10 18L18 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 10L10 14L18 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="ai-chat-message-content">
                {message.isLoading ? (
                  <div className="ai-chat-loading">
                    <span></span>
                      <span></span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <p>{message?.text || "Unknown"}</p>
                    <span className="ai-chat-message-time">
                      {message.timestamp.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="ai-chat-input-form" onSubmit={handleSendMessage}>
          <input
            ref={inputRef}
            type="text"
            className="ai-chat-input"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="ai-chat-send-btn"
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? (
              <svg className="ai-chat-spinner" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="50.26548245743669" strokeDashoffset="25.132741228718345"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 10L17.5 3.33333L10.8333 17.5L9.16667 11.6667L2.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiChat;
