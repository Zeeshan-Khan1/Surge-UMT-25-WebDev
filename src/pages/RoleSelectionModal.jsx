import React from 'react'
import { User, Briefcase, GraduationCap, X } from 'lucide-react'
import './RoleSelectionModal.css'

const roles = [
  {
    id: 'student',
    title: 'Student / Talent Seeker',
    description: 'Browse opportunities, apply for jobs, and find projects that match your skills',
    icon: User,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    email: 'student@university.edu',
    features: ['Browse Opportunities', 'Match Scoring', 'Apply Easily', 'Track Applications']
  },
  {
    id: 'recruiter',
    title: 'Recruiter / Talent Finder',
    description: 'Post opportunities, manage applicants, and find the perfect candidates',
    icon: Briefcase,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    email: 'recruiter@startup.com',
    features: ['Post Jobs', 'Manage Applicants', 'Analytics Dashboard', 'Direct Messaging']
  },
  {
    id: 'professor',
    title: 'Professor / Researcher',
    description: 'Find students for research projects and academic collaborations',
    icon: GraduationCap,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    email: 'professor@university.edu',
    features: ['Academic Projects', 'Student Matching', 'Research Opportunities', 'Team Building']
  }
]

export default function RoleSelectionModal({ onSelectRole, onClose }) {
  return (
    <div className="role-modal-overlay" onClick={onClose}>
      <div className="role-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="role-modal-header">
          <h2>Choose Your Role</h2>
          <p>Select how you want to use CampusConnect</p>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="roles-grid">
          {roles.map((role) => {
            const IconComponent = role.icon
            return (
              <div
                key={role.id}
                className="role-card"
                onClick={() => onSelectRole(role)}
                style={{ '--role-gradient': role.gradient }}
              >
                <div className="role-card-header" style={{ background: role.gradient }}>
                  <IconComponent size={32} />
                </div>
                <div className="role-card-body">
                  <h3>{role.title}</h3>
                  <p>{role.description}</p>
                  <div className="role-features">
                    {role.features.map((feature, idx) => (
                      <span key={idx} className="role-feature-tag">{feature}</span>
                    ))}
                  </div>
                  <div className="role-demo-info">
                    <small>Demo: {role.email}</small>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

