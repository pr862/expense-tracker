 import React, { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts"
import "../styles/BudgetSection.css"

const Budget = ({ expenses = [] }) => {
  const [categories, setCategories] = useState(() => JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: "Housing", spent: 1200, limit: 1300, color: "#6366f1" },
    { id: 2, name: "Food", spent: 800, limit: 600, color: "#ef4444" },
    { id: 3, name: "Transport", spent: 400, limit: 500, color: "#f59e0b" },
    { id: 4, name: "Entertainment", spent: 300, limit: 400, color: "#22c55e" },
    { id: 5, name: "Utilities", spent: 250, limit: 300, color: "#8b5cf6" }
  ])
  const [editMode, setEditMode] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', limit: '' })

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories))
  }, [categories])

  // Calculate spent from expenses if provided, else use static
  const getSpent = (catName) => {
    if (expenses.length > 0) {
      return expenses.filter(e => e.category === catName).reduce((sum, e) => sum + parseFloat(e.amount), 0)
    }
    return categories.find(c => c.name === catName)?.spent || 0
  }

  const updatedCategories = categories.map(cat => ({ ...cat, spent: getSpent(cat.name) }))

  const totalBudget = updatedCategories.reduce((a, c) => a + c.limit, 0)
  const totalSpent = updatedCategories.reduce((a, c) => a + c.spent, 0)
  const remaining = totalBudget - totalSpent
  const isOverBudget = totalSpent > totalBudget

  const barData = updatedCategories.map(c => ({
    name: c.name,
    spent: c.spent
  }))

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.limit) {
      const colors = ['#6366f1', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899', '#06b6d4']
      const newId = Math.max(...categories.map(c => c.id)) + 1
      const newCat = {
        id: newId,
        name: newCategory.name,
        spent: 0,
        limit: parseFloat(newCategory.limit),
        color: colors[newId % colors.length]
      }
      setCategories([...categories, newCat])
      setNewCategory({ name: '', limit: '' })
    }
  }

  const handleLimitChange = (id, newLimit) => {
    setCategories(categories.map(cat => cat.id === id ? { ...cat, limit: parseFloat(newLimit) } : cat))
  }

  return (
    <div className="budget-page">

      {/* Over Budget Warning */}
      {isOverBudget && (
        <div className="warning-banner">
          <span>⚠️ You've exceeded your total budget!</span>
        </div>
      )}

      {/* Header */}
      <div className="budget-header">
        <div>
          <h2>Budgeting</h2>
          <p>Track your spending against your monthly goals.</p>
        </div>
        <button className="primary-btn" onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Save Changes' : 'Adjust Budgets'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCard title="Total Budget" value={`$${totalBudget}`} />
        <SummaryCard title="Total Spent" value={`$${totalSpent}`} />
        <SummaryCard title="Remaining" value={`$${remaining}`} success={remaining >= 0} />
      </div>

      {/* Main Content */}
      <div className="budget-grid">

        {/* Chart */}
        <div className="card">
          <h3>Budget vs Actual</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="spent" fill="#8884d8" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3>Category Breakdown</h3>

          {updatedCategories.map(cat => {
            const percent = Math.round((cat.spent / cat.limit) * 100)
            const isOver = cat.spent > cat.limit
            return (
              <div key={cat.id} className="category-row">
                <div className="category-head">
                  <span>{cat.name}</span>
                  {editMode ? (
                    <input
                      type="number"
                      value={cat.limit}
                      onChange={(e) => handleLimitChange(cat.id, e.target.value)}
                      className="limit-input"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <span className={isOver ? 'over-budget' : ''}>{percent}%</span>
                  )}
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${isOver ? 'over-budget' : ''}`}
                    style={{ width: `${Math.min(percent, 100)}%`, background: cat.color }}
                  />
                </div>
              </div>
            )
          })}

          {editMode && (
            <div className="add-category-form">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Limit"
                value={newCategory.limit}
                onChange={(e) => setNewCategory({ ...newCategory, limit: e.target.value })}
                min="0"
                step="0.01"
              />
              <button onClick={handleAddCategory}>Add</button>
            </div>
          )}

          <button className="outline-btn" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Cancel' : '+ Add Category'}
          </button>
        </div>

      </div>
    </div>
  )
}

const SummaryCard = ({ title, value, success }) => (
  <div className={`summary-card ${success ? "success" : ""}`}>
    <p>{title}</p>
    <h3>{value}</h3>
  </div>
)

export default Budget
