import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

const empty = { name: '', license_number: '', phone: '', bus_id: '', status: 'Available' };

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const fetchDrivers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/drivers', { params });
      setDrivers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDrivers(); }, [search, statusFilter]);
  useEffect(() => { api.get('/buses').then(r => setBuses(r.data)).catch(console.error); }, []);

  const openAdd = () => { setForm(empty); setError(''); setModal({ open: true, mode: 'add' }); };
  const openEdit = (d) => { setForm({ ...d, bus_id: d.bus_id || '' }); setError(''); setModal({ open: true, mode: 'edit', data: d }); };
  const closeModal = () => setModal({ open: false, mode: 'add', data: null });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (modal.mode === 'add') await api.post('/drivers', form);
      else await api.put(`/drivers/${modal.data.id}`, form);
      closeModal(); fetchDrivers();
    } catch (err) { setError(err.response?.data?.message || 'Error saving driver.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver?')) return;
    try { await api.delete(`/drivers/${id}`); fetchDrivers(); }
    catch (err) { alert(err.response?.data?.message || 'Error deleting.'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Drivers</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Driver</button>
      </div>

      <div className="filters">
        <input className="form-control search-input" placeholder="Search name, license, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="On-duty">On-duty</option>
        </select>
      </div>

      <div className="table-container card">
        {loading ? <div className="loading">Loading...</div> : (
          <table className="table">
            <thead>
              <tr><th>#</th><th>Name</th><th>License No.</th><th>Phone</th><th>Assigned Bus</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No drivers found.</td></tr>
              ) : drivers.map((d, i) => (
                <tr key={d.id}>
                  <td>{i + 1}</td>
                  <td>{d.name}</td>
                  <td>{d.license_number}</td>
                  <td>{d.phone}</td>
                  <td>{d.bus_number || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                  <td><span className={`badge ${d.status === 'Available' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span></td>
                  <td>
                    <button className="btn btn-sm" style={{ marginRight: 8 }} onClick={() => openEdit(d)}>✏️ Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={closeModal} title={modal.mode === 'add' ? 'Add New Driver' : 'Edit Driver'}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Driver's full name" />
          </div>
          <div className="form-group">
            <label>License Number</label>
            <input className="form-control" value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} required placeholder="e.g. MH-DL-001234" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="10-digit phone number" />
          </div>
          <div className="form-group">
            <label>Assign Bus</label>
            <select className="form-control" value={form.bus_id} onChange={e => setForm({ ...form, bus_id: e.target.value })}>
              <option value="">-- Unassigned --</option>
              {buses.map(b => <option key={b.id} value={b.id}>{b.bus_number} ({b.bus_type})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="Available">Available</option>
              <option value="On-duty">On-duty</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">{modal.mode === 'add' ? 'Add Driver' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
