import { LayoutDashboard, CheckSquare, DollarSign, BarChart3, Settings, Menu, X, User, Target, FolderKanban, Shield } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { cn } from '../ui/utils';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onWorkspaceClick: () => void;
}

export function Sidebar({ currentPage, onNavigate, isCollapsed, onToggleCollapse, onWorkspaceClick }: SidebarProps) {
  const { user } = useAuth();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'habits', label: 'Daily Habits', icon: Target },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(user?.role === 'SUPER_ADMIN' ? [{ id: 'admin', label: 'Admin Panel', icon: Shield }] : []),
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300",
          isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "w-64 lg:w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg" />
                <span className="font-semibold text-gray-900">TaskFlow</span>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5 lg:hidden" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      onToggleCollapse();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full p-3 rounded-lg transition-all",
                    isActive 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Workspace Section */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={onWorkspaceClick}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FolderKanban className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Workspaces</span>
              </button>
            </div>
          )}

          {/* User Section */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

