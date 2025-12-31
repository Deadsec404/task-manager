import { useState, useEffect } from 'react';
import { X, Play, Pause, Clock, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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

interface TaskDetailsPanelProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

export function TaskDetailsPanel({ task, onClose, onUpdate }: TaskDetailsPanelProps) {
  const [editedTask, setEditedTask] = useState(task);
  const [isTracking, setIsTracking] = useState(task.isTracking || false);
  const [saving, setSaving] = useState(false);
  const [startTime, setStartTime] = useState<string | Date | undefined>(task.startTime);

  // Update state when task prop changes
  useEffect(() => {
    setEditedTask(task);
    setIsTracking(task.isTracking || false);
    setStartTime(task.startTime);
  }, [task]);

  // Fetch task details to get updated startTime when tracking
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await api.getTask(task.id.toString());
        const activeEntry = response.task.timeEntries?.find((entry: any) => !entry.endTime);
        if (activeEntry) {
          setStartTime(activeEntry.startTime);
          setIsTracking(true);
        } else {
          setIsTracking(false);
          setStartTime(undefined);
        }
        // Update tracked time from time entries
        const trackedTime = response.task.timeEntries?.reduce((sum: number, entry: any) => {
          if (entry.endTime && entry.duration) {
            return sum + (entry.duration / 60); // Convert minutes to hours
          }
          return sum;
        }, 0) || 0;
        setEditedTask(prev => ({ ...prev, trackedTime }));
      } catch (error) {
        console.error('Failed to fetch task details:', error);
      }
    };
    
    if (isTracking) {
      fetchTaskDetails();
      // Refresh every 30 seconds to sync with backend
      const interval = setInterval(fetchTaskDetails, 30000);
      return () => clearInterval(interval);
    }
  }, [isTracking, task.id]);

  const { formattedTime } = useRemainingTime({
    estimatedTime: editedTask.estimatedTime,
    trackedTime: editedTask.trackedTime,
    isTracking: isTracking,
    startTime: startTime,
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Map to API format
      const apiTaskData = {
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status === 'not-started' ? 'NOT_STARTED' :
                editedTask.status === 'in-progress' ? 'IN_PROGRESS' :
                editedTask.status === 'completed' ? 'COMPLETED' : 'OVERDUE',
        priority: editedTask.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        dueDate: editedTask.dueDate 
          ? new Date(editedTask.dueDate + 'T00:00:00.000Z').toISOString()
          : undefined,
        category: editedTask.category || undefined,
        expectedTime: editedTask.estimatedTime ? Math.round(editedTask.estimatedTime * 60) : undefined, // Convert hours to minutes
      };
      
      await api.updateTask(task.id.toString(), apiTaskData);
      onUpdate({ ...editedTask, isTracking });
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTimer = async () => {
    try {
      if (isTracking) {
        await api.stopTimeTracking(task.id.toString());
        setIsTracking(false);
        setStartTime(undefined);
        
        // Refresh task data to get updated trackedTime
        const response = await api.getTask(task.id.toString());
        const trackedTime = response.task.timeEntries?.reduce((sum: number, entry: any) => {
          if (entry.endTime && entry.duration) {
            return sum + (entry.duration / 60); // Convert minutes to hours
          }
          return sum;
        }, 0) || 0;
        setEditedTask(prev => ({ ...prev, trackedTime }));
      } else {
        const response = await api.startTimeTracking(task.id.toString());
        setIsTracking(true);
        if (response.timeEntry?.startTime) {
          setStartTime(response.timeEntry.startTime);
        }
      }
    } catch (error) {
      console.error('Failed to toggle timer:', error);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Task Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Timer Controls */}
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Time Tracked</p>
                <p className="text-3xl font-bold text-gray-900">
                  {editedTask.trackedTime.toFixed(1)}h
                  {editedTask.estimatedTime > 0 && (
                    <span className="text-lg text-gray-500"> / {editedTask.estimatedTime.toFixed(1)}h</span>
                  )}
                </p>
                {isTracking && editedTask.estimatedTime > 0 && (
                  <p className="text-lg font-semibold text-blue-600 mt-2">
                    {formattedTime}
                  </p>
                )}
              </div>
              <Button
                size="lg"
                onClick={toggleTimer}
                className={isTracking ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {isTracking ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Stop Timer
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Timer
                  </>
                )}
              </Button>
            </div>
            {isTracking && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                Timer is running...
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <Input
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              placeholder="Enter task description"
              rows={4}
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={editedTask.status}
                onValueChange={(value: Task['status']) => 
                  setEditedTask({ ...editedTask, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <Select
                value={editedTask.priority}
                onValueChange={(value: Task['priority']) => 
                  setEditedTask({ ...editedTask, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <Select
                value={editedTask.category}
                onValueChange={(value) => 
                  setEditedTask({ ...editedTask, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <Input
                type="date"
                value={editedTask.dueDate}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Time Estimates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Expected Time (hours)
              </label>
              <Input
                type="number"
                value={editedTask.estimatedTime}
                onChange={(e) => setEditedTask({ ...editedTask, estimatedTime: parseFloat(e.target.value) })}
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Time (hours)
              </label>
              <Input
                type="number"
                value={editedTask.trackedTime}
                onChange={(e) => setEditedTask({ ...editedTask, trackedTime: parseFloat(e.target.value) })}
                min="0"
                step="0.5"
              />
            </div>
          </div>

          {/* Warning if overdue */}
          {editedTask.status === 'overdue' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">This task is overdue</p>
                <p className="text-sm text-red-700 mt-1">
                  Due date was {new Date(editedTask.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

