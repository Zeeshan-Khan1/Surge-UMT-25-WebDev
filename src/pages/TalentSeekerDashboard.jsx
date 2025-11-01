import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../services/database'
import { getRecommendedJobs, calculateMatchScore } from '../services/matchScore'
import { Search, Filter, Bookmark, User, LogOut, Briefcase, MessageSquare } from 'lucide-react'
import './Dashboard.css'

export default function TalentSeekerDashboard() {
  const { user, logout, toggleRole, currentRole } = useAuth()
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [jobs, searchTerm, filterType])

  const loadJobs = () => {
    const allJobs = db.getJobs({ status: 'active' })
    setJobs(allJobs)
    const recommendedJobs = getRecommendedJobs(user, allJobs, 5)
    setRecommended(recommendedJobs.map(r => r.job))
    setLoading(false)
  }

  const filterJobs = () => {
    let filtered = [...jobs]

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(job => job.type === filterType)
    }

    setFilteredJobs(filtered)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleJobClick = (jobId) => {
    db.incrementJobViews(jobId)
    navigate(`/job/${jobId}`)
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
          <h1>Browse Opportunities</h1>
          <p>Find the perfect opportunity that matches your skills</p>
        </div>

        <div className="search-filters">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search jobs by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-bar">
            <Filter size={18} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="academic-projects">Academic Projects</option>
              <option value="startup-collaborations">Startup/Collaborations</option>
              <option value="part-time-jobs">Part-time Jobs</option>
              <option value="competitions-hackathons">Competitions/Hackathons</option>
              <option value="team-search">Team Search</option>
            </select>
          </div>
        </div>

        {recommended.length > 0 && (
          <section className="recommended-section">
            <h2>Recommended for You</h2>
            <div className="jobs-grid">
              {recommended.map(job => (
                <JobCard key={job.id} job={job} user={user} onClick={() => handleJobClick(job.id)} />
              ))}
            </div>
          </section>
        )}

        <section className="all-jobs-section">
          <h2>{recommended.length > 0 ? 'All Opportunities' : 'Opportunities'}</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <p>No jobs found matching your criteria.</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map(job => (
                <JobCard key={job.id} job={job} user={user} onClick={() => handleJobClick(job.id)} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function JobCard({ job, user, onClick }) {
  const matchScore = calculateMatchScore(user, job)

  return (
    <div className="job-card" onClick={onClick}>
      <div className="job-header">
        <h3>{job.title}</h3>
        <span className="job-type">{job.type.replace(/-/g, ' ')}</span>
      </div>
      <p className="job-description">{job.description.substring(0, 150)}...</p>
      <div className="job-tags">
        {job.tags.slice(0, 3).map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <div className="job-footer">
        <div className="match-score">
          <span className="match-label">Match Score:</span>
          <span className={`match-value ${matchScore.score >= 70 ? 'high' : matchScore.score >= 50 ? 'medium' : 'low'}`}>
            {matchScore.score}%
          </span>
        </div>
        <div className="job-stats">
          <span>{job.views} views</span>
          <span>{job.applications} applications</span>
        </div>
      </div>
    </div>
  )
}

