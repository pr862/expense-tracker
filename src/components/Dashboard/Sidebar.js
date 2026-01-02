import { NavLink } from "react-router-dom";
import {
  Home,
  Receipt,
  BarChart3,
  DollarSign,
  Bell,
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

        <NavLink to="/dashboard/budgets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <DollarSign size={18} /> Budgets
        </NavLink>

        <NavLink to="/dashboard/alerts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bell size={18} /> Alerts
        </NavLink>
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
