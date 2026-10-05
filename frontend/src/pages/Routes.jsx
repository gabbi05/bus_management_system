import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

const empty = { route_name: '', source: '', destination: '', stops: '', departure_time: '', arrival_time: '', bus_id: '' };

export default function BusRoutes() {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/busroutes');
      setRoutes(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchRoutes();
    api.get('/buses').then(r => setBuses(r.data)).catch(console.error);
  }, []);

  const openAdd = () => { setForm(empty); setError(''); setModal({ open: true, mode: 'add' }); };
  const openEdit = (r) => { setForm({ ...r, bus_id: r.bus_id || '' }); setError(''); setModal({ open: true, mode: 'edit', data: r }); };
  const closeModal = () => setModal({ open: false, mode: 'add', data: null });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (modal.mode === 'add') await api.post('/busroutes', form);
      else await api.put(`/busroutes/${modal.data.id}`, form);
      closeModal(); fetchRoutes();
    } catch (err) { setError(err.response?.data?.message || 'Error saving route.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route?')) return;
    try { await api.delete(`/busroutes/${id}`); fetchRoutes(); }
    catch (err) { alert(err.response?.data?.message || 'Error deleting.'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Routes</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Route</button>
      </div>

      <div className="table-container card">
        {loading ? <div className="loading">Loading...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Route Name</th><th>Source</th><th>Destination</th>
                <th>Departure</th><th>Arrival</th><th>Bus</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No routes found.</td></tr>
              ) : routes.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.route_name}</td>
                  <td>{r.source}</td>
                  <td>{r.destination}</td>
                  <td>{r.departure_time || '-'}</td>
                  <td>{r.arrival_time || '-'}</td>
                  <td>{r.bus_number || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                  <td>
                    <button className="btn btn-sm" style={{ marginRight: 8 }} onClick={() => openEdit(r)}>✏️ Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={closeModal} title={modal.mode === 'add' ? 'Add New Route' : 'Edit Route'}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}
          <div className="form-group">
            <label>Route Name</label>
            <input className="form-control" value={form.route_name} onChange={e => setForm({ ...form, route_name: e.target.value })} required placeholder="e.g. Mumbai - Pune Express" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Source</label>
              <input className="form-control" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} required placeholder="From" />
            </div>
            <div className="form-group">
              <label>Destination</label>
              <input className="form-control" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required placeholder="To" />
            </div>
          </div>
          <div className="form-group">
            <label>Stops (comma separated)</label>
            <textarea className="form-control" rows={2} value={form.stops} onChange={e => setForm({ ...form, stops: e.target.value })} placeholder="Stop1, Stop2, Stop3" />
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
            <label>Assign Bus</label>
            <select className="form-control" value={form.bus_id} onChange={e => setForm({ ...form, bus_id: e.target.value })}>
              <option value="">-- Select Bus --</option>
              {buses.map(b => <option key={b.id} value={b.id}>{b.bus_number} ({b.bus_type})</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">{modal.mode === 'add' ? 'Add Route' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
