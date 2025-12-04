import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import FlowchartViewNew from './pages/FlowchartViewNew'
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
