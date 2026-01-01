import React from 'react';
import '../../styles/SummaryCards.css';

const SummaryCards = ({ expenses, budgets }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate current month totals (like reports section)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1).toISOString().slice(0, 7);

  const totalIncome = expenses
    .filter(exp => exp.type === 'income' && exp.date.startsWith(currentMonth))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalExpenses = expenses
    .filter(exp => exp.type === 'expense' && exp.date.startsWith(currentMonth))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalBalance = totalIncome - totalExpenses;
  const savings = totalIncome - totalExpenses; // Assuming savings as balance

  // Calculate trends (simplified, assuming last month comparison)
  const lastMonthIncome = expenses
    .filter(exp => exp.type === 'income' && exp.date.startsWith(lastMonth))
    .reduce((sum, exp) => sum + exp.amount, 0);
  const incomeChange = totalIncome - lastMonthIncome;

  const lastMonthExpenses = expenses
    .filter(exp => exp.type === 'expense' && exp.date.startsWith(lastMonth))
    .reduce((sum, exp) => sum + exp.amount, 0);
  const expenseChange = totalExpenses - lastMonthExpenses;

  const lastMonthBalance = lastMonthIncome - lastMonthExpenses;
  const balanceChange = totalBalance - lastMonthBalance;

  const getPercentageChange = (change, previous) => {
    if (previous === 0) {
      if (change > 0) return "+New";
      return "N/A";
    }
    let percentage = (change / previous) * 100;
    if (Math.abs(percentage) > 1000) {
      return percentage > 0 ? ">1000%" : "<-1000%";
    }
    return (percentage >= 0 ? '+' : '') + percentage.toFixed(1) + '%';
  };

  const formatChange = (change) => {
    return (change >= 0 ? '+' : '') + formatCurrency(change);
  };

  // Calculate savings goal based on budgets (Income - Total Budget = Savings Goal)
  const totalBudget = (budgets || []).reduce((sum, b) => sum + Number(b.limit), 0);
  const savingsGoal = totalBudget > 0 ? Math.max(0, totalIncome - totalBudget) : totalIncome;
  const savingsProgress = savingsGoal > 0 ? Math.max(0, Math.min((savings / savingsGoal) * 100, 100)) : 0;

  // Debug log for progress bar issue
  console.log('SummaryCards Debug:', {
    totalIncome,
    totalExpenses,
    savings,
    totalBudget,
    savingsGoal,
    savingsProgress,
    budgets: budgets.map(b => ({ category: b.category, limit: b.limit })),
    expensesLength: expenses.length
  });

  return (
    <div className="summary-grid">
      {/* Total Balance */}
      <div className="summary-card total-balance">
        <p className="card-label">Total Balance</p>
        <h2 className="card-value">{formatCurrency(totalBalance)}</h2>
        <div className="badge">
          {getPercentageChange(balanceChange, lastMonthBalance)} <span>from last month</span>
        </div>
      </div>

      {/* Income */}
      <div className="summary-card">
        <div className="card-header">
          <span className="header-label">Income</span>
          <div className="icon income">↑</div>
        </div>
        <h3 className="amount">{formatCurrency(totalIncome)}</h3>
        <p className="subtext">{formatChange(incomeChange)} vs last month</p>
      </div>

      {/* Expense */}
      <div className="summary-card">
        <div className="card-header">
          <span className="header-label">Expense</span>
          <div className="icon expense">↓</div>
        </div>
        <h3 className="amount">{formatCurrency(totalExpenses)}</h3>
        <p className="subtext">{formatChange(expenseChange)} vs last month</p>
      </div>

      {/* Savings */}
      <div className="summary-card">
        <div className="card-header">
          <span className="header-label savings-label">Savings</span>
          <div className="icon savings">$</div>
        </div>
        <h3 className="amount">{formatCurrency(savings)}</h3>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${savingsProgress}%` }}></div>
        </div>
        <p className="progress-text">{savingsProgress.toFixed(1)}% of goal</p>
      </div>
    </div>
  );
};

export default SummaryCards;
