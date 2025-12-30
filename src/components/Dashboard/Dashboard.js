import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
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
import Sidebar from './Sidebar';
import SummaryCards from './SummaryCards';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import Analytics from './Analytics';
import BudgetSection from '../BudgetSection';
import Notifications from './Notifications';
import FloatingAddButton from './FloatingAddButton';
import ProfilePage from './ProfilePage';
import Settings from './Settings';
import { useAuth } from '../../App';
import '../../styles/Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Dashboard Home Page Component
const DashboardHome = ({ expenses, budgets, user, onDeleteExpense, onEditExpense }) => {

  // Calculate remaining budget for quick stats
  const totalBudget = budgets.reduce((sum, b) => sum.limit + sum, 0);
  const totalSpent = expenses
    .filter(exp => exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = totalBudget - totalSpent;

  // Calculate monthly data for chart
  const monthlyChartData = useMemo(() => {
    const monthlyExpenses = expenses
      .filter(expense => expense.type === 'expense')
      .reduce((acc, expense) => {
        const month = new Date(expense.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
      }, {});

    const monthlyIncome = expenses
      .filter(expense => expense.type === 'income')
      .reduce((acc, expense) => {
        const month = new Date(expense.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
      }, {});

    const allMonths = [...new Set([...Object.keys(monthlyExpenses), ...Object.keys(monthlyIncome)])];
    allMonths.sort((a, b) => new Date(a) - new Date(b));

    // Get last 6 months for better visualization
    const recentMonths = allMonths.slice(-6);

    return {
      labels: recentMonths,
      datasets: [
        {
          label: 'Expenses',
          data: recentMonths.map(month => monthlyExpenses[month] || 0),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Income',
          data: recentMonths.map(month => monthlyIncome[month] || 0),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }, [expenses]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(context.parsed);
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <h1>Home</h1>
        <p>Welcome back, {user?.name || 'User'}!</p>
      </div>

      {/* Top Summary Cards */}
      <SummaryCards expenses={expenses} />

      {/* Bottom Cards Row */}
      <div className="dashboard-bottom-cards">
        {/* Recent Transactions Card */}
        <div className="card transactions-card">
          <h3>Recent Transactions</h3>
          {expenses.length === 0 ? (
            <p>No expenses recorded yet.</p>
          ) : (
            <ul className="transactions-list">
              {expenses.slice(-5).reverse().map(exp => (
                <li key={exp.id} className={exp.type === 'expense' ? 'expense' : 'income'}>
                  <span>{exp.category}</span>
                  <span>${exp.amount.toFixed(2)}</span>
                  <span>{exp.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Monthly Overview Card */}
        <div className="card overview-card">
          <h3>Monthly Overview</h3>
          <div className="chart-container">
            {monthlyChartData.labels.length > 0 ? (
              <Line data={monthlyChartData} options={chartOptions} />
            ) : (
              <div className="chart-empty">
                <div className="empty-icon">📈</div>
                <p>No data available for chart</p>
              </div>
            )}
          </div>
          <div className="budget-summary">
            <p>Total Budget: ${totalBudget}</p>
            <p>Spent: ${totalSpent}</p>
            <p>Remaining: ${remaining}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// Expenses Page Component
const ExpensesPage = ({ expenses, onDeleteExpense, onEditExpense }) => {
  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <h1>Expense Management</h1>
        <p>Track and manage all your expenses</p>
      </div>
      
      <div className="dashboard-section">
        <ExpenseList 
          expenses={expenses} 
          onDeleteExpense={onDeleteExpense}
          onEditExpense={onEditExpense}
          showActions={true}
        />
      </div>
    </div>
  );
};

// Reports Page Component
const ReportsPage = ({ expenses, budgets }) => {
  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <h1>Reports</h1>
        <p>Insights into your spending patterns</p>
      </div>
      
      <div className="dashboard-section">
        <Analytics expenses={expenses} budgets={budgets} />
      </div>
    </div>
  );
};

// Budgets Page Component
const BudgetsPage = ({ budgets }) => {
  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <h1>Budget Management</h1>
        <p>Set and monitor your spending limits</p>
      </div>
      
      <div className="dashboard-section">
        <BudgetSection budgets={budgets} />
      </div>
    </div>
  );
};





// Alerts Page Component
const AlertsPage = () => {
  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <h1>Alerts</h1>
        <p>Manage your financial alerts and notifications</p>
      </div>
      
      <div className="dashboard-section">
        <p>Alert management coming soon...</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [formType, setFormType] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedExpenses = localStorage.getItem('expenses');
    const savedBudgets = localStorage.getItem('budgets');
    const savedNotifications = localStorage.getItem('notifications');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedExpenses) {
      try {
        const parsedExpenses = JSON.parse(savedExpenses);
        setExpenses(Array.isArray(parsedExpenses) ? parsedExpenses : []);
      } catch (error) {
        console.error('Error parsing expenses from localStorage:', error);
        setExpenses([]);
      }
    }
    if (savedBudgets) {
      try {
        const parsedBudgets = JSON.parse(savedBudgets);
        setBudgets(Array.isArray(parsedBudgets) ? parsedBudgets : []);
      } catch (error) {
        console.error('Error parsing budgets from localStorage:', error);
        setBudgets([]);
      }
    }
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

    // Initialize with sample data if no data exists
    if (!savedExpenses) {
      const sampleExpenses = [
        {
          id: '1',
          amount: 1500,
          category: 'Salary',
          date: '2024-01-01',
          note: 'Monthly salary',
          type: 'income'
        },
        {
          id: '2',
          amount: 500,
          category: 'Food',
          date: '2024-01-02',
          note: 'Groceries',
          type: 'expense'
        },
        {
          id: '3',
          amount: 1200,
          category: 'Rent',
          date: '2024-01-01',
          note: 'Monthly rent',
          type: 'expense'
        }
      ];
      setExpenses(sampleExpenses);
      localStorage.setItem('expenses', JSON.stringify(sampleExpenses));
    }

    if (!savedBudgets) {
      const sampleBudgets = [
        { category: 'Food', limit: 1000, spent: 500, period: 'monthly' },
        { category: 'Travel', limit: 500, spent: 200, period: 'monthly' },
        { category: 'Entertainment', limit: 300, spent: 150, period: 'monthly' }
      ];
      setBudgets(sampleBudgets);
      localStorage.setItem('budgets', JSON.stringify(sampleBudgets));
    }
  }, []);

  const handleLogout = () => {
    // Clear authentication state
    logout();
    // Remove local user data
    localStorage.removeItem('user');
    // Navigate to landing page
    navigate('/');
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleAddExpense = (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    setExpenses(prev => [...prev, newExpense]);
    setShowExpenseForm(false);
    
    // Regenerate notifications after adding new expense
    setTimeout(() => {
      const newNotifications = generateAllNotifications();
      setNotifications(newNotifications);
    }, 100);
  };

  const handleDeleteExpense = (expenseId) => {
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
  };

  const handleEditExpense = (expenseId, updatedData) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === expenseId ? { ...exp, ...updatedData } : exp
    ));
  };

  const handleAddIncome = () => {
    setFormType('income');
    setShowIncomeForm(true);
    setShowExpenseForm(false);
  };

  const handleOpenExpenseForm = () => {
    setFormType('expense');
    setShowExpenseForm(true);
    setShowIncomeForm(false);
  };

  // Notification generation functions
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const generateBudgetNotifications = React.useCallback((expenses, budgets) => {
    const notifications = [];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Check each budget
    budgets.forEach(budget => {
      const monthExpenses = expenses.filter(exp => 
        exp.date.startsWith(currentMonth) && 
        exp.category === budget.category && 
        exp.type === 'expense'
      );
      
      const spentAmount = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const budgetLimit = budget.limit;
      const spentPercentage = (spentAmount / budgetLimit) * 100;
      
      if (spentPercentage >= 90) {
        notifications.push({
          id: generateId(),
          type: 'error',
          title: 'Budget Exceeded!',
          message: `You've spent ${spentPercentage.toFixed(0)}% of your ${budget.category} budget (${spentAmount}/${budgetLimit}).`,
          timestamp: Date.now()
        });
      } else if (spentPercentage >= 75) {
        notifications.push({
          id: generateId(),
          type: 'warning',
          title: 'Budget Alert',
          message: `You've spent ${spentPercentage.toFixed(0)}% of your ${budget.category} budget. Consider reviewing your spending.`,
          timestamp: Date.now()
        });
      }
    });
    
    return notifications;
  }, []);

  const generateSpendingPatternNotifications = React.useCallback((expenses) => {
    const notifications = [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1).toISOString().slice(0, 7);
    
    const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth) && exp.type === 'expense');
    const lastMonthExpenses = expenses.filter(exp => exp.date.startsWith(lastMonth) && exp.type === 'expense');
    
    const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    if (lastMonthTotal > 0 && currentMonthTotal > lastMonthTotal * 1.5) {
      notifications.push({
        id: generateId(),
        type: 'warning',
        title: 'Unusual Spending Detected',
        message: `Your spending this month is 50% higher than last month. Consider reviewing your expenses.`,
        timestamp: Date.now()
      });
    }
    
    // Check for large single expenses
    const largeExpenses = currentMonthExpenses.filter(exp => exp.amount > currentMonthTotal * 0.3);
    largeExpenses.forEach(expense => {
      notifications.push({
        id: generateId(),
        type: 'info',
        title: 'Large Expense Recorded',
        message: `A significant expense of $${expense.amount} was recorded for ${expense.category}.`,
        timestamp: Date.now()
      });
    });
    
    return notifications;
  }, []);

  const generateMilestoneNotifications = React.useCallback((expenses) => {
    const notifications = [];
    const totalExpenses = expenses.filter(exp => exp.type === 'expense').reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = expenses.filter(exp => exp.type === 'income').reduce((sum, exp) => sum + exp.amount, 0);
    
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
      
      if (savingsRate >= 20) {
        notifications.push({
          id: generateId(),
          type: 'success',
          title: 'Great Savings Rate!',
          message: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the excellent work!`,
          timestamp: Date.now()
        });
      } else if (savingsRate < 0) {
        notifications.push({
          id: generateId(),
          type: 'warning',
          title: 'Overspending Alert',
          message: 'Your expenses exceed your income. Consider creating a budget to improve your financial health.',
          timestamp: Date.now()
        });
      }
    }
    
    return notifications;
  }, []);

  const generateWelcomeNotification = React.useCallback(() => {
    return [{
      id: generateId(),
      type: 'info',
      title: 'Welcome to Expense Tracker!',
      message: 'Start tracking your expenses to get personalized insights and budget recommendations.',
      timestamp: Date.now()
    }];
  }, []);

  const generateAllNotifications = React.useCallback(() => {
    let allNotifications = [];
    
    // Add welcome notification if this is first time
    const savedNotifications = localStorage.getItem('notifications');
    if (!savedNotifications || JSON.parse(savedNotifications).length === 0) {
      allNotifications = [...generateWelcomeNotification()];
    }
    
    // Generate budget notifications
    const budgetNotifications = generateBudgetNotifications(expenses, budgets);
    allNotifications = [...allNotifications, ...budgetNotifications];
    
    // Generate spending pattern notifications
    const patternNotifications = generateSpendingPatternNotifications(expenses);
    allNotifications = [...allNotifications, ...patternNotifications];
    
    // Generate milestone notifications
    const milestoneNotifications = generateMilestoneNotifications(expenses);
    allNotifications = [...allNotifications, ...milestoneNotifications];
    
    return allNotifications;
  }, [expenses, budgets, generateBudgetNotifications, generateSpendingPatternNotifications, generateMilestoneNotifications, generateWelcomeNotification]);

  // Initialize notifications on component mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      // Generate initial notifications
      const initialNotifications = generateAllNotifications();
      setNotifications(initialNotifications);
      localStorage.setItem('notifications', JSON.stringify(initialNotifications));
    }
  }, [expenses, budgets, generateAllNotifications]); // Regenerate when expenses or budgets change

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Check if current route is dashboard home
  const isDashboardHome = location.pathname === '/dashboard';

  return (
    <div className="dashboard-container">
      <Sidebar 
        onLogout={handleLogout}
        user={user}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      
      <div className="dashboard-content">
        {/* Mobile Menu Button */}
        {isMobile && (
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileSidebar}
            aria-label="Toggle sidebar"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}
        
        <Routes>
          <Route path="" element={
            <DashboardHome
              expenses={expenses}
              budgets={budgets}
              user={user}
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={handleEditExpense}
            />
          } />
          <Route path="profile" element={<ProfilePage user={user} setUser={setUser} />} />
          <Route path="expenses" element={
            <ExpensesPage
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={handleEditExpense}
            />
          } />
          <Route path="reports" element={
            <ReportsPage
              expenses={expenses}
              budgets={budgets}
            />
          } />
          <Route path="budgets" element={
            <BudgetsPage
              budgets={budgets}
            />
          } />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </div>

      {isDashboardHome && (
        <FloatingAddButton 
          onAddIncome={handleAddIncome}
          onAddExpense={handleOpenExpenseForm}
        />
      )}

      {showExpenseForm && (
        <ExpenseForm
          onClose={() => {
            setShowExpenseForm(false);
            setFormType(null);
          }}
          onSubmit={handleAddExpense}
          defaultType="expense"
        />
      )}

      {showIncomeForm && (
        <ExpenseForm
          onClose={() => {
            setShowIncomeForm(false);
            setFormType(null);
          }}
          onSubmit={handleAddExpense}
          defaultType="income"
        />
      )}

      <Notifications 
        notifications={notifications}
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />
    </div>
  );
};

export default Dashboard;
