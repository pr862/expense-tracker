import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { format, parseISO } from "date-fns";
import "../../styles/Analytics.css";

const Analytics = ({ expenses, budgets }) => {
  const [selectedWeek, setSelectedWeek] = useState('this');

  const getWeeklyData = (weekOffset = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() - (weekOffset * 7)); // Start from Sunday, offset for last week

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayKey = format(day, 'yyyy-MM-dd');
      const dayExpenses = expenses.filter(exp => exp.date === dayKey && exp.type === 'expense');
      const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      days.push({
        day: format(day, 'EEE'),
        value: total
      });
    }

    const maxValue = Math.max(...days.map(d => d.value), 0);
    return { data: days, maxValue };
  };

  const weeklyData = getWeeklyData(selectedWeek === 'last' ? 1 : 0);
  // Calculate KPI data
  const kpiData = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = format(currentDate, 'yyyy-MM');
    const lastMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1), 'yyyy-MM');

    const currentMonthExpenses = expenses.filter(exp =>
      exp.date.startsWith(currentMonth) && exp.type === 'expense'
    );
    const lastMonthExpenses = expenses.filter(exp =>
      exp.date.startsWith(lastMonth) && exp.type === 'expense'
    );
    const currentMonthIncome = expenses.filter(exp =>
      exp.date.startsWith(currentMonth) && exp.type === 'income'
    );
    const lastMonthIncome = expenses.filter(exp =>
      exp.date.startsWith(lastMonth) && exp.type === 'income'
    );

    const totalIncome = currentMonthIncome.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthIncomeTotal = lastMonthIncome.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthExpensesTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const incomeChange = lastMonthIncomeTotal > 0 ? ((totalIncome - lastMonthIncomeTotal) / lastMonthIncomeTotal) * 100 : 0;
    const expenseChange = lastMonthExpensesTotal > 0 ? ((totalExpenses - lastMonthExpensesTotal) / lastMonthExpensesTotal) * 100 : 0;

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      incomeChange,
      expenseChange
    };
  }, [expenses]);

  // Calculate monthly data for area chart
  const monthlyData = useMemo(() => {
    const months = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM');

      const income = expenses
        .filter(exp => exp.date.startsWith(monthKey) && exp.type === 'income')
        .reduce((sum, exp) => sum + exp.amount, 0);

      const expense = expenses
        .filter(exp => exp.date.startsWith(monthKey) && exp.type === 'expense')
        .reduce((sum, exp) => sum + exp.amount, 0);

      months.push({
        month: monthName,
        income,
        expense
      });
    }

    return months;
  }, [expenses]);


  // Calculate expense breakdown data
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

  // Get recent high-value transactions
  const recentTransactions = useMemo(() => {
    return expenses
      .filter(exp => exp.amount > 100) // High value threshold
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [expenses]);

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1>Financial Reports</h1>
          <p>Deep dive into your financial health.</p>
        </div>

        <div className="header-actions">
          <select>
            <option>Last 6 Months</option>
            <option>Last 3 Months</option>
            <option>Last Year</option>
          </select>
          <button className="export-btn">Export</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card hover-effect">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#22c55e"/>
            </svg>
          </div>
          <span className={`kpi-badge ${kpiData.incomeChange >= 0 ? 'green' : 'red'}`}>
            {kpiData.incomeChange >= 0 ? '+' : ''}{kpiData.incomeChange.toFixed(1)}%
          </span>
          <h4>Total Income</h4>
          <h2>${kpiData.totalIncome.toLocaleString()}</h2>
        </div>

        <div className="kpi-card hover-effect">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" fill="#ef4444"/>
            </svg>
          </div>
          <span className={`kpi-badge ${kpiData.expenseChange <= 0 ? 'green' : 'red'}`}>
            {kpiData.expenseChange >= 0 ? '+' : ''}{kpiData.expenseChange.toFixed(1)}%
          </span>
          <h4>Total Expenses</h4>
          <h2>${kpiData.totalExpenses.toLocaleString()}</h2>
        </div>

        <div className="kpi-card hover-effect">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM12 4V5H12V4ZM8 7V19H16V7H8Z" fill="#16a34a"/>
            </svg>
          </div>
          <h4>Net Savings</h4>
          <h2>${kpiData.netSavings.toLocaleString()}</h2>
        </div>

        <div className="kpi-card hover-effect">
          <div className="kpi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z" fill="#7c3aed"/>
            </svg>
          </div>
          <span className="kpi-badge purple">Target: 20%</span>
          <h4>Savings Rate</h4>
          <h2>{kpiData.savingsRate.toFixed(1)}%</h2>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid">

        {/* Area Chart */}
        <div className="chart-card large">
          <h3>Income vs Expense</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />

              <Area
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                fill="url(#expense)"
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                fill="url(#income)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <h3>Expense Breakdown</h3>

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
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
            </PieChart>
          </ResponsiveContainer>

          <div className="expense-list">
            {expenseData.map((item) => (
              <div key={item.name} className="expense-item">
                <span>
                  <i style={{ background: item.color }} />
                  {item.name}
                </span>
                <strong>${item.value.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="table-card">
        <div className="table-header">
          <h3>Recent High Value Transactions</h3>
          <span>View All</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {recentTransactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.category}</td>
                <td><span className="tag">{transaction.category}</span></td>
                <td>{format(parseISO(transaction.date), 'MMM dd, yyyy')}</td>
                <td className={transaction.type === 'expense' ? 'negative' : 'positive'}>
                  {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
