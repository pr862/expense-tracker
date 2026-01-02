import React, { useState } from 'react';
import '../../styles/BudgetPage.css';
import { expenseCategories } from './categories';

const BudgetPage = ({ budgets, onAddBudget, onEditBudget, onDeleteBudget }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly'
  });
  const [error, setError] = useState('');

  const totalAllocated = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);

  const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated * 100).toFixed(1) : 0;
  const remainingRate = totalAllocated > 0 ? ((totalAllocated - totalSpent) / totalAllocated * 100).toFixed(1) : 0;

  const getCategoryIcon = (categoryValue) => {
    const cat = expenseCategories.find(c => c.value === categoryValue);
    return cat ? cat.icon : '📦';
  };

  const getCategoryLabel = (categoryValue) => {
    const cat = expenseCategories.find(c => c.value === categoryValue);
    return cat ? cat.label : categoryValue;
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingBudget(null);
    setFormData({ category: '', limit: '', period: 'monthly' });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.category || !formData.limit || parseFloat(formData.limit) <= 0) {
      setError('Please select a category and enter a valid limit greater than 0.');
      return;
    }

    const budgetData = {
      ...formData,
      limit: parseFloat(formData.limit),
      id: editingBudget ? editingBudget.id : Date.now().toString()
    };

    if (editingBudget) {
      onEditBudget(budgets.findIndex(b => b.id === editingBudget.id), budgetData);
      setEditingBudget(null);
    } else {
      onAddBudget(budgetData);
    }

    setFormData({ category: '', limit: '', period: 'monthly' });
    setShowForm(false);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit,
      period: budget.period
    });
    setShowForm(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      onDeleteBudget(index);
    }
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <h1>Budget Management</h1>
        <p>Set and track your spending limits</p>
        <button 
          className="add-btn" 
          onClick={() => setShowForm(true)}
          aria-label="Add new budget"
        >+ Add Budget</button>
      </div>

      {/* KPI Summary Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <h4>Total Allocated</h4>
          <h2>${totalAllocated.toLocaleString()}</h2>
          <span className="kpi-badge green">Full Allocation</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">📉</div>
          <h4>Total Spent</h4>
          <h2>${totalSpent.toLocaleString()}</h2>
          <span className={`kpi-badge ${totalSpent > totalAllocated ? 'red' : 'green'}`}>{utilizationRate}% Utilized</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">💳</div>
          <h4>Total Remaining</h4>
          <h2>${(totalAllocated - totalSpent).toLocaleString()}</h2>
          <span className="kpi-badge blue">{remainingRate}% Available</span>
        </div>
      </div>

      <div className="budget-section">
        <h3>Your Budgets</h3>
        <div className="budget-list">
          {budgets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <p>No budgets set yet. Click "Add Budget" above to start tracking your spending!</p>
            </div>
          ) : (
            budgets.map((budget, index) => (
              <div key={budget.id} className="budget-card">
                <div className="budget-header">
                  <div className="budget-icon">
                    {getCategoryIcon(budget.category)}
                  </div>
                  <h4>{getCategoryLabel(budget.category)}</h4>
                  <p>Period: {budget.period}</p>
                </div>
                <div className="budget-body">
                  <div className="budget-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        data-percent={Math.min((budget.spent / budget.limit) * 100, 100).toFixed(0)}
                        style={{
                          width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%`,
                          backgroundColor: budget.spent > budget.limit ? '#ef4444' : '#10b981'
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      ${budget.spent?.toFixed(2) || 0} / ${budget.limit}
                    </span>
                    {(() => {
                      const remaining = budget.limit - (budget.spent || 0);
                      return (
                        <span className={`remaining-text ${remaining < 0 ? 'negative' : ''}`}>
                          Remaining: ${remaining.toFixed(2)}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="budget-footer">
                  <div className="budget-actions">
                    <button 
                      onClick={() => handleEdit(budget)} 
                      title="Edit Budget"
                      aria-label={`Edit ${getCategoryLabel(budget.category)} budget`}
                    >✏️</button>
                    <button 
                      onClick={() => handleDelete(index)} 
                      title="Delete Budget"
                      aria-label={`Delete ${getCategoryLabel(budget.category)} budget`}
                    >🗑️</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button 
              className="modal-close" 
              onClick={handleClose}
              aria-label="Close modal"
            >×</button>
            <h2>{editingBudget ? 'Edit Budget' : 'Add New Budget'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Select a category</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Limit ($)</label>
                <input
                  type="number"
                  value={formData.limit}
                  onChange={(e) => setFormData({...formData, limit: e.target.value})}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({...formData, period: e.target.value})}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions">
                <button type="submit">{editingBudget ? 'Update' : 'Add'} Budget</button>
                <button type="button" onClick={handleClose}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
