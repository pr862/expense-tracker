import React, { useState } from 'react';
import '../../styles/ExpenseForm.css';
import { expenseCategories, incomeCategories } from './categories';

const ExpenseForm = ({ onClose, onSubmit, expense = null, defaultType = 'expense' }) => {
  const [formData, setFormData] = useState({
    amount: expense?.amount || '',
    category: expense?.category || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    note: expense?.note || '',
    type: expense?.type || defaultType
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [focusedField, setFocusedField] = useState('');



  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

  // Quick action amounts for different types
  const quickAmounts = {
    expense: [25, 50, 100, 200, 500],
    income: [1000, 2000, 3000, 5000, 10000]
  };

  // Real-time validation
  const validateField = (name, value) => {
    switch (name) {
      case 'amount':
        if (!value || parseFloat(value) <= 0) {
          return 'Please enter a valid amount';
        }
        if (parseFloat(value) > 1000000) {
          return 'Amount cannot exceed $1,000,000';
        }
        return '';
      case 'category':
        if (!value) {
          return 'Please select a category';
        }
        return '';
      case 'date':
        if (!value) {
          return 'Please select a date';
        }
        if (new Date(value) > new Date()) {
          return 'Date cannot be in the future';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFocus = (e) => {
    setFocusedField(e.target.name);
  };

  const handleQuickAmount = (amount) => {
    setFormData(prev => ({
      ...prev,
      amount: amount.toString()
    }));
    
    // Clear amount error if exists
    if (errors.amount) {
      setErrors(prev => ({
        ...prev,
        amount: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (['amount', 'category', 'date'].includes(key)) {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(newErrors);
    setTouched({
      amount: true,
      category: true,
      date: true,
      note: true,
      type: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API call delay for professional feel
      setTimeout(() => {
        onSubmit({
          ...formData,
          amount: parseFloat(formData.amount)
        });
        setIsLoading(false);
      }, 800);
    }
  };

  const isFormValid = () => {
    return formData.amount && 
           formData.category && 
           formData.date && 
           !errors.amount && 
           !errors.category && 
           !errors.date;
  };



  return (
    <div className="expense-form-overlay">
      <div className={`expense-form-modal ${formData.type}-form`}>
        <div className="form-header">
          <h2>
            {expense 
              ? `Edit ${formData.type === 'income' ? 'Income' : 'Expense'}` 
              : `Add New ${formData.type === 'income' ? 'Income' : 'Expense'}`}
          </h2>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          {/* Quick Actions */}
          <div className="quick-actions">
            <h4>Quick Amount</h4>
            <div className="quick-amounts">
              {quickAmounts[formData.type].map(amount => (
                <button
                  key={amount}
                  type="button"
                  className="quick-amount-btn"
                  onClick={() => handleQuickAmount(amount)}
                  disabled={isLoading}
                >
                  ${amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder=" "
                step="0.01"
                min="0"
                className={`form-control ${
                  errors.amount ? 'error' : 
                  formData.amount && !errors.amount ? 'success' : ''
                } ${focusedField === 'amount' ? 'focused' : ''}`}
                disabled={isLoading}
              />
              <label htmlFor="amount" className="floating-label">
                Amount ($)
              </label>
              {errors.amount && <span className="error-message">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`form-control ${
                  errors.category ? 'error' : 
                  formData.category && !errors.category ? 'success' : ''
                } ${focusedField === 'category' ? 'focused' : ''}`}
                disabled={isLoading}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
              <label htmlFor="category" className="floating-label">
                Category
              </label>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`form-control ${
                  errors.date ? 'error' : 
                  formData.date && !errors.date ? 'success' : ''
                } ${focusedField === 'date' ? 'focused' : ''}`}
                disabled={isLoading}
              />
              <label htmlFor="date" className="floating-label">
                Date
              </label>
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>
          </div>

          <div className="form-group">
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder=" "
              rows="3"
              className={`form-control ${focusedField === 'note' ? 'focused' : ''}`}
              disabled={isLoading}
            />
            <label htmlFor="note" className="floating-label">
              Note (Optional)
            </label>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? 'Processing...' : 
               expense ? 'Update' : 'Add'} {formData.type === 'expense' ? 'Expense' : 'Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
