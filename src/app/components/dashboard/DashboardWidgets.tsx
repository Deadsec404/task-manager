import { CheckCircle2, Clock, DollarSign, TrendingUp, AlertCircle, Target } from 'lucide-react';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../../contexts/AuthContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { api } from '../../../lib/api';
import { useState, useEffect } from 'react';

export function DashboardWidgets() {
  const { user } = useAuth();
  const { workspaces, currentWorkspace } = useWorkspace();
  const preferredCurrency = user?.preferredCurrency || 'USD';
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    todayTasks: [] as any[],
    overdueTasks: [] as any[],
    timeSpentToday: 0,
    tasksCompletedThisWeek: 0,
    monthlyExpenses: 0,
    budgetStatus: [] as any[],
    productivityScore: 0,
    tasksCompletedLastWeek: 0,
    totalTasks: 0,
    completedTasks: 0,
    timeTracked: 0,
    onTimeTasks: 0,
  });
  const [expenseData, setExpenseData] = useState<Array<{ month: string; amount: number }>>([]);

  // Fetch dashboard data for current workspace only
  useEffect(() => {
    if (currentWorkspace) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace?.id]);

  const fetchDashboardData = async () => {
    if (!currentWorkspace) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching dashboard data for workspace:', currentWorkspace.name, currentWorkspace.id);
      
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const lastWeekStart = new Date(weekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Fetch dashboard data for current workspace
      const data = await api.getDashboardData(currentWorkspace.id);
      console.log('Dashboard data:', {
        todayTasks: data.todayTasks?.length || 0,
        overdueTasks: data.overdueTasks?.length || 0,
        timeSpentToday: data.timeSpentToday || 0,
        tasksCompletedThisWeek: data.tasksCompletedThisWeek || 0,
        monthlyExpenses: data.monthlyExpenses || 0,
      });
      
      // Fetch tasks for productivity calculation
      const tasksRes = await api.getTasks(currentWorkspace.id);
      console.log('Tasks:', tasksRes.tasks?.length || 0);
      
      let allTimeEntries: any[] = [];
      for (const task of tasksRes.tasks || []) {
        if (task.timeEntries) {
          allTimeEntries.push(...task.timeEntries);
        }
      }
      
      // Fetch expenses for monthly chart
      const expensesRes = await api.getExpenses(currentWorkspace.id);
      console.log('Expenses:', expensesRes.expenses?.length || 0);
      
      const allTasks = tasksRes.tasks || [];
      const allExpenses = expensesRes.expenses || [];
      
      console.log('Aggregated data:', {
        todayTasks: data.todayTasks?.length || 0,
        overdueTasks: data.overdueTasks?.length || 0,
        timeSpentToday: data.timeSpentToday || 0,
        tasksCompletedThisWeek: data.tasksCompletedThisWeek || 0,
        monthlyExpenses: data.monthlyExpenses || 0,
        allTasks: allTasks.length,
        allExpenses: allExpenses.length,
      });
      
      // Calculate last week's completed tasks
      const lastWeekTasks = allTasks.filter(task => {
        if (task.status !== 'COMPLETED' || !task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return completedDate >= lastWeekStart && completedDate < weekStart;
      });
      const totalTasksCompletedLastWeek = lastWeekTasks.length;
      
      // Calculate productivity metrics
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.status === 'COMPLETED').length;
      const totalTimeTracked = allTimeEntries
        .filter(entry => entry.endTime && entry.duration)
        .reduce((sum, entry) => sum + (entry.duration / 60), 0); // Convert minutes to hours
      
      // Calculate on-time tasks (completed before or on due date)
      const onTimeTasks = allTasks.filter(task => {
        if (task.status !== 'COMPLETED' || !task.dueDate || !task.completedAt) return false;
        const dueDate = new Date(task.dueDate);
        const completedDate = new Date(task.completedAt);
        return completedDate <= dueDate;
      }).length;
      
      const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const onTimePercentage = completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 0;
      
      // Generate monthly expense data (last 6 months)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData: Array<{ month: string; amount: number }> = [];
      
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
      const finalData = {
        todayTasks: data.todayTasks || [],
        overdueTasks: data.overdueTasks || [],
        timeSpentToday: data.timeSpentToday || 0,
        tasksCompletedThisWeek: data.tasksCompletedThisWeek || 0,
        monthlyExpenses: data.monthlyExpenses || 0,
        budgetStatus: data.budgetStatus || [],
        productivityScore,
        tasksCompletedLastWeek: totalTasksCompletedLastWeek,
        totalTasks,
        completedTasks,
        timeTracked: totalTimeTracked,
        onTimeTasks: onTimePercentage,
      };
      
      console.log('Setting dashboard data:', finalData);
      setDashboardData(finalData);
      setExpenseData(monthlyData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate days overdue for tasks
  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const tasksToday = dashboardData.todayTasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    completed: task.status === 'COMPLETED',
  }));

  const overdueTasks = dashboardData.overdueTasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    daysOverdue: task.dueDate ? getDaysOverdue(task.dueDate) : 0,
  }));

  const timeSpentToday = dashboardData.timeSpentToday / 3600; // Convert seconds to hours
  const totalTimeToday = 8;
  const tasksCompletedWeek = dashboardData.tasksCompletedThisWeek;
  const tasksCompletedLastWeek = dashboardData.tasksCompletedLastWeek;
  const tasksChange = tasksCompletedLastWeek > 0 
    ? ((tasksCompletedWeek - tasksCompletedLastWeek) / tasksCompletedLastWeek) * 100 
    : 0;
  const productivityScore = dashboardData.productivityScore || 0;
  
  // Calculate budget data
  const totalBudget = dashboardData.budgetStatus.reduce((sum: number, budget: any) => sum + (budget.amount || 0), 0);
  const usedBudget = dashboardData.monthlyExpenses || 0;

  const budgetData = [
    { name: 'Used', value: usedBudget, color: '#3b82f6' },
    { name: 'Remaining', value: Math.max(0, totalBudget - usedBudget), color: '#e5e7eb' },
  ];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Please create a workspace to view the dashboard</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Today's Tasks */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Today's Tasks</h3>
            <p className="text-sm text-gray-500">
              {tasksToday.filter(t => t.completed).length} of {tasksToday.length} completed
              {currentWorkspace && <span className="ml-1 text-xs">({currentWorkspace.name})</span>}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {tasksToday.map((task) => (
            <div key={task.id} className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center ${
                task.completed ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
              }`}>
                {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Overdue Tasks */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Overdue Tasks</h3>
            <p className="text-sm text-gray-500">{overdueTasks.length} tasks need attention</p>
          </div>
        </div>
        <div className="space-y-3">
          {overdueTasks.map((task) => (
            <div key={task.id} className="flex items-start justify-between gap-3 p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-700">{task.title}</span>
              <Badge variant="destructive" className="text-xs">
                {task.daysOverdue}d
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Time Spent Today */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Time Spent Today</h3>
            <p className="text-sm text-gray-500">{timeSpentToday}h of {totalTimeToday}h</p>
          </div>
        </div>
        <div className="space-y-3">
          <Progress value={(timeSpentToday / totalTimeToday) * 100} className="h-3" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{timeSpentToday}h</p>
              <p className="text-xs text-gray-500 mt-1">Tracked</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{totalTimeToday - timeSpentToday}h</p>
              <p className="text-xs text-gray-500 mt-1">Remaining</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks Completed This Week */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">This Week</h3>
            <p className="text-sm text-gray-500">Tasks completed</p>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <p className="text-4xl font-bold text-gray-900">{tasksCompletedWeek}</p>
          {tasksChange !== 0 && (
            <p className={`text-sm mb-2 flex items-center gap-1 ${tasksChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 ${tasksChange < 0 ? 'rotate-180' : ''}`} />
              {tasksChange >= 0 ? '+' : ''}{tasksChange.toFixed(0)}% from last week
            </p>
          )}
        </div>
      </Card>

      {/* Monthly Expenses Chart */}
      <Card className="p-6 md:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Monthly Expenses</h3>
            <p className="text-sm text-gray-500">Last 6 months trend</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={expenseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatAmount(value)} />
            <Tooltip formatter={(value: number) => formatAmount(value)} />
            <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Remaining Budget */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Budget Status</h3>
            <p className="text-sm text-gray-500">Monthly budget</p>
          </div>
        </div>
        <div className="flex items-center justify-center mb-4">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Used</span>
            <span className="font-semibold text-gray-900">{formatAmount(usedBudget)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining</span>
            <span className="font-semibold text-teal-600">{formatAmount(totalBudget - usedBudget)}</span>
          </div>
        </div>
      </Card>

      {/* Productivity Score */}
      <Card className="p-6 md:col-span-2 lg:col-span-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Productivity Score</h3>
            <p className="text-sm text-gray-500">Based on tasks completed and time tracked</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-teal-500">
            <div className="flex items-center justify-center w-28 h-28 rounded-full bg-white">
              <span className="text-3xl font-bold text-gray-900">{productivityScore}%</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{dashboardData.completedTasks}</p>
              <p className="text-sm text-gray-600 mt-1">Tasks Done</p>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <p className="text-2xl font-bold text-teal-600">{dashboardData.timeTracked.toFixed(1)}h</p>
              <p className="text-sm text-gray-600 mt-1">Time Tracked</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{dashboardData.onTimeTasks}%</p>
              <p className="text-sm text-gray-600 mt-1">On Time</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

