const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/busroutes
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT br.*, b.bus_number 
      FROM bus_routes br
      LEFT JOIN buses b ON br.bus_id = b.id
      ORDER BY br.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/busroutes/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT br.*, b.bus_number 
      FROM bus_routes br
      LEFT JOIN buses b ON br.bus_id = b.id
      WHERE br.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Route not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/busroutes
router.post('/', verifyToken, async (req, res) => {
  const { route_name, source, destination, stops, departure_time, arrival_time, bus_id } = req.body;
  if (!route_name || !source || !destination) {
    return res.status(400).json({ message: 'Route name, source and destination are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO bus_routes (route_name, source, destination, stops, departure_time, arrival_time, bus_id) VALUES (?,?,?,?,?,?,?)',
      [route_name, source, destination, stops || '', departure_time || null, arrival_time || null, bus_id || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Route created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/busroutes/:id
router.put('/:id', verifyToken, async (req, res) => {
  const { route_name, source, destination, stops, departure_time, arrival_time, bus_id } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE bus_routes SET route_name=?, source=?, destination=?, stops=?, departure_time=?, arrival_time=?, bus_id=? WHERE id=?',
      [route_name, source, destination, stops, departure_time || null, arrival_time || null, bus_id || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Route not found.' });
    res.json({ message: 'Route updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/busroutes/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM bus_routes WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Route not found.' });
    res.json({ message: 'Route deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
