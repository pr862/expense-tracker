import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from './Sidebar';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import Analytics from './Analytics';
import BudgetPage from './BudgetPage';
import Notifications from './Notifications';
import ProfilePage from './ProfilePage';
import Settings from './Settings';
import SummaryCards from './SummaryCards';
import TypeSelection from './TypeSelection';
import TopCategories from './TopCategories';
import FloatingAddButton from './FloatingAddButton';
import QRScanner from './QRScanner';
import BillScanner from './BillScanner';
import SmartSuggestions from './SmartSuggestions';

import { expenseCategories, incomeCategories } from './categories';
import { useAuth } from '../../App';
import '../../styles/Dashboard.css';

// Dashboard Home Page Component
const DashboardHome = ({ expenses, budgets, user, onDeleteExpense, onEditExpense, onAddExpense, onDeleteBudget, onEditBudget, navigate }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('this-week');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);

  // Category icons mapping from shared categories
  const categoryIcons = useMemo(() => {
    const icons = {};
    [...expenseCategories, ...incomeCategories].forEach(cat => {
      icons[cat.label] = cat.icon;
    });
    icons.default = '💳';
    return icons;
  }, []);

  // Weekly chart data (last 7 days for Recharts)
  const weeklyChartData = useMemo(() => {
    const now = new Date();
    let dayOfWeek = now.getDay();
    let daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const currentMonday = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
    let startOfWeek, endOfWeek;

    if (selectedPeriod === 'last-week') {
      const lastMonday = new Date(currentMonday.getTime() - 7 * 24 * 60 * 60 * 1000);
      startOfWeek = lastMonday;
      endOfWeek = new Date(lastMonday.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      startOfWeek = currentMonday;
      endOfWeek = new Date(currentMonday.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];

    const weeklyExpenses = expenses
      .filter(expense => {
        return expense.type === 'expense' &&
               expense.date >= startStr &&
               expense.date < endStr;
      })
      .reduce((acc, expense) => {
        const date = new Date(expense.date);
        const dayIndex = (date.getDay() + 6) % 7; // 0=Mon, 6=Sun
        acc[dayIndex] = (acc[dayIndex] || 0) + expense.amount;
        return acc;
      }, {});

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map((day, index) => ({
      day,
      value: weeklyExpenses[index] || 0
    }));

    return data;
  }, [expenses, selectedPeriod]);

  const hasWeeklyData = weeklyChartData.some(item => item.value > 0);

  // Handle download expenses as CSV
  const handleDownload = () => {
    if (expenses.length === 0) {
      alert('No expenses to download.');
      return;
    }

    const csvHeaders = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const csvRows = expenses.map(exp => [
      exp.date,
      exp.type,
      exp.category,
      exp.amount,
      exp.note || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'expenses.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top categories data for new component
  const topCategoriesData = useMemo(() => {
    if (budgets.length === 0) {
      return [];
    }

    // Map budgets to include spent amounts and colors (budgets already have spent calculated based on their period)
    const colors = ['blue', 'red', 'yellow', 'green', 'purple'];
    return budgets.map((budget, index) => {
      const cat = expenseCategories.find(c => c.value === budget.category);
      return {
        name: cat ? cat.label : budget.category,
        spent: budget.spent || 0,
        total: budget.limit,
        color: colors[index % colors.length]
      };
    });
  }, [budgets]);

  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard <span className="subtitle">Financial Overview</span></h1>
          <p>Welcome back, {user?.name || 'User'}!</p>
        </div>
        <div className="header-actions">
          <button className="download-btn" onClick={handleDownload}>Download</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCards expenses={expenses} budgets={budgets} />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="weekly-chart">
          <div className="weekly-header">
            <h3>Weekly Spending</h3>
            <div className="period-select">
              <div
                className="period-button"
                onClick={() => setIsPeriodOpen(!isPeriodOpen)}
              >
                <span>{selectedPeriod === 'this-week' ? 'This Week' : 'Last Week'}</span>
                <span className={`arrow ${isPeriodOpen ? 'open' : ''}`}>▼</span>
              </div>
              {isPeriodOpen && (
                <div className="period-options">
                  <div
                    className={`period-option ${selectedPeriod === 'this-week' ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPeriod('this-week');
                      setIsPeriodOpen(false);
                    }}
                  >
                    This Week
                  </div>
                  <div
                    className={`period-option ${selectedPeriod === 'last-week' ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPeriod('last-week');
                      setIsPeriodOpen(false);
                    }}
                  >
                    Last Week
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="chart-container">
            {hasWeeklyData ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={weeklyChartData}>
                  <defs>
                    <linearGradient id="spending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12}} interval={0} />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Spending']} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" fill="url(#spending)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <div className="empty-icon">📈</div>
                <p>No data available for chart</p>
              </div>
            )}
          </div>
        </div>

        <div className="top-categories">
          {topCategoriesData.length > 0 ? (
            <TopCategories categories={topCategoriesData} />
          ) : (
            <div className="chart-empty">
              <div className="empty-icon">📊</div>
              <p>No budget data available</p>
            </div>
          )}
        </div>
      </div>



  

      {/* Recent Transactions */}
      <div className="recent-transactions">
      <h3>Recent Transactions <span className="view-all">View all</span></h3>
        {expenses.length === 0 ? (
          <p>No transactions recorded yet.</p>
        ) : (
          <div className="transactions-table">
            {expenses.slice(-5).reverse().map(exp => (
              <div key={exp.id} className={`transaction-item ${exp.type === 'expense' ? 'expense' : 'income'}`}>
                <div className="transaction-info">
                  <span className="icon">{categoryIcons[exp.category] || categoryIcons.default}</span>
                  <div>
                    <div className="description">{exp.category} - {exp.note}</div>
                    <div className="date-time">{exp.date} {exp.time || '12:00 PM'}</div>
                  </div>
                </div>
                <div className="amount">
                  {exp.type === 'income' ? '+' : '-'}${exp.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
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
      <div className="dashboard-section">
        <Analytics expenses={expenses} budgets={budgets} />
      </div>
    </div>
  );
};



// Alerts Page Component
const AlertsPage = ({ notifications, expenses, budgets }) => {
  return (
    <div className="dashboard-main">
      <SmartSuggestions expenses={expenses} budgets={budgets} />
      <Notifications notifications={notifications} />
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showBillScanner, setShowBillScanner] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

 

  // Function to calculate spent amounts for budgets based on expenses
  const calculateBudgetSpent = (budgets, expenses) => {
    const currentDate = new Date();
    return budgets.map(budget => {
      let startDate, endDate;
      if (budget.period === 'weekly') {
        // Current week: Monday to Sunday
        const day = currentDate.getDay();
        const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), diff);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
      } else if (budget.period === 'monthly') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      } else if (budget.period === 'yearly') {
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), 11, 31);
      } else {
        // Default to monthly
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      }

      const periodExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return exp.type === 'expense' && 
               exp.category.toLowerCase() === budget.category.toLowerCase() && 
               expDate >= startDate && expDate <= endDate;
      });
      const spent = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return { ...budget, spent };
    });
  };

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
    
    // Clear initial dummy data only once
    if (!localStorage.getItem('dummy_cleared')) {
      localStorage.removeItem('expenses');
      localStorage.setItem('dummy_cleared', 'true');
      setExpenses([]);
    } else if (savedExpenses) {
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


  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

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
      date: new Date().toLocaleDateString('en-CA')
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



  const handleOpenTypeSelection = () => {
    setShowTypeSelection(true);
  };

  const handleSelectExpense = () => {
    setShowTypeSelection(false);
    setShowExpenseForm(true);
    setShowIncomeForm(false);
  };

  const handleSelectIncome = () => {
    setShowTypeSelection(false);
    setShowIncomeForm(true);
    setShowExpenseForm(false);
  };



  const handleScanResult = (scanData) => {
    // Auto-fill the expense form with scanned data
    setShowExpenseForm(true);
    setShowScanner(false);
    // Set the scanned data as editingExpense to pre-fill the form
    setEditingExpense(scanData);
  };

  const handleBillScanResult = (scanData) => {
    // Auto-fill the expense form with scanned bill data
    setShowExpenseForm(true);
    setShowBillScanner(false);
    // Set the scanned data as editingExpense to pre-fill the form
    // Include detected currency if available
    setEditingExpense({
      ...scanData    });
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
      action: 'Get Started',
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

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Update budgets with calculated spent amounts whenever expenses change
  useEffect(() => {
    if (budgets.length > 0) {
      const updatedBudgets = calculateBudgetSpent(budgets, expenses);
      setBudgets(updatedBudgets);
    }
  }, [expenses]);



  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Check if current route is dashboard home
  // const isDashboardHome = location.pathname === '/dashboard';


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
              onAddExpense={handleOpenTypeSelection}
              onDeleteBudget={(index) => {
                setBudgets(prev => prev.filter((_, i) => i !== index));
              }}
              onEditBudget={(index, updatedBudget) => {
                const tempBudgets = budgets.map((b, i) => i === index ? updatedBudget : b);
                const updatedBudgets = calculateBudgetSpent(tempBudgets, expenses);
                setBudgets(updatedBudgets);
              }}
            />
          } />
          <Route path="profile" element={<ProfilePage user={user} setUser={setUser} expenses={expenses} />} />
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
            <BudgetPage
              budgets={budgets}
              expenses={expenses}
              onAddBudget={(budget) => {
                const newBudgetWithSpent = calculateBudgetSpent([budget], expenses)[0];
                setBudgets(prev => [...prev, newBudgetWithSpent]);
              }}
              onDeleteBudget={(index) => {
                setBudgets(prev => prev.filter((_, i) => i !== index));
              }}
              onEditBudget={(index, updatedBudget) => {
                const tempBudgets = budgets.map((b, i) => i === index ? updatedBudget : b);
                const updatedBudgets = calculateBudgetSpent(tempBudgets, expenses);
                setBudgets(updatedBudgets);
              }}
            />
          } />
          <Route path="alerts" element={<AlertsPage notifications={notifications} expenses={expenses} budgets={budgets} />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </div>

   
       

      {showTypeSelection && (
        <TypeSelection
          onSelectExpense={handleSelectExpense}
          onSelectIncome={handleSelectIncome}
          onClose={() => setShowTypeSelection(false)}
        />
      )}

      {showExpenseForm && (
        <ExpenseForm
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
          onSubmit={(data) => {
            if (editingExpense) {
              handleEditExpense(editingExpense.id, data);
              setEditingExpense(null);
            } else {
              handleAddExpense(data);
            }
            setShowExpenseForm(false);
          }}
          expense={editingExpense}
          defaultType="expense"
        />
      )}

      {showIncomeForm && (
        <ExpenseForm
          onClose={() => {
            setShowIncomeForm(false);
            setEditingExpense(null);
          }}
          onSubmit={(data) => {
            if (editingExpense) {
              handleEditExpense(editingExpense.id, data);
              setEditingExpense(null);
            } else {
              handleAddExpense(data);
            }
            setShowIncomeForm(false);
          }}
          expense={editingExpense}
          defaultType="income"
        />
      )}



      <FloatingAddButton
        onAddIncome={() => {
          setShowIncomeForm(true);
          setShowExpenseForm(false);
          setShowTypeSelection(false);
        }}
        onAddExpense={() => {
          setShowExpenseForm(true);
          setShowIncomeForm(false);
          setShowTypeSelection(false);
        }}
        onScanQR={() => setShowScanner(true)}
        onScanBill={() => setShowBillScanner(true)}
      />

      {showScanner && (
        <QRScanner
          onScan={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showBillScanner && (
        <BillScanner
          onScan={handleBillScanResult}
          onClose={() => setShowBillScanner(false)}
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


