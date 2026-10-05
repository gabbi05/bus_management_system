import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

const empty = { route_id: '', bus_id: '', driver_id: '', trip_date: '', departure_time: '', arrival_time: '', status: 'Upcoming' };

const statusBadge = { Upcoming: 'badge-info', 'In-Progress': 'badge-warning', Completed: 'badge-success', Cancelled: 'badge-danger' };

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const fetchTrips = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      const res = await api.get('/trips', { params });
      setTrips(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrips(); }, [statusFilter, dateFilter]);
  useEffect(() => {
    api.get('/busroutes').then(r => setRoutes(r.data)).catch(console.error);
    api.get('/buses').then(r => setBuses(r.data)).catch(console.error);
    api.get('/drivers').then(r => setDrivers(r.data)).catch(console.error);
  }, []);

  const openAdd = () => { setForm(empty); setError(''); setModal({ open: true, mode: 'add' }); };
  const openEdit = (t) => { setForm({ ...t, bus_id: t.bus_id || '', driver_id: t.driver_id || '', route_id: t.route_id || '' }); setError(''); setModal({ open: true, mode: 'edit', data: t }); };
  const closeModal = () => setModal({ open: false, mode: 'add', data: null });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (modal.mode === 'add') await api.post('/trips', form);
      else await api.put(`/trips/${modal.data.id}`, form);
      closeModal(); fetchTrips();
    } catch (err) { setError(err.response?.data?.message || 'Error saving trip.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip?')) return;
    try { await api.delete(`/trips/${id}`); fetchTrips(); }
    catch (err) { alert('Error deleting trip.'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Trips</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Schedule Trip</button>
      </div>

      <div className="filters">
        <input type="date" className="form-control" style={{ width: 180 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Upcoming">Upcoming</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        {(dateFilter || statusFilter) && <button className="btn btn-sm" onClick={() => { setDateFilter(''); setStatusFilter(''); }}>Clear Filters</button>}
      </div>

      <div className="table-container card">
        {loading ? <div className="loading">Loading...</div> : (
          <table className="table">
            <thead>
              <tr><th>#</th><th>Route</th><th>Bus</th><th>Driver</th><th>Date</th><th>Departure</th><th>Arrival</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No trips found.</td></tr>
              ) : trips.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td>{t.route_name || '-'}</td>
                  <td>{t.bus_number || '-'}</td>
                  <td>{t.driver_name || '-'}</td>
                  <td>{t.trip_date ? new Date(t.trip_date).toLocaleDateString('en-IN') : '-'}</td>
                  <td>{t.departure_time || '-'}</td>
                  <td>{t.arrival_time || '-'}</td>
                  <td><span className={`badge ${statusBadge[t.status] || 'badge-info'}`}>{t.status}</span></td>
                  <td>
                    <button className="btn btn-sm" style={{ marginRight: 8 }} onClick={() => openEdit(t)}>✏️ Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={closeModal} title={modal.mode === 'add' ? 'Schedule New Trip' : 'Edit Trip'}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}
          <div className="form-group">
            <label>Route</label>
            <select className="form-control" value={form.route_id} onChange={e => setForm({ ...form, route_id: e.target.value })} required>
              <option value="">-- Select Route --</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.route_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Bus</label>
            <select className="form-control" value={form.bus_id} onChange={e => setForm({ ...form, bus_id: e.target.value })} required>
              <option value="">-- Select Bus --</option>
              {buses.map(b => <option key={b.id} value={b.id}>{b.bus_number} ({b.bus_type})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Driver</label>
            <select className="form-control" value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
              <option value="">-- Select Driver --</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Trip Date</label>
            <input type="date" className="form-control" value={form.trip_date} onChange={e => setForm({ ...form, trip_date: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Departure Time</label>
              <input type="time" className="form-control" value={form.departure_time} onChange={e => setForm({ ...form, departure_time: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Arrival Time</label>
              <input type="time" className="form-control" value={form.arrival_time} onChange={e => setForm({ ...form, arrival_time: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="Upcoming">Upcoming</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">{modal.mode === 'add' ? 'Schedule Trip' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
