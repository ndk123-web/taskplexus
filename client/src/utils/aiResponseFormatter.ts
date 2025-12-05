// AI response formatting utilities

export const formatAiResponse = (text: string): string => {
  if (!text) return '';
  
  let formatted = text;
  
  // Remove or replace common markdown-like patterns
  formatted = formatted
    // Convert **bold** to HTML bold (or remove asterisks)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Convert *italic* to HTML italic (or remove asterisks)
    .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>')
    
    // Convert `code` to HTML code (or style it differently)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Convert ### Headers to styled headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    
    // Convert bullet points - to proper bullets
    .replace(/^- (.*$)/gm, '• $1')
    
    // Convert numbered lists
    .replace(/^\d+\. /gm, '')
    
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    
    // Remove extra spacing
    .trim();
    
  return formatted;
};

export const formatAiResponsePlain = (text: string): string => {
  if (!text) return '';
  
  let formatted = text;
  
  // Simple cleanup - remove markdown formatting
  formatted = formatted
    // Remove **bold**
    .replace(/\*\*(.*?)\*\*/g, '$1')
    
    // Remove *italic*
    .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '$1')
    
    // Remove `code`
    .replace(/`([^`]+)`/g, '$1')
    
    // Convert headers to simple format
    .replace(/^#{1,6} (.*$)/gm, '$1')
    
    // Convert bullet points
    .replace(/^- (.*$)/gm, '• $1')
    
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    
    // Remove extra spacing
    .trim();
    
  return formatted;
};

export const renderFormattedText = (text: string): string => {
  // For now, just return the plain formatted text
  // This can be enhanced later if needed for HTML rendering
  return formatAiResponsePlain(text);
};