import React, { useState } from 'react';
import '../../styles/FloatingAddButton.css';
import { ExpenseActionIcon, IncomeActionIcon, ScanQRIcon, CloseIcon, PlusIcon } from './Icons';

const FloatingAddButton = ({ onAddExpense, onAddIncome, onScanQR }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Helper to handle clicks (perform action then close menu)
  const handleAction = (action) => {
    action();
    closeMenu();
  };

  return (
    <>
      {/* 1. Backdrop overlay to focus attention and allow clicking outside to close */}
      <div 
        className={`fab-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={closeMenu}
      />

      <div className={`floating-add-button ${isOpen ? 'open' : ''}`}>
        <div className="fab-menu">
          
          {/* Item 1: Expense */}
          <div className="fab-item-wrapper" style={{ '--i': 2 }}> {/* --i used for staggered animation delay */}
            <span className="fab-label">Add Expense</span>
            <button 
              className="fab-item expense" 
              onClick={() => handleAction(onAddExpense)}
              aria-label="Add Expense"
            >
              <ExpenseActionIcon size={20} />
            </button>
          </div>

          {/* Item 2: Income */}
          <div className="fab-item-wrapper" style={{ '--i': 1 }}>
            <span className="fab-label">Add Income</span>
            <button 
              className="fab-item income" 
              onClick={() => handleAction(onAddIncome)}
              aria-label="Add Income"
            >
              <IncomeActionIcon size={20} />
            </button>
          </div>

          {/* Item 3: Scan */}
          {/* <div className="fab-item-wrapper" style={{ '--i': 0 }}>
            <span className="fab-label">Scan QR</span>
            <button 
              className="fab-item scan" 
              onClick={() => handleAction(onScanQR)}
              aria-label="Scan QR"
            >
              <ScanQRIcon size={20} />
            </button>
          </div> */}

        </div>

        {/* Main Button */}
        <button 
          className="fab-main" 
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label="Toggle Action Menu"
        >
          <div className={`icon-container ${isOpen ? 'rotate' : ''}`}>
             <PlusIcon size={24} />
          </div>
        </button>
        {/* <button className="fab-item bill" onClick={onScanBill}>
          <span className="fab-icon"><BillIcon size={20} /></span>
          <span className="fab-label">Scan Bill</span>
        </button> */}
      </div>
    </>
  );
};

export default FloatingAddButton;

