import { UserPlus, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

export type InputMode = 'manual' | 'csv';

interface InputModeToggleProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  disabled?: boolean;
}

export function InputModeToggle({ mode, onModeChange, disabled }: InputModeToggleProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => onModeChange('manual')}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            mode === 'manual'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-pressed={mode === 'manual'}
          aria-label="Add recipients manually"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Add Manually
        </button>

        <button
          type="button"
          onClick={() => onModeChange('csv')}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            mode === 'csv'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-pressed={mode === 'csv'}
          aria-label="Upload CSV or Excel file"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload CSV/Excel
        </button>
      </div>
    </div>
  );
}
