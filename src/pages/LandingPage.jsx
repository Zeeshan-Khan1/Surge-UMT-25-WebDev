import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Search, Users, Briefcase, Award, MessageSquare } from 'lucide-react'
import './LandingPage.css'

export default function LandingPage() {
  const { user } = useAuth()

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
                <Link to="/login">Login</Link>
                <Link to="/signup" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>The University Talent Finder</h1>
          <p className="hero-subtitle">
            Connect students with opportunities - part-time work, startup gigs, 
            academic projects, competitions, and collaborations all in one place.
          </p>
          {!user && (
            <div className="hero-actions">
              <Link to="/signup" className="btn-primary btn-large">Get Started</Link>
              <Link to="/login" className="btn-secondary btn-large">Sign In</Link>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why CampusConnect?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Briefcase className="feature-icon" />
              <h3>Talent Finder</h3>
              <p>Post jobs and opportunities. Manage applicants and find the perfect match for your projects.</p>
            </div>
            <div className="feature-card">
              <Search className="feature-icon" />
              <h3>Talent Seeker</h3>
              <p>Browse opportunities tailored to your skills. Get personalized recommendations.</p>
            </div>
            <div className="feature-card">
              <Award className="feature-icon" />
              <h3>Match Score</h3>
              <p>See how well you match with opportunities. AI-powered compatibility scoring.</p>
            </div>
            <div className="feature-card">
              <MessageSquare className="feature-icon" />
              <h3>Real-time Chat</h3>
              <p>Communicate directly with employers or applicants. Streamlined messaging.</p>
            </div>
            <div className="feature-card">
              <Users className="feature-icon" />
              <h3>Role Switching</h3>
              <p>Switch between Talent Finder and Seeker modes without logging out.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Connect?</h2>
          <p>Join thousands of students already using CampusConnect</p>
          {!user && (
            <Link to="/signup" className="btn-primary btn-large">Create Your Account</Link>
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

