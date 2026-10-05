const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/reports/dashboard
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const [[{ totalBuses }]] = await db.query('SELECT COUNT(*) as totalBuses FROM buses');
    const [[{ totalRoutes }]] = await db.query('SELECT COUNT(*) as totalRoutes FROM bus_routes');
    const [[{ totalDrivers }]] = await db.query('SELECT COUNT(*) as totalDrivers FROM drivers');
    const [[{ totalBookings }]] = await db.query('SELECT COUNT(*) as totalBookings FROM bookings');
    const [[{ totalRevenue }]] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM payments WHERE status = 'Paid'"
    );

    const [recentBookings] = await db.query(`
      SELECT bk.id, bk.passenger_name, bk.passenger_phone, bk.seats, bk.travel_date, bk.status,
        br.route_name, br.source, br.destination
      FROM bookings bk
      LEFT JOIN bus_routes br ON bk.route_id = br.id
      ORDER BY bk.created_at DESC
      LIMIT 5
    `);

    res.json({ totalBuses, totalRoutes, totalDrivers, totalBookings, totalRevenue, recentBookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/reports/revenue  - last 7 days
router.get('/revenue', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE(payment_date) as date, COALESCE(SUM(amount), 0) as revenue
      FROM payments
      WHERE status = 'Paid' AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(payment_date)
      ORDER BY date ASC
    `);

    // Fill in missing days with 0
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = rows.find(r => r.date && r.date.toISOString().split('T')[0] === dateStr);
      result.push({ date: dateStr, revenue: found ? parseFloat(found.revenue) : 0 });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/reports/bookings-by-route
router.get('/bookings-by-route', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT br.route_name, COUNT(bk.id) as count
      FROM bus_routes br
      LEFT JOIN bookings bk ON bk.route_id = br.id
      GROUP BY br.id, br.route_name
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/reports/driver-utilization
router.get('/driver-utilization', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.name, COUNT(t.id) as trips
      FROM drivers d
      LEFT JOIN trips t ON t.driver_id = d.id
      GROUP BY d.id, d.name
      ORDER BY trips DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
