import { Loader2 } from 'lucide-react';

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
}

export function Loading({ fullScreen = false, text = 'Carregando...' }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      <p className="text-secondary-600 dark:text-secondary-400 text-sm">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        {content}
      </div>
    );
  }

  return content;
}
