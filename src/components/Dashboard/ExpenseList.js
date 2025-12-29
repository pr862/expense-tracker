import React, { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import '../../styles/ExpenseList.css';

const ExpenseList = ({ expenses, onDeleteExpense, onEditExpense, showActions = true }) => {
  const [editingExpense, setEditingExpense] = useState(null);
  const [filter, setFilter] = useState('all');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍔',
      'Travel': '✈️',
      'Rent': '🏠',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Shopping': '🛍️',
      'Utilities': '💡',
      'Education': '📚',
      'Investment': '📈',
      'Salary': '💰',
      'Other': '📝'
    };
    return icons[category] || '📝';
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true;
    return expense.type === filter;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  const handleEditSubmit = (updatedData) => {
    onEditExpense(editingExpense.id, updatedData);
    setEditingExpense(null);
  };

  const handleDelete = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      onDeleteExpense(expenseId);
    }
  };

  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <h3>Recent Transactions</h3>
        <div className="expense-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'income' ? 'active' : ''}`}
            onClick={() => setFilter('income')}
          >
            Income
          </button>
          <button
            className={`filter-btn ${filter === 'expense' ? 'active' : ''}`}
            onClick={() => setFilter('expense')}
          >
            Expenses
          </button>
        </div>
      </div>

      {sortedExpenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h4>No transactions yet</h4>
          <p>Start tracking your expenses by adding your first transaction!</p>
        </div>
      ) : (
        <div className="expense-table">
          <div className="table-header">
            <div className="header-cell">Type</div>
            <div className="header-cell">Category</div>
            <div className="header-cell">Amount</div>
            <div className="header-cell">Date</div>
            <div className="header-cell">Note</div>
            {showActions && <div className="header-cell">Actions</div>}
          </div>

          <div className="table-body">
            {sortedExpenses.map((expense) => (
              <div key={expense.id} className={`expense-row ${expense.type}`}>
                <div className="expense-cell">
                  <span className={`type-badge ${expense.type}`}>
                    {expense.type === 'income' ? '💰' : '💳'}
                  </span>
                </div>
                <div className="expense-cell">
                  <div className="category-info">
                    <span className="category-icon">{getCategoryIcon(expense.category)}</span>
                    <span className="category-name">{expense.category}</span>
                  </div>
                </div>
                <div className="expense-cell">
                  <span className={`amount ${expense.type}`}>
                    {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                  </span>
                </div>
                <div className="expense-cell">
                  <span className="date">{formatDate(expense.date)}</span>
                </div>
                <div className="expense-cell">
                  <span className="note">{expense.note || 'No note'}</span>
                </div>
                {showActions && (
                  <div className="expense-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(expense)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(expense.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {editingExpense && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};

export default ExpenseList;
