import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { useAuth } from '../../../contexts/AuthContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { getStoredCategories, getStoredPaymentMethods, getStoredSubcategories } from '../settings/CategoryPaymentManager';

interface Expense {
  amount: number;
  currency: string;
  category: string;
  subcategory: string;
  description: string;
  workspaceId: string;
  paymentMethod: string;
  date: string;
}

interface AddExpenseDialogProps {
  onClose: () => void;
  onAdd: (expense: Expense) => Promise<void>;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

export function AddExpenseDialog({ onClose, onAdd }: AddExpenseDialogProps) {
  const { user } = useAuth();
  const { workspaces, currentWorkspace } = useWorkspace();
  const preferredCurrency = user?.preferredCurrency || 'USD';
  
  // Get stored categories and payment methods
  const categories = getStoredCategories();
  const paymentMethods = getStoredPaymentMethods();
  const categorySubcategories = getStoredSubcategories();
  
  const [formData, setFormData] = useState<Expense>({
    amount: 0,
    currency: preferredCurrency,
    category: categories[0] || 'Software',
    subcategory: categorySubcategories[categories[0] || 'Software']?.[0] || '',
    description: '',
    workspaceId: currentWorkspace?.id || workspaces[0]?.id || '',
    paymentMethod: paymentMethods[0] || 'Credit Card',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount > 0 && formData.description) {
      setLoading(true);
      try {
        await onAdd(formData);
      } catch (error) {
        console.error('Failed to add expense:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCategoryChange = (category: string) => {
    console.log('Category changed to:', category); // Debug log
    const newSubcategory = categorySubcategories[category]?.[0] || '';
    setFormData(prev => ({
      ...prev,
      category,
      subcategory: newSubcategory,
    }));
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={(e) => {
          // Only close if clicking directly on overlay, not on dropdowns or dialog content
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      />

      {/* Dialog */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-xl z-[60] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
          <h2 className="font-semibold text-gray-900">Add New Expense</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
                className="text-lg"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                modal={false}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter expense description"
              rows={3}
              required
            />
          </div>

          {/* Workspace & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Workspace</Label>
              <Select
                value={formData.workspaceId}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, workspaceId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {workspaces.map(workspace => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => 
                  setFormData({ ...formData, paymentMethod: value })
                }
                modal={false}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subcategory</Label>
              <Select
                value={formData.subcategory}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, subcategory: value }))
                }
                disabled={!categorySubcategories[formData.category] || categorySubcategories[formData.category].length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categorySubcategories[formData.category]?.length ? "Select subcategory" : "No subcategories"} />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {categorySubcategories[formData.category]?.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

