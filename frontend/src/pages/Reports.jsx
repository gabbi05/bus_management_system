import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';

export default function Reports() {
  const [revenue, setRevenue] = useState([]);
  const [bookingsByRoute, setBookingsByRoute] = useState([]);
  const [driverUtil, setDriverUtil] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [revRes, bprRes, duRes] = await Promise.all([
          api.get('/reports/revenue'),
          api.get('/reports/bookings-by-route'),
          api.get('/reports/driver-utilization')
        ]);
        setRevenue(revRes.data);
        setBookingsByRoute(bprRes.data);
        setDriverUtil(duRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const tooltipStyle = {
    contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 },
    labelStyle: { color: '#f1f5f9' }
  };

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Reports & Analytics</h2>
      </div>

      <div className="charts-grid">
        <div className="card">
          <h3 className="chart-title">📈 Revenue Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`₹${v}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="chart-title">🎫 Bookings by Route</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bookingsByRoute}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="route_name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="chart-title">👨‍✈️ Driver Utilization</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={driverUtil}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="trips" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Trips" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div className="card">
          <h3 className="chart-title">📋 Revenue Summary</h3>
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr><th>Date</th><th>Revenue (₹)</th></tr>
            </thead>
            <tbody>
              {revenue.map((r) => (
                <tr key={r.date}>
                  <td>{r.date}</td>
                  <td style={{ color: '#10b981', fontWeight: 600 }}>₹{Number(r.revenue).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Total</strong></td>
                <td style={{ color: '#f59e0b', fontWeight: 700 }}>
                  ₹{revenue.reduce((s, r) => s + Number(r.revenue), 0).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="chart-title">🛣️ Bookings per Route</h3>
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr><th>Route</th><th>Bookings</th></tr>
            </thead>
            <tbody>
              {bookingsByRoute.map((r) => (
                <tr key={r.route_name}>
                  <td>{r.route_name}</td>
                  <td><span className="badge badge-info">{r.count}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
