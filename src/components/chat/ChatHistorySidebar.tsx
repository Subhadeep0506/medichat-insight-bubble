
import React from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface ChatHistorySidebarProps {
  chatHistories: ChatHistory[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export const ChatHistorySidebar = ({
  chatHistories,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatHistorySidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
          {!isCollapsed && "New Chat"}
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!isCollapsed && "Chat History"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatHistories.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    isActive={currentChatId === chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className="group relative flex items-start gap-3 p-3 hover:bg-accent/50"
                  >
                    <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0" />
                    
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium truncate">
                            {truncateText(chat.title, 20)}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {truncateText(chat.lastMessage, 40)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(chat.timestamp)}
                          </span>
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {chat.messageCount}
                          </span>
                        </div>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {chatHistories.length === 0 && !isCollapsed && (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chat history yet</p>
                  <p className="text-xs">Start a new conversation</p>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
