import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const STORAGE_KEY_CATEGORIES = 'expense_categories';
const STORAGE_KEY_PAYMENT_METHODS = 'expense_payment_methods';
const STORAGE_KEY_SUBCATEGORIES = 'expense_subcategories';

const DEFAULT_CATEGORIES = ['Software', 'Office', 'Travel', 'Marketing', 'Food', 'Other'];
const DEFAULT_PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'PayPal'];
const DEFAULT_SUBCATEGORIES: Record<string, string[]> = {
  Software: ['Subscriptions', 'Licenses', 'Tools', 'Cloud Services', 'Development Tools'],
  Office: ['Equipment', 'Supplies', 'Furniture', 'Rent', 'Maintenance'],
  Travel: ['Transport', 'Accommodation', 'Meals', 'Fuel', 'Parking'],
  Marketing: ['Advertising', 'Content', 'Social Media', 'SEO', 'Email Marketing'],
  Food: ['Meals', 'Groceries', 'Coffee', 'Restaurants', 'Snacks'],
  Other: ['Miscellaneous', 'Gifts', 'Donations', 'Fees'],
};

export function CategoryPaymentManager() {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(DEFAULT_PAYMENT_METHODS);
  const [subcategories, setSubcategories] = useState<Record<string, string[]>>(DEFAULT_SUBCATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      const savedPaymentMethods = localStorage.getItem(STORAGE_KEY_PAYMENT_METHODS);
      const savedSubcategories = localStorage.getItem(STORAGE_KEY_SUBCATEGORIES);

      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }

      if (savedPaymentMethods) {
        const parsed = JSON.parse(savedPaymentMethods);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPaymentMethods(parsed);
        } else {
          setPaymentMethods(DEFAULT_PAYMENT_METHODS);
        }
      } else {
        setPaymentMethods(DEFAULT_PAYMENT_METHODS);
      }

      if (savedSubcategories) {
        const parsed = JSON.parse(savedSubcategories);
        if (parsed && typeof parsed === 'object') {
          setSubcategories(parsed);
        } else {
          setSubcategories(DEFAULT_SUBCATEGORIES);
        }
      } else {
        setSubcategories(DEFAULT_SUBCATEGORIES);
      }
    } catch (error) {
      console.error('Error loading categories/payment methods:', error);
      // Fallback to defaults if there's an error
      setCategories(DEFAULT_CATEGORIES);
      setPaymentMethods(DEFAULT_PAYMENT_METHODS);
      setSubcategories(DEFAULT_SUBCATEGORIES);
    }
  }, []);

  // Save to localStorage whenever changes occur
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAYMENT_METHODS, JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SUBCATEGORIES, JSON.stringify(subcategories));
  }, [subcategories]);

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updated = [...categories, newCategory.trim()];
      setCategories(updated);
      setSubcategories({ ...subcategories, [newCategory.trim()]: [] });
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    if (categories.length > 1) {
      const updated = categories.filter(c => c !== category);
      setCategories(updated);
      const updatedSubcategories = { ...subcategories };
      delete updatedSubcategories[category];
      setSubcategories(updatedSubcategories);
    } else {
      alert('You must have at least one category');
    }
  };

  const addPaymentMethod = () => {
    if (newPaymentMethod.trim() && !paymentMethods.includes(newPaymentMethod.trim())) {
      setPaymentMethods([...paymentMethods, newPaymentMethod.trim()]);
      setNewPaymentMethod('');
    }
  };

  const removePaymentMethod = (method: string) => {
    if (paymentMethods.length > 1) {
      setPaymentMethods(paymentMethods.filter(m => m !== method));
    } else {
      alert('You must have at least one payment method');
    }
  };

  const addSubcategory = () => {
    if (selectedCategory && newSubcategory.trim()) {
      const currentSubs = subcategories[selectedCategory] || [];
      if (!currentSubs.includes(newSubcategory.trim())) {
        setSubcategories({
          ...subcategories,
          [selectedCategory]: [...currentSubs, newSubcategory.trim()],
        });
        setNewSubcategory('');
      }
    }
  };

  const removeSubcategory = (category: string, subcategory: string) => {
    const currentSubs = subcategories[category] || [];
    if (currentSubs.length > 1) {
      setSubcategories({
        ...subcategories,
        [category]: currentSubs.filter(s => s !== subcategory),
      });
    } else {
      alert('You must have at least one subcategory per category');
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all categories and payment methods to defaults? This will remove all custom entries.')) {
      setCategories(DEFAULT_CATEGORIES);
      setPaymentMethods(DEFAULT_PAYMENT_METHODS);
      setSubcategories(DEFAULT_SUBCATEGORIES);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Manage Categories & Payment Methods</h3>
          <p className="text-sm text-gray-500 mt-1">Customize expense categories and payment methods</p>
        </div>
        <Button variant="outline" size="sm" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Categories</h4>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category"
                className="w-32"
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              />
              <Button size="sm" onClick={addCategory}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No categories. Click "Reset to Defaults" to add default categories.</p>
            ) : (
              categories.map((category) => (
                <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{category}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCategory(category)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Payment Methods</h4>
            <div className="flex gap-2">
              <Input
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value)}
                placeholder="New method"
                className="w-32"
                onKeyPress={(e) => e.key === 'Enter' && addPaymentMethod()}
              />
              <Button size="sm" onClick={addPaymentMethod}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No payment methods. Click "Reset to Defaults" to add default payment methods.</p>
            ) : (
              paymentMethods.map((method) => (
                <div key={method} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{method}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePaymentMethod(method)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Subcategories */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Subcategories</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Select Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Add Subcategory</Label>
            <div className="flex gap-2">
              <Input
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                placeholder="New subcategory"
                onKeyPress={(e) => e.key === 'Enter' && addSubcategory()}
              />
              <Button onClick={addSubcategory} disabled={!selectedCategory}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        {selectedCategory && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Subcategories for {selectedCategory}:</p>
            <div className="flex flex-wrap gap-2">
              {(subcategories[selectedCategory] || []).map((sub) => (
                <div key={sub} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                  <span className="text-sm text-gray-700">{sub}</span>
                  <button
                    onClick={() => removeSubcategory(selectedCategory, sub)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {(!subcategories[selectedCategory] || subcategories[selectedCategory].length === 0) && (
                <p className="text-sm text-gray-500">No subcategories yet</p>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// Export functions to get categories and payment methods
export function getStoredCategories(): string[] {
  const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
  return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
}

export function getStoredPaymentMethods(): string[] {
  const saved = localStorage.getItem(STORAGE_KEY_PAYMENT_METHODS);
  return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_METHODS;
}

export function getStoredSubcategories(): Record<string, string[]> {
  const saved = localStorage.getItem(STORAGE_KEY_SUBCATEGORIES);
  return saved ? JSON.parse(saved) : DEFAULT_SUBCATEGORIES;
}

