import React from 'react';
import { Activity, Shield, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  title: string
}

export const ChatHeader = (_props: ChatHeaderProps) => {
  return (
    <div className="flex-1 flex items-center justify-between min-w-0">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 p-2">
        <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg dark:bg-blue-900/50 flex-shrink-0">
          <Stethoscope className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">AI Mental Health Assistant</h1>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 hidden sm:block truncate">{_props.title}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mr-2 md:gap-2 flex-shrink-0">
        <div className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-green-100 rounded-full dark:bg-green-900/30">
          <Activity className="h-3 w-3 md:h-4 md:w-4 text-green-600 dark:text-green-400" />
          <span className="text-xs md:text-sm font-medium text-green-700 dark:text-green-300 hidden sm:inline">Active</span>
        </div>

        <div className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-purple-100 rounded-full dark:bg-purple-900/30">
          <Shield className="h-3 w-3 md:h-4 md:w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs md:text-sm font-medium text-purple-700 dark:text-purple-300 hidden sm:inline">Secure</span>
        </div>
      </div>
    </div>
  );
};
