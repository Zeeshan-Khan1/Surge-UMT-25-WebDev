import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../services/database'
import { Send, User, LogOut, Briefcase, MessageSquare, ArrowLeft } from 'lucide-react'
import './ChatPage.css'

export default function ChatPage() {
  const { user, logout, toggleRole, currentRole } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(searchParams.get('userId') || null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [otherUser, setOtherUser] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId)
      const other = db.getUser(selectedUserId)
      setOtherUser(other)
      db.markMessagesAsRead(user.id, selectedUserId)
    }
  }, [selectedUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = () => {
    const allMessages = db.getMessages({ userId: user.id })
    const userIds = new Set()
    
    allMessages.forEach(msg => {
      if (msg.fromId === user.id) {
        userIds.add(msg.toId)
      } else {
        userIds.add(msg.fromId)
      }
    })

    const conversationsList = Array.from(userIds).map(id => {
      const other = db.getUser(id)
      const userMessages = db.getMessages({ userId: user.id, otherUserId: id })
      const lastMessage = userMessages[userMessages.length - 1]
      const unreadCount = userMessages.filter(m => m.toId === user.id && !m.read).length

      return {
        userId: id,
        user: other,
        lastMessage,
        unreadCount
      }
    }).sort((a, b) => {
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    })

    setConversations(conversationsList)
  }

  const loadMessages = (otherUserId) => {
    const userMessages = db.getMessages({ userId: user.id, otherUserId })
    setMessages(userMessages)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedUserId) return

    db.createMessage(user.id, selectedUserId, messageText.trim())
    setMessageText('')
    loadMessages(selectedUserId)
    loadConversations()
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleConversationClick = (userId) => {
    setSelectedUserId(userId)
    navigate(`/chat?userId=${userId}`)
  }

  return (
    <div className="chat-page">
      <nav className="dashboard-nav">
        <div className="nav-container">
          <Link to="/" className="logo">CampusConnect</Link>
          <div className="nav-right">
            <button onClick={toggleRole} className="role-toggle">
              <Briefcase size={18} />
              Switch to {currentRole === 'finder' ? 'Seeker' : 'Finder'}
            </button>
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

      <div className="chat-container">
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
          </div>
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="empty-conversations">
                <MessageSquare size={48} />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.userId}
                  className={`conversation-item ${selectedUserId === conv.userId ? 'active' : ''}`}
                  onClick={() => handleConversationClick(conv.userId)}
                >
                  <div className="conversation-avatar">
                    <User size={24} />
                  </div>
                  <div className="conversation-info">
                    <h3>{conv.user?.name || 'Unknown User'}</h3>
                    <p>{conv.lastMessage?.text.substring(0, 50) || 'No messages'}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-main">
          {selectedUserId && otherUser ? (
            <>
              <div className="chat-header">
                <button onClick={() => setSelectedUserId(null)} className="back-button">
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-header-info">
                  <h2>{otherUser.name}</h2>
                  <p>{otherUser.email}</p>
                </div>
              </div>

              <div className="messages-container">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message ${msg.fromId === user.id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button type="submit" className="send-button" disabled={!messageText.trim()}>
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <MessageSquare size={64} />
              <h2>Select a conversation</h2>
              <p>Choose a conversation from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

