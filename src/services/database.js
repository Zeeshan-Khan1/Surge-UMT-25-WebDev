// Database service using localStorage for demo
// In production, this would connect to a real database

class Database {
  constructor() {
    this.init()
  }

  init() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]))
    }
    if (!localStorage.getItem('jobs')) {
      localStorage.setItem('jobs', JSON.stringify([]))
    }
    if (!localStorage.getItem('applications')) {
      localStorage.setItem('applications', JSON.stringify([]))
    }
    if (!localStorage.getItem('messages')) {
      localStorage.setItem('messages', JSON.stringify([]))
    }
  }

  // User operations
  createUser(email, password, name, skills = [], bio = '') {
    const users = this.getUsers()
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists')
    }

    const user = {
      id: this.generateId(),
      email,
      password, // In production, hash this
      name,
      skills,
      bio,
      createdAt: new Date().toISOString(),
      profileScore: 0
    }

    users.push(user)
    this.saveUsers(users)
    return { ...user, password: undefined }
  }

  authenticateUser(email, password) {
    const users = this.getUsers()
    const user = users.find(u => u.email === email && u.password === password)
    if (user) {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    }
    return null
  }

  getUser(id) {
    const users = this.getUsers()
    const user = users.find(u => u.id === id)
    if (user) {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    }
    return null
  }

  updateUser(id, updates) {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === id)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      this.saveUsers(users)
      return users[index]
    }
    return null
  }

  // Job operations
  createJob(userId, jobData) {
    const jobs = this.getJobs()
    const job = {
      id: this.generateId(),
      userId,
      ...jobData,
      status: 'active',
      createdAt: new Date().toISOString(),
      views: 0,
      applications: 0,
      interested: 0
    }
    jobs.push(job)
    this.saveJobs(jobs)
    return job
  }

  getJobs(filters = {}) {
    let jobs = JSON.parse(localStorage.getItem('jobs') || '[]')
    
    if (filters.userId) {
      jobs = jobs.filter(j => j.userId === filters.userId)
    }
    if (filters.status) {
      jobs = jobs.filter(j => j.status === filters.status)
    }
    if (filters.type) {
      jobs = jobs.filter(j => j.type === filters.type)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(searchLower) ||
        j.description.toLowerCase().includes(searchLower) ||
        j.tags.some(t => t.toLowerCase().includes(searchLower))
      )
    }
    if (filters.tags && filters.tags.length > 0) {
      jobs = jobs.filter(j => 
        filters.tags.some(tag => j.tags.includes(tag))
      )
    }

    return jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  getJob(id) {
    const jobs = this.getJobs()
    return jobs.find(j => j.id === id)
  }

  updateJob(id, updates) {
    const jobs = this.getJobs()
    const index = jobs.findIndex(j => j.id === id)
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates }
      this.saveJobs(jobs)
      return jobs[index]
    }
    return null
  }

  deleteJob(id) {
    const jobs = this.getJobs()
    const filtered = jobs.filter(j => j.id !== id)
    this.saveJobs(filtered)
    return true
  }

  incrementJobViews(id) {
    const job = this.getJob(id)
    if (job) {
      this.updateJob(id, { views: job.views + 1 })
    }
  }

  // Application operations
  createApplication(jobId, userId, applicationData) {
    const applications = this.getApplications()
    
    // Check if already applied
    if (applications.find(a => a.jobId === jobId && a.userId === userId)) {
      throw new Error('Already applied to this job')
    }

    const application = {
      id: this.generateId(),
      jobId,
      userId,
      ...applicationData,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    applications.push(application)
    this.saveApplications(applications)
    
    // Update job applications count
    const job = this.getJob(jobId)
    if (job) {
      this.updateJob(jobId, { applications: job.applications + 1 })
    }

    return application
  }

  getApplications(filters = {}) {
    let applications = JSON.parse(localStorage.getItem('applications') || '[]')
    
    if (filters.jobId) {
      applications = applications.filter(a => a.jobId === filters.jobId)
    }
    if (filters.userId) {
      applications = applications.filter(a => a.userId === filters.userId)
    }
    if (filters.status) {
      applications = applications.filter(a => a.status === filters.status)
    }

    return applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  updateApplication(id, updates) {
    const applications = this.getApplications()
    const index = applications.findIndex(a => a.id === id)
    if (index !== -1) {
      applications[index] = { ...applications[index], ...updates }
      this.saveApplications(applications)
      return applications[index]
    }
    return null
  }

  // Message operations
  createMessage(fromId, toId, text, jobId = null) {
    const messages = this.getMessages()
    const message = {
      id: this.generateId(),
      fromId,
      toId,
      jobId,
      text,
      read: false,
      createdAt: new Date().toISOString()
    }
    messages.push(message)
    this.saveMessages(messages)
    return message
  }

  getMessages(filters = {}) {
    let messages = JSON.parse(localStorage.getItem('messages') || '[]')
    
    if (filters.userId) {
      messages = messages.filter(m => 
        m.fromId === filters.userId || m.toId === filters.userId
      )
    }
    if (filters.otherUserId) {
      messages = messages.filter(m => 
        (m.fromId === filters.userId && m.toId === filters.otherUserId) ||
        (m.fromId === filters.otherUserId && m.toId === filters.userId)
      )
    }

    return messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  markMessagesAsRead(userId, otherUserId) {
    const messages = this.getMessages({ userId, otherUserId })
    messages.forEach(m => {
      if (m.toId === userId) {
        this.updateMessage(m.id, { read: true })
      }
    })
  }

  updateMessage(id, updates) {
    const messages = this.getMessages()
    const index = messages.findIndex(m => m.id === id)
    if (index !== -1) {
      messages[index] = { ...messages[index], ...updates }
      this.saveMessages(messages)
      return messages[index]
    }
    return null
  }

  // Helper methods
  getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]')
  }

  saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users))
  }

  getJobs() {
    return JSON.parse(localStorage.getItem('jobs') || '[]')
  }

  saveJobs(jobs) {
    localStorage.setItem('jobs', JSON.stringify(jobs))
  }

  getApplications() {
    return JSON.parse(localStorage.getItem('applications') || '[]')
  }

  saveApplications(applications) {
    localStorage.setItem('applications', JSON.stringify(applications))
  }

  getMessages() {
    return JSON.parse(localStorage.getItem('messages') || '[]')
  }

  saveMessages(messages) {
    localStorage.setItem('messages', JSON.stringify(messages))
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

export const db = new Database()

