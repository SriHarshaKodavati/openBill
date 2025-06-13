// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Users, Receipt, Share, User } from 'lucide-react'
import { getGroupData, addExpense, deleteExpense } from '../utils/api'
import ExpenseForm from './ExpenseForm'
import MemberDetails from './MemberDetails'

const Dashboard = ({ groupData: initialGroupData, onBack }) => {
  const [groupData, setGroupData] = useState(initialGroupData)
  const [expenses, setExpenses] = useState([])
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
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
              <Receipt className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-700">Total Expenses</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">₹{totalExpenses.toFixed(2)}</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-700">Members</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">{groupData.members.length}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Receipt className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-700">Transactions</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">{expenses.length}</p>
          </div>
        </div>

        {/* Members List with Balances */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Members & Balances
          </h3>
          <div className="grid gap-3">
            {groupData.members.map((member, idx) => {
              const balance = calculateMemberBalance(member)
              const debtors = getDebtorsForMember(member)
              const creditors = getCreditorsForMember(member)
              
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMember(member)}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl border border-white/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-gray-800 block">{member}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {debtors.length > 0 && (
                          <span className="text-green-600">
                            {debtors.length} owe{debtors.length === 1 ? 's' : ''} you
                          </span>
                        )}
                        {debtors.length > 0 && creditors.length > 0 && <span className="mx-1">•</span>}
                        {creditors.length > 0 && (
                          <span className="text-red-600">
                            You owe {creditors.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {balance > 0 ? '+' : ''}₹{balance.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {balance > 0 ? 'gets back' : balance < 0 ? 'owes' : 'settled'}
                    </p>
                  </div>
                </motion.button>
              )
            })}
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
                      {expense.splitBetween && (
                        <p className="text-xs text-gray-500 mt-1">
                          Split between: {expense.splitBetween.join(', ')} 
                          ({expense.splitBetween.length} people)
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xl font-bold text-gray-800">₹{expense.amount.toFixed(2)}</span>
                        {expense.splitBetween && (
                          <p className="text-xs text-gray-500">
                            ₹{(expense.amount / expense.splitBetween.length).toFixed(2)} each
                          </p>
                        )}
                      </div>
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