import React, { useState } from 'react'
import { useFleet } from '../../context/FleetContext.jsx'
import { Plus, Wrench } from 'lucide-react'

export function VehicleRegistry() {
  const { vehicles } = useFleet()
  const [open, setOpen] = useState(false)

  return (
    <div className="page">
      <header className="page-header row-between">
        <div>
          <h1>Vehicle Registry</h1>
          <p>Central registry of all assets with capacity and lifecycle status.</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus className="btn-icon" />
          <span>Add Vehicle</span>
        </button>
      </header>

      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Plate</th>
              <th>Model</th>
              <th>Capacity (kg)</th>
              <th>Odometer (km)</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <VehicleRow key={v.id} id={v.id} />
            ))}
          </tbody>
        </table>
      </div>

      {open && <AddVehicleModal onClose={() => setOpen(false)} />}
    </div>
  )
}

function statusBadge(status) {
  if (status === 'Available') return 'badge badge-green'
  if (status === 'On Trip') return 'badge badge-amber'
  return 'badge badge-red'
}

function VehicleRow({ id }) {
  const { vehicles, toggleVehicleInShop } = useFleet()
  const vehicle = vehicles.find(v => v.id === id)
  if (!vehicle) return null
  const disabled = vehicle.status === 'On Trip'

  return (
    <tr>
      <td className="cell-strong">{vehicle.plate}</td>
      <td>{vehicle.model}</td>
      <td>{vehicle.maxLoad.toLocaleString()}</td>
      <td>{vehicle.odometer.toLocaleString()}</td>
      <td>
        <span className={statusBadge(vehicle.status)}>{vehicle.status}</span>
      </td>
      <td className="text-right">
        <button
          className="btn-secondary btn-xs btn-row-action"
          onClick={() => toggleVehicleInShop(vehicle.id)}
          disabled={disabled}
        >
          <Wrench className="btn-icon-xs" />
          <span>{vehicle.status === 'In Shop' ? 'Set Available' : 'Mark In Shop'}</span>
        </button>
      </td>
    </tr>
  )
}

function AddVehicleModal({ onClose }) {
  const { addVehicle } = useFleet()
  const [plate, setPlate] = useState('')
  const [model, setModel] = useState('')
  const [maxLoad, setMaxLoad] = useState('')
  const [odometer, setOdometer] = useState('')
  const [acquisitionCost, setAcquisitionCost] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!plate || !model || !maxLoad || !odometer || !acquisitionCost) return
    const maxNum = Number(maxLoad)
    const odoNum = Number(odometer)
    const costNum = Number(acquisitionCost)
    if (
      isNaN(maxNum) || maxNum <= 0 ||
      isNaN(odoNum) || odoNum < 0 ||
      isNaN(costNum) || costNum < 0
    ) {
      // simple client-side guard; server will also check
      return
    }
    setSaving(true)
    addVehicle({
      plate,
      model,
      maxLoad: maxNum,
      odometer: odoNum,
      acquisitionCost: costNum,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop">
      <div className="card modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Add Vehicle</div>
            <div className="modal-subtitle">
              Register a new asset into the fleet.
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="grid-two">
            <div>
              <label className="label">Plate</label>
              <input
                className="input"
                value={plate}
                onChange={e => setPlate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Model</label>
              <input
                className="input"
                value={model}
                onChange={e => setModel(e.target.value)}
              />
            </div>
          </div>
          <div className="grid-three">
            <div>
              <label className="label">Max Load (kg)</label>
              <input
                className="input"
                type="number"
                value={maxLoad}
                onChange={e => setMaxLoad(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Odometer (km)</label>
              <input
                className="input"
                type="number"
                value={odometer}
                onChange={e => setOdometer(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Acquisition Cost ($)</label>
              <input
                className="input"
                type="number"
                value={acquisitionCost}
                onChange={e => setAcquisitionCost(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              Save Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
