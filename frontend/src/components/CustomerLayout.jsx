import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function CustomerLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout" style={{ flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="logo-text" style={{ fontSize: 24, cursor: 'pointer' }} onClick={() => navigate('/')}>🚍 BusMS</div>
          <nav style={{ display: 'flex', gap: 15, marginLeft: 20 }}>
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 15px' }}>Find Routes</NavLink>
            <NavLink to="/my-bookings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 15px' }}>My Bookings</NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 15px' }}>Profile</NavLink>
          </nav>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">{(user.full_name || user.username || 'U')[0].toUpperCase()}</div>
            <span className="user-name">{user.full_name || user.username}</span>
          </div>
          <button className="btn btn-sm btn-danger" onClick={handleLogout} style={{ marginLeft: 15 }}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content page-container">
        <Outlet />
      </div>
    </div>
  );
}
