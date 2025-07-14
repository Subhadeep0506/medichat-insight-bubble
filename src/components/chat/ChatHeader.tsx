
import React from 'react';
import { Activity, Shield, Brain } from 'lucide-react';

export const ChatHeader = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Medical AI Assistant</h1>
            <p className="text-blue-100">Advanced medical image analysis and consultation support</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-full">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Responsible AI</span>
          </div>
          <div className="flex items-center space-x-2 bg-green-500/30 px-3 py-2 rounded-full">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
