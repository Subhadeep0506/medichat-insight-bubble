
import React from 'react';
import { ChatMessage } from '../MedicalChatInterface';
import { User, Bot, Info, Shield } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
      }`}>
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 max-w-xl ${isUser ? 'text-right' : ''}`}>
        <div className={`relative inline-block p-4 rounded-2xl shadow-lg ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-sm' 
            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
        }`}>
          {/* Responsibility AI Indicator for Assistant Messages */}
          {!isUser && message.responsibilityScore && (
            <div className="absolute -top-2 -right-2">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="cursor-help">
                    <Badge 
                      variant="secondary" 
                      className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors flex items-center space-x-1"
                    >
                      <Info className="h-3 w-3" />
                      <span className="text-xs font-medium">{message.responsibilityScore}%</span>
                    </Badge>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-800 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Responsible AI Score: {message.responsibilityScore}%
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {message.responsibilityReason}
                    </p>
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <strong>Note:</strong> This score reflects adherence to ethical AI practices in medical contexts, including appropriate disclaimers and professional consultation recommendations.
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          )}
          
          {/* Message Image */}
          {message.image && (
            <div className="mb-3">
              <img 
                src={message.image} 
                alt="Uploaded medical image" 
                className="max-w-xs rounded-lg shadow-md"
              />
            </div>
          )}
          
          {/* Message Text */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {/* Timestamp */}
          <div className={`mt-2 text-xs opacity-70 ${isUser ? 'text-right' : ''}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};
