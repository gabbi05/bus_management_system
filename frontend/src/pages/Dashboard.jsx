import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [bookingsByRoute, setBookingsByRoute] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, revRes, bprRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/revenue'),
          api.get('/reports/bookings-by-route')
        ]);
        setStats(dashRes.data);
        setRevenue(revRes.data);
        setBookingsByRoute(bprRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Buses', value: stats?.totalBuses || 0, icon: '🚌', color: '#6366f1' },
    { label: 'Total Routes', value: stats?.totalRoutes || 0, icon: '🛣️', color: '#8b5cf6' },
    { label: 'Total Drivers', value: stats?.totalDrivers || 0, icon: '👨‍✈️', color: '#06b6d4' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: '🎫', color: '#10b981' },
    { label: 'Total Revenue', value: `₹${Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: '#f59e0b' },
  ];

  return (
    <div>
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderLeftColor: card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card">
          <h3 className="chart-title">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="chart-title">Bookings by Route</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingsByRoute} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis dataKey="route_name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={130} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="chart-title">Recent Bookings</h3>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Passenger</th>
              <th>Phone</th>
              <th>Route</th>
              <th>Seats</th>
              <th>Travel Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recentBookings || []).map((bk) => (
              <tr key={bk.id}>
                <td>{bk.id}</td>
                <td>{bk.passenger_name}</td>
                <td>{bk.passenger_phone}</td>
                <td>{bk.route_name}</td>
                <td>{bk.seats}</td>
                <td>{bk.travel_date ? new Date(bk.travel_date).toLocaleDateString('en-IN') : '-'}</td>
                <td>
                  <span className={`badge ${bk.status === 'Confirmed' ? 'badge-success' : 'badge-danger'}`}>
                    {bk.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
