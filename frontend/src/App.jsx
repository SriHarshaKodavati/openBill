import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Landing from './components/Landing'
import JoinGroup from './components/JoinGroup'
import Dashboard from './components/Dashboard'

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [groupData, setGroupData] = useState(null)

  const handleJoinGroup = (data) => {
    setGroupData(data)
    setCurrentView('dashboard')
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
    setGroupData(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <AnimatePresence mode="wait">
        {currentView === 'landing' && (
          <Landing 
            key="landing"
            onJoinGroup={() => setCurrentView('join')}
          />
        )}
        {currentView === 'join' && (
          <JoinGroup 
            key="join"
            onSuccess={handleJoinGroup}
            onBack={handleBackToLanding}
          />
        )}
        {currentView === 'dashboard' && (
          <Dashboard 
            key="dashboard"
            groupData={groupData}
            onBack={handleBackToLanding}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App