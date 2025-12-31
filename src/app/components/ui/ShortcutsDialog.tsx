import { Keyboard } from 'lucide-react';
import { Card } from './card';
import { Button } from './button';
import { shortcuts } from '../../../lib/shortcuts';

interface ShortcutsDialogProps {
  onClose: () => void;
}

export function ShortcutsDialog({ onClose }: ShortcutsDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-gray-900">Navigation</h3>
            <div className="space-y-2">
              {Object.entries(shortcuts).map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">{desc}</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">?</kbd> to toggle this dialog
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

