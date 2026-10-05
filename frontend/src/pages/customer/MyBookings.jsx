import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statusBadge = { Confirmed: 'badge-success', Cancelled: 'badge-danger' };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/customer/bookings');
      setBookings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/customer/bookings/${id}/cancel`);
      fetchBookings();
      alert('Booking cancelled and refund initiated.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling booking.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">My Bookings</h2>
      </div>

      <div className="table-container card">
        {loading ? <div className="loading">Loading bookings...</div> : (
          <table className="table">
            <thead>
              <tr><th>Booking ID</th><th>Route</th><th>Travel Date</th><th>Seats</th><th>Amount Paid</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>You have no bookings yet.</td></tr>
              ) : bookings.map((b) => (
                <tr key={b.id}>
                  <td>#BKG-{b.id.toString().padStart(4, '0')}</td>
                  <td>{b.route_name}<br/><span style={{fontSize: 11, color: 'var(--text-secondary)'}}>{b.source} → {b.destination}</span></td>
                  <td>{new Date(b.travel_date).toLocaleDateString('en-IN')}</td>
                  <td>{b.seats}</td>
                  <td>₹{b.paid_amount || 0}</td>
                  <td><span className={`badge ${statusBadge[b.status] || 'badge-info'}`}>{b.status}</span></td>
                  <td>
                    {b.status === 'Confirmed' && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleCancel(b.id)}>Cancel Ticket</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
