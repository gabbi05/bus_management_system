import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CustomerLayout from './components/CustomerLayout';

// Shared Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import Dashboard from './pages/Dashboard';
import Buses from './pages/Buses';
import RoutesPage from './pages/Routes';
import Drivers from './pages/Drivers';
import Bookings from './pages/Bookings';
import Trips from './pages/Trips';
import Fares from './pages/Fares';
import Reports from './pages/Reports';

// Customer Pages
import CustomerHome from './pages/customer/CustomerHome';
import MyBookings from './pages/customer/MyBookings';
import Profile from './pages/customer/Profile';

const AdminLayout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Routes */}
        <Route path="/" element={<ProtectedRoute role="customer"><CustomerLayout /></ProtectedRoute>}>
          <Route index element={<CustomerHome />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="buses" element={<Buses />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="trips" element={<Trips />} />
          <Route path="fares" element={<Fares />} />
          <Route path="reports" element={<Reports />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
