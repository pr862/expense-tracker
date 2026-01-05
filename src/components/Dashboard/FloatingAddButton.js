import React, { useState } from 'react';
import '../../styles/FloatingAddButton.css';

const FloatingAddButton = ({ onAddExpense, onAddIncome, onScanQR, onScanBill }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="floating-add-button">
      <div className={`fab-menu ${isOpen ? 'open' : ''}`}>
        <button className="fab-item expense" onClick={onAddExpense}>
          <span className="fab-icon">💸</span>
          <span className="fab-label">Expense</span>
        </button>
        <button className="fab-item income" onClick={onAddIncome}>
          <span className="fab-icon">💰</span>
          <span className="fab-label">Income</span>
        </button>
        <button className="fab-item scan" onClick={onScanQR}>
          <span className="fab-icon">📱</span>
          <span className="fab-label">Scan QR</span>
        </button>
        <button className="fab-item bill" onClick={onScanBill}>
          <span className="fab-icon">📄</span>
          <span className="fab-label">Scan Bill</span>
        </button>
      </div>
      <button className="fab-main" onClick={toggleMenu}>
        <span className="fab-icon">{isOpen ? '✕' : '+'}</span>
      </button>
    </div>
  );
};

export default FloatingAddButton;
