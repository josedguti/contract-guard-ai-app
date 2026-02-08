import { clsx } from 'clsx';

interface ProgressProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Progress({
  value,
  label,
  showPercentage = true,
  variant = 'default',
  size = 'md',
  className,
}: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  const variants = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={clsx('h-full transition-all duration-300 ease-out', variants[variant])}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
