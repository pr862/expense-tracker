import React, { useState } from 'react';
import "../../styles/Settings.css";

import {
  Bell,
  Shield,
  Database,
  Sliders,
  Download,
  Trash2,
  Lock,
  AlertCircle
} from "lucide-react";

const Settings = () => {
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Light');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [budgetThresholds, setBudgetThresholds] = useState(true);
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: 1, name: 'Chase Bank', detail: 'Checking •••• 4242', color: 'blue' },
    { id: 2, name: 'Amex', detail: 'Platinum •••• 1001', color: 'green' }
  ]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveChanges = () => {
    const settings = {
      language,
      theme,
      twoFactorAuth,
      biometricLogin,
      emailAlerts,
      pushNotifications,
      weeklyReports,
      budgetThresholds,
      connectedAccounts
    };
    console.log('Settings saved:', settings);
    alert('Changes saved successfully');
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    console.log('Password changed:', { currentPassword, newPassword });
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const toggleExportDropdown = () => {
    setShowExportDropdown(!showExportDropdown);
  };

  const handleExportCSV = () => {
    console.log('Exporting CSV...');
    alert('CSV export initiated');
    setShowExportDropdown(false);
  };

  const handleExportPDF = () => {
    console.log('Exporting PDF...');
    alert('PDF export initiated');
    setShowExportDropdown(false);
  };

  const handleDeleteData = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteData = () => {
    console.log('All data deleted');
    setShowDeleteModal(false);
    alert('Data has been deleted');
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleUnlinkAccount = (id) => {
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== id));
    console.log(`Unlinked account ${id}`);
  };

  const handleLinkNewAccount = () => {
    console.log('Linking new account...');
    alert('Redirecting to link new account');
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your application preferences and security.</p>
        </div>
        <button className="primary-btn" onClick={handleSaveChanges}>Save Changes</button>
      </div>

      <div className="settings-grid">
        {/* Left Column */}
        <div className="settings-left">
          {/* General Preferences */}
          <div className="card">
            <h3>
              <Sliders size={18} /> General Preferences
            </h3>

            <div className="form-row">
              <div>
                <label>Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>

              <div>
                <label>Theme</label>
                <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <h3>
              <Bell size={18} /> Notifications
            </h3>

            <Toggle
              title="Email Alerts"
              desc="Receive daily summaries and critical alerts."
              active={emailAlerts}
              onChange={setEmailAlerts}
            />

            <Toggle
              title="Push Notifications"
              desc="Get real-time updates on mobile."
              active={pushNotifications}
              onChange={setPushNotifications}
            />

            <Toggle
              title="Weekly Reports"
              desc="Detailed analysis of your spending habits."
              active={weeklyReports}
              onChange={setWeeklyReports}
            />

            <Toggle
              title="Budget Thresholds"
              desc="Get notified when you exceed 80% of budget."
              active={budgetThresholds}
              onChange={setBudgetThresholds}
            />
          </div>

          {/* Connected Accounts */}
          <div className="card">
            <h3>🏦 Connected Accounts</h3>
            {connectedAccounts.map((account) => (
              <Account
                key={account.id}
                name={account.name}
                detail={account.detail}
                color={account.color}
                onUnlink={() => handleUnlinkAccount(account.id)}
              />
            ))}
            <button className="link-btn" onClick={handleLinkNewAccount}>＋ Link New Account</button>
          </div>
        </div>

        {/* Right Column */}
        <div className="settings-right">
          {/* Security */}
          <div className="card">
            <h3>
              <Shield size={18} /> Security
            </h3>

            <Toggle
              title="Two-Factor Auth"
              active={twoFactorAuth}
              onChange={setTwoFactorAuth}
            />
            <Toggle
              title="Biometric Login"
              active={biometricLogin}
              onChange={setBiometricLogin}
            />

            <button className="outline-btn" onClick={handleChangePassword}>
              <Lock size={16} /> Change Password
            </button>
          </div>

          {/* Data */}
          <div className="card">
            <h3>
              <Database size={18} /> Data
            </h3>

            <div className="export-wrapper">
              <button className="data-btn" onClick={toggleExportDropdown}>
                Export to CSV <Download size={16} />
                <span className="dropdown-arrow">▼</span>
              </button>
              {showExportDropdown && (
                <div className="export-dropdown">
                  <button className="dropdown-item" onClick={handleExportCSV}>
                    Export to CSV
                  </button>
                  <button className="dropdown-item" onClick={handleExportPDF}>
                    Export to PDF
                  </button>
                </div>
              )}
            </div>

            <button className="danger-btn" onClick={handleDeleteData}>
              <Trash2 size={16} /> Delete All Data
            </button>
          </div>

          <p className="version">ExpenseFlow v1.0.2<br />© 2024 ExpenseFlow Inc.</p>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={handleClosePasswordModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Data Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">
              <AlertCircle size={48} />
            </div>
            <h3>Delete All Data</h3>
            <p>This action cannot be undone. All your expenses, budgets, and data will be permanently deleted.</p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={handleCloseDeleteModal}>
                Cancel
              </button>
              <button className="danger-btn" onClick={confirmDeleteData}>
                Delete Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Toggle = ({ title, desc, active, onChange }) => (
  <div className="toggle-row">
    <div>
      <strong>{title}</strong>
      {desc && <p>{desc}</p>}
    </div>
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider"></span>
    </label>
  </div>
);

const Account = ({ name, detail, color, onUnlink }) => (
  <div className="account-row">
    <div className={`bank-icon ${color}`}>{name[0]}</div>
    <div>
      <strong>{name}</strong>
      <p>{detail}</p>
    </div>
    <span className="unlink" onClick={onUnlink}>Unlink</span>
  </div>
);

export default Settings;
