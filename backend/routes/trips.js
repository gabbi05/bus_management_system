const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/trips
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = `
      SELECT t.*, 
        br.route_name, br.source, br.destination,
        b.bus_number,
        d.name AS driver_name
      FROM trips t
      LEFT JOIN bus_routes br ON t.route_id = br.id
      LEFT JOIN buses b ON t.bus_id = b.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (date) {
      query += ' AND t.trip_date = ?';
      params.push(date);
    }

    query += ' ORDER BY t.trip_date DESC, t.departure_time';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/trips/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, br.route_name, b.bus_number, d.name AS driver_name
      FROM trips t
      LEFT JOIN bus_routes br ON t.route_id = br.id
      LEFT JOIN buses b ON t.bus_id = b.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE t.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Trip not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/trips
router.post('/', verifyToken, async (req, res) => {
  const { route_id, bus_id, driver_id, trip_date, departure_time, arrival_time, status } = req.body;
  if (!route_id || !bus_id || !trip_date) {
    return res.status(400).json({ message: 'Route, bus and trip date are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO trips (route_id, bus_id, driver_id, trip_date, departure_time, arrival_time, status) VALUES (?,?,?,?,?,?,?)',
      [route_id, bus_id, driver_id || null, trip_date, departure_time || null, arrival_time || null, status || 'Upcoming']
    );
    res.status(201).json({ id: result.insertId, message: 'Trip scheduled successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/trips/:id
router.put('/:id', verifyToken, async (req, res) => {
  const { route_id, bus_id, driver_id, trip_date, departure_time, arrival_time, status } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE trips SET route_id=?, bus_id=?, driver_id=?, trip_date=?, departure_time=?, arrival_time=?, status=? WHERE id=?',
      [route_id, bus_id, driver_id || null, trip_date, departure_time || null, arrival_time || null, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Trip not found.' });
    res.json({ message: 'Trip updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM trips WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Trip not found.' });
    res.json({ message: 'Trip deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
