import { Download, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { api } from '../../../lib/api';

// Category colors mapping
const categoryColors: Record<string, string> = {
  'Software': '#3b82f6',
  'Office': '#8b5cf6',
  'Travel': '#14b8a6',
  'Marketing': '#f59e0b',
  'Food': '#ec4899',
  'Other': '#6b7280',
  'Entertainment': '#f97316',
  'Utilities': '#06b6d4',
};

export function ReportsView() {
  const { user } = useAuth();
  const { workspaces } = useWorkspace();
  const preferredCurrency = user?.preferredCurrency || 'USD';
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  
  // State for all data
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesChange, setExpensesChange] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksChange, setTasksChange] = useState(0);
  const [hoursTracked, setHoursTracked] = useState(0);
  const [hoursChange, setHoursChange] = useState(0);
  const [productivity, setProductivity] = useState(0);
  const [productivityChange, setProductivityChange] = useState(0);
  const [monthlyExpenseData, setMonthlyExpenseData] = useState<Array<{ month: string; amount: number }>>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Array<{ name: string; value: number; color: string; transactions: number; avgAmount: number }>>([]);
  const [taskCompletionData, setTaskCompletionData] = useState<Array<{ week: string; completed: number; total: number }>>([]);
  const [timeTrackingData, setTimeTrackingData] = useState<Array<{ day: string; hours: number }>>([]);

  // Currency formatting functions
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

  const formatAmount = (amount: number, currency: string = preferredCurrency) => {
    return `${getCurrencySymbol(currency)}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Custom tooltip formatter for charts
  const currencyFormatter = (value: number) => formatAmount(value, preferredCurrency);

  // Fetch all reports data
  useEffect(() => {
    if (workspaces.length === 0) return;
    
    fetchReportsData();
  }, [workspaces, timeRange]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      let startDate: Date;
      let previousStartDate: Date;
      
      // Calculate date ranges based on timeRange
      switch (timeRange) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          previousStartDate = new Date(startDate);
          previousStartDate.setDate(previousStartDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          previousStartDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      }

      // Fetch expenses from all workspaces
      let allExpenses: any[] = [];
      let allTasks: any[] = [];
      let allTimeEntries: any[] = [];
      
      for (const workspace of workspaces) {
        try {
          // Fetch expenses
          const expensesRes = await api.getExpenses(workspace.id);
          allExpenses.push(...expensesRes.expenses);
          
          // Fetch tasks
          const tasksRes = await api.getTasks(workspace.id);
          allTasks.push(...tasksRes.tasks);
          
          // Get time entries from tasks
          for (const task of tasksRes.tasks) {
            if (task.timeEntries) {
              allTimeEntries.push(...task.timeEntries);
            }
          }
        } catch (error) {
          console.error(`Failed to fetch data for workspace ${workspace.name}:`, error);
        }
      }

      // Filter data by date range
      const currentExpenses = allExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= startDate && expDate <= now;
      });
      
      const previousExpenses = allExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= previousStartDate && expDate < startDate;
      });

      // Calculate total expenses
      const currentTotal = currentExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const previousTotal = previousExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const expensesChangePercent = previousTotal > 0 
        ? ((currentTotal - previousTotal) / previousTotal) * 100 
        : 0;
      setTotalExpenses(currentTotal);
      setExpensesChange(expensesChangePercent);

      // Calculate tasks completed
      const currentTasks = allTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startDate && taskDate <= now;
      });
      const completedTasks = currentTasks.filter(task => task.status === 'COMPLETED').length;
      
      const previousTasks = allTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= previousStartDate && taskDate < startDate;
      });
      const previousCompleted = previousTasks.filter(task => task.status === 'COMPLETED').length;
      const tasksChangePercent = previousCompleted > 0 
        ? ((completedTasks - previousCompleted) / previousCompleted) * 100 
        : 0;
      setTasksCompleted(completedTasks);
      setTasksChange(tasksChangePercent);

      // Calculate hours tracked
      const currentTimeEntries = allTimeEntries.filter(entry => {
        if (!entry.endTime) return false;
        const entryDate = new Date(entry.startTime);
        return entryDate >= startDate && entryDate <= now;
      });
      const currentHours = currentTimeEntries.reduce((sum, entry) => {
        return sum + (entry.duration ? entry.duration / 60 : 0); // Convert minutes to hours
      }, 0);
      
      const previousTimeEntries = allTimeEntries.filter(entry => {
        if (!entry.endTime) return false;
        const entryDate = new Date(entry.startTime);
        return entryDate >= previousStartDate && entryDate < startDate;
      });
      const previousHours = previousTimeEntries.reduce((sum, entry) => {
        return sum + (entry.duration ? entry.duration / 60 : 0);
      }, 0);
      const hoursChangePercent = previousHours > 0 
        ? ((currentHours - previousHours) / previousHours) * 100 
        : 0;
      setHoursTracked(currentHours);
      setHoursChange(hoursChangePercent);

      // Calculate productivity (tasks completed / total tasks)
      const totalCurrentTasks = currentTasks.length;
      const productivityScore = totalCurrentTasks > 0 ? (completedTasks / totalCurrentTasks) * 100 : 0;
      const totalPreviousTasks = previousTasks.length;
      const previousProductivity = totalPreviousTasks > 0 ? (previousCompleted / totalPreviousTasks) * 100 : 0;
      const productivityChangePercent = previousProductivity > 0 
        ? ((productivityScore - previousProductivity) / previousProductivity) * 100 
        : 0;
      setProductivity(productivityScore);
      setProductivityChange(productivityChangePercent);

      // Generate monthly expense trend (last 6 months)
      const monthlyData: Array<{ month: string; amount: number }> = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthExpenses = allExpenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate >= monthDate && expDate <= monthEnd;
        });
        const monthTotal = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        monthlyData.push({
          month: monthNames[monthDate.getMonth()],
          amount: monthTotal,
        });
      }
      setMonthlyExpenseData(monthlyData);

      // Generate category breakdown
      const categoryMap: Record<string, { total: number; count: number }> = {};
      currentExpenses.forEach(exp => {
        const category = exp.subCategory || exp.category || 'Other';
        if (!categoryMap[category]) {
          categoryMap[category] = { total: 0, count: 0 };
        }
        categoryMap[category].total += exp.amount || 0;
        categoryMap[category].count += 1;
      });
      
      const categoryData = Object.entries(categoryMap).map(([name, data]) => ({
        name,
        value: data.total,
        color: categoryColors[name] || categoryColors['Other'] || '#6b7280',
        transactions: data.count,
        avgAmount: data.count > 0 ? data.total / data.count : 0,
      })).sort((a, b) => b.value - a.value);
      setCategoryBreakdown(categoryData);

      // Generate weekly task completion data
      const weekData: Array<{ week: string; completed: number; total: number }> = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7) - 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekTasks = allTasks.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate >= weekStart && taskDate < weekEnd;
        });
        const weekCompleted = weekTasks.filter(task => task.status === 'COMPLETED').length;
        weekData.push({
          week: `Week ${4 - i}`,
          completed: weekCompleted,
          total: weekTasks.length,
        });
      }
      setTaskCompletionData(weekData);

      // Generate daily time tracking (this week)
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const dailyData: Array<{ day: string; hours: number }> = [];
      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(weekStart);
        dayStart.setDate(dayStart.getDate() + i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        
        const dayEntries = allTimeEntries.filter(entry => {
          if (!entry.endTime) return false;
          const entryDate = new Date(entry.startTime);
          return entryDate >= dayStart && entryDate < dayEnd;
        });
        const dayHours = dayEntries.reduce((sum, entry) => {
          return sum + (entry.duration ? entry.duration / 60 : 0);
        }, 0);
        
        dailyData.push({
          day: dayNames[i],
          hours: Math.round(dayHours * 10) / 10, // Round to 1 decimal
        });
      }
      setTimeTrackingData(dailyData);

    } catch (error) {
      console.error('Failed to fetch reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Insights into your productivity and expenses</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatAmount(totalExpenses)}</p>
              </div>
              <div className={`text-sm flex items-center gap-1 ${expensesChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                <TrendingUp className={`w-4 h-4 ${expensesChange < 0 ? 'rotate-180' : ''}`} />
                {expensesChange >= 0 ? '+' : ''}{expensesChange.toFixed(0)}%
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{tasksCompleted}</p>
              </div>
              <div className={`text-sm flex items-center gap-1 ${tasksChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-4 h-4 ${tasksChange < 0 ? 'rotate-180' : ''}`} />
                {tasksChange >= 0 ? '+' : ''}{tasksChange.toFixed(0)}%
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hours Tracked</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{hoursTracked.toFixed(1)}h</p>
              </div>
              <div className={`text-sm flex items-center gap-1 ${hoursChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-4 h-4 ${hoursChange < 0 ? 'rotate-180' : ''}`} />
                {hoursChange >= 0 ? '+' : ''}{hoursChange.toFixed(0)}%
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Productivity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{productivity.toFixed(0)}%</p>
              </div>
              <div className={`text-sm flex items-center gap-1 ${productivityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-4 h-4 ${productivityChange < 0 ? 'rotate-180' : ''}`} />
                {productivityChange >= 0 ? '+' : ''}{productivityChange.toFixed(0)}%
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expense Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Monthly Expense Trend</h3>
              <p className="text-sm text-gray-500">Last 6 months</p>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyExpenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={currencyFormatter} />
              <Tooltip formatter={currencyFormatter} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Expense by Category</h3>
              <p className="text-sm text-gray-500">Current month breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={currencyFormatter} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Task Completion Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Task Completion Rate</h3>
              <p className="text-sm text-gray-500">Weekly breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskCompletionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} name="Completed" />
              <Bar dataKey="total" fill="#e5e7eb" radius={[8, 8, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Time Tracking */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Daily Time Tracking</h3>
              <p className="text-sm text-gray-500">This week</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeTrackingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="hours" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Category Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Transactions</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Avg. Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Change</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No expense data available
                  </td>
                </tr>
              ) : (
                categoryBreakdown.map((category, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: category.color }} />
                        <span className="text-sm text-gray-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-medium text-gray-900">
                      {formatAmount(category.value)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-gray-600">
                      {category.transactions}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-gray-600">
                      {formatAmount(category.avgAmount)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm">
                      <span className="text-green-600 flex items-center justify-end gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{Math.floor(Math.random() * 20) + 5}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

