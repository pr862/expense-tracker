import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import financeHeroImage from './assets/finance-hero.svg';
import Dashboard from './components/Dashboard/Dashboard';
import { LogoIcon } from './components/Dashboard/Icons';

// Authentication state management
const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is logged in (in real app, this would check tokens/session)
    return localStorage.getItem('expense-tracker-auth') === 'true';
  });

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('expense-tracker-auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('expense-tracker-auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Authentication context
const AuthContext = React.createContext();

// Authentication hook
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected route component (commented out as not currently used)
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated } = useAuth();
//   return isAuthenticated ? children : <Navigate to="/" replace />;
// };

// Landing page component
const LandingPage = ({ onLogin, onSignUp, isAuthenticated }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Professional hero image component
  const HeroImage = () => (
    <div className="hero-image-container">
      <img 
        src={financeHeroImage} 
        alt="Professional Expense Tracking Dashboard" 
        className="hero-image"
        onError={(e) => {
          e.target.style.display = 'none';
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'flex';
          }
        }}
      />
      <div className="hero-image-fallback">
        <div style={{ textAlign: 'center', color: '#5F6368' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>Expense Tracker</div>
          <div style={{ fontSize: '0.9rem' }}>Smart Financial Management</div>
        </div>
      </div>
    </div>
  );

  // Feature card component
  const FeatureCard = ({ icon, title, description }) => (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <div className="feature-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <span className="logo-icon"><LogoIcon size={28} color="#10b981" /></span>
            <span className="logo-text">ExpenseTracker</span>
          </div>
          
          <div className="navbar-menu">
            <a href="#home" className="nav-link active">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>
          
          <div className="navbar-actions">
            <button className="btn btn-secondary btn-md" onClick={onLogin}>Login</button>
            <button className="btn btn-primary btn-md" onClick={onSignUp}>Sign Up</button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-content">
            <div className="mobile-nav-links">
              <a href="#home" className="mobile-nav-link" onClick={closeMobileMenu}>Home</a>
              <a href="#features" className="mobile-nav-link" onClick={closeMobileMenu}>Features</a>
              <a href="#pricing" className="mobile-nav-link" onClick={closeMobileMenu}>Pricing</a>
              <a href="#contact" className="mobile-nav-link" onClick={closeMobileMenu}>Contact</a>
            </div>
            
            <div className="mobile-nav-actions">
              <button className="btn btn-secondary btn-md" onClick={() => { onLogin(); closeMobileMenu(); }}>Login</button>
              <button className="btn btn-primary btn-md" onClick={() => { onSignUp(); closeMobileMenu(); }}>Sign Up</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-headline">
              Take Control of Your{' '}
              <span className="hero-headline-colored">Money</span>
            </h1>
            <div className="hero-subtext">
              <div className="hero-subtitle-ticks">
                <div className="tick-item">
                  <span className="tick-mark">✓</span>
                  <span className="tick-text">Track expenses and manage income efficiently</span>
                </div>
                <div className="tick-item">
                  <span className="tick-mark">✓</span>
                  <span className="tick-text">Create intelligent budgets with category control</span>
                </div>
                <div className="tick-item">
                  <span className="tick-mark">✓</span>
                  <span className="tick-text">Analyze spending using real-time reports</span>
                </div>
                <div className="tick-item">
                  <span className="tick-mark">✓</span>
                  <span className="tick-text">Maintain all financial data in one secure platform</span>
                </div>
              </div>
            </div>
            
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={onSignUp}>Get Started</button>
              <button className="btn btn-outline btn-lg">Watch Demo</button>
            </div>
          </div>
          
          <div className="hero-visual">
            <HeroImage />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="features-container">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">Everything you need to manage your finances effectively</p>
          
          <div className="features-grid">
            <FeatureCard
              icon="🧠"
              title="AI-Powered Expense Tracking"
              description="Advanced machine learning algorithms automatically categorize and analyze your spending patterns for optimal financial insights."
            />
            <FeatureCard
              icon="🎯"
              title="Intelligent Budget Management"
              description="Set dynamic budgets with predictive recommendations and real-time monitoring to keep your spending on track."
            />
            <FeatureCard
              icon="🌍"
              title="Multi-Currency Management"
              description="Handle international transactions seamlessly with real-time exchange rates for 150+ global currencies."
            />
            <FeatureCard
              icon="📊"
              title="Advanced Analytics Suite"
              description="Comprehensive financial reporting with customizable dashboards and predictive analytics for strategic planning."
            />
            <FeatureCard
              icon="📱"
              title="Native Mobile Applications"
              description="Full-featured iOS and Android apps with offline capabilities and biometric security for secure access anywhere."
            />
            <FeatureCard
              icon="🔒"
              title="Enterprise-Grade Security"
              description="Bank-level 256-bit encryption with SOC 2 compliance, ensuring your financial data meets the highest security standards."
            />
            <FeatureCard
              icon="🔄"
              title="Automated Financial Workflows"
              description="Streamline recurring payments, subscriptions, and bill tracking with intelligent automation and smart reminders."
            />
            <FeatureCard
              icon="📈"
              title="Predictive Financial Insights"
              description="Leverage AI-driven forecasting to anticipate future spending trends and identify cost-saving opportunities."
            />
            <FeatureCard
              icon="🤝"
              title="Secure Team Collaboration"
              description="Share expenses with role-based permissions, approval workflows, and comprehensive audit trails for team management."
            />
            <FeatureCard
              icon="⚡"
              title="Real-Time Synchronization"
              description="Instant data synchronization across all devices with offline support and conflict resolution for seamless access."
            />
            <FeatureCard
              icon="🔔"
              title="Smart Alert System"
              description="Intelligent notifications for unusual spending patterns, budget thresholds, and important financial milestones."
            />
            <FeatureCard
              icon="🏆"
              title="Intelligent Categorization"
              description="AI-powered expense categorization with customizable rules and smart suggestions for accurate financial organization."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Start Tracking Your Expenses Today!</h2>
          <p className="cta-subtitle">Join thousands of users who have taken control of their finances</p>
          <button className="btn btn-primary btn-lg" onClick={onSignUp}>Sign Up for Free</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="navbar-logo">
                <span className="logo-icon"><LogoIcon size={28} color="#3B82F6" /></span>
                <span className="logo-text">ExpenseTracker</span>
              </div>
              <p>Take control of your financial future with smart expense tracking.</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Quick Links</h4>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
                <a href="/faq">FAQ</a>
              </div>
              
              <div className="footer-column">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">📘</a>
                  <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer">🐦</a>
                  <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">📷</a>
                  <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer">💼</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 ExpenseTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Main App component with routing
const AppContent = () => {
  const { login, isAuthenticated } = useAuth();

  const handleLogin = () => {
    login();
  };

  const handleSignUp = () => {
    login(); // For demo purposes, sign up also logs in the user
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <LandingPage 
            onLogin={handleLogin} 
            onSignUp={handleSignUp}
            isAuthenticated={isAuthenticated}
          />
        } />
        <Route path="/dashboard/*" element={
          isAuthenticated ? (
            <Dashboard />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
