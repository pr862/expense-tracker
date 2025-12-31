import "./TopCategories.css";

const TopCategories = ({ categories }) => {
  return (
    <div className="top-categories-card">
      <h3 className="card-title">Top Categories</h3>

      {categories.map((cat, index) => {
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

      <button className="view-budget-btn">View Full Budget</button>
    </div>
  );
};

export default TopCategories;
