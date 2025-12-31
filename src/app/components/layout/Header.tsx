import { Bell, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface HeaderProps {
  onToggleSidebar: () => void;
  onWorkspaceClick: () => void;
  onNavigate?: (page: string) => void;
}

export function Header({ onToggleSidebar, onWorkspaceClick, onNavigate }: HeaderProps) {
  const { user, logout } = useAuth();
  const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspace();

  const handleWorkspaceChange = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Workspace Switcher */}
          {currentWorkspace && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-teal-500 rounded" />
                  <span className="text-sm font-medium text-gray-900 hidden sm:inline">
                    {currentWorkspace.name}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onSelect={(e) => {
                      e.preventDefault();
                      handleWorkspaceChange(workspace.id);
                    }}
                    className={currentWorkspace.id === workspace.id ? 'bg-blue-50' : ''}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-teal-500 rounded" />
                      {workspace.name}
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem 
                  className="text-blue-600"
                  onSelect={(e) => {
                    e.preventDefault();
                    onWorkspaceClick();
                  }}
                >
                  + Manage Workspaces
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getUserInitials()}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled className="opacity-100">
                <div>
                  <p className="font-medium text-gray-900">{user?.name || user?.email}</p>
                  <p className="text-xs text-gray-500">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'User'}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  if (onNavigate) {
                    onNavigate('profile');
                  }
                }}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onSelect={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

