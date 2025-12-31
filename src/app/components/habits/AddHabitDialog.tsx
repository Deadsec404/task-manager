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

interface HabitFormData {
  title: string;
  description: string;
  category: string;
  targetDays: number;
  icon: string;
  color: string;
}

interface AddHabitDialogProps {
  onClose: () => void;
  onAdd: (habit: HabitFormData) => Promise<void>;
}

const habitIcons = [
  { emoji: '📚', label: 'Book' },
  { emoji: '💪', label: 'Fitness' },
  { emoji: '💻', label: 'Coding' },
  { emoji: '📖', label: 'Reading' },
  { emoji: '🧘', label: 'Meditation' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '✍️', label: 'Writing' },
  { emoji: '🏃', label: 'Running' },
  { emoji: '💧', label: 'Water' },
  { emoji: '🥗', label: 'Healthy Food' },
  { emoji: '😴', label: 'Sleep' },
  { emoji: '🎯', label: 'Goal' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '✅', label: 'Check' },
];

const colorOptions = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
];

export function AddHabitDialog({ onClose, onAdd }: AddHabitDialogProps) {
  const [formData, setFormData] = useState<HabitFormData>({
    title: '',
    description: '',
    category: 'Learning',
    targetDays: 30,
    icon: '🎯',
    color: 'blue',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title) {
      setLoading(true);
      try {
        await onAdd(formData);
      } catch (error) {
        console.error('Failed to add habit:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-xl z-50 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
          <h2 className="font-semibold text-gray-900">Create New Habit</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Habit Title */}
          <div>
            <Label htmlFor="title">Habit Name *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete 1 tutorial, Go to the gym"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this habit involve?"
              rows={3}
            />
          </div>

          {/* Category & Target Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Learning">Learning</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Fitness">Fitness</SelectItem>
                  <SelectItem value="Wellness">Wellness</SelectItem>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Creativity">Creativity</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetDays">Target Days</Label>
              <Input
                id="targetDays"
                type="number"
                min="1"
                value={formData.targetDays}
                onChange={(e) => setFormData({ ...formData, targetDays: parseInt(e.target.value) || 30 })}
              />
              <p className="text-xs text-gray-500 mt-1">Goal number of days to complete</p>
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <Label>Choose Icon</Label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {habitIcons.map((icon) => (
                <button
                  key={icon.emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: icon.emoji })}
                  className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                    formData.icon === icon.emoji 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={icon.label}
                >
                  {icon.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label>Choose Color</Label>
            <div className="flex gap-3 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-12 h-12 rounded-lg ${color.class} transition-all hover:scale-110 ${
                    formData.color === color.value 
                      ? 'ring-4 ring-offset-2 ring-gray-400' 
                      : ''
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label>Preview</Label>
            <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${colorOptions.find(c => c.value === formData.color)?.class.replace('bg-', 'bg-').replace('-500', '-100')} rounded-lg flex items-center justify-center text-2xl`}>
                  {formData.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{formData.title || 'Habit Name'}</h4>
                  <p className="text-sm text-gray-600">{formData.description || 'Habit description'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Creating...' : 'Create Habit'}
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

