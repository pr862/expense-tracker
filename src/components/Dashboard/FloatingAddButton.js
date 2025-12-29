import React, { useState } from 'react';
import '../../styles/FloatingAddButton.css';

const FloatingAddButton = ({ onAddIncome, onAddExpense }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="floating-add-container">
      {isExpanded && (
        <div className="floating-menu">
          <button 
            className="floating-menu-item income"
            onClick={() => {
              onAddIncome();
              setIsExpanded(false);
            }}
          >
            <span className="menu-icon">💰</span>
            <span className="menu-label">Add Income</span>
          </button>
          <button 
            className="floating-menu-item expense"
            onClick={() => {
              onAddExpense();
              setIsExpanded(false);
            }}
          >
            <span className="menu-icon">💳</span>
            <span className="menu-label">Add Expense</span>
          </button>
        </div>
      )}
      
      <button 
        className={`floating-add-btn ${isExpanded ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="Add new transaction"
      >
        <span className="btn-icon">{isExpanded ? '✕' : '+'}</span>
      </button>
    </div>
  );
};

export default FloatingAddButton;
