const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/bookings
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT bk.*, br.route_name, br.source, br.destination
      FROM bookings bk
      LEFT JOIN bus_routes br ON bk.route_id = br.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (bk.passenger_name LIKE ? OR bk.passenger_phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ' AND bk.status = ?';
      params.push(status);
    }

    query += ' ORDER BY bk.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/bookings/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT bk.*, br.route_name FROM bookings bk
      LEFT JOIN bus_routes br ON bk.route_id = br.id
      WHERE bk.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Booking not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/bookings
router.post('/', verifyToken, async (req, res) => {
  const { passenger_name, passenger_phone, route_id, trip_id, seats, travel_date } = req.body;
  if (!passenger_name || !passenger_phone || !route_id || !travel_date) {
    return res.status(400).json({ message: 'Passenger name, phone, route and travel date are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO bookings (passenger_name, passenger_phone, route_id, trip_id, seats, travel_date, status) VALUES (?,?,?,?,?,?,?)',
      [passenger_name, passenger_phone, route_id, trip_id || null, seats || 1, travel_date, 'Confirmed']
    );

    // Auto create pending payment
    const [fares] = await db.query('SELECT fare_amount FROM fares WHERE route_id = ?', [route_id]);
    const fareAmount = fares.length > 0 ? fares[0].fare_amount * (seats || 1) : 0;

    if (fareAmount > 0) {
      await db.query(
        'INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?,?,?,?)',
        [result.insertId, fareAmount, 'Cash', 'Pending']
      );
    }

    res.status(201).json({ id: result.insertId, message: 'Booking created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/bookings/:id
router.put('/:id', verifyToken, async (req, res) => {
  const { passenger_name, passenger_phone, route_id, trip_id, seats, travel_date, status } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE bookings SET passenger_name=?, passenger_phone=?, route_id=?, trip_id=?, seats=?, travel_date=?, status=? WHERE id=?',
      [passenger_name, passenger_phone, route_id, trip_id || null, seats, travel_date, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking not found.' });

    // If cancelled, refund payment
    if (status === 'Cancelled') {
      await db.query('UPDATE payments SET status=? WHERE booking_id=?', ['Refunded', req.params.id]);
    }

    res.json({ message: 'Booking updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM bookings WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ message: 'Booking deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
