import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserInfo';
import useWorkspaceStore from '../store/useWorkspaceStore';
import './Dashboard.css';

// Todo interface - defines structure for task items
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'in-progress' | 'completed' | 'not-started' | 'todo';
  createdAt: Date;
}

// Goal interface - defines structure for goal items
interface Goal {
  id: number;
  title: string;
  progress: number;
  target: number;
  category: string;
}


const Dashboard = () => {
  const navigate = useNavigate();
  const {userInfo, signOutUser} = useUserStore();
  const { workspaces, currentWorkspace, addWorkspace, editWorkspace, deleteWorkspace, setCurrentWorkspace, initializeDefaultWorkspace } = useWorkspaceStore();
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  
  // Workspace states
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState('');
  
  // Initialize default workspace on mount
  useEffect(() => {
    initializeDefaultWorkspace();
  }, [initializeDefaultWorkspace]);
  
  // Demo todos with different priorities and statuses
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Complete project documentation', completed: true, priority: 'high', status: 'completed', createdAt: new Date(2025, 10, 5) },
    { id: 2, text: 'Review pull requests', completed: false, priority: 'medium', status: 'in-progress', createdAt: new Date(2025, 10, 6) },
    { id: 3, text: 'Team meeting at 3 PM', completed: false, priority: 'high', status: 'not-started', createdAt: new Date(2025, 10, 7) },
    { id: 4, text: 'Update portfolio website', completed: false, priority: 'low', status: 'not-started', createdAt: new Date(2025, 10, 4) },
    { id: 5, text: 'Morning workout', completed: true, priority: 'medium', status: 'completed', createdAt: new Date(2025, 10, 6) },
    { id: 6, text: 'Code review for feature branch', completed: false, priority: 'high', status: 'in-progress', createdAt: new Date(2025, 10, 7) },
    { id: 7, text: 'Write unit tests', completed: false, priority: 'medium', status: 'not-started', createdAt: new Date(2025, 10, 5) },
    { id: 8, text: 'Fix production bug', completed: false, priority: 'high', status: 'in-progress', createdAt: new Date(2025, 10, 7) },
  ]);

  // Demo goals with progress tracking
  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, title: 'Complete 50 tasks this month', progress: 32, target: 50, category: 'Productivity' },
    { id: 2, title: 'Learn React Advanced Patterns', progress: 7, target: 10, category: 'Learning' },
    { id: 3, title: 'Workout 20 days', progress: 14, target: 20, category: 'Health' },
  ]);

  // States for adding new todos
  const [newTodo, setNewTodo] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAddTodo, setShowAddTodo] = useState(false);
  
  // States for adding new goals
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', category: '' });
  
  // States for editing todos
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editTodoText, setEditTodoText] = useState('');
  const [editTodoPriority, setEditTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  // States for editing goals
  const [editingGoal, setEditingGoal] = useState<number | null>(null);
  const [editGoalData, setEditGoalData] = useState({ title: '', target: '', category: '' });
  
  // Layout view state - grid or list
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [goalsViewLayout, setGoalsViewLayout] = useState<'grid' | 'list'>('grid');
  
  // Show more/less state
  const [showAllTodos, setShowAllTodos] = useState(false);
  const [showAllGoals, setShowAllGoals] = useState(false);
  
  // Display limits
  const TODOS_DISPLAY_LIMIT = 6;
  const GOALS_DISPLAY_LIMIT = 6;
  
  // Analytics chart state
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  
  // Analytics data - tasks completed per day
  const analyticsData = [
    { day: 'Mon', completed: 6, label: 'Monday' },
    { day: 'Tue', completed: 9, label: 'Tuesday' },
    { day: 'Wed', completed: 5, label: 'Wednesday' },
    { day: 'Thu', completed: 11, label: 'Thursday' },
    { day: 'Fri', completed: 8, label: 'Friday' },
    { day: 'Sat', completed: 4, label: 'Saturday' },
    { day: 'Sun', completed: 3, label: 'Sunday' },
  ];
  const maxCompleted = Math.max(...analyticsData.map(d => d.completed));
  
  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle adding new todo with selected priority
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: newTodo, 
        completed: false, 
        priority: newTodoPriority,
        status: 'not-started',
        createdAt: new Date()
      }]);
      setNewTodo('');
      setNewTodoPriority('medium');
      setShowAddTodo(false);
    }
  };

  // Handle adding new goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.title.trim() && newGoal.target && newGoal.category.trim()) {
      setGoals([...goals, {
        id: Date.now(),
        title: newGoal.title,
        progress: 0,
        target: parseInt(newGoal.target),
        category: newGoal.category
      }]);
      setNewGoal({ title: '', target: '', category: '' });
      setShowAddGoal(false);
    }
  };

  // Toggle todo completion status
  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Delete a todo
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Start editing a todo - set edit mode with current values
  const startEditTodo = (todo: Todo) => {
    setEditingTodo(todo.id);
    setEditTodoText(todo.text);
    setEditTodoPriority(todo.priority);
  };

  // Save edited todo with updated text and priority
  const saveEditTodo = () => {
    if (editingTodo && editTodoText.trim()) {
      setTodos(todos.map(todo => 
        todo.id === editingTodo ? { ...todo, text: editTodoText, priority: editTodoPriority } : todo
      ));
      setEditingTodo(null);
      setEditTodoText('');
      setEditTodoPriority('medium');
    }
  };

  // Cancel todo editing and reset states
  const cancelEditTodo = () => {
    setEditingTodo(null);
    setEditTodoText('');
    setEditTodoPriority('medium');
  };

  // Delete a goal
  const deleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  // Start editing a goal - set edit mode with current values
  const startEditGoal = (goal: Goal) => {
    setEditingGoal(goal.id);
    setEditGoalData({
      title: goal.title,
      target: goal.target.toString(),
      category: goal.category
    });
  };

  // Save edited goal with updated values
  const saveEditGoal = () => {
    if (editingGoal && editGoalData.title.trim() && editGoalData.target && editGoalData.category.trim()) {
      setGoals(goals.map(goal => 
        goal.id === editingGoal 
          ? { 
              ...goal, 
              title: editGoalData.title,
              target: parseInt(editGoalData.target),
              category: editGoalData.category,
              progress: Math.min(goal.progress, parseInt(editGoalData.target)) // Adjust progress if target changes
            }
          : goal
      ));
      setEditingGoal(null);
      setEditGoalData({ title: '', target: '', category: '' });
    }
  };

  // Cancel goal editing and reset states
  const cancelEditGoal = () => {
    setEditingGoal(null);
    setEditGoalData({ title: '', target: '', category: '' });
  };

  // Increase goal progress by 1 (max = target)
  const incrementGoal = (id: number) => {
    setGoals(goals.map(goal => 
      goal.id === id && goal.progress < goal.target
        ? { ...goal, progress: goal.progress + 1 }
        : goal
    ));
  };

  // Decrease goal progress by 1 (min = 0)
  const decrementGoal = (id: number) => {
    setGoals(goals.map(goal => 
      goal.id === id && goal.progress > 0
        ? { ...goal, progress: goal.progress - 1 }
        : goal
    ));
  };

  // Workspace handlers
  const handleAddWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      addWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setShowAddWorkspace(false);
    }
  };

  const handleEditWorkspace = (id: string, currentName: string) => {
    setEditingWorkspaceId(id);
    setEditingWorkspaceName(currentName);
    setShowWorkspaceMenu(null);
  };

  const handleSaveEditWorkspace = () => {
    if (editingWorkspaceId && editingWorkspaceName.trim()) {
      editWorkspace(editingWorkspaceId, editingWorkspaceName.trim());
      setEditingWorkspaceId(null);
      setEditingWorkspaceName('');
    }
  };

  const handleDeleteWorkspace = (id: string) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      deleteWorkspace(id);
      setShowWorkspaceMenu(null);
    }
  };

  const handleWorkspaceClick = (workspace: typeof workspaces[0]) => {
    setCurrentWorkspace(workspace);
  };

  const handleMenuClick = (workspaceId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.top - 90, // Position above the button
      left: rect.left - 140 + rect.width
    });
    setShowWorkspaceMenu(showWorkspaceMenu === workspaceId ? null : workspaceId);
  };

  // Logout and redirect to home
  const handleLogout = () => {
    signOutUser();
    navigate('/');
  };

  // Calculate comprehensive statistics for stat cards
  const completedTodos = todos.filter(t => t.status === 'completed').length;
  const inProgressTodos = todos.filter(t => t.status === 'in-progress').length;
  const notStartedTodos = todos.filter(t => t.status === 'not-started' || t.status === 'todo').length;
  const totalTodos = todos.length;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
  
  // Recent tasks (last 5)
  const recentTasks = [...todos].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
           {!sidebarCollapsed ? <span className="sidebar-logo-icon">⚡</span> : null}
            {!sidebarCollapsed && <span>TaskPlexus</span>}
          </Link>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 10H17M3 5H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 11H8V16H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11H17V16H12V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!sidebarCollapsed && <span>Overview</span>}
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeSection === 'tasks' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('tasks');
              scrollToSection('tasks-section');
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M16 4L7 13L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!sidebarCollapsed && <span>Tasks</span>}
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeSection === 'goals' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('goals');
              scrollToSection('goals-section');
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {!sidebarCollapsed && <span>Goals</span>}
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeSection === 'flowchart' ? 'active' : ''}`}
            onClick={() => navigate('/flowchart')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 6.5H12M10 9V11M10 11L3 11M10 11L17 11" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {!sidebarCollapsed && <span>Flowchart</span>}
          </button>
          
          {/* Workspaces Section */}
          {!sidebarCollapsed && (
            <div className="sidebar-workspaces">
              <div className="sidebar-workspaces-header">
                <span className="sidebar-workspaces-title">Workspaces</span>
                <button 
                  className="workspace-add-btn"
                  onClick={() => setShowAddWorkspace(true)}
                  title="Add Workspace"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              
              {/* Add Workspace Form */}
              {showAddWorkspace && (
                <form className="workspace-add-form" onSubmit={handleAddWorkspace}>
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Workspace name"
                    className="workspace-input"
                    autoFocus
                  />
                  <div className="workspace-form-actions">
                    <button type="submit" className="workspace-submit-btn">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      className="workspace-cancel-btn"
                      onClick={() => {
                        setShowAddWorkspace(false);
                        setNewWorkspaceName('');
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </form>
              )}
              
              {/* Workspaces List */}
              <div className="sidebar-workspaces-list">
                {workspaces.map((workspace) => (
                  <div 
                    key={workspace.id}
                    className={`workspace-item ${currentWorkspace?.id === workspace.id ? 'active' : ''}`}
                  >
                    {editingWorkspaceId === workspace.id ? (
                      <div className="workspace-edit-form">
                        <input
                          type="text"
                          value={editingWorkspaceName}
                          onChange={(e) => setEditingWorkspaceName(e.target.value)}
                          className="workspace-input"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEditWorkspace();
                            } else if (e.key === 'Escape') {
                              setEditingWorkspaceId(null);
                              setEditingWorkspaceName('');
                            }
                          }}
                        />
                        <div className="workspace-edit-actions">
                          <button 
                            className="workspace-save-btn"
                            onClick={handleSaveEditWorkspace}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            className="workspace-cancel-btn"
                            onClick={() => {
                              setEditingWorkspaceId(null);
                              setEditingWorkspaceName('');
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          className="workspace-name"
                          onClick={() => handleWorkspaceClick(workspace)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4.66667C2 4.31304 2.14048 3.97391 2.39052 3.72386C2.64057 3.47381 2.97971 3.33333 3.33333 3.33333H6L7.33333 5.33333H12.6667C13.0203 5.33333 13.3594 5.47381 13.6095 5.72386C13.8595 5.97391 14 6.31304 14 6.66667V11.3333C14 11.687 13.8595 12.0261 13.6095 12.2761C13.3594 12.5262 13.0203 12.6667 12.6667 12.6667H3.33333C2.97971 12.6667 2.64057 12.5262 2.39052 12.2761C2.14048 12.0261 2 11.687 2 11.3333V4.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="workspace-name-text">{workspace.name}</span>
                          {workspace.isDefault && <span className="workspace-badge">Default</span>}
                        </button>
                        {!workspace.isDefault && (
                          <div className="workspace-menu">
                            <button 
                              className="workspace-menu-btn"
                              onClick={(e) => handleMenuClick(workspace.id, e)}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="3" r="1" fill="currentColor"/>
                                <circle cx="8" cy="8" r="1" fill="currentColor"/>
                                <circle cx="8" cy="13" r="1" fill="currentColor"/>
                              </svg>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>
        
        {/* Workspace Dropdown Menu Portal */}
        {showWorkspaceMenu && menuPosition && (
          <>
            <div 
              className="workspace-dropdown-overlay"
              onClick={() => setShowWorkspaceMenu(null)}
            />
            <div 
              className="workspace-dropdown"
              style={{
                position: 'fixed',
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              {workspaces.find(w => w.id === showWorkspaceMenu) && (
                <>
                  <button 
                    className="workspace-dropdown-item"
                    onClick={() => {
                      const workspace = workspaces.find(w => w.id === showWorkspaceMenu);
                      if (workspace) {
                        handleEditWorkspace(workspace.id, workspace.name);
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M10.2083 1.75004C10.3588 1.59958 10.5385 1.48061 10.7367 1.40024C10.9349 1.31986 11.1477 1.27954 11.3625 1.27954C11.5773 1.27954 11.7901 1.31986 11.9883 1.40024C12.1865 1.48061 12.3662 1.59958 12.5167 1.75004C12.6671 1.9005 12.7861 2.08019 12.8665 2.27839C12.9469 2.47659 12.9872 2.68938 12.9872 2.90421C12.9872 3.11903 12.9469 3.33182 12.8665 3.53002C12.7861 3.72822 12.6671 3.90791 12.5167 4.05837L4.66667 11.9084L1.75 12.6667L2.50833 9.75004L10.2083 1.75004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Edit
                  </button>
                  <button 
                    className="workspace-dropdown-item delete"
                    onClick={() => {
                      const workspace = workspaces.find(w => w.id === showWorkspaceMenu);
                      if (workspace) {
                        handleDeleteWorkspace(workspace.id);
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1.75 3.5H12.25M11.0833 3.5V11.6667C11.0833 12.25 10.5 12.8333 9.91667 12.8333H4.08333C3.5 12.8333 2.91667 12.25 2.91667 11.6667V3.5M4.66667 3.5V2.33333C4.66667 1.75 5.25 1.16667 5.83333 1.16667H8.16667C8.75 1.16667 9.33333 1.75 9.33333 2.33333V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-profile-avatar">✨</div>
            {!sidebarCollapsed && (
              <div className="user-profile-info">
                <div className="user-profile-name">{userInfo?.fullName}</div>
                <div className="user-profile-email">{userInfo?.email}</div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="sidebar-logout">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.3333 14.1667L17.5 10L13.3333 5.83334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.5 10H7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        {/* Dashboard Header */}
        <header className="dashboard-top-header">
          <div className="dashboard-top-header-left">
            {/* {/* <div className="dashboard-top-logo">
              <span className="dashboard-top-logo-icon">⚡</span>
              <span className="dashboard-top-logo-text">TaskPlexus</span>
            </div> */}
            <div className="dashboard-top-breadcrumb">
              <span className="breadcrumb-item">Dashboard</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">
                {activeSection === 'overview' && 'Overview'}
                {activeSection === 'tasks' && 'Tasks'}
                {activeSection === 'goals' && 'Goals'}
              </span>
            </div>
          </div>
          
          {/* Current Workspace Display */}
          <div className="dashboard-top-header-right">
            <div className="current-workspace-display">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2.25 5.25C2.25 4.83579 2.41462 4.43855 2.70765 4.14549C3.00067 3.85243 3.39782 3.6875 3.8125 3.6875H6.75L8.25 6H14.1875C14.6022 6 14.9994 6.16462 15.2924 6.45765C15.5855 6.75067 15.75 7.14782 15.75 7.5625V12.75C15.75 13.1647 15.5855 13.5619 15.2924 13.8549C14.9994 14.148 14.6022 14.3125 14.1875 14.3125H3.8125C3.39782 14.3125 3.00067 14.148 2.70765 13.8549C2.41462 13.5619 2.25 13.1647 2.25 12.75V5.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="current-workspace-info">
                <span className="current-workspace-label">Workspace</span>
                <span className="current-workspace-name">{currentWorkspace?.name || 'Personal'}</span>
              </div>
            </div>
          </div>
         
        </header>
        
        <div className="dashboard-content">
          {/* Top Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card-pro">
              <div className="stat-card-pro-header">
                <div className="stat-card-pro-icon total">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5C15 5.53043 14.7893 6.03914 14.4142 6.41421C14.0391 6.78929 13.5304 7 13 7H11C10.4696 7 9.96086 6.78929 9.58579 6.41421C9.21071 6.03914 9 5.53043 9 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="stat-card-pro-label">Total Tasks</span>
              </div>
              <div className="stat-card-pro-value">{totalTodos}</div>
              <div className="stat-card-pro-trend positive">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 6L8 2L4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>+12% from last week</span>
              </div>
            </div>
            
            <div className="stat-card-pro">
              <div className="stat-card-pro-header">
                <div className="stat-card-pro-icon progress">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="stat-card-pro-label">In Progress</span>
              </div>
              <div className="stat-card-pro-value">{inProgressTodos}</div>
              <div className="stat-card-pro-trend neutral">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Same as yesterday</span>
              </div>
            </div>
            
            <div className="stat-card-pro">
              <div className="stat-card-pro-header">
                <div className="stat-card-pro-icon completed">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="stat-card-pro-label">Completed</span>
              </div>
              <div className="stat-card-pro-value">{completedTodos}</div>
              <div className="stat-card-pro-trend positive">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 6L8 2L4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>+{completionRate}% completion rate</span>
              </div>
            </div>
            
            <div className="stat-card-pro">
              <div className="stat-card-pro-header">
                <div className="stat-card-pro-icon pending">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  </svg>
                </div>
                <span className="stat-card-pro-label">Not Started</span>
              </div>
              <div className="stat-card-pro-value">{notStartedTodos}</div>
              <div className="stat-card-pro-trend neutral">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Yet to begin</span>
              </div>
            </div>
          </div>

          {/* Analytics and Recent Tasks Row */}
          <div className="analytics-row">
            {/* Analytics Chart */}
            <div className="analytics-card">
              <div className="analytics-header">
                <h3>Task Analytics</h3>
                <p>Last 7 days performance</p>
              </div>
              <div className="analytics-chart">
                {hoveredDay !== null && (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-title">{analyticsData[hoveredDay].label}</div>
                    <div className="chart-tooltip-value">{analyticsData[hoveredDay].completed} tasks completed</div>
                  </div>
                )}
                <div className="chart-bars">
                  {analyticsData.map((data, index) => (
                    <div 
                      key={data.day}
                      className="chart-bar" 
                      style={{ height: `${(data.completed / maxCompleted) * 100}%` }}
                      onMouseEnter={() => setHoveredDay(index)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      <div className="chart-bar-fill">
                        <span className="chart-bar-value">{data.completed}</span>
                      </div>
                      <span className="chart-bar-label">{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Recent Tasks */}
            <div className="recent-tasks-card">
              <div className="recent-tasks-header">
                <h3>Recent Tasks</h3>
                <button className="view-all-btn" onClick={() => setActiveSection('tasks')}>View All</button>
              </div>
              <div className="recent-tasks-list">
                {recentTasks.map(task => (
                  <div key={task.id} className="recent-task-item">
                    <div className={`recent-task-status status-${task.status}`}></div>
                    <div className="recent-task-content">
                      <span className="recent-task-text">{task.text}</span>
                      <span className="recent-task-meta">
                        <span className={`priority-dot priority-${task.priority}`}></span>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Welcome Section with stats */}
          <div className="welcome-section">
            <div>
              <h1 className="dashboard-title">Your Tasks & Goals</h1>
              <p className="dashboard-subtitle">Here's what's happening with your tasks today.</p>
            </div>
            <div className="welcome-actions">
              {/* Layout Toggle Button */}
              <button 
                className="layout-toggle-btn"
                onClick={() => setViewLayout(viewLayout === 'grid' ? 'list' : 'grid')}
                title={viewLayout === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
              >
                {viewLayout === 'grid' ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M3 4H17M3 10H17M3 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    List View
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 11H8V16H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 11H17V16H12V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Grid View
                  </>
                )}
              </button>
              
              {/* Flowchart View button */}
              <button 
                className="flowchart-view-btn"
                onClick={() => navigate('/flowchart')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 11H8V16H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11H17V16H12V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Flowchart View
              </button>
              
              {/* Quick statistics cards */}
              <div className="quick-stats">
                <div className="stat-card">
                  <div className="stat-icon">✓</div>
                  <div className="stat-info">
                    <div className="stat-value">{completedTodos}/{totalTodos}</div>
                    <div className="stat-label">Tasks Done</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <div className="stat-value">{completionRate}%</div>
                    <div className="stat-label">Completion Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid - Todos and Goals sections */}
          <div className="dashboard-grid">
            {/* Todos Section */}
            <div id="tasks-section" className="dashboard-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Today's Tasks</h2>
                  <p className="section-subtitle">
                    {totalTodos - completedTodos} tasks remaining
                    {todos.length > TODOS_DISPLAY_LIMIT && (
                      <span className="item-count"> • Showing {showAllTodos ? todos.length : Math.min(TODOS_DISPLAY_LIMIT, todos.length)} of {todos.length}</span>
                    )}
                  </p>
                </div>
                <div className="section-header-actions">
                  {/* Layout toggle for todos */}
                  <button 
                    className="layout-toggle-sm"
                    onClick={() => setViewLayout(viewLayout === 'grid' ? 'list' : 'grid')}
                    title={viewLayout === 'grid' ? 'List View' : 'Grid View'}
                  >
                    {viewLayout === 'grid' ? (
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M3 4H17M3 10H17M3 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 11H8V16H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11H17V16H12V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  {/* Button to show add todo form */}
                  <button 
                    className="add-btn"
                    onClick={() => setShowAddTodo(!showAddTodo)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add Task
                  </button>
                </div>
              </div>

              {/* Add Todo Form - shows when "Add Task" is clicked */}
              {showAddTodo && (
                <form className="add-form" onSubmit={handleAddTodo}>
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="What needs to be done?"
                    className="add-input"
                    autoFocus
                  />
                  {/* Priority selector buttons */}
                  <div className="priority-selector">
                    <label className="priority-label">Priority:</label>
                    <div className="priority-options">
                      <button
                        type="button"
                        className={`priority-option ${newTodoPriority === 'low' ? 'active' : ''} priority-low`}
                        onClick={() => setNewTodoPriority('low')}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        className={`priority-option ${newTodoPriority === 'medium' ? 'active' : ''} priority-medium`}
                        onClick={() => setNewTodoPriority('medium')}
                      >
                        Medium
                      </button>
                      <button
                        type="button"
                        className={`priority-option ${newTodoPriority === 'high' ? 'active' : ''} priority-high`}
                        onClick={() => setNewTodoPriority('high')}
                      >
                        High
                      </button>
                    </div>
                  </div>
                  {/* Form action buttons */}
                  <div className="add-form-actions">
                    <button type="submit" className="submit-btn">Add Task</button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setShowAddTodo(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Todos List - displays all todos */}
              <div className={`todos-list ${viewLayout === 'list' ? 'list-view' : ''}`}>
                {(showAllTodos ? todos : todos.slice(0, TODOS_DISPLAY_LIMIT)).map(todo => (
                  <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                    {/* Edit mode - shows when pencil icon is clicked */}
                    {editingTodo === todo.id ? (
                      <div className="todo-edit-form">
                        <input
                          type="text"
                          value={editTodoText}
                          onChange={(e) => setEditTodoText(e.target.value)}
                          className="todo-edit-input"
                          autoFocus
                        />
                        {/* Priority selector in edit mode */}
                        <div className="priority-selector">
                          <label className="priority-label">Priority:</label>
                          <div className="priority-options">
                            <button
                              type="button"
                              className={`priority-option ${editTodoPriority === 'low' ? 'active' : ''} priority-low`}
                              onClick={() => setEditTodoPriority('low')}
                            >
                              Low
                            </button>
                            <button
                              type="button"
                              className={`priority-option ${editTodoPriority === 'medium' ? 'active' : ''} priority-medium`}
                              onClick={() => setEditTodoPriority('medium')}
                            >
                              Medium
                            </button>
                            <button
                              type="button"
                              className={`priority-option ${editTodoPriority === 'high' ? 'active' : ''} priority-high`}
                              onClick={() => setEditTodoPriority('high')}
                            >
                              High
                            </button>
                          </div>
                        </div>
                        {/* Save and cancel buttons for edit mode */}
                        <div className="todo-edit-actions">
                          <button 
                            className="todo-save-btn"
                            onClick={saveEditTodo}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            className="todo-cancel-btn"
                            onClick={cancelEditTodo}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Normal display mode */}
                        <div className="todo-main">
                          {/* Checkbox to toggle completion */}
                          <button 
                            className="todo-checkbox"
                            onClick={() => toggleTodo(todo.id)}
                          >
                            {todo.completed && <span>✓</span>}
                          </button>
                          <span className="todo-text">{todo.text}</span>
                          {/* Priority badge */}
                          <span className={`todo-priority priority-${todo.priority}`}>
                            {todo.priority}
                          </span>
                        </div>
                        {/* Edit and delete buttons */}
                        <div className="todo-actions">
                          <button 
                            className="todo-edit"
                            onClick={() => startEditTodo(todo)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M11.3333 2.00004C11.5084 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4188 1.44775 12.6667 1.44775C12.9145 1.44775 13.1599 1.49653 13.3886 1.59129C13.6174 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.38272 14.4088 2.61146C14.5036 2.84019 14.5523 3.08555 14.5523 3.33337C14.5523 3.58119 14.5036 3.82655 14.4088 4.05529C14.314 4.28402 14.1751 4.49161 14 4.66671L5 13.6667L1.33333 14.6667L2.33333 11L11.3333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            className="todo-delete"
                            onClick={() => deleteTodo(todo.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Show More/Less Button for Todos */}
              {todos.length > TODOS_DISPLAY_LIMIT && (
                <button 
                  className="show-more-btn"
                  onClick={() => setShowAllTodos(!showAllTodos)}
                >
                  {showAllTodos ? (
                    <>
                      Show Less
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 10L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      Show More ({todos.length - TODOS_DISPLAY_LIMIT} more)
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Goals Section */}
            <div id="goals-section" className="dashboard-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Goals</h2>
                  <p className="section-subtitle">
                    Track your progress
                    {goals.length > GOALS_DISPLAY_LIMIT && (
                      <span className="item-count"> • Showing {showAllGoals ? goals.length : Math.min(GOALS_DISPLAY_LIMIT, goals.length)} of {goals.length}</span>
                    )}
                  </p>
                </div>
                <div className="section-header-actions">
                  {/* Layout toggle for goals */}
                  <button 
                    className="layout-toggle-sm"
                    onClick={() => setGoalsViewLayout(goalsViewLayout === 'grid' ? 'list' : 'grid')}
                    title={goalsViewLayout === 'grid' ? 'List View' : 'Grid View'}
                  >
                    {goalsViewLayout === 'grid' ? (
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M3 4H17M3 10H17M3 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M3 4H8V9H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 4H17V9H12V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 11H8V16H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11H17V16H12V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  {/* Button to show add goal form */}
                  <button 
                    className="add-btn"
                    onClick={() => setShowAddGoal(!showAddGoal)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add Goal
                  </button>
                </div>
              </div>

              {/* Add Goal Form - shows when "Add Goal" is clicked */}
              {showAddGoal && (
                <form className="add-form goal-form" onSubmit={handleAddGoal}>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="Goal title"
                    className="add-input"
                  />
                  <div className="goal-form-row">
                    <input
                      type="number"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                      placeholder="Target"
                      className="add-input"
                      min="1"
                    />
                    <input
                      type="text"
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                      placeholder="Category"
                      className="add-input"
                    />
                  </div>
                  <div className="add-form-actions">
                    <button type="submit" className="submit-btn">Add Goal</button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setShowAddGoal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Goals List - displays all goals */}
              <div className={`goals-list ${goalsViewLayout === 'list' ? 'list-view' : ''}`}>
                {(showAllGoals ? goals : goals.slice(0, GOALS_DISPLAY_LIMIT)).map(goal => {
                  const percentage = Math.round((goal.progress / goal.target) * 100);
                  return (
                    <div key={goal.id} className="goal-card">
                      {/* Edit mode - shows when pencil icon is clicked */}
                      {editingGoal === goal.id ? (
                        <div className="goal-edit-form">
                          <input
                            type="text"
                            value={editGoalData.title}
                            onChange={(e) => setEditGoalData({...editGoalData, title: e.target.value})}
                            placeholder="Goal title"
                            className="goal-edit-input"
                            autoFocus
                          />
                          <div className="goal-edit-row">
                            <input
                              type="number"
                              value={editGoalData.target}
                              onChange={(e) => setEditGoalData({...editGoalData, target: e.target.value})}
                              placeholder="Target"
                              className="goal-edit-input"
                              min="1"
                            />
                            <input
                              type="text"
                              value={editGoalData.category}
                              onChange={(e) => setEditGoalData({...editGoalData, category: e.target.value})}
                              placeholder="Category"
                              className="goal-edit-input"
                            />
                          </div>
                          <div className="goal-edit-actions">
                            <button 
                              className="goal-save-btn"
                              onClick={saveEditGoal}
                            >
                              Save Changes
                            </button>
                            <button 
                              className="goal-cancel-btn"
                              onClick={cancelEditGoal}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Normal display mode */}
                          <div className="goal-header">
                            <div>
                              <h3 className="goal-title">{goal.title}</h3>
                              <span className="goal-category">{goal.category}</span>
                            </div>
                            <div className="goal-header-actions">
                              {/* Progress percentage */}
                              <div className="goal-percentage">{percentage}%</div>
                              {/* Edit button */}
                              <button 
                                className="goal-edit-icon"
                                onClick={() => startEditGoal(goal)}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M11.3333 2.00004C11.5084 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4188 1.44775 12.6667 1.44775C12.9145 1.44775 13.1599 1.49653 13.3886 1.59129C13.6174 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.38272 14.4088 2.61146C14.5036 2.84019 14.5523 3.08555 14.5523 3.33337C14.5523 3.58119 14.5036 3.82655 14.4088 4.05529C14.314 4.28402 14.1751 4.49161 14 4.66671L5 13.6667L1.33333 14.6667L2.33333 11L11.3333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              {/* Delete button */}
                              <button 
                                className="goal-delete-icon"
                                onClick={() => deleteGoal(goal.id)}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="goal-progress">
                            <div 
                              className="goal-progress-bar"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          {/* Progress stats and increment/decrement buttons */}
                          <div className="goal-stats">
                            <span className="goal-stat">{goal.progress} / {goal.target}</span>
                            <div className="goal-actions">
                              {/* Decrement button */}
                              <button 
                                className="goal-action-btn"
                                onClick={() => decrementGoal(goal.id)}
                                disabled={goal.progress === 0}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </button>
                              {/* Increment button */}
                              <button 
                                className="goal-action-btn primary"
                                onClick={() => incrementGoal(goal.id)}
                                disabled={goal.progress >= goal.target}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Show More/Less Button for Goals */}
              {goals.length > GOALS_DISPLAY_LIMIT && (
                <button 
                  className="show-more-btn"
                  onClick={() => setShowAllGoals(!showAllGoals)}
                >
                  {showAllGoals ? (
                    <>
                      Show Less
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 10L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      Show More ({goals.length - GOALS_DISPLAY_LIMIT} more)
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
     </main>

      {/* Animated background elements */}
      <div className="dashboard-background">
        <div className="dashboard-bg-circle dashboard-bg-circle-1"></div>
        <div className="dashboard-bg-circle dashboard-bg-circle-2"></div>
      </div>
    </div>
  );
};

export default Dashboard;