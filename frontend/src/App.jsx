import React, { useState } from 'react'
import { FleetProvider } from './context/FleetContext.jsx'
import { AppShell } from './components/layout/AppShell.jsx'
import { Shield, Truck } from 'lucide-react'

const roles = [
  'Fleet Manager',
  'Dispatcher',
  'Safety Officer',
  'Financial Analyst',
]

export default function App() {
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState('login')

  if (!user) {
    return (
      <div className="login-root">
        <div className="card login-card">
          <div className="login-header">
            <div className="login-icon">
              <Truck className="login-icon-svg" />
            </div>
            <div>
              <div className="login-badge">FleetFlow</div>
              <div className="login-title">
                {mode === 'login' ? 'Command Center Login' : 'Create Operator Account'}
              </div>
            </div>
          </div>
          {mode === 'login' ? (
            <LoginForm onLogin={setUser} onSwitch={() => setMode('register')} />
          ) : (
            <RegisterForm onRegister={setUser} onSwitch={() => setMode('login')} />
          )}
        </div>
      </div>
    )
  }

  return (
    <FleetProvider>
      <AppShell user={user} onLogout={() => setUser(null)} />
    </FleetProvider>
  )
}

function LoginForm({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Enter email and password.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        let message = 'Login failed.'
        try {
          const data = await res.json()
          if (data && data.error) {
            message = data.error
          }
        } catch {
        }
        setError(message)
        return
      }
      const data = await res.json()
      onLogin(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && (
        <div className="alert-error">
          <Shield className="alert-icon" />
          <span>{error}</span>
        </div>
      )}
      <div>
        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          value={email}
          placeholder="fleet.manager@company.com"
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          value={password}
          placeholder="••••••••"
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <button className="btn-primary login-submit" disabled={loading} type="submit">
        {loading && <span className="spinner" />}
        <span>Enter Command Center</span>
      </button>
      <div className="auth-switch-row">
        <span className="auth-switch-label">New to FleetFlow?</span>
        <button type="button" className="auth-switch-link" onClick={onSwitch}>
          Create an account
        </button>
      </div>
    </form>
  )
}

function RegisterForm({ onRegister, onSwitch }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(roles[0])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!name || !email || !password) {
      setError('Fill all fields to register.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })
      if (!res.ok) {
        let message = 'Registration failed.'
        try {
          const data = await res.json()
          if (data && data.error) {
            message = data.error
          }
        } catch {
        }
        setError(message)
        return
      }
      const data = await res.json()
      onRegister(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && (
        <div className="alert-error">
          <Shield className="alert-icon" />
          <span>{error}</span>
        </div>
      )}
      <div>
        <label className="label">Full Name</label>
        <input
          className="input"
          value={name}
          placeholder="Your name"
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          value={email}
          placeholder="you@company.com"
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          value={password}
          placeholder="••••••••"
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Role</label>
        <select
          className="select"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          {roles.map(r => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <button className="btn-primary login-submit" disabled={loading} type="submit">
        {loading && <span className="spinner" />}
        <span>Create Account</span>
      </button>
      <div className="auth-switch-row">
        <span className="auth-switch-label">Already have access?</span>
        <button type="button" className="auth-switch-link" onClick={onSwitch}>
          Back to login
        </button>
      </div>
    </form>
  )
}
