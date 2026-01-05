import React, { useMemo } from "react";
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from "date-fns";
import "../../styles/SmartSuggestions.css";

const SmartSuggestions = ({ expenses = [], budgets = [] }) => {
  // Helper function to get expenses for a specific month
  const getMonthlyExpenses = (monthOffset = 0) => {
    if (!expenses || expenses.length === 0) return [];

    const targetDate = subMonths(new Date(), monthOffset);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    return expenses.filter(exp => {
      const expDate = parseISO(exp.date);
      return exp.type === 'expense' && expDate >= start && expDate <= end;
    });
  };

  // Detect recurring expenses (categories with consistent monthly spending)
  const recurringExpenses = useMemo(() => {
    const categoryMonthlyTotals = {};
    const monthsToCheck = 3; // Check last 3 months

    // Collect monthly totals for each category
    for (let i = 0; i < monthsToCheck; i++) {
      const monthExpenses = getMonthlyExpenses(i);
      monthExpenses.forEach(exp => {
        if (!categoryMonthlyTotals[exp.category]) {
          categoryMonthlyTotals[exp.category] = [];
        }
        categoryMonthlyTotals[exp.category].push(exp.amount);
      });
    }

    // Find categories with consistent spending (variation < 30%)
    const recurring = [];
    Object.entries(categoryMonthlyTotals).forEach(([category, amounts]) => {
      if (amounts.length >= 2) {
        const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        const max = Math.max(...amounts);
        const min = Math.min(...amounts);
        const variation = (max - min) / avg;

        if (variation < 0.3 && avg > 50) { // Consistent spending over $50
          recurring.push({
            category,
            averageAmount: avg,
            months: amounts.length,
            nextDue: format(subMonths(new Date(), -1), 'MMMM yyyy')
          });
        }
      }
    });

    return recurring.slice(0, 5); // Top 5 recurring expenses
  }, [expenses]);

  // Predict future bills based on historical averages
  const futurePredictions = useMemo(() => {
    const predictions = [];
    const monthsToAnalyze = 6; // Use last 6 months for prediction

    // Get category averages
    const categoryAverages = {};
    for (let i = 0; i < monthsToAnalyze; i++) {
      const monthExpenses = getMonthlyExpenses(i);
      monthExpenses.forEach(exp => {
        if (!categoryAverages[exp.category]) {
          categoryAverages[exp.category] = [];
        }
        categoryAverages[exp.category].push(exp.amount);
      });
    }

    // Calculate predictions for next month
    Object.entries(categoryAverages).forEach(([category, amounts]) => {
      if (amounts.length >= 2) {
        const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        const recentAvg = amounts.slice(0, 2).reduce((sum, amt) => sum + amt, 0) / 2; // Last 2 months

        // Predict next month's bill (weighted average)
        const prediction = (recentAvg * 0.7) + (avg * 0.3);

        if (prediction > 20) { // Only predict bills over $20
          predictions.push({
            category,
            predictedAmount: prediction,
            confidence: amounts.length >= 4 ? 'High' : amounts.length >= 2 ? 'Medium' : 'Low',
            basedOnMonths: amounts.length
          });
        }
      }
    });

    return predictions.sort((a, b) => b.predictedAmount - a.predictedAmount).slice(0, 6);
  }, [expenses]);

  // Suggest budget adjustments
  const budgetSuggestions = useMemo(() => {
    const suggestions = [];

    budgets.forEach(budget => {
      const currentMonthExpenses = getMonthlyExpenses(0);
      const categoryExpenses = currentMonthExpenses.filter(exp => exp.category === budget.category);
      const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const remaining = budget.limit - spent;
      const spentPercentage = (spent / budget.limit) * 100;

      if (spentPercentage > 90) {
        suggestions.push({
          type: 'danger',
          category: budget.category,
          message: `You're ${spentPercentage.toFixed(0)}% through your ${budget.category} budget. Consider reducing spending or increasing your budget limit.`,
          action: 'Reduce spending',
          impact: 'Save $' + (spent - budget.limit * 0.8).toFixed(0)
        });
      } else if (spentPercentage > 75) {
        suggestions.push({
          type: 'warning',
          category: budget.category,
          message: `You've used ${spentPercentage.toFixed(0)}% of your ${budget.category} budget. Monitor your spending closely.`,
          action: 'Monitor closely',
          impact: 'Budget healthy'
        });
      } else if (remaining > budget.limit * 0.5) {
        suggestions.push({
          type: 'success',
          category: budget.category,
          message: `Great job! You have $${remaining.toFixed(0)} remaining in your ${budget.category} budget.`,
          action: 'Keep it up',
          impact: 'On track'
        });
      }
    });

    return suggestions.slice(0, 4);
  }, [expenses, budgets]);

  // Debug: Check if we have data
  const hasData = expenses.length > 0 || budgets.length > 0;
  const hasRecurring = recurringExpenses.length > 0;
  const hasPredictions = futurePredictions.length > 0;
  const hasBudgetSuggestions = budgetSuggestions.length > 0;

  if (!hasData) {
    return (
      <div className="smart-suggestions">
        <div className="suggestions-header">
          <h2>Smart Expense Suggestions</h2>
          <p>AI-powered insights to optimize your spending</p>
        </div>
        <div className="empty-state">
          <p>Start tracking expenses and setting budgets to see personalized suggestions!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-suggestions">
      <div className="suggestions-header">
        <h2>Smart Expense Suggestions</h2>
        <p>AI-powered insights to optimize your spending</p>
      </div>

      <div className="suggestions-grid">
        {/* Recurring Expenses */}
        <div className="suggestion-card">
          <div className="card-header">
            <h3>🔄 Recurring Expenses</h3>
            <span className="card-badge">{recurringExpenses.length}</span>
          </div>
          <div className="card-content">
            {recurringExpenses.length > 0 ? (
              recurringExpenses.map((expense, index) => (
                <div key={index} className="suggestion-item">
                  <div className="item-info">
                    <span className="category">{expense.category}</span>
                    <span className="amount">${expense.averageAmount.toFixed(0)}/month</span>
                  </div>
                  <div className="item-meta">
                    <span className="meta">Based on {expense.months} months</span>
                    <span className="due-date">Next: {expense.nextDue}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No recurring expenses detected yet. Keep tracking to see patterns!</p>
              </div>
            )}
          </div>
        </div>

        {/* Future Predictions */}
        <div className="suggestion-card">
          <div className="card-header">
            <h3>🔮 Future Bill Predictions</h3>
            <span className="card-badge">{futurePredictions.length}</span>
          </div>
          <div className="card-content">
            {futurePredictions.length > 0 ? (
              futurePredictions.map((prediction, index) => (
                <div key={index} className="suggestion-item prediction">
                  <div className="item-info">
                    <span className="category">{prediction.category}</span>
                    <span className="amount">${prediction.predictedAmount.toFixed(0)}</span>
                  </div>
                  <div className="item-meta">
                    <span className="confidence confidence-{prediction.confidence.toLowerCase()}">
                      {prediction.confidence} confidence
                    </span>
                    <span className="meta">Based on {prediction.basedOnMonths} months</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Need more data to predict future bills. Continue tracking expenses!</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Adjustments */}
        <div className="suggestion-card full-width">
          <div className="card-header">
            <h3>📊 Budget Adjustment Suggestions</h3>
            <span className="card-badge">{budgetSuggestions.length}</span>
          </div>
          <div className="card-content">
            {budgetSuggestions.length > 0 ? (
              budgetSuggestions.map((suggestion, index) => (
                <div key={index} className={`suggestion-item budget ${suggestion.type}`}>
                  <div className="item-info">
                    <span className="category">{suggestion.category}</span>
                    <span className="action">{suggestion.action}</span>
                  </div>
                  <div className="item-meta">
                    <span className="message">{suggestion.message}</span>
                    <span className="impact">Impact: {suggestion.impact}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Create budgets to receive personalized adjustment suggestions!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSuggestions;
