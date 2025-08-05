
import React from 'react';
import { Activity, Shield, Stethoscope, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onBackToCase?: () => void;
}

export const ChatHeader = ({ onBackToCase }: ChatHeaderProps) => {
  return (
    <div className="flex-1 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onBackToCase && (
          <Button variant="ghost" onClick={onBackToCase} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Cases
          </Button>
        )}
        <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/50">
          <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Pathology Assistant</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Analyze medical images with AI-powered insights</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full dark:bg-green-900/30">
          <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Active</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full dark:bg-purple-900/30">
          <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Secure</span>
        </div>
      </div>
    </div>
  );
};
