import React, { useState } from 'react';

const BudgetSection = ({ budgets, onDeleteBudget, onEditBudget }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({
    category: '',
    limit: '',
    period: 'monthly'
  });

  const expenseCategories = [
    'Food', 'Travel', 'Rent', 'Entertainment', 'Healthcare',
    'Shopping', 'Utilities', 'Education', 'Other'
  ];

  const handleEdit = (index) => {
    const budget = budgets[index];
    setEditForm({
      category: budget.category,
      limit: budget.limit.toString(),
      period: budget.period
    });
    setEditingIndex(index);
  };

  const handleSaveEdit = () => {
    if (!editForm.category || !editForm.limit) return;

    const capitalizedCategory = editForm.category.charAt(0).toUpperCase() + editForm.category.slice(1).toLowerCase();
    const updatedBudget = {
      ...budgets[editingIndex],
      category: capitalizedCategory,
      limit: parseFloat(editForm.limit),
      period: editForm.period
    };

    onEditBudget(editingIndex, updatedBudget);
    setEditingIndex(null);
    setEditForm({ category: '', limit: '', period: 'monthly' });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm({ category: '', limit: '', period: 'monthly' });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return '#ef4444'; // red
    if (percentage >= 75) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

  const getProgressWidth = (percentage) => {
    return Math.min(percentage, 100);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍽️',
      'Travel': '✈️',
      'Rent': '🏠',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Shopping': '🛍️',
      'Utilities': '💡',
      'Education': '📚',
      'Other': '💰'
    };
    return icons[category] || '💰';
  };

  return (
    <div className="budget-section">
      <h3>Your Budgets</h3>

      {budgets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <p>No budgets set yet. Create your first budget to start tracking your spending!</p>
        </div>
      ) : (
        <div className="budgets-list">
          {budgets.map((budget, index) => {
            const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
            const progressColor = getProgressColor(percentage);
            const progressWidth = getProgressWidth(percentage);

            return (
              <div key={index} className="budget-item card">
                {editingIndex === index ? (
                  <div className="budget-edit-form">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      >
                        <option value="">Select a category</option>
                        {expenseCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Limit ($)</label>
                      <input
                        type="number"
                        value={editForm.limit}
                        onChange={(e) => setEditForm({...editForm, limit: e.target.value})}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Period</label>
                      <select
                        value={editForm.period}
                        onChange={(e) => setEditForm({...editForm, period: e.target.value})}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div className="form-actions">
                      <button className="btn btn-secondary" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                      <button className="btn btn-primary" onClick={handleSaveEdit}>
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="budget-header">
                      <div className="budget-category">
                        <span className="category-icon">{getCategoryIcon(budget.category)}</span>
                        <h4>{budget.category}</h4>
                      </div>
                      <div className="budget-actions">
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleEdit(index)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => onDeleteBudget(index)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="budget-details">
                      <div className="budget-amounts">
                        <span className="spent">${budget.spent.toFixed(2)}</span>
                        <span className="separator">/</span>
                        <span className="limit">${budget.limit.toFixed(2)}</span>
                        <span className="period">({budget.period})</span>
                      </div>

                      <div className="budget-progress">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${progressWidth}%`,
                            background: `linear-gradient(90deg, ${progressColor} 0%, ${progressColor} ${progressWidth}%, #e5e7eb ${progressWidth}%)`
                          }}
                        ></div>
                      </div>

                      <div className="budget-percentage">
                        {percentage.toFixed(1)}% used
                        {percentage >= 90 && <span className="warning-icon">⚠️</span>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetSection;
