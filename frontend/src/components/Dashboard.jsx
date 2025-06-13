// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Users, Receipt, Share, User, RefreshCw, Activity, TrendingUp, Clock } from 'lucide-react'
import { getGroupData, addExpense, deleteExpense } from '../utils/api'
import ExpenseForm from './ExpenseForm'
import MemberDetails from './MemberDetails'

const Dashboard = ({ groupData: initialGroupData, onBack }) => {
  const [groupData, setGroupData] = useState(initialGroupData)
  const [expenses, setExpenses] = useState([])
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    loadGroupData()
  }, [])

  const loadGroupData = async () => {
    try {
      const data = await getGroupData(groupData.teamCode)
      setGroupData(data.group)
      setExpenses(data.expenses)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error loading group data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadGroupData()
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
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
        // Auto-refresh to get latest data
        setTimeout(() => handleRefresh(), 1000)
      }
    } catch (error) {
      alert('Error adding expense: ' + error.message)
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpense(expenseId)
      setExpenses(prev => prev.filter(exp => exp._id !== expenseId))
      // Auto-refresh to get latest data
      setTimeout(() => handleRefresh(), 500)
    } catch (error) {
      alert('Error deleting expense: ' + error.message)
    }
  }

  // Calculate member balances
  const calculateMemberBalance = (member) => {
    const memberExpenses = expenses.filter(expense => 
      expense.splitBetween && expense.splitBetween.includes(member)
    )
    
    const totalOwed = memberExpenses.reduce((sum, expense) => {
      return sum + (expense.amount / expense.splitBetween.length)
    }, 0)

    const expensesPaidByMember = expenses.filter(expense => expense.paidBy === member)
    const totalPaid = expensesPaidByMember.reduce((sum, expense) => sum + expense.amount, 0)

    return totalPaid - totalOwed
  }

  // Calculate detailed debt breakdown between all members
  const calculateDetailedDebts = () => {
    const debts = {}
    
    // Initialize debt matrix
    groupData.members.forEach(member => {
      debts[member] = {}
      groupData.members.forEach(otherMember => {
        if (member !== otherMember) {
          debts[member][otherMember] = 0
        }
      })
    })

    // Process each expense
    expenses.forEach(expense => {
      if (!expense.splitBetween || expense.splitBetween.length === 0) return
      
      const sharePerPerson = expense.amount / expense.splitBetween.length
      const payer = expense.paidBy
      
      // Each person in splitBetween owes their share to the payer
      expense.splitBetween.forEach(member => {
        if (member !== payer) {
          debts[member][payer] += sharePerPerson
        }
      })
    })

    // Simplify debts by netting out mutual debts
    const simplifiedDebts = {}
    groupData.members.forEach(member => {
      simplifiedDebts[member] = {}
      groupData.members.forEach(otherMember => {
        if (member !== otherMember) {
          const debt1 = debts[member][otherMember] || 0
          const debt2 = debts[otherMember][member] || 0
          const netDebt = debt1 - debt2
          
          if (netDebt > 0.01) { // Only keep debts > 1 paisa
            simplifiedDebts[member][otherMember] = netDebt
          }
        }
      })
    })

    return simplifiedDebts
  }

  // Get who owes money to a specific member and how much
  const getDebtorsForMember = (member) => {
    const debts = calculateDetailedDebts()
    const debtors = []
    
    groupData.members.forEach(otherMember => {
      if (otherMember !== member && debts[otherMember] && debts[otherMember][member] > 0) {
        debtors.push({
          name: otherMember,
          amount: debts[otherMember][member]
        })
      }
    })
    
    return debtors.sort((a, b) => b.amount - a.amount)
  }

  // Get who a specific member owes money to and how much
  const getCreditorsForMember = (member) => {
    const debts = calculateDetailedDebts()
    const creditors = []
    
    if (debts[member]) {
      Object.entries(debts[member]).forEach(([creditor, amount]) => {
        if (amount > 0) {
          creditors.push({
            name: creditor,
            amount: amount
          })
        }
      })
    }
    
    return creditors.sort((a, b) => b.amount - a.amount)
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -20 }}
      variants={containerVariants}
      className="min-h-screen p-6 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl"
        />
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: "1s" }}
          className="absolute top-40 right-20 w-24 h-24 bg-purple-200/20 rounded-full blur-xl"
        />
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute bottom-20 left-1/3 w-40 h-40 bg-pink-200/20 rounded-full blur-xl"
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="p-3 hover:bg-white/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <motion.h1 
                className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {groupData.name}
              </motion.h1>
              <motion.div 
                className="flex items-center gap-2 text-gray-600"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Share className="w-4 h-4" />
                <span className="font-mono bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-lg border border-white/30">
                  {groupData.teamCode}
                </span>
              </motion.div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/70 backdrop-blur-sm text-gray-700 px-4 py-3 rounded-xl font-semibold shadow-lg border border-white/20 flex items-center gap-2 hover:bg-white/80 transition-all duration-300 disabled:opacity-50"
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.div>
              {refreshing ? 'Syncing...' : 'Refresh'}
            </motion.button>
            
            {/* Add Expense Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExpenseForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </motion.button>
          </div>
        </motion.div>

        {/* Last Refresh Info */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center mb-6"
        >
          <div className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg"
              >
                <Receipt className="w-5 h-5 text-white" />
              </motion.div>
              <h3 className="font-semibold text-gray-700">Total Expenses</h3>
            </div>
            <motion.p 
              className="text-3xl font-bold text-green-700"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              ₹{totalExpenses.toFixed(2)}
            </motion.p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg"
              >
                <Users className="w-5 h-5 text-white" />
              </motion.div>
              <h3 className="font-semibold text-gray-700">Members</h3>
            </div>
            <motion.p 
              className="text-3xl font-bold text-purple-700"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              {groupData.members.length}
            </motion.p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 p-2 rounded-lg"
              >
                <Activity className="w-5 h-5 text-white" />
              </motion.div>
              <h3 className="font-semibold text-gray-700">Transactions</h3>
            </div>
            <motion.p 
              className="text-3xl font-bold text-blue-700"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              {expenses.length}
            </motion.p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-lg"
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </motion.div>
              <h3 className="font-semibold text-gray-700">Average</h3>
            </div>
            <motion.p 
              className="text-3xl font-bold text-orange-700"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              ₹{averageExpense.toFixed(2)}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Members List with Balances */}
        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8 hover:shadow-xl transition-all duration-300">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Members & Balances
          </h3>
          <div className="grid gap-3">
            <AnimatePresence>
              {groupData.members.map((member, idx) => {
                const balance = calculateMemberBalance(member)
                const debtors = getDebtorsForMember(member)
                const creditors = getCreditorsForMember(member)
                
                return (
                  <motion.button
                    key={member}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMember(member)}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/70 to-purple-50/70 hover:from-blue-100/70 hover:to-purple-100/70 rounded-xl border border-white/30 transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-md"
                      >
                        <User className="w-4 h-4 text-white" />
                      </motion.div>
                      <div className="text-left">
                        <span className="font-medium text-gray-800 block">{member}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {debtors.length > 0 && (
                            <span className="text-green-600 font-medium">
                              {debtors.length} owe{debtors.length === 1 ? 's' : ''} you
                            </span>
                          )}
                          {debtors.length > 0 && creditors.length > 0 && <span className="mx-1">•</span>}
                          {creditors.length > 0 && (
                            <span className="text-red-600 font-medium">
                              You owe {creditors.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <motion.p 
                        className={`font-bold text-lg ${
                          balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {balance > 0 ? '+' : ''}₹{balance.toFixed(2)}
                      </motion.p>
                      <p className="text-xs text-gray-500 font-medium">
                        {balance > 0 ? 'gets back' : balance < 0 ? 'owes' : 'settled'}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Expenses List */}
        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="font-semibold text-gray-700 mb-6 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Recent Expenses
          </h3>
          
          {expenses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 text-gray-500"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              </motion.div>
              <p className="font-medium">No expenses yet.</p>
              <p className="text-sm">Add your first expense to get started!</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {expenses.map((expense, idx) => (
                  <motion.div
                    key={expense._id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/20 hover:bg-white/80 transition-all duration-300 backdrop-blur-sm hover:shadow-md"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{expense.description}</h4>
                      <p className="text-sm text-gray-600">
                        Paid by <span className="font-medium text-blue-600">{expense.paidBy}</span> • {new Date(expense.createdAt).toLocaleDateString()}
                      </p>
                      {expense.splitBetween && (
                        <p className="text-xs text-gray-500 mt-1">
                          Split between: <span className="font-medium">{expense.splitBetween.join(', ')}</span>
                          ({expense.splitBetween.length} people)
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <motion.span 
                          className="text-xl font-bold text-gray-800"
                          whileHover={{ scale: 1.1 }}
                        >
                          ₹{expense.amount.toFixed(2)}
                        </motion.span>
                        {expense.splitBetween && (
                          <p className="text-xs text-gray-500">
                            ₹{(expense.amount / expense.splitBetween.length).toFixed(2)} each
                          </p>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 hover:shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
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

      {/* Member Details Modal */}
      <AnimatePresence>
        {selectedMember && (
          <MemberDetails
            member={selectedMember}
            expenses={expenses}
            debtors={getDebtorsForMember(selectedMember)}
            creditors={getCreditorsForMember(selectedMember)}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Dashboard
