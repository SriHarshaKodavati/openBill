import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Plus } from 'lucide-react'
import { createGroup, joinGroup } from '../utils/api'

const JoinGroup = ({ onSuccess, onBack }) => {
  const [mode, setMode] = useState('join') // 'join' or 'create'
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    teamCode: '',
    memberName: '',
    groupName: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      let result
      if (mode === 'create') {
        result = await createGroup(formData.groupName, formData.memberName)
      } else {
        result = await joinGroup(formData.teamCode, formData.memberName)
      }
      
      if (result.success) {
        onSuccess(result.group)
      }
    } catch (error) {
      alert(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {mode === 'join' ? 'Join Group' : 'Create Group'}
          </h2>
          <p className="text-gray-600">
            {mode === 'join' ? 'Enter your team code to join' : 'Start a new expense group'}
          </p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'join' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Join
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'create' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' && (
            <input
              type="text"
              placeholder="Group Name (e.g., Trip to Goa)"
              value={formData.groupName}
              onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          )}
          
          {mode === 'join' && (
            <input
              type="text"
              placeholder="Team Code (e.g., ABC123)"
              value={formData.teamCode}
              onChange={(e) => setFormData(prev => ({ ...prev, teamCode: e.target.value.toUpperCase() }))}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
              required
            />
          )}
          
          <input
            type="text"
            placeholder="Your Name"
            value={formData.memberName}
            onChange={(e) => setFormData(prev => ({ ...prev, memberName: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all"
          >
            {loading ? 'Please wait...' : mode === 'join' ? 'Join Group' : 'Create Group'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}

export default JoinGroup