import { useState, useEffect } from 'react';
import { User, Building2, DollarSign, Bell, Shield, Palette } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { CategoryPaymentManager } from './CategoryPaymentManager';

export function SettingsView() {
  const { user, refreshUser } = useAuth();
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || 'USD');
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setPreferredCurrency(user.preferredCurrency || 'USD');
      setName(user.name || '');
    }
  }, [user]);

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await api.updateUserPreferences({ preferredCurrency, name });
      await refreshUser();
      alert('Preferences saved successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // Get currency symbol based on user's preferred currency
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'SGD': 'S$',
    };
    return symbols[currency] || '$';
  };

  const currencySymbol = getCurrencySymbol(user?.preferredCurrency || 'USD');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-2 bg-gray-100 p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Profile Settings</h3>
                <p className="text-sm text-gray-500">Update your personal information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                  JD
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="Eastern Time (ET)" />
              </div>

              <Separator />

              <div>
                <Label htmlFor="preferredCurrency">Preferred Currency</Label>
                <Select
                  value={preferredCurrency}
                  onValueChange={setPreferredCurrency}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen (¥)</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar (C$)</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar (A$)</SelectItem>
                    <SelectItem value="CHF">CHF - Swiss Franc (CHF)</SelectItem>
                    <SelectItem value="CNY">CNY - Chinese Yuan (¥)</SelectItem>
                    <SelectItem value="SGD">SGD - Singapore Dollar (S$)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  All expenses will be displayed in this currency by default
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSavePreferences}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Workspace Settings */}
        <TabsContent value="workspace" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Workspace Management</h3>
                <p className="text-sm text-gray-500">Manage your workspaces and teams</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="workspaceName">Workspace Name</Label>
                <Input id="workspaceName" defaultValue="Personal Workspace" />
              </div>

              <div>
                <Label htmlFor="workspaceType">Workspace Type</Label>
                <Input id="workspaceType" defaultValue="Individual" />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Team Members</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm">
                        JD
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">John Doe (You)</p>
                        <p className="text-xs text-gray-500">john@example.com</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Owner</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">+ Invite Team Member</Button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Budget Settings */}
        <TabsContent value="budget" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Budget Limits</h3>
                <p className="text-sm text-gray-500">Set monthly budget limits for different categories</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="totalBudget">Total Monthly Budget ({currencySymbol})</Label>
                <Input id="totalBudget" type="number" defaultValue="10000" />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Category Budgets</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="softwareBudget">Software ({currencySymbol})</Label>
                    <Input id="softwareBudget" type="number" defaultValue="3000" />
                  </div>
                  <div>
                    <Label htmlFor="officeBudget">Office ({currencySymbol})</Label>
                    <Input id="officeBudget" type="number" defaultValue="2000" />
                  </div>
                  <div>
                    <Label htmlFor="travelBudget">Travel ({currencySymbol})</Label>
                    <Input id="travelBudget" type="number" defaultValue="1500" />
                  </div>
                  <div>
                    <Label htmlFor="marketingBudget">Marketing ({currencySymbol})</Label>
                    <Input id="marketingBudget" type="number" defaultValue="2000" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Budget Alerts</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">Email alerts at 80% budget</p>
                    <p className="text-xs text-gray-500">Receive notification when nearing limit</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">Warning at 100% budget</p>
                    <p className="text-xs text-gray-500">Get notified when budget is exceeded</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Expenses Settings */}
        <TabsContent value="expenses" className="space-y-6">
          <CategoryPaymentManager />
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
                <p className="text-sm text-gray-500">Manage how you receive notifications</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Task Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900">Task due date reminders</p>
                      <p className="text-xs text-gray-500">Get notified 1 day before due date</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900">Overdue task alerts</p>
                      <p className="text-xs text-gray-500">Daily reminders for overdue tasks</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900">Task completion</p>
                      <p className="text-xs text-gray-500">Celebrate when tasks are completed</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Expense Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900">Large expense alerts</p>
                      <p className="text-xs text-gray-500">Notify for expenses over $500</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900">Monthly expense summary</p>
                      <p className="text-xs text-gray-500">Email report at end of month</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">Weekly productivity summary</p>
                    <p className="text-xs text-gray-500">Receive every Monday morning</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-500">Manage your account security</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enable 2FA</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Active Sessions</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">MacBook Pro - Chrome</p>
                      <p className="text-xs text-gray-500">New York, USA • Current session</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Active</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Appearance</h3>
                <p className="text-sm text-gray-500">Customize the look and feel</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Theme</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-4 border-2 border-blue-600 rounded-lg bg-white hover:shadow-md transition-shadow">
                    <div className="w-full h-20 bg-white border border-gray-200 rounded mb-2" />
                    <p className="text-sm font-medium text-gray-900">Light</p>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                    <div className="w-full h-20 bg-gray-900 rounded mb-2" />
                    <p className="text-sm font-medium text-gray-900">Dark</p>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                    <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 rounded mb-2" />
                    <p className="text-sm font-medium text-gray-900">Auto</p>
                  </button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Display Options</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">Compact mode</p>
                    <p className="text-xs text-gray-500">Reduce spacing between elements</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">Show animations</p>
                    <p className="text-xs text-gray-500">Enable smooth transitions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

