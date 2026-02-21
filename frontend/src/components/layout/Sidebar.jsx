import React from 'react'
import {
  Gauge,
  Truck,
  ClipboardList,
  Wrench,
  Users,
  LineChart,
  LogOut,
} from 'lucide-react'

const modules = [
  { id: 'dashboard', label: 'Command Center', icon: Gauge },
  { id: 'vehicles', label: 'Vehicle Registry', icon: Truck },
  { id: 'dispatch', label: 'Trip Dispatcher', icon: ClipboardList },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'drivers', label: 'Drivers & Safety', icon: Users },
  { id: 'analytics', label: 'Analytics & Finance', icon: LineChart },
]

function allowedModulesForRole(role) {
  if (role === 'Fleet Manager') {
    return ['dashboard', 'vehicles', 'dispatch', 'maintenance', 'drivers', 'analytics']
  }
  if (role === 'Dispatcher') {
    return ['dashboard', 'vehicles', 'dispatch']
  }
  if (role === 'Safety Officer') {
    return ['dashboard', 'drivers', 'vehicles']
  }
  if (role === 'Financial Analyst') {
    return ['dashboard', 'analytics', 'vehicles']
  }
  return ['dashboard']
}

export function Sidebar({ active, onChange, user, onLogout }) {
  const allowed = allowedModulesForRole(user.role)

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Truck className="sidebar-logo-icon" />
        </div>
        <div>
          <div className="sidebar-logo-label">FleetFlow</div>
          <div className="sidebar-logo-subtitle">Modular Command Hub</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {modules
          .filter(item => allowed.includes(item.id))
          .map(item => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={active === item.id ? 'sidebar-link active' : 'sidebar-link'}
            >
              <item.icon className="sidebar-link-icon" />
              <span>{item.label}</span>
            </button>
          ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-label">Logged in as</div>
          <div className="sidebar-user-role">{user.role}</div>
          <div className="sidebar-user-email">{user.email}</div>
        </div>
        <button className="sidebar-link logout" onClick={onLogout}>
          <LogOut className="sidebar-link-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
