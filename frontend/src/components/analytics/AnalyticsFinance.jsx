import React, { useState } from 'react'
import { useFleet } from '../../context/FleetContext.jsx'
import { Fuel, Download, LineChart } from 'lucide-react'

export function AnalyticsFinance() {
  const { vehicles, trips, maintenances, expenses, addExpense } = useFleet()
  const [vehicleId, setVehicleId] = useState('')
  const [fuelLiters, setFuelLiters] = useState('')
  const [fuelCost, setFuelCost] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!vehicleId || !fuelLiters || !fuelCost) return
    addExpense({
      vehicleId,
      fuelLiters: Number(fuelLiters),
      fuelCost: Number(fuelCost),
    })
    setVehicleId('')
    setFuelLiters('')
    setFuelCost('')
  }

  const totalOdometer = vehicles.reduce((sum, v) => sum + v.odometer, 0)
  const totalFuel = expenses.reduce((sum, e) => sum + e.fuelLiters, 0)
  const fuelEfficiency = totalFuel === 0 ? 0 : totalOdometer / totalFuel

  function vehicleRevenue(id) {
    return trips
      .filter(t => t.vehicleId === id && t.status === 'Completed')
      .reduce((sum, t) => sum + t.revenue, 0)
  }

  function vehicleMaintenanceCost(id) {
    return maintenances
      .filter(m => m.vehicleId === id)
      .reduce((sum, m) => sum + m.cost, 0)
  }

  function vehicleFuelCost(id) {
    return expenses
      .filter(e => e.vehicleId === id)
      .reduce((sum, e) => sum + e.fuelCost, 0)
  }

  function vehicleRoi(id, acquisitionCost) {
    if (!acquisitionCost) return 0
    const rev = vehicleRevenue(id)
    const maint = vehicleMaintenanceCost(id)
    const fuel = vehicleFuelCost(id)
    return (rev - (maint + fuel)) / acquisitionCost
  }

  function handleExport() {
    const header = [
      'Vehicle',
      'Revenue',
      'MaintenanceCost',
      'FuelCost',
      'AcquisitionCost',
      'ROI',
    ]
    const rows = [header.join(',')]
    vehicles.forEach(v => {
      const rev = vehicleRevenue(v.id)
      const maint = vehicleMaintenanceCost(v.id)
      const fuel = vehicleFuelCost(v.id)
      const roi = vehicleRoi(v.id, v.acquisitionCost)
      rows.push(
        [
          v.plate,
          rev.toFixed(2),
          maint.toFixed(2),
          fuel.toFixed(2),
          v.acquisitionCost.toFixed(2),
          roi.toFixed(4),
        ].join(',')
      )
    })
    const csv = rows.join('\n')
    console.log('FleetFlow CSV Export:\n', csv)
    alert('CSV exported to console.')
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Operational Analytics & Financial Reports</h1>
        <p>Monitor fuel efficiency and asset-level ROI.</p>
      </header>

      <div className="grid-main-side">
        <div className="card card-padded">
          <div className="card-title-row">
            <div className="card-title-row">
              <Fuel className="card-icon" />
              <div className="card-title">Fuel Capture</div>
            </div>
          </div>
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
                <label className="label">Fuel Liters</label>
                <input
                  className="input"
                  type="number"
                  value={fuelLiters}
                  onChange={e => setFuelLiters(e.target.value)}
                />
              </div>
            </div>
            <div className="grid-two max-w-sm">
              <div>
                <label className="label">Fuel Cost ($)</label>
                <input
                  className="input"
                  type="number"
                  value={fuelCost}
                  onChange={e => setFuelCost(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              <Fuel className="btn-icon" />
              <span>Add Fuel Expense</span>
            </button>
          </form>
        </div>

        <div className="card card-padded side-card">
          <div className="card-title-row">
            <div className="card-title-row">
              <LineChart className="card-icon" />
              <div className="card-title">Fleet Metrics</div>
            </div>
            <button
              type="button"
              className="btn-secondary btn-xs"
              onClick={handleExport}
            >
              <Download className="btn-icon-xs" />
              <span>Export CSV</span>
            </button>
          </div>
          <div className="metrics-list">
            <div className="metrics-row">
              <span>Total Odometer</span>
              <span>{totalOdometer.toLocaleString()} km</span>
            </div>
            <div className="metrics-row">
              <span>Total Fuel Captured</span>
              <span>{totalFuel.toLocaleString()} L</span>
            </div>
            <div className="metrics-row">
              <span>Fuel Efficiency</span>
              <span className="metrics-highlight">
                {fuelEfficiency ? fuelEfficiency.toFixed(2) : '—'} km/L
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-padded table-card">
        <div className="card-title-row">
          <div className="card-title">Vehicle ROI by Asset</div>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Revenue ($)</th>
                <th>Maintenance ($)</th>
                <th>Fuel ($)</th>
                <th>Acquisition ($)</th>
                <th className="text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => {
                const rev = vehicleRevenue(v.id)
                const maint = vehicleMaintenanceCost(v.id)
                const fuel = vehicleFuelCost(v.id)
                const roiValue = vehicleRoi(v.id, v.acquisitionCost)
                return (
                  <tr key={v.id}>
                    <td>
                      {v.plate}
                      <span className="cell-muted-inline">{v.model}</span>
                    </td>
                    <td>{rev.toLocaleString()}</td>
                    <td>{maint.toLocaleString()}</td>
                    <td>{fuel.toLocaleString()}</td>
                    <td>{v.acquisitionCost.toLocaleString()}</td>
                    <td className="text-right">
                      <span
                        className={
                          roiValue > 0.1
                            ? 'badge badge-green'
                            : roiValue > 0
                            ? 'badge badge-amber'
                            : 'badge badge-red'
                        }
                      >
                        {roiValue ? `${(roiValue * 100).toFixed(1)}%` : '0.0%'}
                      </span>
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

