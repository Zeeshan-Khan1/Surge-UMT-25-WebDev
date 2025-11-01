import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Search, Users, Briefcase, Award, MessageSquare, Zap, TrendingUp, Shield, CheckCircle, ArrowRight } from 'lucide-react'
import RoleSelectionModal from './RoleSelectionModal'
import './LandingPage.css'

export default function LandingPage() {
  const { user } = useAuth()
  const [showRoleModal, setShowRoleModal] = useState(false)
  const navigate = useNavigate()

  const handleRoleSelect = (role) => {
    setShowRoleModal(false)
    // Navigate to login page with role pre-selected
    navigate(`/login?role=${role.id}`)
  }

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-container">
          <h1 className="logo">CampusConnect</h1>
          <div className="nav-links">
            {user ? (
              <>
                <Link to="/seeker">Browse Jobs</Link>
                <Link to="/finder">Post Opportunities</Link>
                <Link to="/profile">Profile</Link>
              </>
            ) : (
              <>
                <button className="nav-login-btn" onClick={() => setShowRoleModal(true)}>
                  Login
                </button>
                <Link to="/signup" className="btn-nav-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {showRoleModal && (
        <RoleSelectionModal
          onSelectRole={handleRoleSelect}
          onClose={() => setShowRoleModal(false)}
        />
      )}

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={16} />
            <span>Connecting Students with Opportunities</span>
          </div>
          <h1>The University Talent Finder</h1>
          <p className="hero-subtitle">
            Connect students with opportunities - part-time work, startup gigs, 
            academic projects, competitions, and collaborations all in one place.
            Join a vibrant community of students, recruiters, and researchers.
          </p>
          {!user && (
            <div className="hero-actions">
              <Link to="/signup" className="btn-primary btn-large">
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <button className="btn-secondary btn-large" onClick={() => setShowRoleModal(true)}>
                Login
              </button>
            </div>
          )}
          {!user && (
            <div className="demo-info">
              <p>
                💡 <strong>Try Demo:</strong> Click Login → Select a role → Use password: <code>demo123</code>
              </p>
            </div>
          )}
          <div className="hero-stats">
            <div className="stat-item">
              <strong>500+</strong>
              <span>Active Opportunities</span>
            </div>
            <div className="stat-item">
              <strong>2,000+</strong>
              <span>Students</span>
            </div>
            <div className="stat-item">
              <strong>100+</strong>
              <span>Recruiters</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose CampusConnect?</h2>
            <p className="section-subtitle">Everything you need to connect students with opportunities</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Briefcase className="feature-icon" />
              </div>
              <h3>Talent Finder</h3>
              <p>Post jobs and opportunities. Manage applicants and find the perfect match for your projects with ease.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Search className="feature-icon" />
              </div>
              <h3>Talent Seeker</h3>
              <p>Browse opportunities tailored to your skills. Get personalized recommendations based on your profile.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Award className="feature-icon" />
              </div>
              <h3>Smart Match Score</h3>
              <p>See how well you match with opportunities. AI-powered compatibility scoring saves you time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <MessageSquare className="feature-icon" />
              </div>
              <h3>Real-time Chat</h3>
              <p>Communicate directly with employers or applicants. Streamlined messaging in one place.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Users className="feature-icon" />
              </div>
              <h3>Flexible Roles</h3>
              <p>Switch between Talent Finder and Seeker modes without logging out. One account, multiple roles.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <TrendingUp className="feature-icon" />
              </div>
              <h3>Track Progress</h3>
              <p>Monitor your applications, views, and matches. Stay organized with our intuitive dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p className="section-subtitle">Get started in three simple steps</p>
          </div>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3>Create Your Profile</h3>
              <p>Sign up and complete your profile with your skills, interests, and experience level.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3>Browse or Post</h3>
              <p>As a student, browse opportunities. As a recruiter, post jobs and find talent.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3>Connect & Apply</h3>
              <p>Get matched, apply, and connect directly through our built-in messaging system.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefit-item">
              <CheckCircle className="benefit-icon" />
              <h3>Free to Use</h3>
              <p>No hidden fees. Completely free for students and recruiters.</p>
            </div>
            <div className="benefit-item">
              <Shield className="benefit-icon" />
              <h3>Secure Platform</h3>
              <p>Your data is protected with industry-standard security measures.</p>
            </div>
            <div className="benefit-item">
              <Zap className="benefit-icon" />
              <h3>Fast Matching</h3>
              <p>Our algorithm matches you with the best opportunities in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of students and recruiters already using CampusConnect</p>
          {!user && (
            <div className="cta-actions">
              <Link to="/signup" className="btn-primary btn-large">
                Create Your Account
                <ArrowRight size={20} />
              </Link>
              <button className="btn-secondary btn-large" onClick={() => setShowRoleModal(true)}>
                Login to Existing Account
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2025 CampusConnect. Built for Surge '25 Web Hackathon.</p>
        </div>
      </footer>
    </div>
  )
}

