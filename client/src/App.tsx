import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import FlowchartViewNew from './pages/FlowchartViewNew'
import Activity from './pages/Activity'
import AiPlanner from './pages/AiPlanner'
// import ProfessionalDashboard from './components/features/ProfessionalDashboard'
import TaskDetails from './pages/TaskDetails'
import GoalDetails from './pages/GoalDetails'
import TermsConditions from './pages/Legal/TermsConditions'
import PrivacyPolicy from './pages/Legal/PrivacyPolicy'
import RefundPolicy from './pages/Legal/RefundPolicy'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import Contact from './pages/Contact'
import About from './pages/About'
import { Protected } from './components/layout'

import './styles/App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={
          <Protected>
            <Dashboard />
        </Protected>
      } />
        <Route path="/dashboard/task/:taskId" element={
          <Protected>
            <TaskDetails />
          </Protected>
        } />
        <Route path="/dashboard/goal/:goalId" element={
          <Protected>
            <GoalDetails />
          </Protected>
        } />
        <Route path="/settings" element={
          <Protected>
            <Settings />
        </Protected>
      } />
        <Route path="/flowchart" element={
          <Protected>
            <FlowchartViewNew />
        </Protected>
      } />
        <Route path="/activity" element={
          <Protected>
            <Activity />
        </Protected>
      } />
        <Route path="/ai-planner" element={
          <Protected>
            <AiPlanner />
        </Protected>
      } />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
