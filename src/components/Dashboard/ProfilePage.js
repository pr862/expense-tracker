import "../../styles/ProfilePage.css";
import { 
  Camera, 
  LogOut, 
  User, 
  CreditCard, 
  Bell, 
  Lock, 
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  MessageSquare,
  Clock,
  Shield,
  Key,
  History,
  Trash2,
  Plus,
  Check,
  X,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";

const ProfilePage = ({ user, setUser, expenses = [] }) => {
  // State for user details
  const [profilePic, setProfilePic] = useState("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80");
  const [displayName, setDisplayName] = useState("User");
  const [email, setEmail] = useState("user@example.com");
  const [phone, setPhone] = useState("+1 (555) 000-0000");
  const [location, setLocation] = useState("Location");
  const [bio, setBio] = useState("Financial Minimalist. Focused on building sustainable wealth systems.");
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Active Tab State (Visual only for this demo)
  const [activeTab, setActiveTab] = useState("Profile");

  // Billing State - Initialized to 0 values
  const [billingPlan, setBillingPlan] = useState("Free");
  const [billingAmount] = useState("$0.00");
  const [billingDate, setBillingDate] = useState("N/A");
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Alerts State - Initialized with default values
  const [spendingLimit, setSpendingLimit] = useState(1000);
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(80);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [alertFrequency, setAlertFrequency] = useState("instant");

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginHistory] = useState([]);

  // Monthly spending calculation using useMemo
  const { currentMonthSpending, lastMonthSpending, spendingChange } = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = format(currentDate, 'yyyy-MM');
    const lastMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1), 'yyyy-MM');

    // Ensure expenses is an array
    const expensesArray = expenses || [];

    const currentMonthExpenses = expensesArray.filter(exp => {
      if (exp.type !== 'expense') return false;
      // Handle both ISO date format (yyyy-MM-dd) and other formats
      try {
        const expDate = parseISO(exp.date);
        return format(expDate, 'yyyy-MM') === currentMonth;
      } catch (e) {
        // Fallback for other date formats
        return exp.date.startsWith(currentMonth);
      }
    });

    const lastMonthExpenses = expensesArray.filter(exp => {
      if (exp.type !== 'expense') return false;
      try {
        const expDate = parseISO(exp.date);
        return format(expDate, 'yyyy-MM') === lastMonth;
      } catch (e) {
        return exp.date.startsWith(lastMonth);
      }
    });

    const currentTotal = currentMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const lastTotal = lastMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Calculate percentage change
    let change = 0;
    if (lastTotal > 0) {
      change = ((currentTotal - lastTotal) / lastTotal) * 100;
    } else if (currentTotal > 0) {
      change = 100; // First month with spending
    }

    return {
      currentMonthSpending: currentTotal,
      lastMonthSpending: lastTotal,
      spendingChange: change
    };
  }, [expenses]);

  // Password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Add payment method
  const addPaymentMethod = () => {
    const newId = paymentMethods.length + 1;
    setPaymentMethods([...paymentMethods, { 
      id: newId, 
      type: "Visa", 
      last4: "0000", 
      expiry: "12/28", 
      isDefault: false 
    }]);
  };

  // Remove payment method
  const removePaymentMethod = (id) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
  };

  // Set default payment method
  const setDefaultPayment = (id) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };

  // Save password
  const savePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters!");
      return;
    }
    // Simulate password change
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    alert("Password updated successfully!");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    // Clear user session data
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    sessionStorage.clear();
    
    // Navigate to login page
    navigate("/login");
    
    console.log("User logged out successfully");
  };

  return (
    <div className="profile-page-container">
      {/* Top Background Gradient Area */}
      <div className="header-background"></div>

      <div className="content-wrapper">
        
        {/* Floating Navigation Pill */}
        <div className="nav-pill-container">
          <div className="nav-pill">
            <button 
              className={`nav-item ${activeTab === 'Profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('Profile')}
            >
              <User size={18} /> Profile
            </button>
            <button 
              className={`nav-item ${activeTab === 'Billing' ? 'active' : ''}`}
              onClick={() => setActiveTab('Billing')}
            >
              <CreditCard size={18} /> Billing
            </button>
            <button 
              className={`nav-item ${activeTab === 'Alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('Alerts')}
            >
              <Bell size={18} /> Alerts
            </button>
            <button 
              className={`nav-item ${activeTab === 'Security' ? 'active' : ''}`}
              onClick={() => setActiveTab('Security')}
            >
              <Lock size={18} /> Security
            </button>
          </div>
        </div>

        <div className="profile-grid">
          {/* LEFT COLUMN: Profile Card */}
          <div className="profile-card sidebar-card">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                <img src={profilePic} alt="Profile" className="profile-img" />
                <button className="camera-btn" onClick={triggerFileInput}>
                  <Camera size={14} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              <h2 className="user-name">{displayName}</h2>
              <div className="badge">
                <ShieldCheck size={14} /> Premium Platinum Member
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-settings">SETTINGS</button>
              <button className="btn-upgrade">UPGRADE</button>
            </div>

            <div className="stats-box">
              <div className="stats-header">
                <span className="stats-label">THIS MONTH</span>
                <span className={`stats-perc ${spendingChange <= 0 ? 'positive' : 'negative'}`}>
                  {spendingChange === 0 ? (
                    <span style={{ color: '#64748b' }}>No change</span>
                  ) : spendingChange < 0 ? (
                    <>
                      <TrendingDown size={14} />
                      {Math.abs(spendingChange).toFixed(1)}%
                    </>
                  ) : (
                    <>
                      <TrendingUp size={14} />
                      {spendingChange.toFixed(1)}%
                    </>
                  )}
                </span>
              </div>
              <div className="stats-amount">${currentMonthSpending.toLocaleString()}</div>
              {lastMonthSpending > 0 && (
                <div className="stats-comparison">
                  vs ${lastMonthSpending.toLocaleString()} last month
                </div>
              )}
            </div>

            <div className="logout-section">
              <button className="btn-logout" onClick={handleLogout}>
                <LogOut size={18} /> Log out of account
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Tab Content */}
          <div className="profile-card details-card">
            
            {/* PROFILE TAB */}
            {activeTab === 'Profile' && (
              <>
                <div className="card-header">
                  <div>
                    <h2 className="card-title">Account Details</h2>
                    <p className="card-subtitle">Your information is secure and encrypted.</p>
                  </div>
                  <button className="btn-edit" onClick={toggleEdit}>
                    {isEditing ? "Save Details" : "Edit Details"}
                  </button>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>DISPLAY NAME</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      readOnly={!isEditing}
                      className={isEditing ? 'editable' : ''}
                    />
                  </div>

                  <div className="form-group">
                    <label>EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={!isEditing}
                      className={isEditing ? 'editable' : ''}
                    />
                  </div>

                  <div className="form-group">
                    <label>PHONE</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      readOnly={!isEditing}
                      className={isEditing ? 'editable' : ''}
                    />
                  </div>

                  <div className="form-group">
                    <label>LOCATION</label>
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      readOnly={!isEditing}
                      className={isEditing ? 'editable' : ''}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>PROFESSIONAL BIO</label>
                    <textarea 
                      rows="4"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      readOnly={!isEditing}
                      className={isEditing ? 'editable' : ''}
                    ></textarea>
                  </div>
                </div>
              </>
            )}

            {/* BILLING TAB */}
            {activeTab === 'Billing' && (
              <>
                <div className="card-header">
                  <div>
                    <h2 className="card-title">Billing & Plans</h2>
                    <p className="card-subtitle">Manage your subscription and payment methods.</p>
                  </div>
                </div>

                {/* Current Plan Section */}
                <div className="section-billing">
                  <div className="section-header-billing">
                    <CreditCard size={20} />
                    <h3>Current Plan</h3>
                  </div>
                  <div className="plan-card">
                    <div className="plan-info">
                      <span className="plan-badge">{billingPlan}</span>
                      <p className="plan-description">Basic access to essential features</p>
                    </div>
                    <div className="plan-price">
                      <span className="price-amount">{billingAmount}</span>
                      <span className="price-period">/month</span>
                    </div>
                  </div>
                  <div className="billing-info-row">
                    <div className="billing-info-item">
                      <span className="billing-label">Next billing date</span>
                      <span className="billing-value">{billingDate}</span>
                    </div>
                    <div className="billing-info-item">
                      <span className="billing-label">Amount</span>
                      <span className="billing-value">{billingAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Section */}
                <div className="section-billing">
                  <div className="section-header-billing">
                    <CreditCard size={20} />
                    <h3>Payment Methods</h3>
                  </div>
                  <div className="payment-methods-list">
                    {paymentMethods.map(method => (
                      <div key={method.id} className={`payment-method-item ${method.isDefault ? 'default' : ''}`}>
                        <div className="card-info">
                          <div className="card-icon">
                            <CreditCard size={20} />
                          </div>
                          <div className="card-details">
                            <span className="card-type">{method.type} •••• {method.last4}</span>
                            <span className="card-expiry">Expires {method.expiry}</span>
                          </div>
                          {method.isDefault && <span className="default-badge">Default</span>}
                        </div>
                        <div className="card-actions">
                          {!method.isDefault && (
                            <button className="btn-set-default" onClick={() => setDefaultPayment(method.id)}>
                              Set Default
                            </button>
                          )}
                          <button className="btn-remove-card" onClick={() => removePaymentMethod(method.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-add-payment" onClick={addPaymentMethod}>
                    <Plus size={18} /> Add Payment Method
                  </button>
                </div>

                {/* Billing History Section */}
                <div className="section-billing">
                  <div className="section-header-billing">
                    <History size={20} />
                    <h3>Billing History</h3>
                  </div>
                  {paymentMethods.length === 0 ? (
                    <div className="empty-state">
                      <p>No billing history available</p>
                      <p className="empty-state-subtitle">Add a payment method to see your billing history</p>
                    </div>
                  ) : (
                    <div className="billing-history-table">
                      <div className="history-header">
                        <span>Date</span>
                        <span>Description</span>
                        <span>Amount</span>
                        <span>Status</span>
                      </div>
                      <div className="history-row">
                        <span>Feb 15, 2025</span>
                        <span>Free Plan - Monthly</span>
                        <span>$0.00</span>
                        <span className="status-paid"><Check size={14} /> Paid</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ALERTS TAB */}
            {activeTab === 'Alerts' && (
              <>
                <div className="card-header">
                  <div>
                    <h2 className="card-title">Alerts & Notifications</h2>
                    <p className="card-subtitle">Configure your spending alerts and notification preferences.</p>
                  </div>
                </div>

                {/* Spending Limits Section */}
                <div className="section-alerts">
                  <div className="section-header-alerts">
                    <AlertTriangle size={20} />
                    <h3>Spending Limits</h3>
                  </div>
                  <div className="alert-setting">
                    <div className="setting-label-group">
                      <label>Monthly Spending Limit</label>
                      <span className="setting-description">Get notified when you approach this limit</span>
                    </div>
                    <div className="slider-container">
                      <input 
                        type="range" 
                        min="1000" 
                        max="20000" 
                        step="500"
                        value={spendingLimit}
                        onChange={(e) => setSpendingLimit(Number(e.target.value))}
                        className="range-slider"
                      />
                      <span className="slider-value">${spendingLimit.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="alert-setting">
                    <div className="setting-label-group">
                      <label>Budget Alert Threshold</label>
                      <span className="setting-description">Alert when spending reaches this percentage of budget</span>
                    </div>
                    <div className="slider-container">
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        step="5"
                        value={budgetAlertThreshold}
                        onChange={(e) => setBudgetAlertThreshold(Number(e.target.value))}
                        className="range-slider"
                      />
                      <span className="slider-value">{budgetAlertThreshold}%</span>
                    </div>
                  </div>
                </div>

                {/* Notification Channels Section */}
                <div className="section-alerts">
                  <div className="section-header-alerts">
                    <Bell size={20} />
                    <h3>Notification Channels</h3>
                  </div>
                  <div className="notification-channels">
                    <div className="channel-item">
                      <div className="channel-info">
                        <Mail size={20} />
                        <div className="channel-details">
                          <span className="channel-name">Email Notifications</span>
                          <span className="channel-description">Receive alerts in your inbox</span>
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={emailNotifications}
                          onChange={() => setEmailNotifications(!emailNotifications)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="channel-item">
                      <div className="channel-info">
                        <Smartphone size={20} />
                        <div className="channel-details">
                          <span className="channel-name">Push Notifications</span>
                          <span className="channel-description">Browser and mobile push alerts</span>
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={pushNotifications}
                          onChange={() => setPushNotifications(!pushNotifications)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="channel-item">
                      <div className="channel-info">
                        <MessageSquare size={20} />
                        <div className="channel-details">
                          <span className="channel-name">SMS Notifications</span>
                          <span className="channel-description">Text message alerts</span>
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={smsNotifications}
                          onChange={() => setSmsNotifications(!smsNotifications)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Alert Frequency Section */}
                <div className="section-alerts">
                  <div className="section-header-alerts">
                    <Clock size={20} />
                    <h3>Alert Frequency</h3>
                  </div>
                  <div className="frequency-options">
                    <label className={`frequency-option ${alertFrequency === 'instant' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="frequency" 
                        value="instant"
                        checked={alertFrequency === 'instant'}
                        onChange={(e) => setAlertFrequency(e.target.value)}
                      />
                      <span>Instant</span>
                    </label>
                    <label className={`frequency-option ${alertFrequency === 'daily' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="frequency" 
                        value="daily"
                        checked={alertFrequency === 'daily'}
                        onChange={(e) => setAlertFrequency(e.target.value)}
                      />
                      <span>Daily Digest</span>
                    </label>
                    <label className={`frequency-option ${alertFrequency === 'weekly' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="frequency" 
                        value="weekly"
                        checked={alertFrequency === 'weekly'}
                        onChange={(e) => setAlertFrequency(e.target.value)}
                      />
                      <span>Weekly Summary</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'Security' && (
              <>
                <div className="card-header">
                  <div>
                    <h2 className="card-title">Security Settings</h2>
                    <p className="card-subtitle">Protect your account and manage security preferences.</p>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="section-security">
                  <div className="section-header-security">
                    <Key size={20} />
                    <h3>Change Password</h3>
                  </div>
                  <div className="password-form">
                    <div className="form-group">
                      <label>CURRENT PASSWORD</label>
                      <div className="password-input-wrapper">
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                        <button 
                          type="button" 
                          className="toggle-password"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>NEW PASSWORD</label>
                      <div className="password-input-wrapper">
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button 
                          type="button" 
                          className="toggle-password"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>CONFIRM NEW PASSWORD</label>
                      <div className="password-input-wrapper">
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <button 
                          type="button" 
                          className="toggle-password"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <button className="btn-save-password" onClick={savePassword}>
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication Section */}
                <div className="section-security">
                  <div className="section-header-security">
                    <Shield size={20} />
                    <h3>Two-Factor Authentication</h3>
                  </div>
                  <div className="two-factor-card">
                    <div className="two-factor-info">
                      <div className={`two-factor-status ${twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                        {twoFactorEnabled ? <Check size={20} /> : <X size={20} />}
                        <span>{twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <p className="two-factor-description">
                        Add an extra layer of security to your account by requiring a verification code in addition to your password.
                      </p>
                    </div>
                    <button 
                      className={`btn-toggle-2fa ${twoFactorEnabled ? 'disable' : 'enable'}`}
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    >
                      {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>

                {/* Login Activity Section */}
                <div className="section-security">
                  <div className="section-header-security">
                    <History size={20} />
                    <h3>Login Activity</h3>
                  </div>
                  <div className="login-history-list">
                    {loginHistory.map(session => (
                      <div key={session.id} className="session-item">
                        <div className="session-info">
                          <div className="session-device">
                            <Smartphone size={18} />
                            <span>{session.device}</span>
                          </div>
                          <div className="session-meta">
                            <span className="session-location">{session.location}</span>
                            <span className="session-time">{session.time}</span>
                          </div>
                        </div>
                        {session.current && <span className="current-badge">Current</span>}
                      </div>
                    ))}
                  </div>
                  <button className="btn-logout-all">
                    <LogOut size={16} /> Sign out of all other sessions
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;