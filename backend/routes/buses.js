const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/buses
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM buses WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND bus_number LIKE ?';
      params.push(`%${search}%`);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/buses/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM buses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Bus not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/buses
router.post('/', verifyToken, async (req, res) => {
  const { bus_number, bus_type, capacity, status } = req.body;
  if (!bus_number || !bus_type || !capacity) {
    return res.status(400).json({ message: 'Bus number, type and capacity are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO buses (bus_number, bus_type, capacity, status) VALUES (?, ?, ?, ?)',
      [bus_number, bus_type, capacity, status || 'Active']
    );
    res.status(201).json({ id: result.insertId, message: 'Bus added successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Bus number already exists.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/buses/:id
router.put('/:id', verifyToken, async (req, res) => {
  const { bus_number, bus_type, capacity, status } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE buses SET bus_number=?, bus_type=?, capacity=?, status=? WHERE id=?',
      [bus_number, bus_type, capacity, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Bus not found.' });
    res.json({ message: 'Bus updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/buses/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM buses WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Bus not found.' });
    res.json({ message: 'Bus deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
