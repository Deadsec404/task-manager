import { useState, useEffect } from 'react';
import { Plus, Check, MoreVertical, Target, TrendingUp, Calendar, Flame } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { AddHabitDialog } from './AddHabitDialog';
import { cn } from '../ui/utils';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { api } from '../../../lib/api';

interface Habit {
  id: number;
  title: string;
  description: string;
  category: string;
  streak: number;
  completedToday: boolean;
  totalCompleted: number;
  targetDays: number;
  icon: string;
  color: string;
}

const initialHabits: Habit[] = [
  {
    id: 1,
    title: 'Complete 1 tutorial',
    description: 'Learn something new every day',
    category: 'Learning',
    streak: 7,
    completedToday: true,
    totalCompleted: 45,
    targetDays: 90,
    icon: '📚',
    color: 'blue',
  },
  {
    id: 2,
    title: 'Go to the gym',
    description: 'Stay fit and healthy',
    category: 'Health',
    streak: 5,
    completedToday: true,
    totalCompleted: 32,
    targetDays: 60,
    icon: '💪',
    color: 'green',
  },
  {
    id: 3,
    title: 'Practice coding',
    description: '1 hour of coding practice',
    category: 'Learning',
    streak: 12,
    completedToday: false,
    totalCompleted: 58,
    targetDays: 100,
    icon: '💻',
    color: 'purple',
  },
  {
    id: 4,
    title: 'Read for 30 minutes',
    description: 'Read personal development books',
    category: 'Learning',
    streak: 3,
    completedToday: false,
    totalCompleted: 18,
    targetDays: 30,
    icon: '📖',
    color: 'orange',
  },
  {
    id: 5,
    title: 'Meditation',
    description: '10 minutes morning meditation',
    category: 'Wellness',
    streak: 0,
    completedToday: false,
    totalCompleted: 8,
    targetDays: 21,
    icon: '🧘',
    color: 'teal',
  },
];

const categoryColors = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' },
  green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-500' },
};

export function DailyHabitsView() {
  const { currentWorkspace } = useWorkspace();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch habits when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      fetchHabits();
    }
  }, [currentWorkspace]);

  const fetchHabits = async () => {
    if (!currentWorkspace) return;
    
    try {
      setLoading(true);
      const response = await api.getHabits(currentWorkspace.id);
      
      // Map API response to component format
      const mappedHabits: Habit[] = response.habits.map((habit: any) => {
        // Get today's entry
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = habit.entries?.find((e: any) => e.date === today);
        
        return {
          id: habit.id,
          title: habit.name,
          description: habit.description || '',
          category: habit.category || 'General',
          streak: habit.streak || 0,
          completedToday: todayEntry?.completed || false,
          totalCompleted: habit.entries?.filter((e: any) => e.completed).length || 0,
          targetDays: 30, // Default target
          icon: '🎯',
          color: 'blue',
        };
      });
      
      setHabits(mappedHabits);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitCompletion = async (habitId: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || !currentWorkspace) return;
    
    try {
      const newCompleted = !habit.completedToday;
      await api.toggleHabitEntry(habitId.toString(), undefined, newCompleted);
      
      // Update local state
      setHabits(habits.map(h => {
        if (h.id === habitId) {
          return {
            ...h,
            completedToday: newCompleted,
            streak: newCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
            totalCompleted: newCompleted ? h.totalCompleted + 1 : h.totalCompleted - 1,
          };
        }
        return h;
      }));
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const deleteHabit = async (habitId: number) => {
    if (!currentWorkspace) return;
    
    try {
      await api.deleteHabit(habitId.toString());
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const longestStreak = Math.max(...habits.map(h => h.streak), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading habits...</p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Please select a workspace to view habits</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Habits</h1>
          <p className="text-sm text-gray-500 mt-1">Build lasting habits and track your progress - {currentWorkspace.name}</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Progress</p>
              <p className="text-2xl font-bold text-gray-900">{completedToday}/{totalHabits}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Longest Streak</p>
              <p className="text-2xl font-bold text-gray-900">{longestStreak} days</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Habits</p>
              <p className="text-2xl font-bold text-gray-900">{totalHabits}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Today's Completion</h3>
          <span className="text-sm font-medium text-gray-600">{completionRate}%</span>
        </div>
        <Progress value={completionRate} className="h-3" />
        <p className="text-sm text-gray-500 mt-2">
          {completedToday === totalHabits 
            ? '🎉 All habits completed today! Keep up the great work!' 
            : `${totalHabits - completedToday} habit${totalHabits - completedToday !== 1 ? 's' : ''} remaining`
          }
        </p>
      </Card>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const colors = categoryColors[habit.color as keyof typeof categoryColors];
          const progress = (habit.totalCompleted / habit.targetDays) * 100;

          return (
            <Card 
              key={habit.id} 
              className={cn(
                "p-4 transition-all hover:shadow-md",
                habit.completedToday && "border-l-4 " + colors.border
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Icon & Checkbox */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all",
                      habit.completedToday 
                        ? colors.bg + " ring-2 ring-offset-2 " + colors.border.replace('border-', 'ring-')
                        : "bg-gray-100 hover:bg-gray-200"
                    )}
                  >
                    {habit.completedToday ? (
                      <Check className="w-6 h-6 text-green-600" />
                    ) : (
                      habit.icon
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-semibold text-gray-900",
                      habit.completedToday && "line-through text-gray-500"
                    )}>
                      {habit.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 ml-16 lg:ml-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-orange-600">
                      <Flame className="w-4 h-4" />
                      <span className="font-bold">{habit.streak}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Streak</p>
                  </div>

                  <div className="text-center">
                    <p className="font-bold text-gray-900">{habit.totalCompleted}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>

                  <div className="min-w-[120px]">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.min(100, Math.round(progress))}%</span>
                    </div>
                    <Progress value={Math.min(100, progress)} className="h-2" />
                  </div>

                  <Badge variant="outline" className={colors.text + " border-current"}>
                    {habit.category}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Habit</DropdownMenuItem>
                      <DropdownMenuItem>View History</DropdownMenuItem>
                      <DropdownMenuItem>Reset Streak</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => deleteHabit(habit.id)}
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

      {habits.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-4">Start building better habits by creating your first one</p>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Habit
          </Button>
        </Card>
      )}

      {/* Add Habit Dialog */}
      {showAddDialog && (
        <AddHabitDialog
          onClose={() => setShowAddDialog(false)}
          onAdd={async (newHabit) => {
            if (!currentWorkspace) return;
            
            try {
              // Map form data to API format
              const apiHabitData = {
                name: newHabit.title,
                description: newHabit.description || '',
                frequency: 'DAILY', // Default to daily
              };
              
              await api.createHabit(currentWorkspace.id, apiHabitData);
              await fetchHabits(); // Refresh habits
              setShowAddDialog(false);
            } catch (error) {
              console.error('Failed to create habit:', error);
              throw error;
            }
          }}
        />
      )}
    </div>
  );
}

