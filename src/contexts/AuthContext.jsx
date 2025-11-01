import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/database'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentRole, setCurrentRole] = useState('seeker') // 'finder' or 'seeker'

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('currentUser')
    const savedRole = localStorage.getItem('currentRole')
    
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setCurrentRole(savedRole || 'seeker')
    }
    setLoading(false)
  }, [])

  const signup = async (email, password, name, skills = []) => {
    try {
      const userData = db.createUser(email, password, name, skills)
      setUser(userData)
      localStorage.setItem('currentUser', JSON.stringify(userData))
      localStorage.setItem('currentRole', 'seeker')
      setCurrentRole('seeker')
      return { success: true, user: userData }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const login = async (email, password) => {
    try {
      const userData = db.authenticateUser(email, password)
      if (userData) {
        setUser(userData)
        localStorage.setItem('currentUser', JSON.stringify(userData))
        const savedRole = localStorage.getItem('currentRole') || 'seeker'
        setCurrentRole(savedRole)
        return { success: true, user: userData }
      }
      return { success: false, error: 'Invalid credentials' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    setCurrentRole('seeker')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('currentRole')
  }

  const toggleRole = () => {
    const newRole = currentRole === 'finder' ? 'seeker' : 'finder'
    setCurrentRole(newRole)
    localStorage.setItem('currentRole', newRole)
  }

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    db.updateUser(user.id, updates)
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    currentRole,
    loading,
    signup,
    login,
    logout,
    toggleRole,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

