import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ShadcnErrorAlertProps {
  message: string;
  onClose?: () => void;
}

export const ShadcnErrorAlert: React.FC<ShadcnErrorAlertProps> = ({ message, onClose }) => {
  return (
    <Alert className={cn("border-red-200 bg-red-50")}>
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Error</AlertTitle>
      <AlertDescription className="text-red-700">
        {message}
      </AlertDescription>
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-100"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  );
};