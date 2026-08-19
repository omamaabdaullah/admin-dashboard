// src/views/Layout/Layout.jsx
import { useState, useEffect } from 'react';
import { ArrowRight, Menu } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== '/dashboard';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/dashboard');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`layout${sidebarOpen ? ' layout--sidebar-open' : ''}`}>
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="فتح القائمة"
      >
        <Menu size={22} />
      </button>

      <div
        className="sidebar-overlay"
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onNavigate={closeSidebar}
      />

      <div className="main-wrapper">
        <main className="main-content">
          {showBackButton && (
            <div className="page-back-wrap">
              <button
                type="button"
                className="page-back-btn"
                onClick={handleBack}
                title="العودة للصفحة السابقة"
                aria-label="العودة للصفحة السابقة"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
          <div className="page-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
