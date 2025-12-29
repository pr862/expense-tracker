import React, { useState, useEffect } from 'react';
import '../../styles/Profile.css';

const Profile = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [profileData, setProfileData] = useState({
    // My Account Data
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    avatar: null,
    accountType: 'Free',
    memberSince: 'January 2024',
    
    // Preferences Data
    currency: 'USD',
    monthlyIncome: '',
    salaryCreditDate: '1st',
    startOfMonth: '1st',
    paymentMethods: {
      cash: true,
      upi: false,
      creditCard: true,
      bank: false
    },
    language: 'English',
    theme: 'light',
    themeColor: 'blue',
    dashboardLayout: 'detailed',
    
    // Budgets & Goals
    monthlyBudget: '',
    categoryBudgets: [
      { category: 'Food', limit: 1000, spent: 500 },
      { category: 'Travel', limit: 500, spent: 200 },
      { category: 'Entertainment', limit: 300, spent: 150 }
    ],
    savingsGoals: [
      { name: 'Emergency Fund', target: 5000, current: 1500, deadline: '2024-12-31' },
      { name: 'Vacation', target: 3000, current: 800, deadline: '2024-06-01' }
    ],
    
    // Notifications
    notifications: {
      overspendingAlert: true,
      dailyReminder: false,
      weeklyReport: true,
      billDueAlert: true,
      subscriptionRenewal: true,
      salaryCreditAlert: true
    },
    
    // Security
    twoFactorEnabled: false,
    recentLogins: [
      { device: 'Chrome on Mac', location: 'Mumbai, India', time: '2024-01-15 10:30 AM' },
      { device: 'Safari on iPhone', location: 'Mumbai, India', time: '2024-01-14 08:15 PM' }
    ],
    
    // Subscription
    currentPlan: 'Free',
    billingHistory: []
  });

  // Load profile data from localStorage
  useEffect(() => {
    const savedProfileData = localStorage.getItem('profileData');
    if (savedProfileData) {
      try {
        setProfileData(JSON.parse(savedProfileData));
      } catch (error) {
        console.error('Error parsing profile data:', error);
      }
    }
  }, []);

  // Save profile data to localStorage
  useEffect(() => {
    localStorage.setItem('profileData', JSON.stringify(profileData));
  }, [profileData]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setProfileData(prev => ({
      ...prev,
      avatar: null
    }));
  };

  const updateSavingsGoal = (index, field, value) => {
    setProfileData(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((goal, i) => 
        i === index ? { ...goal, [field]: value } : goal
      )
    }));
  };

  const addSavingsGoal = () => {
    setProfileData(prev => ({
      ...prev,
      savingsGoals: [
        ...prev.savingsGoals,
        { name: '', target: 0, current: 0, deadline: '' }
      ]
    }));
  };

  const removeSavingsGoal = (index) => {
    setProfileData(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter((_, i) => i !== index)
    }));
  };

  const exportData = (format) => {
    const data = {
      expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
      budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
      profile: profileData
    };
    
    let content, filename, mimeType;
    
    switch (format) {
      case 'csv':
        content = 'Name,Email,Phone,Account Type\n';
        content += `${profileData.fullName},${profileData.email},${profileData.phone},${profileData.accountType}`;
        filename = 'profile-data.csv';
        mimeType = 'text/csv';
        break;
      case 'excel':
        content = JSON.stringify(data, null, 2);
        filename = 'profile-data.json';
        mimeType = 'application/json';
        break;
      case 'pdf':
        content = `Profile Data Export\n\nName: ${profileData.fullName}\nEmail: ${profileData.email}\nPhone: ${profileData.phone}\nAccount Type: ${profileData.accountType}\nMember Since: ${profileData.memberSince}`;
        filename = 'profile-data.txt';
        mimeType = 'text/plain';
        break;
      default:
        return;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="profile-tab-content">
            <div className="profile-section">
              <h3>Profile Avatar</h3>
              <div className="avatar-section">
                <div className="avatar-upload">
                  {profileData.avatar ? (
                    <div className="avatar-preview">
                      <img src={profileData.avatar} alt="Profile Avatar" />
                      <button className="remove-avatar" onClick={removeAvatar}>
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="avatar-placeholder">
                      <span className="avatar-icon">👤</span>
                    </div>
                  )}
                  <div className="avatar-actions">
                    <label className="upload-btn">
                      Upload Photo
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                    {profileData.avatar && (
                      <button className="remove-btn" onClick={removeAvatar}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Account Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <div className="email-input-group">
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                    <span className="verified-badge">✓ Verified</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="phone-input-group">
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                    <button className="verify-btn">Verify</button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Account Type</label>
                  <div className="account-type-display">
                    <span className={`account-badge ${profileData.accountType.toLowerCase()}`}>
                      {profileData.accountType}
                    </span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Member Since</label>
                  <input
                    type="text"
                    value={profileData.memberSince}
                    disabled
                    className="disabled-input"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="profile-tab-content">
            <div className="profile-section">
              <h3>Financial Preferences</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Default Currency</label>
                  <select
                    value={profileData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Monthly Income (Optional)</label>
                  <input
                    type="number"
                    value={profileData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                    placeholder="Enter monthly income"
                  />
                </div>
                
                <div className="form-group">
                  <label>Salary Credit Date</label>
                  <input
                    type="date"
                    value={profileData.salaryCreditDate}
                    onChange={(e) => handleInputChange('salaryCreditDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Start of Month</label>
                  <select
                    value={profileData.startOfMonth}
                    onChange={(e) => handleInputChange('startOfMonth', e.target.value)}
                  >
                    <option value="1st">1st of Month</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Payment Methods</label>
                <div className="checkbox-group">
                  {Object.entries(profileData.paymentMethods).map(([method, enabled]) => (
                    <label key={method} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handleNestedInputChange('paymentMethods', method, e.target.checked)}
                      />
                      <span className="checkbox-label">
                        {method === 'upi' ? 'UPI' : method.charAt(0).toUpperCase() + method.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>App Preferences</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={profileData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Theme Mode</label>
                  <div className="theme-toggle">
                    <button
                      className={profileData.theme === 'light' ? 'active' : ''}
                      onClick={() => handleInputChange('theme', 'light')}
                    >
                      ☀️ Light
                    </button>
                    <button
                      className={profileData.theme === 'dark' ? 'active' : ''}
                      onClick={() => handleInputChange('theme', 'dark')}
                    >
                      🌙 Dark
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Theme Color</label>
                  <div className="color-options">
                    {['blue', 'green', 'purple', 'orange'].map(color => (
                      <button
                        key={color}
                        className={`color-option ${color} ${profileData.themeColor === color ? 'active' : ''}`}
                        onClick={() => handleInputChange('themeColor', color)}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Dashboard Layout</label>
                  <select
                    value={profileData.dashboardLayout}
                    onChange={(e) => handleInputChange('dashboardLayout', e.target.value)}
                  >
                    <option value="compact">Compact</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'budgets':
        return (
          <div className="profile-tab-content">
            <div className="profile-section">
              <h3>Budget Overview</h3>
              <div className="form-group">
                <label>Monthly Budget</label>
                <input
                  type="number"
                  value={profileData.monthlyBudget}
                  onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
                  placeholder="Enter monthly budget"
                />
              </div>
              
              <div className="budget-list">
                <h4>Category-wise Budgets</h4>
                {profileData.categoryBudgets.map((budget, index) => (
                  <div key={index} className="budget-item">
                    <div className="budget-info">
                      <span className="budget-category">{budget.category}</span>
                      <span className="budget-amount">${budget.spent}/${budget.limit}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${(budget.spent / budget.limit) * 100}%` }}
                      />
                    </div>
                    <div className="budget-status">
                      {budget.spent / budget.limit > 0.9 ? '🚨 Exceeded' : 
                       budget.spent / budget.limit > 0.75 ? '⚠️ At Risk' : '✅ On Track'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <h3>Savings Goals</h3>
              <div className="savings-goals">
                {profileData.savingsGoals.map((goal, index) => (
                  <div key={index} className="savings-goal">
                    <div className="goal-header">
                      <input
                        type="text"
                        value={goal.name}
                        onChange={(e) => updateSavingsGoal(index, 'name', e.target.value)}
                        placeholder="Goal name"
                        className="goal-name"
                      />
                      <button 
                        className="remove-goal"
                        onClick={() => removeSavingsGoal(index)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="goal-details">
                      <div className="goal-field">
                        <label>Target Amount</label>
                        <input
                          type="number"
                          value={goal.target}
                          onChange={(e) => updateSavingsGoal(index, 'target', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="goal-field">
                        <label>Current Amount</label>
                        <input
                          type="number"
                          value={goal.current}
                          onChange={(e) => updateSavingsGoal(index, 'current', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="goal-field">
                        <label>Deadline</label>
                        <input
                          type="date"
                          value={goal.deadline}
                          onChange={(e) => updateSavingsGoal(index, 'deadline', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(goal.current / goal.target) * 100}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {((goal.current / goal.target) * 100).toFixed(1)}% Complete
                      </span>
                    </div>
                  </div>
                ))}
                <button className="add-goal-btn" onClick={addSavingsGoal}>
                  + Add New Goal
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="profile-tab-content">
            <div className="profile-section">
              <h3>Notification Preferences</h3>
              <div className="notification-toggles">
                {Object.entries(profileData.notifications).map(([key, enabled]) => (
                  <div key={key} className="notification-toggle">
                    <div className="toggle-info">
                      <label className="toggle-label">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id={key}
                        checked={enabled}
                        onChange={(e) => handleNestedInputChange('notifications', key, e.target.checked)}
                      />
                      <label htmlFor={key} className="switch-slider"></label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="profile-tab-content">
            <div className="profile-section">
              <h3>Security Settings</h3>
              <div className="security-actions">
                <button className="security-btn">Change Password</button>
                <div className="two-factor-section">
                  <div className="two-factor-info">
                    <span>Two-Factor Authentication</span>
                    <span className={`security-status ${profileData.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                      {profileData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <button 
                    className="security-btn"
                    onClick={() => handleInputChange('twoFactorEnabled', !profileData.twoFactorEnabled)}
                  >
                    {profileData.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                  </button>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Recent Login Activity</h3>
              <div className="login-history">
                {profileData.recentLogins.map((login, index) => (
                  <div key={index} className="login-item">
                    <div className="login-info">
                      <span className="login-device">{login.device}</span>
                      <span className="login-location">{login.location}</span>
                    </div>
                    <span className="login-time">{login.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="profile-tab-content">
            <div className="profile-section">
              <h3>Export Data</h3>
              <div className="export-options">
                <button className="export-btn" onClick={() => exportData('csv')}>
                  📄 Export as CSV
                </button>
                <button className="export-btn" onClick={() => exportData('excel')}>
                  📊 Export as Excel
                </button>
                <button className="export-btn" onClick={() => exportData('pdf')}>
                  📋 Export as PDF
                </button>
              </div>
            </div>

            <div className="profile-section">
              <h3>Data Management</h3>
              <div className="data-actions">
                <button className="data-btn">Import Bank Statement</button>
                <button className="data-btn">Backup Data</button>
                <button className="data-btn">Restore Data</button>
                <button className="danger-btn">Delete All Data</button>
              </div>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="profile-tab-content">
            <div className="profile-section">
              <h3>Current Plan</h3>
              <div className="current-plan">
                <div className="plan-card free">
                  <h4>Free Plan</h4>
                  <div className="plan-features">
                    <span>✓ Basic expense tracking</span>
                    <span>✓ Up to 5 categories</span>
                    <span>✓ Monthly reports</span>
                    <span>✗ Advanced analytics</span>
                    <span>✗ Priority support</span>
                  </div>
                  <button className="upgrade-btn">Upgrade to Pro</button>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Billing History</h3>
              <div className="billing-history">
                <p className="no-history">No billing history available</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'account', label: 'My Account', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'budgets', label: 'Budgets & Goals', icon: '🎯' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'data', label: 'Data & Export', icon: '📤' },
    { id: 'subscription', label: 'Subscription', icon: '💳' }
  ];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile Settings</h2>
        <p>Manage your account and preferences</p>
      </div>
      
      <div className="profile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="profile-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Profile;
