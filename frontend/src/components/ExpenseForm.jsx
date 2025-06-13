// src/components/ExpenseForm.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Users } from 'lucide-react'

const ExpenseForm = ({ members, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: members[0] || '',
    splitBetween: [...members] // Default to all members
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.description || !formData.amount || !formData.paidBy) {
      alert('Please fill all fields')
      return
    }
    
    if (formData.splitBetween.length === 0) {
      alert('Please select at least one member to split the expense with')
      return
    }
    
    onSubmit({
      description: formData.description,
      amount: parseFloat(formData.amount),
      paidBy: formData.paidBy,
      splitBetween: formData.splitBetween
    })
  }

  const toggleMember = (member) => {
    setFormData(prev => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(member)
        ? prev.splitBetween.filter(m => m !== member)
        : [...prev.splitBetween, member]
    }))
  }

  const selectAll = () => {
    setFormData(prev => ({ ...prev, splitBetween: [...members] }))
  }

  const selectNone = () => {
    setFormData(prev => ({ ...prev, splitBetween: [] }))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Add Expense</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What was it for?
            </label>
            <input
              type="text"
              placeholder="e.g., Dinner at restaurant"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who paid?
            </label>
            <select
              value={formData.paidBy}
              onChange={(e) => setFormData(prev => ({ ...prev, paidBy: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            >
              {members.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Split between ({formData.splitBetween.length} selected)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={selectNone}
                  className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  None
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {members.map((member) => (
                <button
                  key={member}
                  type="button"
                  onClick={() => toggleMember(member)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    formData.splitBetween.includes(member)
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {member}
                </button>
              ))}
            </div>
            {formData.splitBetween.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                ₹{(parseFloat(formData.amount || 0) / formData.splitBetween.length).toFixed(2)} per person
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default ExpenseForm