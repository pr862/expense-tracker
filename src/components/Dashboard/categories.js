import React from 'react';
import { 
  FoodIcon, TransportIcon, EntertainmentIcon, ShoppingIcon,
  UtilitiesIcon, HealthcareIcon, EducationIcon, OtherIcon,
  SalaryIcon, InvestmentIcon, BusinessIcon, FreelanceIcon,
  RentalIcon, OtherIncomeIcon
} from './Icons';

export const expenseCategories = [
  { value: 'food', label: 'Food & Dining', icon: <FoodIcon size={20} /> },
  { value: 'transport', label: 'Transportation', icon: <TransportIcon size={20} /> },
  { value: 'entertainment', label: 'Entertainment', icon: <EntertainmentIcon size={20} /> },
  { value: 'shopping', label: 'Shopping', icon: <ShoppingIcon size={20} /> },
  { value: 'utilities', label: 'Utilities', icon: <UtilitiesIcon size={20} /> },
  { value: 'healthcare', label: 'Healthcare', icon: <HealthcareIcon size={20} /> },
  { value: 'education', label: 'Education', icon: <EducationIcon size={20} /> },
  { value: 'other', label: 'Other', icon: <OtherIcon size={20} /> }
];

export const incomeCategories = [
  { value: 'salary', label: 'Salary', icon: <SalaryIcon size={20} /> },
  { value: 'investment', label: 'Investment', icon: <InvestmentIcon size={20} /> },
  { value: 'business', label: 'Business', icon: <BusinessIcon size={20} /> },
  { value: 'freelance', label: 'Freelance', icon: <FreelanceIcon size={20} /> },
  { value: 'rental', label: 'Rental', icon: <RentalIcon size={20} /> },
  { value: 'other', label: 'Other', icon: <OtherIncomeIcon size={20} /> }
];
