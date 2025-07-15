
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Stethoscope, Eye, Heart, Brain, Bone } from 'lucide-react';

interface QuestionSuggestionsProps {
  onSuggestionSelect: (suggestion: string) => void;
  hasImage: boolean;
}

const generalSuggestions = [
  { icon: Stethoscope, text: "What type of medical scan should I upload?" },
  { icon: Eye, text: "How does this AI system analyze medical images?" },
  { icon: Heart, text: "What are the limitations of AI in medical diagnosis?" }
];

const imageSuggestions = [
  { icon: Eye, text: "What abnormalities can you identify in this image?" },
  { icon: Brain, text: "Is this scan within normal parameters?" },
  { icon: Bone, text: "What anatomical structures are visible here?" },
  { icon: Heart, text: "Are there any areas of concern in this image?" },
  { icon: Stethoscope, text: "What follow-up tests might be recommended?" },
  { icon: Lightbulb, text: "Can you explain the technical aspects of this scan?" }
];

export const QuestionSuggestions = ({ onSuggestionSelect, hasImage }: QuestionSuggestionsProps) => {
  const suggestions = hasImage ? imageSuggestions : generalSuggestions;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Lightbulb className="h-4 w-4" />
        <span className="font-medium text-gray-700 dark:text-gray-400">Suggested questions:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => {
          const IconComponent = suggestion.icon;
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSuggestionSelect(suggestion.text)}
              className="text-left justify-start hover:bg-blue-50 hover:border-blue-500 transition-colors dark:hover:bg-slate-700 dark:hover:border-slate-600"
            >
              <IconComponent className="h-3 w-3 mr-2 text-blue-600" />
              <span className="text-xs">{suggestion.text}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
