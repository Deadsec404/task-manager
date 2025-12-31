import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface Workspace {
  id: string;
  name: string;
  description?: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<void>;
  updateWorkspace: (id: string, name: string, description?: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = async () => {
    try {
      const { workspaces } = await api.getWorkspaces();
      setWorkspaces(workspaces);
      if (workspaces.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(workspaces[0]);
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createWorkspace = async (name: string, description?: string) => {
    const { workspace } = await api.createWorkspace(name, description);
    setWorkspaces([...workspaces, workspace]);
    if (!currentWorkspace) {
      setCurrentWorkspace(workspace);
    }
  };

  const updateWorkspace = async (id: string, name: string, description?: string) => {
    const { workspace } = await api.updateWorkspace(id, name, description);
    setWorkspaces(workspaces.map(w => w.id === id ? workspace : w));
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(workspace);
    }
  };

  const deleteWorkspace = async (id: string) => {
    await api.deleteWorkspace(id);
    setWorkspaces(workspaces.filter(w => w.id !== id));
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(workspaces.find(w => w.id !== id) || null);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        loading,
        refreshWorkspaces,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

