import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { AuthView } from './components/auth/AuthView';
import { WorkspaceSelector } from './components/workspace/WorkspaceSelector';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardWidgets } from './components/dashboard/DashboardWidgets';
import { TaskList } from './components/tasks/TaskList';
import { ExpenseList } from './components/expenses/ExpenseList';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { ProfileView } from './components/profile/ProfileView';
import { DailyHabitsView } from './components/habits/DailyHabitsView';
import { AdminPanel } from './components/admin/AdminPanel';

export default function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (authLoading || workspaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Select or Create a Workspace</h1>
          <WorkspaceSelector />
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardWidgets />;
      case 'tasks':
        return <TaskList />;
      case 'habits':
        return <DailyHabitsView />;
      case 'expenses':
        return <ExpenseList />;
      case 'reports':
        return <ReportsView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <DashboardWidgets />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onWorkspaceClick={() => setShowWorkspaceSelector(true)}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onWorkspaceClick={() => setShowWorkspaceSelector(true)}
          onNavigate={setCurrentPage}
        />
        
        <main className="p-4 lg:p-6">
          {showWorkspaceSelector ? (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Workspaces</h2>
                <button
                  onClick={() => setShowWorkspaceSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <WorkspaceSelector />
            </div>
          ) : (
            renderPage()
          )}
        </main>
      </div>
    </div>
  );
}

