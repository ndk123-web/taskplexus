import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWorkspaceStore from '../store/useWorkspaceStore';
import '../styles/pages/TaskDetails.css'; // Reusing the same styles for consistency

const GoalDetails = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { currentWorkspace, updateGoal } = useWorkspaceStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentWorkspace && goalId) {
      const goal = currentWorkspace.goals.find(g => g.id === goalId);
      if (goal) {
        setTitle(goal.title || '');
        setDescription(goal.description || '');
        if (goal.deadline) {
            const d = new Date(goal.deadline);
            setDeadline(d.toISOString().split('T')[0]);
        }
        setTarget(goal.target || '');
        setCategory(goal.category || '');
        setIsLoading(false);
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentWorkspace, goalId, navigate]);

  const handleSave = async () => {
    if (!currentWorkspace || !goalId) return;
    
    const parsedTarget = parseInt(target, 10);
    const safeTargetDays = isNaN(parsedTarget) || parsedTarget <= 0 ? 1 : parsedTarget;

    await updateGoal(currentWorkspace.id, goalId, {
      title,
      description,
      deadline: deadline ? new Date(deadline) : undefined,
      target,
      targetDays: safeTargetDays,
      category
    });
    
    navigate('/dashboard');
  };

  if (isLoading) return <div className="details-loading">Loading...</div>;

  return (
    <div className="details-page-container">
      <div className="details-card">
        <div className="details-header">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1>Edit Goal</h1>
        </div>

        <div className="details-form">
          <div className="form-group">
            <label>Goal Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="details-input"
              placeholder="What is your goal?"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="details-textarea"
              placeholder="Why is this goal important?"
              rows={5}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target (e.g. Days)</label>
              <input 
                type="number" 
                value={target} 
                onChange={(e) => setTarget(e.target.value)} 
                className="details-input"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input 
                type="text" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="details-input"
                placeholder="e.g. Health, Career"
              />
            </div>
          </div>

          <div className="form-group">
             <label>Deadline</label>
             <input 
               type="date" 
               value={deadline} 
               onChange={(e) => setDeadline(e.target.value)} 
               className="details-input"
             />
          </div>

          <div className="form-actions">
            <button onClick={handleSave} className="save-btn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalDetails;
