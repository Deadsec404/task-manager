// Keyboard shortcuts for productivity
export const shortcuts = {
  // Navigation
  'g d': 'Go to Dashboard',
  'g t': 'Go to Tasks',
  'g e': 'Go to Expenses',
  'g h': 'Go to Habits',
  'g r': 'Go to Reports',
  'g s': 'Go to Settings',
  
  // Actions
  'n': 'New Task/Expense (context dependent)',
  '?': 'Show shortcuts',
  'esc': 'Close dialogs',
  
  // Task actions
  't s': 'Start timer',
  't p': 'Pause timer',
  't c': 'Complete task',
};

export function getShortcutDescription(key: string): string {
  return shortcuts[key as keyof typeof shortcuts] || '';
}

