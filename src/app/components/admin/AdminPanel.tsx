import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Plus, Trash2, Edit2, Users, Shield, DollarSign } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  preferredCurrency: string;
  createdAt: string;
  _count?: {
    workspaces: number;
  };
}

export function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'USER',
    preferredCurrency: 'USD',
  });

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      loadUsers();
      loadStats();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const { users } = await api.getAdminUsers();
      setUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await api.getAdminStats();
      setStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminUser(newUser);
      setNewUser({ email: '', password: '', name: '', role: 'USER', preferredCurrency: 'USD' });
      setShowAddUser(false);
      loadUsers();
      loadStats();
    } catch (error: any) {
      alert(error.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      await api.updateAdminUser(userId, updates);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      alert(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? All their data will be lost.')) {
      return;
    }
    try {
      await api.deleteAdminUser(userId);
      loadUsers();
      loadStats();
    } catch (error: any) {
      alert(error.message || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      SUPER_ADMIN: { label: 'Super Admin', className: 'bg-red-100 text-red-700' },
      ADMIN: { label: 'Admin', className: 'bg-blue-100 text-blue-700' },
      USER: { label: 'User', className: 'bg-gray-100 text-gray-700' },
    };
    const variant = variants[role] || variants.USER;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need Super Admin access to view this page.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Manage users and system settings</p>
        </div>
        <Button onClick={() => setShowAddUser(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Workspaces</p>
                <p className="text-2xl font-bold">{stats.totalWorkspaces}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold">{stats.totalExpenses}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add User Dialog */}
      {showAddUser && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New User</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">Preferred Currency</Label>
                <Select
                  value={newUser.preferredCurrency}
                  onValueChange={(value) => setNewUser({ ...newUser, preferredCurrency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                    <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                    <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create User</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Users Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">All Users</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Workspaces</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell className="font-medium">{userItem.email}</TableCell>
                    <TableCell>{userItem.name || '-'}</TableCell>
                    <TableCell>{getRoleBadge(userItem.role)}</TableCell>
                    <TableCell>{userItem.preferredCurrency}</TableCell>
                    <TableCell>{userItem._count?.workspaces || 0}</TableCell>
                    <TableCell>{new Date(userItem.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingUser(userItem)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {userItem.id !== user?.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUser(userItem.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Edit User</h2>
          <EditUserForm
            user={editingUser}
            onSave={(updates) => {
              handleUpdateUser(editingUser.id, updates);
            }}
            onCancel={() => setEditingUser(null)}
          />
        </Card>
      )}
    </div>
  );
}

function EditUserForm({ user, onSave, onCancel }: { user: User; onSave: (updates: any) => void; onCancel: () => void }) {
  const [updates, setUpdates] = useState({
    name: user.name || '',
    role: user.role,
    preferredCurrency: user.preferredCurrency,
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: any = {
      name: updates.name,
      role: updates.role,
      preferredCurrency: updates.preferredCurrency,
    };
    if (updates.password) {
      updateData.password = updates.password;
    }
    onSave(updateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Name</Label>
          <Input
            value={updates.name}
            onChange={(e) => setUpdates({ ...updates, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Role</Label>
          <Select
            value={updates.role}
            onValueChange={(value) => setUpdates({ ...updates, role: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Preferred Currency</Label>
          <Select
            value={updates.preferredCurrency}
            onValueChange={(value) => setUpdates({ ...updates, preferredCurrency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="INR">INR - Indian Rupee</SelectItem>
              <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
              <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
              <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>New Password (leave empty to keep current)</Label>
          <Input
            type="password"
            value={updates.password}
            onChange={(e) => setUpdates({ ...updates, password: e.target.value })}
            placeholder="Enter new password"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save Changes</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

