// src/views/Layout/Sidebar.jsx
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UtensilsCrossed, Tag,
  BarChart2, UserCog, Bell, ClipboardList, LogOut,
  ChefHat, UserCircle, FileText, X,
} from 'lucide-react';
import { useAuth } from '../../controllers/useAuth';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/dashboard',     label: 'لوحة التحكم',        Icon: LayoutDashboard, adminOnly: false },
  { to: '/users',         label: 'المستخدمون',          Icon: Users,           adminOnly: false },
  { to: '/recipes',       label: 'الوصفات',             Icon: UtensilsCrossed, adminOnly: false },
  { to: '/posts',         label: 'منشورات المستخدمين', Icon: FileText,        adminOnly: false },
  { to: '/categories',    label: 'التصنيفات',           Icon: Tag,             adminOnly: false },
  { to: '/analytics',     label: 'الإحصائيات',          Icon: BarChart2,       adminOnly: false },
  { to: '/employees',     label: 'الموظفون',            Icon: UserCog,         adminOnly: true  },
  { to: '/notifications', label: 'الإشعارات',           Icon: Bell,            adminOnly: false },
  { to: '/audit-log',     label: 'سجل العمليات',        Icon: ClipboardList,   adminOnly: true  },
  { to: '/profile',       label: 'الملف الشخصي',        Icon: UserCircle,      adminOnly: false },
];

const Sidebar = ({ isOpen, onClose, onNavigate }) => {
  const { handleLogout } = useAuth();
  const role = localStorage.getItem('role');

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('user') || '{}')
  );

  useEffect(() => {
    const onStorage = () =>
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    window.addEventListener('storage', onStorage);
    const interval = setInterval(onStorage, 1000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  const initials = user?.name?.charAt(0)?.toUpperCase() || 'A';

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
      <button
        type="button"
        className="sidebar-close-btn"
        onClick={onClose}
        aria-label="إغلاق القائمة"
      >
        <X size={20} />
      </button>

      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <ChefHat size={32} />
        </div>
        <span className="sidebar-logo-name">وصفات</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.filter(item => !item.adminOnly || role === 'admin').map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon className="nav-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-avatar">
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" className="sidebar-avatar-img" />
            : initials
          }
        </div>
        <div className="sidebar-footer-info">
          <span className="sidebar-footer-name">
            {user?.name || 'مدير النظام'}
          </span>
          <button className="sidebar-footer-logout" onClick={handleLogout}>
            <LogOut size={12} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
