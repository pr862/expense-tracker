import React from 'react';
import '../../styles/SummaryCards.css';

const SummaryCards = ({ expenses }) => {
  // Calculate totals
  const totalIncome = expenses
    .filter(expense => expense.type === 'income')
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalExpenses = expenses
    .filter(expense => expense.type === 'expense')
    .reduce((sum, expense) => sum + expense.amount, 0);

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: '💰',
      color: 'success',
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: '💳',
      color: 'danger',
      trend: '+5.2%',
      trendUp: true
    },
    {
      title: 'Current Balance',
      value: formatCurrency(balance),
      icon: '📊',
      color: balance >= 0 ? 'success' : 'danger',
      trend: balance >= 0 ? '+8.1%' : '-15.3%',
      trendUp: balance >= 0
    }
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, index) => (
        <div key={index} className={`summary-card ${card.color}`}>
          <div className="card-header">
            <div className="card-icon">
              <span>{card.icon}</span>
            </div>
            <div className={`trend ${card.trendUp ? 'up' : 'down'}`}>
              <span>{card.trend}</span>
            </div>
          </div>
          
          <div className="card-content">
            <h3 className="card-title">{card.title}</h3>
            <div className="card-value">{card.value}</div>
          </div>
          
          <div className="card-footer">
            <div className="card-indicator"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
