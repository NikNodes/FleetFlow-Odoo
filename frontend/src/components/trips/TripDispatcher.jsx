import React, { useState } from 'react'
import { useFleet } from '../../context/FleetContext.jsx'
import { AlertCircle, CheckCircle2, ClipboardList } from 'lucide-react'

export function TripDispatcher() {
  const { vehicles, drivers, trips, createTrip, completeTrip } = useFleet()
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [cargoWeight, setCargoWeight] = useState('')
  const [revenue, setRevenue] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const dispatchableVehicles = vehicles.filter(v => v.status === 'Available')
  const availableDrivers = drivers.filter(d => d.status === 'Available')

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!vehicleId || !driverId || !cargoWeight || !revenue) {
      setError('Fill in all fields.')
      return
    }
    const cargoNum = Number(cargoWeight)
    const revenueNum = Number(revenue)
    if (isNaN(cargoNum) || cargoNum <= 0 || isNaN(revenueNum) || revenueNum < 0) {
      setError('Cargo weight and revenue must be valid numbers.')
      return
    }
    const result = await createTrip({
      vehicleId,
      driverId,
      cargoWeight: cargoNum,
      revenue: revenueNum,
    })
    if (!result.ok) {
      setError(result.error || 'Unable to create trip.')
      return
    }
    setSuccess('Trip dispatched successfully.')
    setVehicleId('')
    setDriverId('')
    setCargoWeight('')
    setRevenue('')
  }

  async function handleComplete(id) {
    await completeTrip(id)
  }

  return (
    <div className="grid-main-side">
      <div className="page">
        <header className="page-header">
          <h1>Trip Dispatcher</h1>
          <p>Enforce capacity, compliance, and availability before dispatch.</p>
        </header>

        <div className="card card-padded">
          <form onSubmit={handleSubmit} className="form-grid">
            {error && (
              <div className="alert-error">
                <AlertCircle className="alert-icon" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert-success">
                <CheckCircle2 className="alert-icon" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid-two">
              <div>
                <label className="label">Vehicle</label>
                <select
                  className="select"
                  value={vehicleId}
                  onChange={e => setVehicleId(e.target.value)}
                >
                  <option value="">Select available vehicle</option>
                  {dispatchableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plate} · {v.model} · {v.maxLoad.toLocaleString()} kg
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Driver</label>
                <select
                  className="select"
                  value={driverId}
                  onChange={e => setDriverId(e.target.value)}
                >
                  <option value="">Select available driver</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} · License {d.licenseStatus}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-two">
              <div>
                <label className="label">Cargo Weight (kg)</label>
                <input
                  className="input"
                  type="number"
                  value={cargoWeight}
                  onChange={e => setCargoWeight(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Expected Revenue ($)</label>
                <input
                  className="input"
                  type="number"
                  value={revenue}
                  onChange={e => setRevenue(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              <ClipboardList className="btn-icon" />
              <span>Dispatch Trip</span>
            </button>
          </form>
        </div>
      </div>

      <div className="card card-padded side-card">
        <div className="card-title-row">
          <div className="card-title">Trip Lifecycle</div>
          <div className="card-subtitle">
            Mark trips as completed to free assets for reuse.
          </div>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Cargo (kg)</th>
                <th>Revenue ($)</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 && (
                <tr>
                  <td colSpan={7} className="table-empty">
                    No trips dispatched yet.
                  </td>
                </tr>
              )}
              {trips.map(t => {
                const vehicle = vehicles.find(v => v.id === t.vehicleId)
                const driver = drivers.find(d => d.id === t.driverId)
                return (
                  <tr key={t.id}>
                    <td className="cell-muted">{t.id}</td>
                    <td>{vehicle?.plate ?? '—'}</td>
                    <td>{driver?.name ?? '—'}</td>
                    <td>{t.cargoWeight.toLocaleString()}</td>
                    <td>{t.revenue.toLocaleString()}</td>
                    <td>
                      <span
                        className={
                          t.status === 'Dispatched'
                            ? 'badge badge-amber'
                            : 'badge badge-green'
                        }
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="text-right">
                      {t.status === 'Dispatched' && (
                        <button
                          className="btn-secondary btn-xs btn-row-action"
                          onClick={() => handleComplete(t.id)}
                        >
                          <CheckCircle2 className="btn-icon-xs btn-success" />
                          <span>Mark Completed</span>
                        </button>
                      )}
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
