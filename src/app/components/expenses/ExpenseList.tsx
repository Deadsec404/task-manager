import { useState, useEffect } from 'react';
import { Plus, Filter, Download, DollarSign, Calendar, Tag, CreditCard, MoreVertical } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { AddExpenseDialog } from './AddExpenseDialog';
import { useAuth } from '../../../contexts/AuthContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { api } from '../../../lib/api';

interface Expense {
  id: number;
  amount: number;
  currency?: string;
  category: string;
  subcategory: string;
  description: string;
  workspaceId: string;
  workspaceName: string;
  paymentMethod: string;
  date: string;
}

const initialExpenses: Expense[] = [
  {
    id: 1,
    amount: 1250.00,
    currency: 'USD',
    category: 'Software',
    subcategory: 'Subscriptions',
    description: 'Adobe Creative Cloud - Annual subscription',
    type: 'business',
    paymentMethod: 'Credit Card',
    date: '2024-12-28',
  },
  {
    id: 2,
    amount: 450.00,
    currency: 'USD',
    category: 'Office',
    subcategory: 'Equipment',
    description: 'Ergonomic keyboard and mouse',
    type: 'business',
    paymentMethod: 'Debit Card',
    date: '2024-12-27',
  },
  {
    id: 3,
    amount: 85.50,
    currency: 'USD',
    category: 'Travel',
    subcategory: 'Transport',
    description: 'Client meeting - Uber rides',
    type: 'business',
    paymentMethod: 'Credit Card',
    date: '2024-12-26',
  },
  {
    id: 4,
    amount: 120.00,
    currency: 'USD',
    category: 'Food',
    subcategory: 'Meals',
    description: 'Business lunch with client',
    type: 'business',
    paymentMethod: 'Cash',
    date: '2024-12-25',
  },
  {
    id: 5,
    amount: 300.00,
    currency: 'USD',
    category: 'Marketing',
    subcategory: 'Advertising',
    description: 'Google Ads - Monthly budget',
    type: 'business',
    paymentMethod: 'Credit Card',
    date: '2024-12-24',
  },
  {
    id: 6,
    amount: 65.00,
    currency: 'USD',
    category: 'Entertainment',
    subcategory: 'Streaming',
    description: 'Netflix and Spotify subscriptions',
    type: 'personal',
    paymentMethod: 'Credit Card',
    date: '2024-12-23',
  },
];

interface ExpenseWithWorkspace extends Expense {
  workspaceId: string;
  workspaceName: string;
}

export function ExpenseList() {
  const { user } = useAuth();
  const { workspaces, currentWorkspace } = useWorkspace();
  const [expenses, setExpenses] = useState<ExpenseWithWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWorkspace, setFilterWorkspace] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Get user's preferred currency (default to USD)
  const preferredCurrency = user?.preferredCurrency || 'USD';

  // Fetch expenses from all workspaces
  useEffect(() => {
    if (workspaces.length > 0) {
      fetchAllExpenses();
    }
  }, [workspaces]);

  const fetchAllExpenses = async () => {
    if (workspaces.length === 0) return;
    
    try {
      setLoading(true);
      const allExpenses: ExpenseWithWorkspace[] = [];
      
      // Fetch expenses from each workspace
      for (const workspace of workspaces) {
        try {
          const response = await api.getExpenses(workspace.id);
          
          // Map API response to component format with workspace info
          const mappedExpenses: ExpenseWithWorkspace[] = response.expenses.map((exp: any) => ({
            id: exp.id,
            amount: exp.amount,
            currency: exp.currency || 'USD',
            category: exp.category === 'PERSONAL' ? 'Personal' : 
                      exp.category === 'BUSINESS' ? 'Business' : 
                      exp.category === 'CUSTOM' ? exp.subCategory || exp.category || 'Custom' : exp.category,
            subcategory: exp.subCategory || '',
            description: exp.notes || exp.description || 'No description',
            paymentMethod: exp.paymentMethod || 'Unknown',
            date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            workspaceId: workspace.id,
            workspaceName: workspace.name,
          }));
          
          allExpenses.push(...mappedExpenses);
        } catch (error) {
          console.error(`Failed to fetch expenses for workspace ${workspace.name}:`, error);
        }
      }
      
      setExpenses(allExpenses);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filterWorkspace !== 'all' && expense.workspaceId !== filterWorkspace) return false;
    if (filterCategory !== 'all' && expense.category !== filterCategory) return false;
    if (filterMonth !== 'all') {
      const expenseMonth = new Date(expense.date).getMonth();
      if (expenseMonth !== parseInt(filterMonth)) return false;
    }
    return true;
  });

  // Calculate totals per workspace
  const workspaceTotals = workspaces.map(workspace => {
    const workspaceExpenses = filteredExpenses.filter(e => e.workspaceId === workspace.id);
    const total = workspaceExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      total,
    };
  });

  // Calculate total across all workspaces
  const totalExpenses = filteredExpenses.reduce((sum, exp) => {
    return sum + exp.amount;
  }, 0);

  const categories = Array.from(new Set(expenses.map(e => e.category)));

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

  const formatAmount = (amount: number, currency: string = 'USD') => {
    return `${getCurrencySymbol(currency)}${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your expenses</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(totalExpenses, preferredCurrency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{preferredCurrency}</p>
            </div>
          </div>
        </Card>

        {/* Workspace Cards */}
        {workspaceTotals.map((workspaceTotal, index) => {
          const colors = [
            { bg: 'bg-purple-100', icon: 'text-purple-600' },
            { bg: 'bg-teal-100', icon: 'text-teal-600' },
            { bg: 'bg-pink-100', icon: 'text-pink-600' },
            { bg: 'bg-orange-100', icon: 'text-orange-600' },
            { bg: 'bg-indigo-100', icon: 'text-indigo-600' },
            { bg: 'bg-green-100', icon: 'text-green-600' },
          ];
          const color = colors[index % colors.length];
          
          return (
            <Card key={workspaceTotal.workspaceId} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${color.bg} rounded-lg flex items-center justify-center`}>
                  <DollarSign className={`w-5 h-5 ${color.icon}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{workspaceTotal.workspaceName}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(workspaceTotal.total, preferredCurrency)}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Filter className="w-5 h-5 text-gray-500 mt-2 sm:mt-0" />
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
            <Select value={filterWorkspace} onValueChange={setFilterWorkspace}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Workspaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workspaces</SelectItem>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="11">December</SelectItem>
                <SelectItem value="10">November</SelectItem>
                <SelectItem value="9">October</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-gray-500">
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      {/* Expense List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading expenses...</p>
          </div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No expenses found. Add your first expense to get started!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Amount */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(expense.amount, expense.currency || preferredCurrency)}
                  </p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {expense.workspaceName}
                    </Badge>
                    {expense.currency && expense.currency !== preferredCurrency && (
                      <Badge variant="outline" className="text-xs">
                        {expense.currency}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">{expense.description}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {expense.category} - {expense.subcategory}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    {expense.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Receipt</DropdownMenuItem>
                  <DropdownMenuItem>Edit Expense</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
          ))}
        </div>
      )}

      {/* Add Expense Dialog */}
      {showAddDialog && (
        <AddExpenseDialog
          onClose={() => setShowAddDialog(false)}
          onAdd={async (newExpense) => {
            if (!newExpense.workspaceId) return;
            
            try {
              // Map form data to API format
              const apiExpenseData = {
                amount: newExpense.amount,
                currency: newExpense.currency || preferredCurrency,
                category: 'CUSTOM', // Using CUSTOM since we're using categories from settings
                subCategory: newExpense.subcategory || newExpense.category,
                paymentMethod: newExpense.paymentMethod === 'Credit Card' ? 'CARD' :
                               newExpense.paymentMethod === 'Debit Card' ? 'CARD' :
                               newExpense.paymentMethod === 'Cash' ? 'CASH' :
                               newExpense.paymentMethod === 'UPI' ? 'UPI' : 'BANK_TRANSFER',
                date: newExpense.date || new Date().toISOString(),
                notes: newExpense.description,
              };
              
              await api.createExpense(newExpense.workspaceId, apiExpenseData);
              await fetchAllExpenses(); // Refresh expenses from all workspaces
              setShowAddDialog(false);
            } catch (error) {
              console.error('Failed to create expense:', error);
              throw error;
            }
          }}
        />
      )}
    </div>
  );
}

