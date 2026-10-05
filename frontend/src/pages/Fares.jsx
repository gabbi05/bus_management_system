import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

const empty = { route_id: '', fare_amount: '' };

export default function Fares() {
  const [fares, setFares] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const fetchFares = async () => {
    try {
      const res = await api.get('/fares');
      setFares(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchFares();
    api.get('/busroutes').then(r => setRoutes(r.data)).catch(console.error);
  }, []);

  const openAdd = () => { setForm(empty); setError(''); setModal({ open: true, mode: 'add' }); };
  const openEdit = (f) => { setForm({ route_id: f.route_id || '', fare_amount: f.fare_amount || '' }); setError(''); setModal({ open: true, mode: 'edit', data: f }); };
  const closeModal = () => setModal({ open: false, mode: 'add', data: null });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (modal.mode === 'add') await api.post('/fares', form);
      else await api.put(`/fares/${modal.data.id}`, form);
      closeModal(); fetchFares();
    } catch (err) { setError(err.response?.data?.message || 'Error saving fare.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fare?')) return;
    try { await api.delete(`/fares/${id}`); fetchFares(); }
    catch (err) { alert('Error deleting fare.'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Fares</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Set Fare</button>
      </div>

      <div className="table-container card">
        {loading ? <div className="loading">Loading...</div> : (
          <table className="table">
            <thead>
              <tr><th>#</th><th>Route Name</th><th>Source → Destination</th><th>Fare Amount</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {fares.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No fares set.</td></tr>
              ) : fares.map((f, i) => (
                <tr key={f.id}>
                  <td>{i + 1}</td>
                  <td>{f.route_name}</td>
                  <td>{f.source} → {f.destination}</td>
                  <td><span style={{ color: '#f59e0b', fontWeight: 600 }}>₹{Number(f.fare_amount).toLocaleString('en-IN')}</span></td>
                  <td>
                    <button className="btn btn-sm" style={{ marginRight: 8 }} onClick={() => openEdit(f)}>✏️ Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={closeModal} title={modal.mode === 'add' ? 'Set New Fare' : 'Edit Fare'}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}
          <div className="form-group">
            <label>Route</label>
            <select className="form-control" value={form.route_id} onChange={e => setForm({ ...form, route_id: e.target.value })} required>
              <option value="">-- Select Route --</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.route_name} ({r.source} → {r.destination})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Fare Amount (₹)</label>
            <input type="number" className="form-control" value={form.fare_amount} onChange={e => setForm({ ...form, fare_amount: e.target.value })} required min="1" step="0.01" placeholder="e.g. 350" />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">{modal.mode === 'add' ? 'Set Fare' : 'Update Fare'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
