import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWorkspaceStore from '../store/useWorkspaceStore';
import '../styles/pages/TaskDetails.css';
import { useToast } from '../components/ui/ToastProvider';
import SEO from '../components/SEO';

const TaskDetails = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentWorkspace, updateTodo } = useWorkspaceStore();
  
  const [taskText, setTaskText] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentWorkspace && taskId) {
      const todo = currentWorkspace.todos.find(t => t.id === taskId);
      if (todo) {
        setTaskText(todo.text || '');
        setDescription(todo.description || '');
        // Format date for input type="date" (YYYY-MM-DD)
        if (todo.deadline) {
            const d = new Date(todo.deadline);
            setDeadline(d.toISOString().split('T')[0]);
        }
        setEstimatedTime(todo.estimatedTime ? todo.estimatedTime.toString() : '');
        setPriority(todo.priority);
        setIsLoading(false);
      } else {
        // Task not found, maybe redirect or show error
        navigate('/dashboard');
      }
    }
  }, [currentWorkspace, taskId, navigate]);

  const handleSave = async () => {
    if (!currentWorkspace || !taskId) return;
    
    // Validate deadline is not in the past
    if (deadline) {
      const selectedDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (selectedDate < today) {
        showToast('Deadline cannot be in the past', 'error');
        return;
      }
    }
    
    await updateTodo(currentWorkspace.id, taskId, {
      text: taskText,
      description,
      deadline: deadline ? new Date(deadline) : undefined,
      priority,
      estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) : undefined
    });
    
    navigate('/dashboard');
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (isLoading) return <div className="details-loading">Loading...</div>;

  return (
    <div className="details-page-container">
      <SEO 
        title="Edit Task" 
        description="Edit task details, set deadlines, and manage priorities."
      />
      <div className="details-card">
        <div className="details-header">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1>Edit Task</h1>
        </div>

        <div className="details-form">
          <div className="form-group">
            <label>Task Title</label>
            <input 
              type="text" 
              value={taskText} 
              onChange={(e) => setTaskText(e.target.value)} 
              className="details-input"
              placeholder="What needs to be done?"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="details-textarea"
              placeholder="Add more details..."
              rows={5}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Deadline</label>
              <input 
                type="date" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)} 
                className="details-input"
                min={getTodayDate()}
              />
            </div>

            <div className="form-group">
              <label>Estimated Time (Minutes)</label>
              <input 
                type="number" 
                value={estimatedTime} 
                onChange={(e) => setEstimatedTime(e.target.value)} 
                className="details-input"
                placeholder="Enter time in minutes"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Priority</label>
              <div className="priority-select-container">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-btn ${p} ${priority === p ? 'active' : ''}`}
                    onClick={() => setPriority(p as any)}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleSave} className="save-btn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
