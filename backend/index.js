const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'fleetflow',
} = process.env

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise()

app.use(cors({ origin: 'http://localhost:5173', credentials: false }))
app.use(express.json())

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(64) NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id VARCHAR(64) PRIMARY KEY,
      plate VARCHAR(64) NOT NULL UNIQUE,
      model VARCHAR(255) NOT NULL,
      maxLoad INT NOT NULL,
      acquisitionCost DECIMAL(12,2) NOT NULL,
      status VARCHAR(32) NOT NULL,
      odometer INT NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS drivers (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      licenseStatus VARCHAR(32) NOT NULL,
      status VARCHAR(32) NOT NULL,
      safetyScore INT NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS trips (
      id VARCHAR(64) PRIMARY KEY,
      vehicleId VARCHAR(64) NOT NULL,
      driverId VARCHAR(64) NOT NULL,
      cargoWeight INT NOT NULL,
      revenue DECIMAL(12,2) NOT NULL,
      status VARCHAR(32) NOT NULL,
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
      FOREIGN KEY (driverId) REFERENCES drivers(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS maintenances (
      id VARCHAR(64) PRIMARY KEY,
      vehicleId VARCHAR(64) NOT NULL,
      description TEXT NOT NULL,
      cost DECIMAL(12,2) NOT NULL,
      date DATE NOT NULL,
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(64) PRIMARY KEY,
      vehicleId VARCHAR(64) NOT NULL,
      fuelLiters DECIMAL(12,2) NOT NULL,
      fuelCost DECIMAL(12,2) NOT NULL,
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id)
    )
  `)
}

async function seedIfEmpty() {
  const [userRows] = await pool.query('SELECT COUNT(*) AS count FROM users')
  if (userRows[0].count === 0) {
    await pool.query(
      `
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `,
      ['u1', 'Demo Manager', 'fleet.manager@company.com', 'password', 'Fleet Manager']
    )
  }

  const [vehicleRows] = await pool.query('SELECT COUNT(*) AS count FROM vehicles')
  if (vehicleRows[0].count === 0) {
    await pool.query(
      `
      INSERT INTO vehicles (id, plate, model, maxLoad, acquisitionCost, status, odometer)
      VALUES 
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        'v1',
        'GJ-01-AA-1234',
        'Volvo FH16',
        25000,
        120000,
        'Available',
        150000,
        'v2',
        'GJ-01-AA-5678',
        'Tata Prima',
        18000,
        90000,
        'In Shop',
        210000,
        'v3',
        'GJ-01-AA-9999',
        'Ashok Leyland 3718',
        22000,
        100000,
        'Available',
        95000,
      ]
    )
  }

  const [driverRows] = await pool.query('SELECT COUNT(*) AS count FROM drivers')
  if (driverRows[0].count === 0) {
    await pool.query(
      `
      INSERT INTO drivers (id, name, licenseStatus, status, safetyScore)
      VALUES 
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?)
    `,
      [
        'd1',
        'Ravi Patel',
        'Valid',
        'Available',
        92,
        'd2',
        'Sanjay Kumar',
        'Expired',
        'Available',
        76,
        'd3',
        'Meera Shah',
        'Valid',
        'Available',
        88,
      ]
    )
  }
}

async function getState() {
  const [vehicles] = await pool.query('SELECT * FROM vehicles')
  const [drivers] = await pool.query('SELECT * FROM drivers')
  const [trips] = await pool.query('SELECT * FROM trips')
  const [maintenances] = await pool.query('SELECT * FROM maintenances')
  const [expenses] = await pool.query('SELECT * FROM expenses')
  return { vehicles, drivers, trips, maintenances, expenses }
}

app.get('/api/state', async (req, res) => {
  try {
    const state = await getState()
    res.json(state)
  } catch (err) {
    res.status(500).json({ error: 'Failed to load fleet state.' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body || {}
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' })
  }
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [
      email.toLowerCase(),
    ])
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' })
    }
    const id = `u${Date.now()}`
    await pool.query(
      `
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `,
      [id, name, email.toLowerCase(), password, role]
    )
    res.json({ id, name, email: email.toLowerCase(), role })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' })
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?',
      [email.toLowerCase(), password]
    )
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }
    const user = rows[0]
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' })
  }
})

app.post('/api/vehicles', async (req, res) => {
  const { plate, model, maxLoad, odometer, acquisitionCost } = req.body || {}
  if (!plate || !model || !maxLoad || !odometer || !acquisitionCost) {
    return res.status(400).json({ error: 'All fields are required.' })
  }
  try {
    const id = `v${Date.now()}`
    await pool.query(
      `
      INSERT INTO vehicles (id, plate, model, maxLoad, acquisitionCost, status, odometer)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [id, plate, model, maxLoad, acquisitionCost, 'Available', odometer]
    )
    const state = await getState()
    res.json(state)
  } catch (err) {
    res.status(500).json({ error: 'Failed to add vehicle.' })
  }
})

app.post('/api/vehicles/:id/toggle-shop', async (req, res) => {
  const id = req.params.id
  try {
    const [rows] = await pool.query('SELECT status FROM vehicles WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' })
    }
    const current = rows[0].status
    if (current === 'On Trip') {
      const state = await getState()
      return res.json(state)
    }
    const nextStatus = current === 'In Shop' ? 'Available' : 'In Shop'
    await pool.query('UPDATE vehicles SET status = ? WHERE id = ?', [nextStatus, id])
    const state = await getState()
    res.json(state)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vehicle.' })
  }
})

app.post('/api/trips', async (req, res) => {
  const { vehicleId, driverId, cargoWeight, revenue } = req.body || {}
  try {
    const [[vehicle]] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [
      vehicleId,
    ])
    const [[driver]] = await pool.query('SELECT * FROM drivers WHERE id = ?', [
      driverId,
    ])
    if (!vehicle || !driver) {
      return res.status(400).json({ error: 'Select vehicle and driver.' })
    }
    if (cargoWeight > vehicle.maxLoad) {
      return res.status(400).json({ error: 'Cargo exceeds max capacity.' })
    }
    if (driver.licenseStatus === 'Expired') {
      return res.status(400).json({ error: 'Driver license expired.' })
    }
    if (vehicle.status !== 'Available') {
      return res.status(400).json({ error: 'Selected vehicle is not available.' })
    }

    const id = `t${Date.now()}`

    await pool.query(
      `
      INSERT INTO trips (id, vehicleId, driverId, cargoWeight, revenue, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [id, vehicleId, driverId, cargoWeight, revenue, 'Dispatched']
    )

    await pool.query('UPDATE vehicles SET status = ? WHERE id = ?', [
      'On Trip',
      vehicleId,
    ])
    await pool.query('UPDATE drivers SET status = ? WHERE id = ?', [
      'On Duty',
      driverId,
    ])

    const state = await getState()
    res.json(state)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create trip.' })
  }
})

app.post('/api/trips/:id/complete', async (req, res) => {
  const id = req.params.id
  try {
    const [[trip]] = await pool.query('SELECT * FROM trips WHERE id = ?', [id])
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' })
    }
    await pool.query('UPDATE trips SET status = ? WHERE id = ?', ['Completed', id])

    const [[vehicle]] = await pool.query('SELECT status FROM vehicles WHERE id = ?', [
      trip.vehicleId,
    ])
    if (vehicle && vehicle.status !== 'In Shop') {
      await pool.query('UPDATE vehicles SET status = ? WHERE id = ?', [
        'Available',
        trip.vehicleId,
      ])
    }
    await pool.query('UPDATE drivers SET status = ? WHERE id = ?', [
      'Available',
      trip.driverId,
    ])

    const state = await getState()
    res.json(state)
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete trip.' })
  }
})

app.post('/api/maintenances', async (req, res) => {
  const { vehicleId, description, cost, date } = req.body || {}
  if (!vehicleId || !description || !cost) {
    return res.status(400).json({ error: 'Vehicle, description, and cost required.' })
  }
  try {
    const id = `m${Date.now()}`
    const dateValue =
      date && date.length > 0 ? new Date(date).toISOString().slice(0, 10) : null
    const finalDate =
      dateValue || new Date().toISOString().slice(0, 10)

    await pool.query(
      `
      INSERT INTO maintenances (id, vehicleId, description, cost, date)
      VALUES (?, ?, ?, ?, ?)
    `,
      [id, vehicleId, description, cost, finalDate]
    )

    await pool.query('UPDATE vehicles SET status = ? WHERE id = ?', [
      'In Shop',
      vehicleId,
    ])

    const state = await getState()
    res.json(state)
  } catch (err) {
    res.status(500).json({ error: 'Failed to add maintenance log.' })
  }
})

app.post('/api/expenses', async (req, res) => {
  const { vehicleId, fuelLiters, fuelCost } = req.body || {}
  if (!vehicleId || !fuelLiters || !fuelCost) {
    return res.status(400).json({ error: 'Vehicle, liters, and cost required.' })
  }
  try {
    const id = `x${Date.now()}`
    await pool.query(
      `
      INSERT INTO expenses (id, vehicleId, fuelLiters, fuelCost)
      VALUES (?, ?, ?, ?)
    `,
      [id, vehicleId, fuelLiters, fuelCost]
    )
    const state = await getState()
    res.json(state)
  } catch (err) {
    res.status(500).json({ error: 'Failed to add expense.' })
  }
})

async function start() {
  try {
    await ensureSchema()
    await seedIfEmpty()
    app.listen(port, () => {
      console.log(`FleetFlow backend running on http://localhost:${port}`)
    })
  } catch (err) {
    console.error('Failed to start backend:', err)
    process.exit(1)
  }
}

start()
