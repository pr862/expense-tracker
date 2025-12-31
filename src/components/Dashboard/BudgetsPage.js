import React, { useState } from 'react';
import BudgetSection from './BudgetSection';
import '../../styles/BudgetSection.css';

const BudgetsPage = ({ budgets, onAddBudget, onDeleteBudget, onEditBudget }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    limit: '',
    period: 'monthly'
  });

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.limit) return;

    const capitalizedCategory = newBudget.category.charAt(0).toUpperCase() + newBudget.category.slice(1).toLowerCase();
    const budget = {
      category: capitalizedCategory,
      limit: parseFloat(newBudget.limit),
      spent: 0, // Initialize spent to 0 for new budgets
      period: newBudget.period
    };

    onAddBudget(budget);
    setNewBudget({ category: '', limit: '', period: 'monthly' });
    setShowAddForm(false);
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <h1>Budget Management</h1>
        <p>Set and track your spending budgets</p>
      </div>

      <div className="dashboard-section">
        <div className="budget-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? (
              <>
                <span>❌</span> Cancel
              </>
            ) : (
              <>
                <span>➕</span> Add New Budget
              </>
            )}
          </button>
        </div>

        {showAddForm && (
          <div className="card budget-add-form">
            <h3>Add New Budget</h3>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={newBudget.category}
                onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                placeholder="e.g., Food, Travel"
              />
            </div>
            <div className="form-group">
              <label>Limit ($)</label>
              <input
                type="number"
                value={newBudget.limit}
                onChange={(e) => setNewBudget({...newBudget, limit: e.target.value})}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Period</label>
              <select
                value={newBudget.period}
                onChange={(e) => setNewBudget({...newBudget, period: e.target.value})}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddBudget}>
                Add Budget
              </button>
            </div>
          </div>
        )}

        <BudgetSection
          budgets={budgets}
          onDeleteBudget={onDeleteBudget}
          onEditBudget={onEditBudget}
        />
      </div>
    </div>
  );
};

export default BudgetsPage;
