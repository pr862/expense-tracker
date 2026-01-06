import React, { useState } from "react";
import ExpenseForm from "./ExpenseForm";
import { expenseCategories, incomeCategories } from "./categories";
import "../../styles/ExpenseList.css";
import { 
  EmptyListIcon, IncomeActionIcon, TransactionIcon, 
  NoteIcon, getCategoryIcon 
} from "./Icons";

const ExpenseList = ({
  expenses,
  onDeleteExpense,
  onEditExpense,
  showActions = true
}) => {
  const [editingExpense, setEditingExpense] = useState(null);
  const [filter, setFilter] = useState("all");

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

  const getCategory = (category) => {
    const all = [...expenseCategories, ...incomeCategories];
    return all.find((c) => c.value === category);
  };

  const filtered = expenses.filter((e) =>
    filter === "all" ? true : e.type === filter
  );

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <h3>Recent Transactions</h3>

        <div className="expense-filters">
          {["all", "income", "expense"].map((type) => (
            <button
              key={type}
              className={`filter-btn ${filter === type ? "active" : ""}`}
              onClick={() => setFilter(type)}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><EmptyListIcon size={48} /></div>
          <h4>No transactions yet</h4>
          <p>Add your first income or expense</p>
        </div>
      ) : (
        <div className="expense-table">
          {/* HEADER */}
          <div className="table-header">
            <div>Type</div>
            <div>Category</div>
            <div>Amount</div>
            <div>Date</div>
            <div>Note</div>
            {showActions && <div>Actions</div>}
          </div>

          {/* BODY */}
          <div className="table-body">
            {sorted.map((expense) => {
              const category = getCategory(expense.category);

              return (
                <div
                  key={expense.id}
                  className={`expense-row ${expense.type}`}
                >
                  <div className="expense-cell">
                    <span className={`type-badge ${expense.type}`}>
                      {expense.type === "income" ? <IncomeActionIcon size={18} /> : <TransactionIcon size={18} />}
                    </span>
                  </div>

                  <div className="expense-cell category-info">
                    <span className="category-icon">
                      {category?.icon || <NoteIcon size={18} />}
                    </span>
                    <span className="category-name">
                      {category?.label || expense.category}
                    </span>
                  </div>

                  <div className="expense-cell">
                    <span className={`amount ${expense.type}`}>
                      {expense.type === "income" ? "+" : "-"}
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>

                  <div className="expense-cell date">
                    {formatDate(expense.date)}
                  </div>

                  <div className="expense-cell note">
                    {expense.note || "No note"}
                  </div>

                  {showActions && (
                    <div className="expense-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => setEditingExpense(expense)}
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() =>
                            window.confirm("Delete this transaction?") &&
                            onDeleteExpense(expense.id)
                          }
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editingExpense && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmit={(data) => {
            onEditExpense(editingExpense.id, data);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
};

export default ExpenseList;
