import React from 'react'
import { useFleet } from '../../context/FleetContext.jsx'
import { Activity, AlertTriangle, Percent, Archive } from 'lucide-react'

export function Dashboard() {
  const { vehicles, trips } = useFleet()

  const activeCount = vehicles.filter(v => v.status === 'On Trip').length
  const inShopCount = vehicles.filter(v => v.status === 'In Shop').length
  const totalFleet = vehicles.length
  const utilization =
    totalFleet === 0 ? 0 : ((activeCount + inShopCount) / totalFleet) * 100
  const pendingCargo = trips.filter(t => t.status === 'Dispatched').length

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Command Center</h1>
          <p>Real-time snapshot of fleet status, utilization, and operational pressure.</p>
        </div>
        <div className="dashboard-hero">
          <div className="dashboard-road">
            <img
              src="/truck.gif"
              alt="Delivery truck in motion"
              className="dashboard-truck-image"
            />
          </div>
        </div>
      </header>

      <div className="kpi-grid">
        <KpiCard
          icon={Activity}
          label="Active Fleet"
          value={activeCount.toString()}
          badge="On Trip"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Maintenance Alerts"
          value={inShopCount.toString()}
          badge="In Shop"
        />
        <KpiCard
          icon={Percent}
          label="Utilization Rate"
          value={`${utilization.toFixed(0)}%`}
          badge="Fleet Usage"
        />
        <KpiCard
          icon={Archive}
          label="Pending Cargo"
          value={pendingCargo.toString()}
          badge="Open Trips"
        />
      </div>
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, badge }) {
  return (
    <div className="card kpi-card">
      <div className="kpi-header">
        <div className="kpi-label">
          <Icon className="kpi-icon" />
          <span>{label}</span>
        </div>
        <span className="badge badge-slate">{badge}</span>
      </div>
      <div className="kpi-value">{value}</div>
    </div>
  )
}
