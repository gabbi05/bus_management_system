import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

const empty = { passenger_name: '', passenger_phone: '', route_id: '', seats: 1, travel_date: '' };

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/bookings', { params });
      setBookings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [search, statusFilter]);
  useEffect(() => { api.get('/busroutes').then(r => setRoutes(r.data)).catch(console.error); }, []);

  const openAdd = () => { setForm(empty); setError(''); setModal({ open: true, mode: 'add' }); };
  const closeModal = () => setModal({ open: false, mode: 'add', data: null });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      await api.post('/bookings', form);
      closeModal(); fetchBookings();
    } catch (err) { setError(err.response?.data?.message || 'Error creating booking.'); }
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel booking for ${booking.passenger_name}?`)) return;
    try {
      await api.put(`/bookings/${booking.id}`, { ...booking, status: 'Cancelled' });
      fetchBookings();
    } catch (err) { alert('Error cancelling booking.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try { await api.delete(`/bookings/${id}`); fetchBookings(); }
    catch (err) { alert('Error deleting booking.'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Bookings</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ New Booking</button>
      </div>

      <div className="filters">
        <input className="form-control search-input" placeholder="Search passenger name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="table-container card">
        {loading ? <div className="loading">Loading...</div> : (
          <table className="table">
            <thead>
              <tr><th>#</th><th>Passenger</th><th>Phone</th><th>Route</th><th>Seats</th><th>Travel Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No bookings found.</td></tr>
              ) : bookings.map((bk, i) => (
                <tr key={bk.id}>
                  <td>{i + 1}</td>
                  <td>{bk.passenger_name}</td>
                  <td>{bk.passenger_phone}</td>
                  <td>{bk.route_name || '-'}</td>
                  <td>{bk.seats}</td>
                  <td>{bk.travel_date ? new Date(bk.travel_date).toLocaleDateString('en-IN') : '-'}</td>
                  <td><span className={`badge ${bk.status === 'Confirmed' ? 'badge-success' : 'badge-danger'}`}>{bk.status}</span></td>
                  <td>
                    {bk.status === 'Confirmed' && (
                      <button className="btn btn-sm btn-danger" style={{ marginRight: 8 }} onClick={() => handleCancel(bk)}>❌ Cancel</button>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(bk.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={closeModal} title="New Booking">
        <form onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}
          <div className="form-group">
            <label>Passenger Name</label>
            <input className="form-control" value={form.passenger_name} onChange={e => setForm({ ...form, passenger_name: e.target.value })} required placeholder="Full name" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input className="form-control" value={form.passenger_phone} onChange={e => setForm({ ...form, passenger_phone: e.target.value })} required placeholder="10-digit phone" />
          </div>
          <div className="form-group">
            <label>Select Route</label>
            <select className="form-control" value={form.route_id} onChange={e => setForm({ ...form, route_id: e.target.value })} required>
              <option value="">-- Select Route --</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.route_name} ({r.source} → {r.destination})</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Number of Seats</label>
              <input type="number" className="form-control" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} min="1" max="10" required />
            </div>
            <div className="form-group">
              <label>Travel Date</label>
              <input type="date" className="form-control" value={form.travel_date} onChange={e => setForm({ ...form, travel_date: e.target.value })} required min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">Book Ticket</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
