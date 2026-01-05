import "../../styles/ProfilePage.css";
import { Camera, Lock, Bell, Trash2 } from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

import { getCurrencyOptions, formatCurrency } from "../../utils/currency";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProfilePage = ({ user, setUser, expenses = [] }) => {
  const [profilePic, setProfilePic] = useState("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee");
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Morgan");
  const [location, setLocation] = useState("San Francisco, CA");
  const [email, setEmail] = useState("alex.morgan@example.com");
  const [phone, setPhone] = useState("+1 (555) 000-1234");
  const [bio, setBio] = useState("Software Engineer by day, aspiring chef by night. Trying to save for a house down payment.");
  const [currency, setCurrency] = useState("USD");
  const [budgetGoal, setBudgetGoal] = useState(3500);

  const totalSpent = useMemo(() => {
    return expenses
      .filter(exp => exp.type === 'expense')
      .reduce((acc, exp) => acc + exp.amount, 0);
  }, [expenses]);
  const [notifications, setNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef(null);

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('userCurrency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

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

  const handleEditClick = () => {
    const data = {
      firstName,
      lastName,
      location,
      email,
      phone,
      bio,
      currency,
      budgetGoal,
    };
    setOriginalData(data);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFirstName(originalData.firstName);
    setLastName(originalData.lastName);
    setLocation(originalData.location);
    setEmail(originalData.email);
    setPhone(originalData.phone);
    setBio(originalData.bio);
    setCurrency(originalData.currency);
    setBudgetGoal(originalData.budgetGoal);
    setIsEditing(false);
  };

  const handleSave = () => {
    console.log("Profile updated:", {
      firstName,
      lastName,
      location,
      email,
      phone,
      bio,
      currency,
      budgetGoal,
    });
    // Save currency to localStorage
    localStorage.setItem('userCurrency', currency);
    setIsEditing(false);
  };

  const handleChangePasswordClick = () => {
    setShowPasswordModal(true);
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // For now, just log to console
    console.log('Password change attempted:', { currentPassword, newPassword });
    // Close modal
    handleCloseModal();
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    const names = value.split(" ", 2);
    setFirstName(names[0] || "");
    setLastName(names[1] || "");
  };

  const fullName = `${firstName} ${lastName}`.trim();

  const percentage = Math.min(100, Math.round((totalSpent / budgetGoal) * 100));

  // Expense Breakdown Data for Pie Chart
  const expenseData = useMemo(() => {
    const categoryTotals = expenses
      .filter(exp => exp.type === 'expense')
      .reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});

    const colors = ['#22c55e', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#64748b', '#ef4444', '#06b6d4'];

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  }, [expenses]);

  // Line Chart Data
  const lineData = useMemo(() => {
    const currentDate = new Date();
    const labels = [];
    const data = [];

    // Month names array for abbreviated labels
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      const monthIndex = date.getMonth();
      const monthName = monthNames[monthIndex];

      const monthlyExpenses = expenses
        .filter(exp => exp.type === 'expense' && exp.date.startsWith(monthKey))
        .reduce((sum, exp) => sum + exp.amount, 0);

      labels.unshift(monthName); // Prepend to maintain order (oldest first)
      data.unshift(monthlyExpenses);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Spending',
          data,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }, [expenses]);

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-user">
          <div className="avatar">
            <img
              src={profilePic}
              alt="profile"
            />
            <button className="camera-btn" onClick={triggerFileInput}>
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div>
            <input
              type="text"
              value={fullName}
              onChange={handleNameChange}
              className="name-input"
              readOnly={!isEditing}
            />
            <p>📍 <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="location-input"
              readOnly={!isEditing}
            /></p>
            <span>Member since September 2023</span>
          </div>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <button className="edit-btn" onClick={handleEditClick}>
              Edit Profile
            </button>
          ) : (
            <div className="edit-controls">
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel Edit
              </button>
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="profile-grid">
        {/* Left */}
        <div className="left-section">
          {/* AI Insight */}
          

          {/* Personal Info */}
          <div className="card">
            <h3>Personal Information</h3>

            <div className="form-grid">
              <div>
                <label>First Name</label>
                <input 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label>Last Name</label>
                <input 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label>Email Address</label>
                <input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label>Phone Number</label>
                <input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
            </div>

            <label>Bio</label>
            <textarea 
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          {/* Preferences */}
          <div className="card">
            <h3>Preferences</h3>

            <div className="form-grid">
              <div>
                <label>Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={!isEditing}
                >
                  {getCurrencyOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Monthly Budget Goal</label>
                <input 
                  type="number"
                  value={budgetGoal} 
                  onChange={(e) => setBudgetGoal(Number(e.target.value) || 0)}
                  readOnly={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="right-section">
          {/* Monthly Overview */}
          <div className="card">
            <h3>Monthly Overview</h3>
            <div className="budget-info">
              <div className="budget-progress">
                <div className="progress-label">
                  <span>${totalSpent.toLocaleString()}</span>
                  <span>/ ${budgetGoal}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="progress-text">{percentage}% Used</span>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="expense-list">
              {expenseData.map((item) => (
                <div key={item.name} className="expense-item">
                  <span>
                    <div style={{ backgroundColor: item.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }} />
                    {item.name}
                  </span>
                  <strong>${item.value.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Spending Trend */}
          <div className="card">
            <h3>Spending Trend</h3>
            <p>Last 6 months</p>
            <div className="chart-container">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>

          {/* Account */}
          <div className="card">
            <h3>Account</h3>

            <div className="account-item" onClick={handleChangePasswordClick}>
              <Lock size={18} /> Change Password
            </div>

            <div className="account-item">
              <Bell size={18} /> Notifications
              <input 
                type="checkbox" 
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
            </div>

            <div className="account-item danger">
              <Trash2 size={18} /> Delete Account
            </div>
          </div>
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
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
