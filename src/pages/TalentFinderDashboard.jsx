import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../services/database'
import { Plus, Edit, Trash2, Eye, Users, LogOut, User, MessageSquare, Briefcase, BarChart3 } from 'lucide-react'
import './Dashboard.css'
import './TalentFinderDashboard.css'

export default function TalentFinderDashboard() {
  const { user, logout, toggleRole, currentRole } = useAuth()
  const [jobs, setJobs] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [analytics, setAnalytics] = useState({ totalViews: 0, totalApplications: 0, activeJobs: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    loadJobs()
    calculateAnalytics()
  }, [])

  const loadJobs = () => {
    const userJobs = db.getJobs({ userId: user.id })
    setJobs(userJobs)
  }

  const calculateAnalytics = () => {
    const userJobs = db.getJobs({ userId: user.id })
    const totalViews = userJobs.reduce((sum, job) => sum + job.views, 0)
    const totalApplications = userJobs.reduce((sum, job) => sum + job.applications, 0)
    const activeJobs = userJobs.filter(job => job.status === 'active').length

    setAnalytics({ totalViews, totalApplications, activeJobs })
  }

  const handleCreateJob = (jobData) => {
    db.createJob(user.id, jobData)
    loadJobs()
    calculateAnalytics()
    setShowCreateModal(false)
  }

  const handleUpdateJob = (id, updates) => {
    db.updateJob(id, updates)
    loadJobs()
    calculateAnalytics()
    setEditingJob(null)
  }

  const handleDeleteJob = (id) => {
    if (confirm('Are you sure you want to delete this job?')) {
      db.deleteJob(id)
      loadJobs()
      calculateAnalytics()
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleJobClick = (jobId) => {
    const applications = db.getApplications({ jobId })
    navigate(`/job/${jobId}`, { state: { applications } })
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-container">
          <Link to="/" className="logo">CampusConnect</Link>
          <div className="nav-right">
            <button onClick={toggleRole} className="role-toggle">
              <Briefcase size={18} />
              Switch to {currentRole === 'finder' ? 'Seeker' : 'Finder'}
            </button>
            <Link to="/chat" className="nav-link">
              <MessageSquare size={18} />
              Messages
            </Link>
            <Link to="/profile" className="nav-link">
              <User size={18} />
              Profile
            </Link>
            <button onClick={handleLogout} className="nav-link logout">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Manage Opportunities</h1>
            <p>Create and manage your job postings</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus size={20} />
            Create New Post
          </button>
        </div>

        <div className="analytics-section">
          <div className="analytics-card">
            <BarChart3 size={24} />
            <div>
              <h3>{analytics.totalViews}</h3>
              <p>Total Views</p>
            </div>
          </div>
          <div className="analytics-card">
            <Users size={24} />
            <div>
              <h3>{analytics.totalApplications}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          <div className="analytics-card">
            <Briefcase size={24} />
            <div>
              <h3>{analytics.activeJobs}</h3>
              <p>Active Jobs</p>
            </div>
          </div>
        </div>

        <section className="jobs-section">
          <h2>Your Job Postings</h2>
          {jobs.length === 0 ? (
            <div className="empty-state">
              <p>You haven't posted any jobs yet. Create your first opportunity!</p>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map(job => (
                <JobManagementCard
                  key={job.id}
                  job={job}
                  onEdit={() => setEditingJob(job)}
                  onDelete={() => handleDeleteJob(job.id)}
                  onClick={() => handleJobClick(job.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showCreateModal && (
        <JobFormModal
          onSubmit={handleCreateJob}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingJob && (
        <JobFormModal
          job={editingJob}
          onSubmit={(data) => handleUpdateJob(editingJob.id, data)}
          onClose={() => setEditingJob(null)}
        />
      )}
    </div>
  )
}

function JobManagementCard({ job, onEdit, onDelete, onClick }) {
  const applications = db.getApplications({ jobId: job.id })

  return (
    <div className="job-management-card">
      <div className="job-card-content" onClick={onClick}>
        <div className="job-header">
          <h3>{job.title}</h3>
          <span className={`job-status ${job.status}`}>{job.status}</span>
        </div>
        <p className="job-description">{job.description.substring(0, 200)}...</p>
        <div className="job-tags">
          {job.tags.slice(0, 5).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <div className="job-stats">
          <span><Eye size={16} /> {job.views} views</span>
          <span><Users size={16} /> {applications.length} applications</span>
        </div>
      </div>
      <div className="job-actions">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="btn-icon">
          <Edit size={18} />
          Edit
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="btn-icon btn-danger">
          <Trash2 size={18} />
          Delete
        </button>
      </div>
    </div>
  )
}

function JobFormModal({ job, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    description: job?.description || '',
    type: job?.type || 'academic-projects',
    tags: job?.tags?.join(', ') || '',
    requiredSkills: job?.requiredSkills?.join(', ') || '',
    experienceLevel: job?.experienceLevel || 'intermediate',
    location: job?.location || '',
    budget: job?.budget || '',
    status: job?.status || 'draft'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const jobData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
      experienceLevel: formData.experienceLevel,
      location: formData.location,
      budget: formData.budget,
      status: formData.status
    }

    onSubmit(jobData)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{job ? 'Edit Job' : 'Create New Job'}</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Frontend Developer for Startup"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Describe the opportunity, requirements, and what you're looking for..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="academic-projects">Academic Projects</option>
                <option value="startup-collaborations">Startup/Collaborations</option>
                <option value="part-time-jobs">Part-time Jobs</option>
                <option value="competitions-hackathons">Competitions/Hackathons</option>
                <option value="team-search">Team Search</option>
              </select>
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="React, Web Development, Remote"
            />
          </div>

          <div className="form-group">
            <label>Required Skills (comma-separated)</label>
            <input
              type="text"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              placeholder="JavaScript, React, Node.js"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Remote / On-campus"
              />
            </div>

            <div className="form-group">
              <label>Budget (Optional)</label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="$500 / Unpaid / Equity"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

