import React from 'react';
import '../../styles/TypeSelection.css';
import { TransactionIcon, IncomeActionIcon } from './Icons';

const TypeSelection = ({ onSelectExpense, onSelectIncome, onClose }) => {
  return (
    <div className="type-selection-overlay">
      <div className="type-selection-modal">
        <div className="type-selection-header">
          <h2>Add Transaction</h2>
          <p>Choose the type of transaction you want to add</p>
        </div>

        <div className="type-selection-options">
          <div className="type-selection-option" onClick={onSelectExpense}>
            <span className="type-selection-option-icon"><TransactionIcon size={28} /></span>
            <h3 className="type-selection-option-label">Add Expense</h3>
          </div>
          <div className="type-selection-option" onClick={onSelectIncome}>
            <span className="type-selection-option-icon"><IncomeActionIcon size={28} /></span>
            <h3 className="type-selection-option-label">Add Income</h3>
          </div>
        </div>

        <div className="type-selection-actions">
          <button className="type-selection-btn secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypeSelection;
