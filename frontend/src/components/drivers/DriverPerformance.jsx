import React from 'react'
import { useFleet } from '../../context/FleetContext.jsx'
import { ShieldAlert, ShieldCheck } from 'lucide-react'

export function DriverPerformance() {
  const { drivers } = useFleet()

  return (
    <div className="page">
      <header className="page-header">
        <h1>Driver Performance & Safety</h1>
        <p>Monitor compliance, license status, and safety performance.</p>
      </header>
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>License Status</th>
              <th>Duty Status</th>
              <th className="text-right">Safety Score</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id}>
                <td className="cell-strong">{d.name}</td>
                <td>
                  {d.licenseStatus === 'Expired' ? (
                    <span className="badge badge-red badge-inline">
                      <ShieldAlert className="badge-icon" />
                      <span>Expired</span>
                    </span>
                  ) : (
                    <span className="badge badge-green badge-inline">
                      <ShieldCheck className="badge-icon" />
                      <span>Valid</span>
                    </span>
                  )}
                </td>
                <td>
                  <span className="badge badge-slate">{d.status}</span>
                </td>
                <td className="text-right">
                  <span
                    className={
                      d.safetyScore >= 85
                        ? 'badge badge-green'
                        : d.safetyScore >= 70
                        ? 'badge badge-amber'
                        : 'badge badge-red'
                    }
                  >
                    {d.safetyScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

