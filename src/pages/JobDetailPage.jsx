import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../services/database'
import { calculateMatchScore } from '../services/matchScore'
import { ArrowLeft, Bookmark, Send, User, MessageSquare, CheckCircle, Eye } from 'lucide-react'
import './JobDetailPage.css'

export default function JobDetailPage() {
  const { id } = useParams()
  const { user, currentRole } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [matchScore, setMatchScore] = useState(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJob()
    if (currentRole === 'finder') {
      loadApplications()
    } else {
      const match = calculateMatchScore(user, job || {})
      setMatchScore(match)
    }
  }, [id, currentRole])

  const loadJob = () => {
    const jobData = db.getJob(id)
    if (jobData) {
      setJob(jobData)
      db.incrementJobViews(id)
      if (currentRole === 'seeker') {
        const match = calculateMatchScore(user, jobData)
        setMatchScore(match)
      }
    }
    setLoading(false)
  }

  const loadApplications = () => {
    const appData = db.getApplications({ jobId: id })
    setApplications(appData)
  }

  const handleApply = async (e) => {
    e.preventDefault()
    try {
      db.createApplication(id, user.id, {
        message: applicationMessage,
        resumeUrl: null // In production, handle file upload
      })
      alert('Application submitted successfully!')
      setShowApplicationForm(false)
      setApplicationMessage('')
      loadApplications()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleStatusChange = (applicationId, newStatus) => {
    db.updateApplication(applicationId, { status: newStatus })
    loadApplications()
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!job) {
    return (
      <div className="error-page">
        <h2>Job not found</h2>
        <Link to="/seeker">Go back to jobs</Link>
      </div>
    )
  }

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="job-header-section">
          <div className="job-title-section">
            <h1>{job.title}</h1>
            <div className="job-meta">
              <span className="job-type">{job.type.replace(/-/g, ' ')}</span>
              <span className="job-status">{job.status}</span>
              {job.location && <span className="job-location">{job.location}</span>}
            </div>
          </div>
          {currentRole === 'seeker' && matchScore && (
            <div className="match-score-badge">
              <div className="match-score-value">
                {matchScore.score}%
              </div>
              <div className="match-score-label">Match Score</div>
            </div>
          )}
        </div>

        {currentRole === 'seeker' && matchScore && (
          <div className="match-breakdown">
            <h3>Match Breakdown</h3>
            <div className="breakdown-grid">
              <div className="breakdown-item">
                <span className="breakdown-label">Skills Match</span>
                <span className="breakdown-value">{matchScore.breakdown.skillMatch}%</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Interest Match</span>
                <span className="breakdown-value">{matchScore.breakdown.tagMatch}%</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Experience</span>
                <span className="breakdown-value">{matchScore.breakdown.experienceMatch}%</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Profile Completeness</span>
                <span className="breakdown-value">{matchScore.breakdown.profileCompleteness}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="job-content">
          <div className="job-description-section">
            <h2>Description</h2>
            <p>{job.description}</p>
          </div>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="job-skills-section">
              <h2>Required Skills</h2>
              <div className="skills-list">
                {job.requiredSkills.map(skill => (
                  <span key={skill} className="skill-badge">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {job.tags && job.tags.length > 0 && (
            <div className="job-tags-section">
              <h2>Tags</h2>
              <div className="tags-list">
                {job.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="job-details-grid">
            <div className="detail-item">
              <strong>Experience Level:</strong>
              <span>{job.experienceLevel || 'Not specified'}</span>
            </div>
            {job.location && (
              <div className="detail-item">
                <strong>Location:</strong>
                <span>{job.location}</span>
              </div>
            )}
            {job.budget && (
              <div className="detail-item">
                <strong>Budget:</strong>
                <span>{job.budget}</span>
              </div>
            )}
            <div className="detail-item">
              <strong>Posted:</strong>
              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="job-stats">
          <div className="stat-item">
            <Eye size={20} />
            <span>{job.views} views</span>
          </div>
          <div className="stat-item">
            <User size={20} />
            <span>{job.applications} applications</span>
          </div>
        </div>

        {currentRole === 'seeker' && (
          <div className="job-actions">
            <button onClick={() => setShowApplicationForm(true)} className="btn-primary">
              <Send size={20} />
              Apply Now
            </button>
            <button className="btn-secondary">
              <Bookmark size={20} />
              Save Job
            </button>
            <Link to={`/chat?userId=${job.userId}`} className="btn-secondary">
              <MessageSquare size={20} />
              Message Employer
            </Link>
          </div>
        )}

        {currentRole === 'finder' && job.userId === user.id && (
          <div className="applications-section">
            <h2>Applications ({applications.length})</h2>
            {applications.length === 0 ? (
              <p>No applications yet.</p>
            ) : (
              <div className="applications-list">
                {applications.map(app => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onStatusChange={(status) => handleStatusChange(app.id, status)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showApplicationForm && (
        <ApplicationModal
          onSubmit={handleApply}
          onClose={() => setShowApplicationForm(false)}
          message={applicationMessage}
          onChangeMessage={setApplicationMessage}
        />
      )}
    </div>
  )
}

function ApplicationCard({ application, onStatusChange }) {
  const user = db.getUser(application.userId)

  return (
    <div className="application-card">
      <div className="application-header">
        <div>
          <h3>{user?.name || 'Unknown User'}</h3>
          <p>{user?.email}</p>
        </div>
        <span className={`application-status ${application.status}`}>
          {application.status}
        </span>
      </div>
      {application.message && (
        <p className="application-message">{application.message}</p>
      )}
      <div className="application-actions">
        <button
          onClick={() => onStatusChange('shortlisted')}
          className={`btn-status ${application.status === 'shortlisted' ? 'active' : ''}`}
          disabled={application.status === 'shortlisted'}
        >
          Shortlist
        </button>
        <button
          onClick={() => onStatusChange('rejected')}
          className={`btn-status reject ${application.status === 'rejected' ? 'active' : ''}`}
          disabled={application.status === 'rejected'}
        >
          Reject
        </button>
        <button
          onClick={() => onStatusChange('accepted')}
          className={`btn-status accept ${application.status === 'accepted' ? 'active' : ''}`}
          disabled={application.status === 'accepted'}
        >
          Accept
        </button>
        <Link to={`/chat?userId=${application.userId}`} className="btn-secondary">
          <MessageSquare size={18} />
          Message
        </Link>
      </div>
    </div>
  )
}

function ApplicationModal({ onSubmit, onClose, message, onChangeMessage }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Apply for this Opportunity</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>
        <form onSubmit={onSubmit} className="application-form">
          <div className="form-group">
            <label>Cover Message *</label>
            <textarea
              value={message}
              onChange={(e) => onChangeMessage(e.target.value)}
              required
              rows={6}
              placeholder="Tell us why you're interested in this opportunity..."
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit Application</button>
          </div>
        </form>
      </div>
    </div>
  )
}

