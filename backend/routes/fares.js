const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/fares
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, br.route_name, br.source, br.destination
      FROM fares f
      LEFT JOIN bus_routes br ON f.route_id = br.id
      ORDER BY f.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/fares/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, br.route_name FROM fares f
      LEFT JOIN bus_routes br ON f.route_id = br.id
      WHERE f.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Fare not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/fares
router.post('/', verifyToken, async (req, res) => {
  const { route_id, fare_amount } = req.body;
  if (!route_id || !fare_amount) {
    return res.status(400).json({ message: 'Route and fare amount are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO fares (route_id, fare_amount) VALUES (?,?)',
      [route_id, fare_amount]
    );
    res.status(201).json({ id: result.insertId, message: 'Fare set successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Fare for this route already exists. Use update instead.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/fares/:id
router.put('/:id', verifyToken, async (req, res) => {
  const { route_id, fare_amount } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE fares SET route_id=?, fare_amount=? WHERE id=?',
      [route_id, fare_amount, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Fare not found.' });
    res.json({ message: 'Fare updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/fares/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM fares WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Fare not found.' });
    res.json({ message: 'Fare deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
