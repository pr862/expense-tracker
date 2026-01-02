import { NavLink } from "react-router-dom";
import {
  Home,
  Receipt,
  BarChart3,
<<<<<<< HEAD
  DollarSign,
=======
  Bell,
>>>>>>> 1c6d4d6b38197129dd4549289b4fcbadb8e21ca2
  User,
  Settings,
  LogOut
} from "lucide-react";
import '../../styles/Sidebar.css';

const Sidebar = ({ onLogout, user, isMobileOpen, onMobileClose }) => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        Expense<span>Track</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={18} /> Dashboard
        </NavLink>

        <NavLink to="/dashboard/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Receipt size={18} /> Expenses
        </NavLink>

        <NavLink to="/dashboard/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={18} /> Reports
        </NavLink>

<<<<<<< HEAD
        <NavLink to="/dashboard/budgets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <DollarSign size={18} /> Budgets
        </NavLink>
=======


      
>>>>>>> 1c6d4d6b38197129dd4549289b4fcbadb8e21ca2
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        <NavLink to="/dashboard/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={18} /> Profile
        </NavLink>

        <NavLink to="/dashboard/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={18} /> Settings
        </NavLink>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
