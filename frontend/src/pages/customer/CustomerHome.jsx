import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';

export default function CustomerHome() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [modal, setModal] = useState({ open: false, data: null });
  const [bookForm, setBookForm] = useState({ seats: 1, travel_date: '' });
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/customer/routes', { params: { search } });
      setRoutes(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRoutes(); }, [search]);

  const openBook = (r) => { 
    setBookForm({ seats: 1, travel_date: '' }); 
    setBookError(''); setBookSuccess(''); 
    setModal({ open: true, data: r }); 
  };
  const closeModal = () => setModal({ open: false, data: null });

  const handleBook = async (e) => {
    e.preventDefault(); setBookError(''); setBookSuccess('');
    try {
      const res = await api.post('/customer/book', {
        route_id: modal.data.id,
        seats: bookForm.seats,
        travel_date: bookForm.travel_date
      });
      setBookSuccess(`Booked successfully! Amount paid: ₹${res.data.amount}`);
      setTimeout(() => closeModal(), 2000);
    } catch (err) {
      setBookError(err.response?.data?.message || 'Error booking ticket.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Find Bus Routes</h2>
      </div>

      <div className="filters" style={{ marginBottom: 30 }}>
        <input 
          type="text" 
          className="form-control search-input" 
          placeholder="Search by city or route name..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ maxWidth: 400 }}
        />
      </div>

      <div className="stats-grid">
        {loading ? <div className="loading">Loading routes...</div> : routes.length === 0 ? (
           <p style={{ color: 'var(--text-secondary)' }}>No routes found matching your search.</p>
        ) : routes.map(r => (
          <div key={r.id} className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 10, color: 'var(--text-primary)' }}>{r.route_name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 5 }}><strong>From:</strong> {r.source}</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 10 }}><strong>To:</strong> {r.destination}</p>
            <p style={{ color: 'var(--info)', marginBottom: 15, fontWeight: 600 }}>Fare: ₹{r.fare_amount || 'TBA'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-success">{r.bus_type}</span>
              <button className="btn btn-primary btn-sm" onClick={() => openBook(r)}>Book Ticket</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modal.open} onClose={closeModal} title={`Book Ticket: ${modal.data?.route_name}`}>
        <form onSubmit={handleBook}>
          {bookError && <div className="alert-error">{bookError}</div>}
          {bookSuccess && <div className="alert-error" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>{bookSuccess}</div>}
          
          <div className="form-group">
            <label>Travel Date</label>
            <input type="date" className="form-control" required min={new Date().toISOString().split('T')[0]} value={bookForm.travel_date} onChange={e => setBookForm({ ...bookForm, travel_date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Number of Seats</label>
            <input type="number" className="form-control" required min="1" max="5" value={bookForm.seats} onChange={e => setBookForm({ ...bookForm, seats: e.target.value })} />
          </div>
          
          <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginTop: 20, marginBottom: 20 }}>
            <strong>Total Fare:</strong> <span style={{ color: 'var(--info)', fontSize: 18, marginLeft: 10 }}>₹{(modal.data?.fare_amount || 0) * bookForm.seats}</span>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!!bookSuccess}>Confirm & Pay</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
