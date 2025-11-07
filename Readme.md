# ⚡ TaskPlexus

A professional task management application built with **Go** backend and **React** frontend. TaskPlexus combines powerful backend performance with a modern, intuitive user interface for seamless task and goal tracking.

## 🎯 Why TaskPlexus?

**Fast. Professional. Powerful.** ⚡

- **Go (Golang)** - Lightning-fast backend with goroutines
- **MongoDB Atlas** - Cloud-based NoSQL database
- **React + TypeScript** - Modern, type-safe frontend with professional UI
- **Vite** - Super-fast build tool
- **Advanced Features** - Task priorities, goal tracking, analytics, and flowchart visualization

## ✨ Features

- 📋 **Task Management** - Create, edit, delete tasks with priority levels (Low, Medium, High)
- 🎯 **Goal Tracking** - Set goals with progress tracking and visual indicators
- 📊 **Analytics Dashboard** - Interactive charts showing task completion trends
- 🔄 **Flowchart View** - Visualize your tasks in an interactive canvas
- 📈 **Progress Monitoring** - Real-time stats for Total, In Progress, Completed, and Not Started tasks
- 🎨 **Professional UI** - Glass-morphism design with smooth animations

## 🚀 Tech Stack

### Backend
- **Go 1.25.3** - Main backend language
- **MongoDB Driver** - Database connectivity
- **godotenv** - Environment configuration
- **Clean Architecture** - Repository → Service → Handler pattern

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router** - Navigation and routing
- **React Flow** - Flowchart visualization
- **Vite** - Build tool & dev server
- **SWC** - Super-fast TypeScript/React compiler

## 📁 Project Structure

```
taskplexus/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # Dashboard, SignIn, SignUp, Flowchart
│   │   ├── assets/     # Images and static files
│   │   └── main.tsx    # Entry point
│   ├── public/
│   └── package.json
│
└── server/              # Go backend
    ├── cmd/
    │   └── fast-todo/
    │       └── main.go  # Entry point
    ├── internal/
    │   ├── app/         # Application initialization
    │   ├── config/      # Configuration
    │   ├── handler/     # HTTP handlers (todos, users)
    │   ├── service/     # Business logic
    │   ├── repository/  # Database operations
    │   ├── model/       # Data models
    │   ├── middleware/  # Auth, logging middleware
    │   └── server/      # HTTP server setup
    └── go.mod
```

## 🏗️ Architecture (Clean Architecture Pattern)

```
Client Request
    ↓
Server (Routes)
    ↓
Handler (HTTP Layer) - Handles requests/responses
    ↓
Middleware (Auth, Logging) - Request processing
    ↓
Service (Business Logic) - Processing & validation
    ↓
Repository (Database Layer) - MongoDB operations
    ↓
MongoDB Atlas
```

## 🛠️ Setup & Installation

### Prerequisites
- **Go 1.25+** installed
- **Node.js 18+** installed
- **MongoDB Atlas** account (or local MongoDB)

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Create `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
PORT=:8080
```

3. Install dependencies:
```bash
go mod download
```

4. Run the server:
```bash
go run cmd/fast-todo/main.go
```

Server will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start dev server:
```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

## 🎓 Learning Journey

This project is built while learning **Go for backend development**. Key concepts explored:

- ✅ Go project structure & organization
- ✅ MongoDB integration with Go driver
- ✅ Clean Architecture (Layered approach)
- ✅ Dependency Injection pattern
- ✅ HTTP server with net/http
- ✅ Error handling in Go
- ✅ Context management
- ✅ Middleware implementation
- ✅ Professional frontend design patterns
- ✅ State management in React
- ✅ Interactive data visualization

## 📝 API Endpoints

### Todos
```
GET    /todos          # Get all todos
POST   /todos          # Create a new todo
PUT    /todos/:id      # Update a todo
DELETE /todos/:id      # Delete a todo
```

### Users
```
POST   /users/signup   # User registration
POST   /users/login    # User authentication
GET    /users/:id      # Get user profile
```

## 🎨 UI Features

- **Professional Dashboard** - Comprehensive overview with stat cards
- **Task Analytics** - Visual representation of task completion over time
- **Recent Tasks** - Quick access to latest activities
- **Interactive Flowchart** - Drag-and-drop task visualization
- **Responsive Sidebar** - Collapsible navigation for better space management
- **Glass-morphism Design** - Modern, professional aesthetic
- **Smooth Animations** - Enhanced user experience with transitions

## 🔮 Future Enhancements

- [ ] Real-time collaboration features
- [ ] Task categories and tags
- [ ] Deadline notifications
- [ ] Export/Import functionality
- [ ] Dark/Light theme toggle
- [ ] Mobile app (React Native)
- [ ] Task dependencies in flowchart
- [ ] Advanced analytics with filters
- [ ] Docker support
- [ ] Cloud deployment

## 📚 What I Learned

- **Repository Pattern** - Separating database logic
- **Service Layer** - Business logic isolation
- **Handler Pattern** - Clean HTTP handling
- **Interfaces in Go** - Flexible & testable code
- **MongoDB with Go** - BSON, cursors, context
- **Clean Architecture** - Maintainable code structure
- **Professional UI/UX** - Modern design principles
- **React Best Practices** - Component composition, hooks
- **Interactive Visualizations** - Canvas-based rendering

## 🤝 Contributing

This is a learning project, but suggestions and improvements are welcome!

## 📄 License

MIT License - Feel free to use this for learning!

---

**Built with 💙 while learning Go and modern web development**

*"The best way to learn is to build something amazing!"*
