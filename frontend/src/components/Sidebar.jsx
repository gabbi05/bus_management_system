import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/admin', icon: '🏠', label: 'Dashboard' },
  { path: '/admin/buses', icon: '🚌', label: 'Buses' },
  { path: '/admin/routes', icon: '🛣️', label: 'Routes' },
  { path: '/admin/drivers', icon: '👨‍✈️', label: 'Drivers' },
  { path: '/admin/bookings', icon: '🎫', label: 'Bookings' },
  { path: '/admin/trips', icon: '📅', label: 'Trips' },
  { path: '/admin/fares', icon: '💰', label: 'Fares' },
  { path: '/admin/reports', icon: '📊', label: 'Reports' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🚍</span>
        <span className="logo-text">BusMS Admin</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </aside>
  );
}
