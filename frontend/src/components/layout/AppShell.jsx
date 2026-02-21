import React, { useMemo, useState } from 'react'
import { Sidebar } from './Sidebar.jsx'
import { Dashboard } from '../dashboard/Dashboard.jsx'
import { VehicleRegistry } from '../vehicles/VehicleRegistry.jsx'
import { TripDispatcher } from '../trips/TripDispatcher.jsx'
import { MaintenanceLogs } from '../maintenance/MaintenanceLogs.jsx'
import { DriverPerformance } from '../drivers/DriverPerformance.jsx'
import { AnalyticsFinance } from '../analytics/AnalyticsFinance.jsx'

export function AppShell({ user, onLogout }) {
  const [active, setActive] = useState('dashboard')

  const filteredActive = useMemo(() => {
    if (user.role === 'Fleet Manager') return active
    if (user.role === 'Dispatcher') {
      return ['dashboard', 'vehicles', 'dispatch'].includes(active)
        ? active
        : 'dashboard'
    }
    if (user.role === 'Safety Officer') {
      return ['dashboard', 'drivers', 'vehicles'].includes(active)
        ? active
        : 'dashboard'
    }
    if (user.role === 'Financial Analyst') {
      return ['dashboard', 'analytics', 'vehicles'].includes(active)
        ? active
        : 'dashboard'
    }
    return 'dashboard'
  }, [active, user.role])

  return (
    <div className="shell-root">
      <Sidebar
        active={filteredActive}
        onChange={setActive}
        user={user}
        onLogout={onLogout}
      />
      <main className="shell-main">
        <div key={filteredActive} className="shell-content page-transition">
          {filteredActive === 'dashboard' && <Dashboard />}
          {filteredActive === 'vehicles' && <VehicleRegistry />}
          {filteredActive === 'dispatch' && <TripDispatcher />}
          {filteredActive === 'maintenance' && <MaintenanceLogs />}
          {filteredActive === 'drivers' && <DriverPerformance />}
          {filteredActive === 'analytics' && <AnalyticsFinance />}
        </div>
      </main>
    </div>
  )
}
