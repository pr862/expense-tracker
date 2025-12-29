import React from 'react';
import '../../styles/BudgetSection.css';

const BudgetSection = ({ budgets = [] }) => {
  // Ensure budgets is always an array
  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍔',
      'Travel': '✈️',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Shopping': '🛍️',
      'Utilities': '💡',
      'Education': '📚',
      'Other': '📝'
    };
    return icons[category] || '📝';
  };

  const getProgressColor = (percentage) => {
    if (percentage <= 50) return '#10b981';
    if (percentage <= 80) return '#f59e0b';
    return '#ef4444';
  };

  const getProgressBgColor = (percentage) => {
    if (percentage <= 50) return '#ecfdf5';
    if (percentage <= 80) return '#fffbeb';
    return '#fef2f2';
  };

  if (safeBudgets.length === 0) {
    return (
      <div className="budget-section">
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h4>No budgets set</h4>
          <p>Create budgets to track your spending goals and stay on target!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-section">
      <div className="budget-grid">
        {safeBudgets.map((budget, index) => {
          // Ensure budget properties are valid numbers
          const limit = typeof budget.limit === 'number' && !isNaN(budget.limit) ? budget.limit : 0;
          const spent = typeof budget.spent === 'number' && !isNaN(budget.spent) ? budget.spent : 0;
          const category = budget.category || 'Other';
          const period = budget.period || 'monthly';
          
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          const remaining = limit - spent;
          const isOverBudget = spent > limit;
          
          return (
            <div key={index} className={`budget-card ${isOverBudget ? 'over-budget' : ''}`}>
              <div className="budget-header">
                <div className="budget-category">
                  <span className="category-icon">{getCategoryIcon(category)}</span>
                  <span className="category-name">{category}</span>
                </div>
                <div className={`budget-status ${isOverBudget ? 'over' : 'within'}`}>
                  {isOverBudget ? 'Over Budget' : `${Math.round(percentage)}% Used`}
                </div>
              </div>
              
              <div className="budget-details">
                <div className="budget-amounts">
                  <div className="amount-item">
                    <span className="amount-label">Spent</span>
                    <span className="amount-value spent">{formatCurrency(spent)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Budget</span>
                    <span className="amount-value">{formatCurrency(limit)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">{isOverBudget ? 'Over by' : 'Remaining'}</span>
                    <span className={`amount-value ${isOverBudget ? 'over' : 'remaining'}`}>
                      {formatCurrency(Math.abs(remaining))}
                    </span>
                  </div>
                </div>
                
                <div className="progress-container">
                  <div 
                    className="progress-bar"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: getProgressColor(percentage),
                      boxShadow: `0 2px 4px ${getProgressColor(percentage)}20`
                    }}
                  ></div>
                </div>
                
                <div className="budget-footer">
                  <span className="period">{period}</span>
                  <span className="updated">Updated today</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetSection;
