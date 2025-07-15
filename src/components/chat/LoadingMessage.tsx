
import React from 'react';
import { Bot, Loader } from 'lucide-react';

export const LoadingMessage = () => {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
        <Bot className="h-5 w-5" />
      </div>
      
      <div className="flex-1 max-w-xl">
        <div className="inline-block p-4 rounded-2xl rounded-bl-sm bg-card text-card-foreground border border-border shadow-lg">
          <div className="flex items-center space-x-2">
            <Loader className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Analyzing image and generating response...</span>
          </div>
          
          <div className="mt-2 flex space-x-1">
            <div className="w-2 h-2 bg-primary bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
