import React, { useMemo } from 'react';
import { Pie, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import '../../styles/Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = ({ expenses, budgets }) => {
  const categoryData = useMemo(() => {
    const expensesByCategory = expenses
      .filter(expense => expense.type === 'expense')
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});

    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);

    return {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4',
            '#f97316',
            '#84cc16',
            '#ec4899',
            '#6366f1',
            '#14b8a6'
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const monthlyExpenses = expenses
      .filter(expense => expense.type === 'expense')
      .reduce((acc, expense) => {
        const month = new Date(expense.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
      }, {});

    const monthlyIncome = expenses
      .filter(expense => expense.type === 'income')
      .reduce((acc, expense) => {
        const month = new Date(expense.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
      }, {});

    const allMonths = [...new Set([...Object.keys(monthlyExpenses), ...Object.keys(monthlyIncome)])];
    allMonths.sort((a, b) => new Date(a) - new Date(b));

    return {
      labels: allMonths,
      datasets: [
        {
          label: 'Expenses',
          data: allMonths.map(month => monthlyExpenses[month] || 0),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Income',
          data: allMonths.map(month => monthlyIncome[month] || 0),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }, [expenses]);

  const budgetComparisonData = useMemo(() => {
    if (!budgets || budgets.length === 0) return null;

    return {
      labels: budgets.map(budget => budget.category),
      datasets: [
        {
          label: 'Spent',
          data: budgets.map(budget => budget.spent),
          backgroundColor: '#3b82f6',
        },
        {
          label: 'Budget',
          data: budgets.map(budget => budget.limit),
          backgroundColor: '#e2e8f0',
        },
      ],
    };
  }, [budgets]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(context.parsed);
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(context.parsed);
            const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="analytics-container">
      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Expense by Category</h3>
            <p>Breakdown of your spending</p>
          </div>
          <div className="chart-container">
            {categoryData.labels.length > 0 ? (
              <Pie data={categoryData} options={pieOptions} />
            ) : (
              <div className="chart-empty">
                <div className="empty-icon">📊</div>
                <p>No expense data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Trends</h3>
            <p>Income vs Expenses over time</p>
          </div>
          <div className="chart-container">
            {monthlyData.labels.length > 0 ? (
              <Line data={monthlyData} options={chartOptions} />
            ) : (
              <div className="chart-empty">
                <div className="empty-icon">📈</div>
                <p>No trend data available</p>
              </div>
            )}
          </div>
        </div>

        {budgetComparisonData && (
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3>Budget vs Actual Spending</h3>
              <p>Compare your spending against your budgets</p>
            </div>
            <div className="chart-container">
              <Bar data={budgetComparisonData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
