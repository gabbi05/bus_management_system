const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/drivers
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT d.*, b.bus_number 
      FROM drivers d
      LEFT JOIN buses b ON d.bus_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (d.name LIKE ? OR d.license_number LIKE ? OR d.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    query += ' ORDER BY d.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/drivers/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, b.bus_number FROM drivers d
      LEFT JOIN buses b ON d.bus_id = b.id
      WHERE d.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Driver not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/drivers
router.post('/', verifyToken, async (req, res) => {
  const { name, license_number, phone, bus_id, status } = req.body;
  if (!name || !license_number || !phone) {
    return res.status(400).json({ message: 'Name, license number and phone are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO drivers (name, license_number, phone, bus_id, status) VALUES (?,?,?,?,?)',
      [name, license_number, phone, bus_id || null, status || 'Available']
    );
    res.status(201).json({ id: result.insertId, message: 'Driver added successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'License number already exists.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/drivers/:id
router.put('/:id', verifyToken, async (req, res) => {
  const { name, license_number, phone, bus_id, status } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE drivers SET name=?, license_number=?, phone=?, bus_id=?, status=? WHERE id=?',
      [name, license_number, phone, bus_id || null, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Driver not found.' });
    res.json({ message: 'Driver updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/drivers/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM drivers WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Driver not found.' });
    res.json({ message: 'Driver deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
