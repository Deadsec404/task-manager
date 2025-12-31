import { useState } from 'react';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';

export function WorkspaceSelector() {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createWorkspace(name, description || undefined);
    setName('');
    setDescription('');
    setShowCreate(false);
  };

  const handleUpdate = async (id: string) => {
    if (!name.trim()) return;
    await updateWorkspace(id, name, description || undefined);
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workspace? All data will be lost.')) {
      await deleteWorkspace(id);
    }
  };

  const startEdit = (workspace: any) => {
    setEditingId(workspace.id);
    setName(workspace.name);
    setDescription(workspace.description || '');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workspaces</h3>
        <Button
          size="sm"
          onClick={() => {
            setShowCreate(true);
            setName('');
            setDescription('');
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <Label>Workspace Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Personal, Business"
              />
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>
                Create
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  setName('');
                  setDescription('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {workspaces.map((workspace) => (
          <Card
            key={workspace.id}
            className={`p-4 cursor-pointer transition-colors ${
              currentWorkspace?.id === workspace.id
                ? 'border-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setCurrentWorkspace(workspace)}
          >
            {editingId === workspace.id ? (
              <div className="space-y-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Workspace name"
                />
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdate(workspace.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setName('');
                      setDescription('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{workspace.name}</div>
                  {workspace.description && (
                    <div className="text-sm text-gray-500">{workspace.description}</div>
                  )}
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(workspace)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(workspace.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

