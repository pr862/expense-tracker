import React, { useState } from "react";
import "./TopCategories.css";

const TopCategories = ({ categories }) => {
  const [showAll, setShowAll] = useState(false);

  const displayedCategories = showAll ? categories : categories.slice(0, 5);

  return (
    <div className="top-categories-card">
      <h3 className="card-title">Top Categories</h3>

      {displayedCategories.map((cat, index) => {
        const percent = Math.min((cat.spent / cat.total) * 100, 100);

        return (
          <div className="category-item" key={index}>
            <div className="category-header">
              <span>{cat.name}</span>
              <span
                className={`category-amount ${
                  cat.spent > cat.total ? "danger" : ""
                }`}
              >
                ${cat.spent} / ${cat.total}
              </span>
            </div>

            <div className="progress-bar">
              <div
                className={`progress-fill ${cat.color}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}

      <button className="view-budget-btn" onClick={() => setShowAll(!showAll)}>
        {showAll ? "Show Top 5" : "View Full Budget"}
      </button>
    </div>
  );
};

export default TopCategories;
