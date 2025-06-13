// src/components/MemberDetails.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { X, User, Receipt, ArrowRight, ArrowLeft, Users } from 'lucide-react'

const MemberDetails = ({ member, expenses, debtors, creditors, onClose }) => {
  // Calculate member's expenses
  const memberExpenses = expenses.filter(expense => 
    expense.splitBetween.includes(member)
  )
  
  const totalOwed = memberExpenses.reduce((sum, expense) => {
    return sum + (expense.amount / expense.splitBetween.length)
  }, 0)

  const expensesPaidByMember = expenses.filter(expense => expense.paidBy === member)
  const totalPaid = expensesPaidByMember.reduce((sum, expense) => sum + expense.amount, 0)

  const netBalance = totalPaid - totalOwed

  const totalToReceive = debtors.reduce((sum, debtor) => sum + debtor.amount, 0)
  const totalToPay = creditors.reduce((sum, creditor) => sum + creditor.amount, 0)

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
        className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{member}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-sm text-green-600 font-medium">Total Paid</p>
            <p className="text-2xl font-bold text-green-700">₹{totalPaid.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-600 font-medium">Total Owes</p>
            <p className="text-2xl font-bold text-orange-700">₹{totalOwed.toFixed(2)}</p>
          </div>
        </div>

        {/* Net Balance */}
        <div className={`p-4 rounded-xl border-2 mb-6 ${
          netBalance > 0 
            ? 'bg-green-50 border-green-200' 
            : netBalance < 0 
              ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'
        }`}>
          <p className="text-sm font-medium text-gray-600">Net Balance</p>
          <p className={`text-3xl font-bold ${
            netBalance > 0 
              ? 'text-green-700' 
              : netBalance < 0 
                ? 'text-red-700'
                : 'text-gray-700'
          }`}>
            {netBalance > 0 ? '+' : ''}₹{netBalance.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {netBalance > 0 ? 'Should receive' : netBalance < 0 ? 'Should pay' : 'All settled up!'}
          </p>
        </div>

        {/* Detailed Debt Breakdown */}
        <div className="space-y-6">
          {/* People who owe this member */}
          {debtors.length > 0 && (
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                People who owe {member} (₹{totalToReceive.toFixed(2)} total)
              </h4>
              <div className="space-y-3">
                {debtors.map((debtor, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/70 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium text-gray-800">{debtor.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">₹{debtor.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">owes to {member}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People this member owes */}
          {creditors.length > 0 && (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
              <h4 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                {member} owes to (₹{totalToPay.toFixed(2)} total)
              </h4>
              <div className="space-y-3">
                {creditors.map((creditor, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/70 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500 p-2 rounded-lg">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium text-gray-800">{creditor.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-700">₹{creditor.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{member} owes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All settled message */}
          {debtors.length === 0 && creditors.length === 0 && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">All settled up!</p>
              <p className="text-sm text-gray-500">No pending debts with other members</p>
            </div>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="mt-8 space-y-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Expense Breakdown ({memberExpenses.length} expenses)
          </h4>
          
          {memberExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No expenses to split</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {memberExpenses.map((expense) => {
                const memberShare = expense.amount / expense.splitBetween.length
                return (
                  <div key={expense._id} className="bg-gray-50 p-3 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{expense.description}</h5>
                        <p className="text-sm text-gray-600">
                          Paid by {expense.paidBy} • Split {expense.splitBetween.length} ways
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">₹{memberShare.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">of ₹{expense.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Split between: {expense.splitBetween.join(', ')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Settlement Suggestions */}
        {(debtors.length > 0 || creditors.length > 0) && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-3">Settlement Suggestions</h5>
            <div className="space-y-2 text-sm">
              {creditors.map((creditor, idx) => (
                <p key={idx} className="text-blue-700">
                  • {member} should pay ₹{creditor.amount.toFixed(2)} to {creditor.name}
                </p>
              ))}
              {debtors.map((debtor, idx) => (
                <p key={idx} className="text-blue-700">
                  • {debtor.name} should pay ₹{debtor.amount.toFixed(2)} to {member}
                </p>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default MemberDetails