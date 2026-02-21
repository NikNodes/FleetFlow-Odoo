import React, { useState } from 'react'
import { useFleet } from '../../context/FleetContext.jsx'
import { Wrench, CalendarDays } from 'lucide-react'

export function MaintenanceLogs() {
  const { vehicles, maintenances, addMaintenance } = useFleet()
  const [vehicleId, setVehicleId] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [date, setDate] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!vehicleId || !description || !cost) return
    addMaintenance({
      vehicleId,
      description,
      cost: Number(cost),
      date: date || undefined,
    })
    setVehicleId('')
    setDescription('')
    setCost('')
    setDate('')
  }

  return (
    <div className="grid-main-side">
      <div className="page">
        <header className="page-header">
          <h1>Maintenance & Service Logs</h1>
          <p>Capture workshop activity and flag assets as in-shop automatically.</p>
        </header>

        <div className="card card-padded">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="grid-two">
              <div>
                <label className="label">Vehicle</label>
                <select
                  className="select"
                  value={vehicleId}
                  onChange={e => setVehicleId(e.target.value)}
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plate} · {v.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <div className="date-wrapper">
                  <input
                    className="input date-input"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                  <CalendarDays className="date-icon" />
                </div>
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="grid-two max-w-sm">
              <div>
                <label className="label">Cost ($)</label>
                <input
                  className="input"
                  type="number"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              <Wrench className="btn-icon" />
              <span>Save Maintenance Log</span>
            </button>
          </form>
        </div>
      </div>

      <div className="card card-padded side-card">
        <div className="card-title-row">
          <div className="card-title">Maintenance History</div>
          <div className="card-subtitle">Recent service entries per vehicle.</div>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Description</th>
                <th>Date</th>
                <th className="text-right">Cost ($)</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.length === 0 && (
                <tr>
                  <td colSpan={4} className="table-empty">
                    No maintenance logs recorded yet.
                  </td>
                </tr>
              )}
              {maintenances.map(m => {
                const vehicle = vehicles.find(v => v.id === m.vehicleId)
                return (
                  <tr key={m.id}>
                    <td>{vehicle?.plate ?? '—'}</td>
                    <td className="cell-wrap">{m.description}</td>
                    <td className="cell-muted">{m.date}</td>
                    <td className="text-right">
                      {m.cost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

