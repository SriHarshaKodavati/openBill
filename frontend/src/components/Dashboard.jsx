// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Users, Receipt, Share } from 'lucide-react'
import { getGroupData, addExpense, deleteExpense } from '../utils/api'
import ExpenseForm from './ExpenseForm'

const Dashboard = ({ groupData: initialGroupData, onBack }) => {
  const [groupData, setGroupData] = useState(initialGroupData)
  const [expenses, setExpenses] = useState([])
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGroupData()
  }, [])

  const loadGroupData = async () => {
    try {
      const data = await getGroupData(groupData.teamCode)
      setGroupData(data.group)
      setExpenses(data.expenses)
    } catch (error) {
      console.error('Error loading group data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (expenseData) => {
    try {
      const result = await addExpense({
        ...expenseData,
        teamCode: groupData.teamCode
      })
      
      if (result.success) {
        setExpenses(prev => [result.expense, ...prev])
        setShowExpenseForm(false)
      }
    } catch (error) {
      alert('Error adding expense: ' + error.message)
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpense(expenseId)
      setExpenses(prev => prev.filter(exp => exp._id !== expenseId))
    } catch (error) {
      alert('Error deleting expense: ' + error.message)
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const perPersonShare = totalExpenses / groupData.members.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{groupData.name}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Share className="w-4 h-4" />
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{groupData.teamCode}</span>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowExpenseForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-700">Per Person</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">₹{perPersonShare.toFixed(2)}</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-700">Members</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">{groupData.members.length}</p>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Members
          </h3>
          <div className="flex flex-wrap gap-3">
            {groupData.members.map((member, idx) => (
              <div key={idx} className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-xl text-sm font-medium">
                {member}
              </div>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="font-semibold text-gray-700 mb-6 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Recent Expenses
          </h3>
          
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No expenses yet. Add your first expense to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {expenses.map((expense) => (
                  <motion.div
                    key={expense._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/20 hover:bg-white/70 transition-all"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{expense.description}</h4>
                      <p className="text-sm text-gray-600">
                        Paid by {expense.paidBy} • {new Date(expense.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-gray-800">₹{expense.amount.toFixed(2)}</span>
                      <button
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Expense Form Modal */}
      <AnimatePresence>
        {showExpenseForm && (
          <ExpenseForm
            members={groupData.members}
            onSubmit={handleAddExpense}
            onClose={() => setShowExpenseForm(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Dashboard