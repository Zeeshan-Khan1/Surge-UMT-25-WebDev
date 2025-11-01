import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { User, Edit, Save, X, LogOut, Briefcase, MessageSquare } from 'lucide-react'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, updateProfile, logout, toggleRole, currentRole } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    experienceLevel: user?.experienceLevel || 'intermediate'
  })
  const navigate = useNavigate()

  const handleSave = () => {
    const updates = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      interests: formData.interests.split(',').map(i => i.trim()).filter(i => i)
    }
    updateProfile(updates)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      skills: user?.skills?.join(', ') || '',
      interests: user?.interests?.join(', ') || '',
      experienceLevel: user?.experienceLevel || 'intermediate'
    })
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="profile-page">
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
            {currentRole === 'seeker' && (
              <Link to="/seeker" className="nav-link">
                Browse Jobs
              </Link>
            )}
            {currentRole === 'finder' && (
              <Link to="/finder" className="nav-link">
                My Posts
              </Link>
            )}
            <button onClick={handleLogout} className="nav-link logout">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              <User size={48} />
            </div>
            <div className="profile-info">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="profile-name-input"
                />
              ) : (
                <h1>{user?.name || 'User'}</h1>
              )}
              <p>{user?.email}</p>
            </div>
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="btn-icon save">
                    <Save size={18} />
                    Save
                  </button>
                  <button onClick={handleCancel} className="btn-icon cancel">
                    <X size={18} />
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn-icon">
                  <Edit size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="profile-content">
            <section className="profile-section">
              <h2>About</h2>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="profile-bio-input"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="profile-bio">{user?.bio || 'No bio yet.'}</p>
              )}
            </section>

            <section className="profile-section">
              <h2>Skills</h2>
              {isEditing ? (
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="React, Node.js, Python (comma-separated)"
                />
              ) : (
                <div className="skills-list">
                  {user?.skills && user.skills.length > 0 ? (
                    user.skills.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))
                  ) : (
                    <p>No skills added yet.</p>
                  )}
                </div>
              )}
            </section>

            <section className="profile-section">
              <h2>Interests</h2>
              {isEditing ? (
                <input
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="Web Development, AI, Startups (comma-separated)"
                />
              ) : (
                <div className="interests-list">
                  {user?.interests && user.interests.length > 0 ? (
                    user.interests.map(interest => (
                      <span key={interest} className="interest-tag">{interest}</span>
                    ))
                  ) : (
                    <p>No interests added yet.</p>
                  )}
                </div>
              )}
            </section>

            <section className="profile-section">
              <h2>Experience Level</h2>
              {isEditing ? (
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="profile-select"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              ) : (
                <p className="experience-level">{user?.experienceLevel || 'Not specified'}</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

