
import React from 'react';
import { Activity, Shield, Stethoscope } from 'lucide-react';

export const ChatHeader = () => {
  return (
    <div className="flex-1 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Stethoscope className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-300">Medical AI Assistant</h1>
          <p className="text-sm text-gray-600 dark:text-gray-200">Analyze medical images with AI-powered insights</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
          <Activity className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Active</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full">
          <Shield className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Secure</span>
        </div>
      </div>
    </div>
  );
};
