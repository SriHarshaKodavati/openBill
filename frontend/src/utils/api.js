// src/utils/api.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Create a new group
export const createGroup = async (name, memberName) => {
  try {
    const response = await api.post('/groups', { name, memberName })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create group')
  }
}

// Join existing group
export const joinGroup = async (teamCode, memberName) => {
  try {
    const response = await api.post('/groups/join', { teamCode, memberName })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to join group')
  }
}

// Get group data and expenses
export const getGroupData = async (teamCode) => {
  try {
    const response = await api.get(`/groups/${teamCode}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch group data')
  }
}

// Add new expense
export const addExpense = async (expenseData) => {
  try {
    const response = await api.post('/expenses', expenseData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add expense')
  }
}

// Delete expense
export const deleteExpense = async (expenseId) => {
  try {
    const response = await api.delete(`/expenses/${expenseId}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete expense')
  }
}

export default api