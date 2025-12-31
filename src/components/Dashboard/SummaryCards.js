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

  const balanceChange = totalBalance - (lastMonthIncome - lastMonthExpenses);

  // Savings goal progress (assuming total budget as savings goal for simplicity)
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const savingsProgress = totalBudget > 0 ? Math.min((savings / totalBudget) * 100, 100) : 0;

  return (
    <div className="summary-grid">
      {/* Total Balance */}
      <div className="summary-card total-balance">
        <p className="card-label">Total Balance</p>
        <h2 className="card-value">{formatCurrency(totalBalance)}</h2>
        <div className="badge">
          {balanceChange >= 0 ? '+' : ''}{(balanceChange / (lastMonthIncome - lastMonthExpenses || 1) * 100).toFixed(1)}% <span>from last month</span>
        </div>
      </div>

      {/* Income */}
      <div className="summary-card">
        <div className="card-header">
          <span className="header-label">Income</span>
          <div className="icon income">↑</div>
        </div>
        <h3 className="amount">{formatCurrency(totalIncome)}</h3>
        <p className="subtext">{incomeChange >= 0 ? '+' : ''}{formatCurrency(incomeChange)} vs last month</p>
      </div>

      {/* Expense */}
      <div className="summary-card">
        <div className="card-header">
          <span className="header-label">Expense</span>
          <div className="icon expense">↓</div>
        </div>
        <h3 className="amount">{formatCurrency(totalExpenses)}</h3>
        <p className="subtext">{expenseChange >= 0 ? '+' : ''}{(expenseChange / (lastMonthExpenses || 1) * 100).toFixed(0)}% vs last month</p>
      </div>

      {/* Savings */}
      <div className="summary-card">
        <div className="card-header">
          <span className="header-label">Savings</span>
          <div className="icon savings">$</div>
        </div>
        <h3 className="amount">{formatCurrency(savings)}</h3>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${savingsProgress}%` }}></div>
        </div>
        <p className="progress-text">{savingsProgress.toFixed(0)}% of goal</p>
      </div>
    </div>
  );
};

export default SummaryCards;
