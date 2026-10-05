const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/customer/routes - Search available routes (public)
router.get('/routes', async (req, res) => {
  try {
    const { search, source, destination } = req.query;
    let query = `
      SELECT br.*, b.bus_number, b.bus_type, b.capacity, f.fare_amount
      FROM bus_routes br
      LEFT JOIN buses b ON br.bus_id = b.id
      LEFT JOIN fares f ON f.route_id = br.id
      WHERE b.status = 'Active'
    `;
    const params = [];

    if (search) {
      query += ' AND (br.route_name LIKE ? OR br.source LIKE ? OR br.destination LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (source) {
      query += ' AND br.source LIKE ?';
      params.push(`%${source}%`);
    }
    if (destination) {
      query += ' AND br.destination LIKE ?';
      params.push(`%${destination}%`);
    }

    query += ' ORDER BY br.departure_time ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/customer/trips - Get upcoming trips for a route
router.get('/trips', async (req, res) => {
  try {
    const { route_id } = req.query;
    let query = `
      SELECT t.*, br.route_name, br.source, br.destination, b.bus_number, b.bus_type, b.capacity,
        d.name AS driver_name, f.fare_amount
      FROM trips t
      LEFT JOIN bus_routes br ON t.route_id = br.id
      LEFT JOIN buses b ON t.bus_id = b.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      LEFT JOIN fares f ON f.route_id = t.route_id
      WHERE t.status IN ('Upcoming', 'In-Progress') AND t.trip_date >= CURDATE()
    `;
    const params = [];

    if (route_id) {
      query += ' AND t.route_id = ?';
      params.push(route_id);
    }

    query += ' ORDER BY t.trip_date ASC, t.departure_time ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/customer/book - Book a ticket (customer only)
router.post('/book', verifyToken, async (req, res) => {
  const { route_id, trip_id, seats, travel_date } = req.body;

  if (!route_id || !seats || !travel_date) {
    return res.status(400).json({ message: 'Route, seats and travel date are required.' });
  }

  try {
    // Get user info
    const [users] = await db.query('SELECT full_name, phone FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(400).json({ message: 'User not found.' });
    const user = users[0];

    const [result] = await db.query(
      'INSERT INTO bookings (passenger_name, passenger_phone, route_id, trip_id, seats, travel_date, status, user_id) VALUES (?,?,?,?,?,?,?,?)',
      [user.full_name, user.phone || '', route_id, trip_id || null, seats || 1, travel_date, 'Confirmed', req.user.id]
    );

    // Auto create payment
    const [fares] = await db.query('SELECT fare_amount FROM fares WHERE route_id = ?', [route_id]);
    const fareAmount = fares.length > 0 ? fares[0].fare_amount * (seats || 1) : 0;

    if (fareAmount > 0) {
      await db.query(
        'INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?,?,?,?)',
        [result.insertId, fareAmount, 'Online', 'Paid']
      );
    }

    res.status(201).json({ id: result.insertId, message: 'Ticket booked successfully!', amount: fareAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/customer/bookings - Get customer's own bookings
router.get('/bookings', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT bk.*, br.route_name, br.source, br.destination, br.departure_time, br.arrival_time,
        p.amount AS paid_amount, p.payment_method, p.status AS payment_status
      FROM bookings bk
      LEFT JOIN bus_routes br ON bk.route_id = br.id
      LEFT JOIN payments p ON p.booking_id = bk.id
      WHERE bk.user_id = ?
      ORDER BY bk.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/customer/bookings/:id/cancel - Cancel own booking
router.put('/bookings/:id/cancel', verifyToken, async (req, res) => {
  try {
    // Verify booking belongs to user
    const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found.' });
    if (bookings[0].status === 'Cancelled') return res.status(400).json({ message: 'Booking already cancelled.' });

    await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['Cancelled', req.params.id]);
    await db.query('UPDATE payments SET status = ? WHERE booking_id = ?', ['Refunded', req.params.id]);

    res.json({ message: 'Booking cancelled and refund initiated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
