import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Home,
  Apple,
  Dumbbell,
  History,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/foods', icon: Apple, label: 'Alimentos' },
  { to: '/exercises', icon: Dumbbell, label: 'Exercícios' },
  { to: '/history', icon: History, label: 'Histórico' },
  { to: '/reports', icon: BarChart3, label: 'Relatórios' },
];

export function Layout() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/foods') return 'Alimentos';
    if (path === '/exercises') return 'Exercícios';
    if (path === '/history') return 'Histórico';
    if (path === '/reports') return 'Relatórios';
    if (path === '/settings') return 'Configurações';
    return 'NutriTracker Pro';
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700">
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-secondary-900 dark:text-white">NutriTracker</h1>
              <p className="text-xs text-secondary-500">Pro</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </NavLink>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-all duration-200"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-secondary-900 dark:text-white">NutriTracker</h1>
                <p className="text-xs text-secondary-500">Pro</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg">
              <X className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Olá,</p>
          <p className="font-semibold text-secondary-900 dark:text-white">{profile?.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 space-y-1">
          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </NavLink>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-all duration-200"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg">
              <Menu className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </button>
            <h1 className="font-semibold text-secondary-900 dark:text-white">{getPageTitle()}</h1>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              ) : (
                <Moon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-secondary-800 border-t border-secondary-200 dark:border-secondary-700 safe-area-inset-bottom">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-primary-500'
                      : 'text-secondary-500 dark:text-secondary-400'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
