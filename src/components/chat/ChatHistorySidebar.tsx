
import React from 'react';
import { MessageSquare, Plus, Trash2, Clock, Calendar, Tag, Stethoscope, Heart, Brain, Eye, Bone, Activity, User, Settings, Moon, Sun } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  createdAt: Date;
  messageCount: number;
  category: 'radiology' | 'cardiology' | 'neurology' | 'orthopedics' | 'general' | 'pathology';
  tags: string[];
}

interface ChatHistorySidebarProps {
  chatHistories: ChatHistory[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

const categoryConfig = {
  radiology: { icon: Eye, color: 'bg-blue-500', label: 'Radiology' },
  cardiology: { icon: Heart, color: 'bg-red-500', label: 'Cardiology' },
  neurology: { icon: Brain, color: 'bg-purple-500', label: 'Neurology' },
  orthopedics: { icon: Bone, color: 'bg-amber-500', label: 'Orthopedics' },
  general: { icon: Stethoscope, color: 'bg-green-500', label: 'General' },
  pathology: { icon: Activity, color: 'bg-pink-500', label: 'Pathology' },
};

const tagColors = [
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
];

export const ChatHistorySidebar = ({
  chatHistories,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatHistorySidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { theme, setTheme } = useTheme();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="p-4">
        <Button 
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && "New Medical Chat"}
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!isCollapsed && "Chat History"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatHistories.map((chat) => {
                const categoryInfo = categoryConfig[chat.category];
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      isActive={currentChatId === chat.id}
                      onClick={() => onSelectChat(chat.id)}
                      className="group relative flex flex-col items-start gap-2 p-3 hover:bg-accent/50 h-auto"
                    >
                      {!isCollapsed ? (
                        <div className="w-full space-y-2">
                          {/* Header with category and delete button */}
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded ${categoryInfo.color} text-white`}>
                                <CategoryIcon className="h-3 w-3" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {categoryInfo.label}
                              </Badge>
                            </div>
                            <button
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChat(chat.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Title */}
                          <h4 className="text-sm font-medium text-left w-full">
                            {truncateText(chat.title, 30)}
                          </h4>
                          
                          {/* Last message preview */}
                          <p className="text-xs text-muted-foreground text-left w-full leading-relaxed">
                            {truncateText(chat.lastMessage, 60)}
                          </p>
                          
                          {/* Tags */}
                          {chat.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 w-full">
                              {chat.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={tag}
                                  className={`text-xs px-1.5 py-0.5 rounded-full border ${getTagColor(index)}`}
                                >
                                  {truncateText(tag, 8)}
                                </span>
                              ))}
                              {chat.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{chat.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Timestamps and message count */}
                          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(chat.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(chat.timestamp)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{chat.messageCount}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <div className={`p-2 rounded ${categoryInfo.color} text-white`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              {chatHistories.length === 0 && !isCollapsed && (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chat history yet</p>
                  <p className="text-xs">Start a new medical consultation</p>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* Profile Section */}
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="Dr. Smith" />
                <AvatarFallback className="bg-primary/10 text-primary">DS</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Dr. Smith</p>
                <p className="text-xs text-muted-foreground">Medical AI Assistant</p>
              </div>
            </div>

            {/* Settings and Theme Toggle */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {/* Collapsed Profile */}
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt="Dr. Smith" />
              <AvatarFallback className="bg-primary/10 text-primary">DS</AvatarFallback>
            </Avatar>
            
            {/* Collapsed Controls */}
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
