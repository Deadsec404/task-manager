import { useState, useEffect } from 'react';
import { Plus, Clock, Calendar, Play, Pause, MoreVertical, Filter } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { TaskDetailsPanel } from './TaskDetailsPanel';
import { AddTaskDialog } from './AddTaskDialog';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { api } from '../../../lib/api';
import { useRemainingTime } from '../../../hooks/useRemainingTime';

interface Task {
  id: number | string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  category: string;
  estimatedTime: number;
  trackedTime: number;
  isTracking?: boolean;
  startTime?: string | Date;
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Design landing page mockups',
    description: 'Create high-fidelity mockups for the new product landing page',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2025-01-05',
    category: 'Design',
    estimatedTime: 8,
    trackedTime: 4.5,
    isTracking: false,
  },
  {
    id: 2,
    title: 'Client presentation preparation',
    description: 'Prepare slides and demo for quarterly business review',
    status: 'not-started',
    priority: 'high',
    dueDate: '2025-01-03',
    category: 'Business',
    estimatedTime: 4,
    trackedTime: 0,
  },
  {
    id: 3,
    title: 'Update documentation',
    description: 'Update API documentation with new endpoints',
    status: 'overdue',
    priority: 'medium',
    dueDate: '2024-12-28',
    category: 'Development',
    estimatedTime: 3,
    trackedTime: 1.5,
  },
  {
    id: 4,
    title: 'Code review - Authentication module',
    description: 'Review pull request for new authentication features',
    status: 'completed',
    priority: 'medium',
    dueDate: '2024-12-30',
    category: 'Development',
    estimatedTime: 2,
    trackedTime: 2,
  },
  {
    id: 5,
    title: 'Monthly expense report',
    description: 'Compile and submit expense report for December',
    status: 'not-started',
    priority: 'low',
    dueDate: '2025-01-10',
    category: 'Finance',
    estimatedTime: 2,
    trackedTime: 0,
  },
];

export function TaskList() {
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch tasks when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      fetchTasks();
    }
  }, [currentWorkspace]);

  const fetchTasks = async () => {
    if (!currentWorkspace) return;
    
    try {
      setLoading(true);
      const response = await api.getTasks(currentWorkspace.id);
      
      // Map API response to component format
      const mappedTasks: Task[] = response.tasks.map((task: any) => {
        // Calculate tracked time from completed time entries (ones with endTime)
        const trackedTime = task.timeEntries?.reduce((sum: number, entry: any) => {
          if (entry.endTime && entry.duration) {
            // Duration is in minutes, convert to hours
            return sum + (entry.duration / 60);
          }
          return sum;
        }, 0) || 0;
        
        // Find active time entry (one without endTime)
        const activeEntry = task.timeEntries?.find((entry: any) => !entry.endTime);
        const hasActiveEntry = !!activeEntry;
        
        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: task.status === 'NOT_STARTED' ? 'not-started' :
                  task.status === 'IN_PROGRESS' ? 'in-progress' :
                  task.status === 'COMPLETED' ? 'completed' : 'overdue',
          priority: task.priority === 'LOW' ? 'low' :
                    task.priority === 'MEDIUM' ? 'medium' : 'high',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          category: task.category || 'General',
          estimatedTime: (task.expectedTime || 0) / 60, // Convert minutes to hours
          trackedTime: trackedTime,
          isTracking: hasActiveEntry,
          startTime: activeEntry?.startTime,
        };
      });
      
      setTasks(mappedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    const variants = {
      'not-started': { label: 'Not Started', variant: 'secondary' as const },
      'in-progress': { label: 'In Progress', variant: 'default' as const },
      'completed': { label: 'Completed', variant: 'outline' as const },
      'overdue': { label: 'Overdue', variant: 'destructive' as const },
    };
    return variants[status];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: 'bg-gray-400',
      medium: 'bg-yellow-400',
      high: 'bg-red-400',
    };
    return colors[priority];
  };

  // Component for displaying task time with countdown
  function TaskTimeDisplay({ task }: { task: Task }) {
    const { formattedTime } = useRemainingTime({
      estimatedTime: task.estimatedTime,
      trackedTime: task.trackedTime,
      isTracking: task.isTracking || false,
      startTime: task.startTime,
    });
    
    return (
      <span className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        {task.trackedTime.toFixed(1)}h {task.estimatedTime > 0 && `/ ${task.estimatedTime.toFixed(1)}h`}
        {task.isTracking && task.estimatedTime > 0 && (
          <span className="ml-2 text-blue-600 font-medium">
            • {formattedTime}
          </span>
        )}
      </span>
    );
  }

  const toggleTimer = async (taskId: number | string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      if (task.isTracking) {
        await api.stopTimeTracking(taskId.toString());
      } else {
        // Check if there's already an active timer (in case state is out of sync)
        try {
          await api.startTimeTracking(taskId.toString());
        } catch (error: any) {
          // If timer is already active, just refresh the state
          if (error.message?.includes('already active')) {
            console.log('Timer already active, refreshing state...');
            await fetchTasks();
            return;
          }
          throw error;
        }
      }
      
      // Refresh tasks to get updated time and state
      await fetchTasks();
    } catch (error) {
      console.error('Failed to toggle timer:', error);
      // Refresh tasks to sync state with backend
      await fetchTasks();
    }
  };

  const handleDuplicateTask = async (task: Task) => {
    if (!currentWorkspace) return;
    
    try {
      // Map task data to API format for duplication
      const apiTaskData = {
        title: `${task.title} (Copy)`,
        description: task.description,
        status: task.status === 'not-started' ? 'NOT_STARTED' :
                task.status === 'in-progress' ? 'IN_PROGRESS' :
                task.status === 'completed' ? 'COMPLETED' : 'OVERDUE',
        priority: task.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        dueDate: task.dueDate 
          ? new Date(task.dueDate + 'T00:00:00.000Z').toISOString()
          : undefined,
        category: task.category || undefined,
        expectedTime: task.estimatedTime ? Math.round(task.estimatedTime * 60) : undefined, // Convert hours to minutes
      };
      
      await api.createTask(currentWorkspace.id, apiTaskData);
      await fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Failed to duplicate task:', error);
      alert('Failed to duplicate task. Please try again.');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.deleteTask(task.id.toString());
      await fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Please select a workspace to view tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your tasks and track time - {currentWorkspace.name}</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Filter className="w-5 h-5 text-gray-500 mt-2 sm:mt-0" />
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-gray-500">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No tasks found. Add your first task to get started!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
          const statusInfo = getStatusBadge(task.status);
          return (
            <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Priority Indicator */}
                <div className={`w-1 h-12 rounded ${getPriorityColor(task.priority)} hidden lg:block`} />

                {/* Task Info */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <TaskTimeDisplay task={task} />
                    {task.category && (
                      <Badge variant="outline" className="text-xs">{task.category}</Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={task.isTracking ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTimer(task.id)}
                    className={task.isTracking ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {task.isTracking ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Start</span>
                      </>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedTask(task)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateTask(task)}>
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={() => handleDeleteTask(task)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          );
          })}
        </div>
      )}

      {/* Task Details Panel */}
      {selectedTask && (
        <TaskDetailsPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={async (updatedTask) => {
            // Refresh tasks from API after update
            await fetchTasks();
            setSelectedTask(null);
          }}
        />
      )}

      {/* Add Task Dialog */}
      {showAddDialog && (
        <AddTaskDialog
          onClose={() => setShowAddDialog(false)}
          onAdd={async (taskData) => {
            if (!currentWorkspace) return;
            
            try {
              // Map form data to API format
              const apiTaskData = {
                title: taskData.title,
                description: taskData.description,
                status: taskData.status === 'not-started' ? 'NOT_STARTED' :
                        taskData.status === 'in-progress' ? 'IN_PROGRESS' : 'COMPLETED',
                priority: taskData.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
                dueDate: taskData.dueDate 
                  ? new Date(taskData.dueDate + 'T00:00:00.000Z').toISOString()
                  : undefined,
                category: taskData.category || undefined,
                expectedTime: taskData.estimatedTime ? Math.round(taskData.estimatedTime * 60) : undefined, // Convert hours to minutes
              };
              
              await api.createTask(currentWorkspace.id, apiTaskData);
              await fetchTasks(); // Refresh tasks
              setShowAddDialog(false);
            } catch (error) {
              console.error('Failed to create task:', error);
              throw error;
            }
          }}
        />
      )}
    </div>
  );
}

