// stores/auth.js
import { defineStore } from 'pinia'

export const useAuth = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    isAdmin: false,
  }),
  actions: {
    setToken(token) {
      // Ensure we never store a stringified string
      this.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    logout() {
      this.token = null
      this.isAdmin = false
      localStorage.removeItem('token')
    },
    // Add this new method to check auth state
    isAuthenticated() {
      return !!this.token
    },
  },
})
