import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

const empty = { bus_number: '', bus_type: 'AC', capacity: '', status: 'Active' };

export default function Buses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const fetchBuses = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/buses', { params });
      setBuses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBuses(); }, [search, statusFilter]);

  const openAdd = () => { setForm(empty); setError(''); setModal({ open: true, mode: 'add' }); };
  const openEdit = (bus) => { setForm(bus); setError(''); setModal({ open: true, mode: 'edit', data: bus }); };
  const closeModal = () => setModal({ open: false, mode: 'add', data: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (modal.mode === 'add') {
        await api.post('/buses', form);
      } else {
        await api.put(`/buses/${modal.data.id}`, form);
      }
      closeModal();
      fetchBuses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving bus.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bus?')) return;
    try {
      await api.delete(`/buses/${id}`);
      fetchBuses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting bus.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Buses</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Bus</button>
      </div>

      <div className="filters">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search bus number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="table-container card">
        {loading ? <div className="loading">Loading...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Bus Number</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No buses found.</td></tr>
              ) : buses.map((bus, i) => (
                <tr key={bus.id}>
                  <td>{i + 1}</td>
                  <td>{bus.bus_number}</td>
                  <td><span className={`badge ${bus.bus_type === 'AC' ? 'badge-info' : 'badge-warning'}`}>{bus.bus_type}</span></td>
                  <td>{bus.capacity}</td>
                  <td><span className={`badge ${bus.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{bus.status}</span></td>
                  <td>
                    <button className="btn btn-sm" style={{ marginRight: 8 }} onClick={() => openEdit(bus)}>✏️ Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(bus.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={closeModal} title={modal.mode === 'add' ? 'Add New Bus' : 'Edit Bus'}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}
          <div className="form-group">
            <label>Bus Number</label>
            <input className="form-control" value={form.bus_number} onChange={(e) => setForm({ ...form, bus_number: e.target.value })} required placeholder="e.g. MH-01-AB-1234" />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select className="form-control" value={form.bus_type} onChange={(e) => setForm({ ...form, bus_type: e.target.value })}>
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
            </select>
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input type="number" className="form-control" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required placeholder="e.g. 45" min="1" />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">{modal.mode === 'add' ? 'Add Bus' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
