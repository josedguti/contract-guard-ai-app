import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  className?: string;
}

export function Alert({ children, variant = 'info', title, className }: AlertProps) {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-900',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    },
  };

  const config = variants[variant];

  return (
    <div
      className={clsx(
        'rounded-lg border p-4',
        config.container,
        className
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
