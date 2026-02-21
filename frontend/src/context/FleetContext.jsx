import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const FleetContext = createContext(undefined)

export function FleetProvider({ children }) {
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [trips, setTrips] = useState([])
  const [maintenances, setMaintenances] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadState() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/state')
      if (!res.ok) {
        throw new Error('Unable to load fleet state.')
      }
      const data = await res.json()
      setVehicles(data.vehicles || [])
      setDrivers(data.drivers || [])
      setTrips(data.trips || [])
      setMaintenances(data.maintenances || [])
      setExpenses(data.expenses || [])
    } catch (e) {
      setError(e.message || 'Failed to connect to backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadState()
  }, [])

  async function addVehicle(v) {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v),
    })
    if (!res.ok) {
      return
    }
    const data = await res.json()
    setVehicles(data.vehicles || [])
    setDrivers(data.drivers || [])
    setTrips(data.trips || [])
    setMaintenances(data.maintenances || [])
    setExpenses(data.expenses || [])
  }

  async function toggleVehicleInShop(vehicleId) {
    const res = await fetch(`/api/vehicles/${vehicleId}/toggle-shop`, {
      method: 'POST',
    })
    if (!res.ok) {
      return
    }
    const data = await res.json()
    setVehicles(data.vehicles || [])
    setDrivers(data.drivers || [])
    setTrips(data.trips || [])
    setMaintenances(data.maintenances || [])
    setExpenses(data.expenses || [])
  }

  async function createTrip(input) {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      let message = 'Unable to create trip.'
      try {
        const data = await res.json()
        if (data && data.error) {
          message = data.error
        }
      } catch {
      }
      return { ok: false, error: message }
    }
    const data = await res.json()
    setVehicles(data.vehicles || [])
    setDrivers(data.drivers || [])
    setTrips(data.trips || [])
    setMaintenances(data.maintenances || [])
    setExpenses(data.expenses || [])
    return { ok: true }
  }

  async function completeTrip(tripId) {
    const res = await fetch(`/api/trips/${tripId}/complete`, {
      method: 'POST',
    })
    if (!res.ok) {
      return
    }
    const data = await res.json()
    setVehicles(data.vehicles || [])
    setDrivers(data.drivers || [])
    setTrips(data.trips || [])
    setMaintenances(data.maintenances || [])
    setExpenses(data.expenses || [])
  }

  async function addMaintenance(m) {
    const res = await fetch('/api/maintenances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m),
    })
    if (!res.ok) {
      return
    }
    const data = await res.json()
    setVehicles(data.vehicles || [])
    setDrivers(data.drivers || [])
    setTrips(data.trips || [])
    setMaintenances(data.maintenances || [])
    setExpenses(data.expenses || [])
  }

  async function addExpense(e) {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(e),
    })
    if (!res.ok) {
      return
    }
    const data = await res.json()
    setVehicles(data.vehicles || [])
    setDrivers(data.drivers || [])
    setTrips(data.trips || [])
    setMaintenances(data.maintenances || [])
    setExpenses(data.expenses || [])
  }

  const value = useMemo(
    () => ({
      vehicles,
      drivers,
      trips,
      maintenances,
      expenses,
      loading,
      error,
      addVehicle,
      toggleVehicleInShop,
      createTrip,
      completeTrip,
      addMaintenance,
      addExpense,
      reload: loadState,
    }),
    [vehicles, drivers, trips, maintenances, expenses, loading, error]
  )

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>
}

export function useFleet() {
  const ctx = useContext(FleetContext)
  if (!ctx) {
    throw new Error('useFleet must be used within FleetProvider')
  }
  return ctx
}
